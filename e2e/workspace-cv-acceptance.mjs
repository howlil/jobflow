import { chromium, expect } from '@playwright/test';
import { Buffer } from 'node:buffer';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const extensionDir = resolve('.output/chrome-mv3');
const manifest = JSON.parse(
  await readFile(join(extensionDir, 'manifest.json'), 'utf8'),
);
const optionsPath = manifest.options_ui?.page ?? manifest.options_page;
if (!optionsPath) throw new Error('Expected options entrypoint');

const fixtureHtml = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /><title>Backend Engineer Application</title></head>
<body>
  <main>
    <h1>Backend Engineer</h1>
    <form id="application">
      <label for="resume">Resume / CV</label>
      <input id="resume" name="resume" type="file" />
      <button type="submit">Apply</button>
    </form>
  </main>
  <script>
    window.__submitCount = 0;
    document.querySelector('#application').addEventListener('submit', (event) => {
      event.preventDefault();
      window.__submitCount += 1;
    });
  </script>
</body>
</html>`;

async function startFixtureServer() {
  const server = createServer((request, response) => {
    if (request.url === '/apply') {
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
  return { server, url: `http://127.0.0.1:${address.port}/apply` };
}

async function getExtensionId(context) {
  let [serviceWorker] = context.serviceWorkers();
  serviceWorker ??= await context.waitForEvent('serviceworker');
  const extensionId = serviceWorker.url().split('/')[2];
  if (!extensionId) throw new Error('Could not determine extension id');
  return extensionId;
}

const cvText = `
Maya Putri
Backend Software Engineer
maya@example.com
https://github.com/mayaputri

Summary
Backend engineer building reliable APIs.

Skills
Go, PostgreSQL, Redis
`;

const dataDir = await mkdtemp(join(tmpdir(), 'jobflow-i14-'));
const fixture = await startFixtureServer();
let context;

try {
  context = await chromium.launchPersistentContext(dataDir, {
    channel: 'chromium',
    headless: true,
    args: [
      `--disable-extensions-except=${extensionDir}`,
      `--load-extension=${extensionDir}`,
    ],
  });
  const extensionId = await getExtensionId(context);
  const applicationPage = await context.newPage();
  await applicationPage.goto(fixture.url);
  await expect(
    applicationPage.locator('jobflow-form-assistant'),
  ).toBeAttached();
  await applicationPage.getByRole('button', { name: 'Open Job Flow' }).click();
  await expect(applicationPage.getByText('backend-cv.txt')).toHaveCount(0);

  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/${optionsPath}`);
  await page.getByRole('button', { name: 'Documents' }).click();
  await expect(
    page.getByRole('heading', { name: 'Import from CV' }),
  ).toBeVisible();
  await expect(page.getByText('No CV stored yet.')).toBeVisible();

  await page.getByLabel('Choose CV').setInputFiles({
    name: 'backend-cv.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from(cvText),
  });
  await expect(page.getByText(/Found .* profile candidates/i)).toBeVisible();
  await expect(page.getByText('Maya Putri')).toBeVisible();
  await expect(page.getByText(/Go, PostgreSQL, Redis/)).toBeVisible();

  await page.getByRole('button', { name: 'Import data and save CV' }).click();
  await expect(
    page.getByText(
      /Imported .* reviewed profile groups and stored backend-cv\.txt/i,
    ),
  ).toBeVisible();
  await expect(
    page.locator('.document-row').getByText('backend-cv.txt'),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Personal' }).click();
  await expect(page.getByLabel('First name')).toHaveValue('Maya');
  await expect(page.getByLabel('Last name')).toHaveValue('Putri');
  await expect(page.getByLabel('Professional headline')).toHaveValue(
    'Backend Software Engineer',
  );

  await expect(page.getByLabel('Primary email')).toHaveValue(
    'maya@example.com',
  );

  await page.getByRole('button', { name: 'Skills' }).click();
  await expect(page.locator('input[value="Go"]')).toBeVisible();
  await expect(page.locator('input[value="PostgreSQL"]')).toBeVisible();
  await expect(page.locator('input[value="Redis"]')).toBeVisible();

  await page.getByRole('button', { name: 'Documents' }).click();
  await expect(
    page.locator('.document-row').getByText('backend-cv.txt'),
  ).toBeVisible();

  await expect(applicationPage.getByText('backend-cv.txt')).toBeVisible();
  await applicationPage.getByRole('button', { name: 'Attach' }).click();
  await expect(applicationPage.getByRole('status')).toHaveText('Attached');

  const attachedName = await applicationPage
    .locator('#resume')
    .evaluate((input) => input.files?.[0]?.name ?? '');
  expect(attachedName).toBe('backend-cv.txt');
  expect(await applicationPage.evaluate(() => globalThis.__submitCount)).toBe(
    0,
  );
} finally {
  await context?.close();
  await new Promise((resolvePromise) => fixture.server.close(resolvePromise));
  await rm(dataDir, { recursive: true, force: true });
}
