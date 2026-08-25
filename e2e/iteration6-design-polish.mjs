import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';

import { chromium, expect } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const extensionDir = path.join(root, '.output', 'chrome-mv3');
const screenshotsDir = path.join(
  root,
  '.agent',
  'design-audits',
  'iteration-6-verification',
);
const dataDir = await mkdtemp(path.join(tmpdir(), 'fillio-iteration6-'));

async function findExtensionPage(context) {
  const pages = context.pages();
  const extensionPage = pages.find((page) => page.url().startsWith('chrome-extension://'));
  if (extensionPage !== undefined) return extensionPage;

  return context.waitForEvent('page', {
    predicate: (page) => page.url().startsWith('chrome-extension://'),
  });
}

async function getExtensionId(context) {
  const workers = context.serviceWorkers();
  let worker = workers.find((item) => item.url().startsWith('chrome-extension://'));
  if (worker === undefined) {
    worker = await context.waitForEvent('serviceworker', {
      predicate: (item) => item.url().startsWith('chrome-extension://'),
    });
  }
  return new URL(worker.url()).host;
}

async function capture(page, name, viewport) {
  await page.setViewportSize(viewport);
  await page.screenshot({
    path: path.join(screenshotsDir, name),
    fullPage: true,
  });
}

async function startFixtureServer() {
  const server = createServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(`<!doctype html>
      <html>
        <head><title>Backend Engineer Application</title></head>
        <body>
          <main>
            <h1>Backend Engineer Application</h1>
            <form>
              <label>
                National ID
                <input name="national_id" autocomplete="off" />
              </label>
            </form>
          </main>
        </body>
      </html>`);
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  if (address === null || typeof address === 'string') {
    throw new Error('Could not start Iteration 6 fixture server.');
  }

  return {
    url: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

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
  await expect(
    page.getByRole('heading', { name: 'Sensitive vault' }),
  ).toBeVisible();
  await capture(page, 'options-desktop.png', { width: 1440, height: 1000 });
  await capture(page, 'options-mobile.png', { width: 390, height: 844 });

  await page.goto(fixture.url);
  const panel = page.locator('fillio-form-assistant');
  await expect(panel).toBeAttached();
  await expect(page.getByText('Sensitive fields detected')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'No safe fields ready to fill yet' }),
  ).toBeVisible();
  await capture(page, 'floating-panel-desktop.png', {
    width: 1440,
    height: 1000,
  });
  await capture(page, 'floating-panel-mobile.png', {
    width: 390,
    height: 844,
  });

  const popupPage = await findExtensionPage(context);
  await popupPage.goto(`chrome-extension://${extensionId}/${popupPath}`);
  await expect(popupPage.getByText('Ready to apply')).toBeVisible();
  await capture(popupPage, 'popup-desktop.png', { width: 420, height: 760 });
} finally {
  await context?.close();
  await fixture.close();
  await rm(dataDir, { recursive: true, force: true });
}
