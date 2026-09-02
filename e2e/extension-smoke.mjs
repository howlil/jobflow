import { chromium, expect } from '@playwright/test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const extensionDir = resolve('.output/chrome-mv3');
const manifest = JSON.parse(
  await readFile(join(extensionDir, 'manifest.json'), 'utf8'),
);
const optionsPath = manifest.options_ui?.page ?? manifest.options_page;
const popupPath = manifest.action?.default_popup;

if (!optionsPath || !popupPath) {
  throw new Error(
    'Expected options and popup entrypoints in generated manifest',
  );
}

const fixtureHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Career application fixture</title>
  </head>
  <body>
    <main>
      <h1>Backend Engineer Application</h1>
      <form id="application">
        <section>
          <h2>Candidate information</h2>
          <label for="first-name">First name</label>
          <input id="first-name" name="first_name" />

          <label for="last-name">Last name</label>
          <input id="last-name" name="last_name" />

          <label for="email">Email</label>
          <input id="email" name="email" type="email" />

          <label for="phone">Phone number</label>
          <input id="phone" name="phone" type="tel" />

          <label for="city">City</label>
          <select id="city" name="city">
            <option value="">Choose city</option>
            <option value="jkt">Jakarta</option>
            <option value="pdg">Padang</option>
          </select>

          <label for="linkedin">LinkedIn profile</label>
          <input id="linkedin" name="linkedin" />

          <label for="github">GitHub URL</label>
          <input id="github" name="github" />

          <label for="ambiguous-name">Name</label>
          <input id="ambiguous-name" name="name" />

          <label for="birth-date">Date of birth</label>
          <input id="birth-date" name="birth_date" type="date" />

          <label for="resume">Resume</label>
          <input id="resume" name="resume" type="file" />

          <label for="favorite-color">Favorite color</label>
          <input id="favorite-color" name="favorite_color" />

          <button id="submit" type="submit">Apply</button>
        </section>
      </form>
    </main>
    <script>
      window.__submitCount = 0;
      window.__eventLog = [];
      document.querySelector('#application').addEventListener('submit', (event) => {
        event.preventDefault();
        window.__submitCount += 1;
      });
      for (const control of document.querySelectorAll('input, select')) {
        control.addEventListener('input', () => {
          window.__eventLog.push(control.name + ':input');
        });
        control.addEventListener('change', () => {
          window.__eventLog.push(control.name + ':change');
        });
      }
    </script>
  </body>
</html>`;

async function startFixtureServer() {
  const server = createServer((request, response) => {
    if (request.url === '/career-form') {
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      response.end(fixtureHtml);
      return;
    }

    response.writeHead(404);
    response.end('Not found');
  });

  await new Promise((resolvePromise, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolvePromise);
  });

  const address = server.address();
  if (address === null || typeof address === 'string') {
    server.close();
    throw new Error('Could not determine fixture server port');
  }

  return {
    server,
    url: `http://127.0.0.1:${address.port}/career-form`,
  };
}

async function launchExtension(userDataDir) {
  return chromium.launchPersistentContext(userDataDir, {
    channel: 'chromium',
    headless: true,
    args: [
      `--disable-extensions-except=${extensionDir}`,
      `--load-extension=${extensionDir}`,
    ],
  });
}

async function getServiceWorker(context) {
  let [worker] = context.serviceWorkers();
  worker ??= await context.waitForEvent('serviceworker');
  return worker;
}

async function getExtensionId(context) {
  const worker = await getServiceWorker(context);
  const extensionId = worker.url().split('/')[2];
  if (!extensionId) throw new Error('Could not determine extension id');
  return extensionId;
}

const fixture = await startFixtureServer();
const userDataDir = await mkdtemp(join(tmpdir(), 'jobflow-smoke-'));
let context;

try {
  context = await launchExtension(userDataDir);
  let extensionId = await getExtensionId(context);
  let page = await context.newPage();

  await page.goto(`chrome-extension://${extensionId}/${optionsPath}`);
  await page.getByRole('button', { name: 'Personal', exact: true }).click();
  await page.getByLabel('First name').fill('Smoke');
  await page.getByLabel('Last name').fill('Tester');

  await page.getByLabel('Primary email').fill('smoke@example.com');
  await page.getByLabel('Primary phone').fill('+628123456789');
  await page.getByLabel('City').fill('Padang');

  await page.getByLabel('LinkedIn').fill('https://linkedin.com/in/smoke');
  await page.getByLabel('GitHub').fill('https://github.com/smoke');

  await expect(page.getByRole('status')).toHaveText('Changes pending.');
  await expect(page.getByRole('status')).toHaveText('Profile saved.');

  await context.close();
  context = undefined;

  context = await launchExtension(userDataDir);
  extensionId = await getExtensionId(context);
  page = await context.newPage();

  await page.goto(`chrome-extension://${extensionId}/${optionsPath}`);
  await page.getByRole('button', { name: 'Personal', exact: true }).click();
  await expect(page.getByLabel('First name')).toHaveValue('Smoke');
  await expect(page.getByLabel('Last name')).toHaveValue('Tester');

  await expect(page.getByLabel('Primary email')).toHaveValue(
    'smoke@example.com',
  );

  await page.goto(`chrome-extension://${extensionId}/${popupPath}`);
  await expect(page.getByRole('heading', { name: 'Current application' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open workspace' })).toBeVisible();

  await page.goto(fixture.url);
  await expect(page.locator('jobflow-form-assistant')).toBeAttached();
  await page.getByRole('button', { name: 'Open Job Flow' }).click();
  await expect(
    page.getByRole('button', { name: 'Fill 7 ready fields' }),
  ).toBeVisible();

  const serviceWorker = await getServiceWorker(context);
  const summary = await serviceWorker.evaluate(async () => {
    const extensionApi = globalThis.chrome;
    const [tab] = await extensionApi.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.id === undefined) throw new Error('Active fixture tab not found');
    return extensionApi.tabs.sendMessage(tab.id, {
      type: 'jobflow:get-page-analysis',
    });
  });
  expect(summary).toEqual({
    ready: 7,
    needsReview: 1,
    sensitive: 1,
    unknown: 2,
    total: 11,
  });

  expect(await page.evaluate(() => globalThis.__submitCount)).toBe(0);
  await page.getByRole('button', { name: 'Fill 7 ready fields' }).click();

  await expect(page.getByLabel('First name')).toHaveValue('Smoke');
  await expect(page.getByLabel('Last name')).toHaveValue('Tester');
  await expect(page.getByLabel('Email')).toHaveValue('smoke@example.com');
  await expect(page.getByLabel('Phone number')).toHaveValue('+628123456789');
  await expect(page.getByLabel('City')).toHaveValue('pdg');
  await expect(page.getByLabel('LinkedIn profile')).toHaveValue(
    'https://linkedin.com/in/smoke',
  );
  await expect(page.getByLabel('GitHub URL')).toHaveValue(
    'https://github.com/smoke',
  );

  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Date of birth')).toHaveValue('');
  await expect(page.getByLabel('Resume')).toHaveValue('');
  await expect(page.getByLabel('Favorite color')).toHaveValue('');
  expect(await page.evaluate(() => globalThis.__submitCount)).toBe(0);
  expect(await page.evaluate(() => globalThis.__eventLog)).toEqual(
    expect.arrayContaining([
      'first_name:input',
      'first_name:change',
      'last_name:input',
      'last_name:change',
      'email:input',
      'email:change',
      'phone:input',
      'phone:change',
      'city:input',
      'city:change',
      'linkedin:input',
      'linkedin:change',
      'github:input',
      'github:change',
    ]),
  );
} finally {
  await context?.close();
  await new Promise((resolvePromise) => fixture.server.close(resolvePromise));
  await rm(userDataDir, { recursive: true, force: true });
}
