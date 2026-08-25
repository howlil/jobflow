import { chromium, expect } from '@playwright/test';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const extensionDir = resolve('.output/chrome-mv3');
const screenshotsDir = resolve('test-results/iteration-6-design-polish');
const manifest = JSON.parse(
  await readFile(join(extensionDir, 'manifest.json'), 'utf8'),
);
const optionsPath = manifest.options_ui?.page ?? manifest.options_page;
if (!optionsPath) throw new Error('Expected options entrypoint');

const fixtureHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Sensitive-only career application</title>
  </head>
  <body>
    <main>
      <h1>Senior Engineer Application</h1>
      <form id="application">
        <label for="birth-date">Date of birth</label>
        <input id="birth-date" name="date_of_birth" type="date" />

        <label for="national-id">National ID</label>
        <input id="national-id" name="national_id" />

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
  return { server, url: `http://127.0.0.1:${address.port}/career-form` };
}

async function getExtensionId(context) {
  let [serviceWorker] = context.serviceWorkers();
  serviceWorker ??= await context.waitForEvent('serviceworker');
  const extensionId = serviceWorker.url().split('/')[2];
  if (!extensionId) throw new Error('Could not determine extension id');
  return extensionId;
}

async function capture(page, name, viewport) {
  await page.setViewportSize(viewport);
  await page.screenshot({ path: join(screenshotsDir, name), fullPage: true });
}

const dataDir = await mkdtemp(join(tmpdir(), 'fillio-i6-'));
const fixture = await startFixtureServer();
let context;

try {
  await mkdir(screenshotsDir, { recursive: true });
  context = await chromium.launchPersistentContext(dataDir, {
    channel: 'chromium',
    headless: true,
    args: [
      `--disable-extensions-except=${extensionDir}`,
      `--load-extension=${extensionDir}`,
    ],
  });
  const extensionId = await getExtensionId(context);
  const page = await context.newPage();

  await page.goto(`chrome-extension://${extensionId}/${optionsPath}`);
  await expect(page.getByText('Profile readiness')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Import from CV' })).toBeVisible();
  await expect(page.getByText('Career data workspace')).toBeVisible();
  await capture(page, 'options-desktop.png', { width: 1440, height: 1000 });
  await capture(page, 'options-tablet.png', { width: 1024, height: 900 });
  await capture(page, 'options-mobile.png', { width: 390, height: 844 });

  await page.goto(fixture.url);
  const host = page.locator('fillio-form-assistant');
  await expect(host).toBeAttached();
  const launcher = page.getByRole('button', { name: 'Open Fillio' });
  await expect(launcher).toBeVisible();
  await expect(page.getByText('Sensitive fields detected')).toHaveCount(0);
  await capture(page, 'floating-launcher-desktop.png', { width: 1440, height: 1000 });

  await launcher.click();
  await expect(page.getByText('Sensitive')).toBeVisible();
  await page.getByRole('button', { name: /Sensitive data/i }).click();
  await expect(page.getByText('Sensitive fields detected')).toBeVisible();
  await expect(page.getByText('Date of birth')).toBeVisible();
  await expect(page.getByText('National ID')).toBeVisible();
  await capture(page, 'floating-panel-desktop.png', { width: 1440, height: 1000 });

  await page.getByRole('button', { name: 'Close Fillio' }).first().click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open Fillio' }).click();
  await capture(page, 'floating-panel-mobile.png', { width: 390, height: 844 });

  expect(await page.getByLabel('Date of birth').inputValue()).toBe('');
  expect(await page.getByLabel('National ID').inputValue()).toBe('');
  expect(await page.evaluate(() => globalThis.__submitCount)).toBe(0);
} finally {
  await context?.close();
  await new Promise((resolvePromise) => fixture.server.close(resolvePromise));
  await rm(dataDir, { recursive: true, force: true });
}
