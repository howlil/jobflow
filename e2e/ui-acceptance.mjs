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

async function capture(page, name, viewport, fullPage = true) {
  await page.setViewportSize(viewport);
  await page.waitForTimeout(220);
  await page.screenshot({ path: join(screenshotsDir, name), fullPage });
}

const dataDir = await mkdtemp(join(tmpdir(), 'jobflow-i6-'));
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
  await expect(
    page.getByRole('complementary', { name: 'Job Flow sidebar' }),
  ).toBeVisible();
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Pipeline' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Job pipeline' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Overview' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Skills' })).toHaveCount(0);

  await page.setViewportSize({ width: 1920, height: 1080 });
  const wideMain = await page.getByRole('main').boundingBox();
  expect(wideMain?.width ?? 0).toBeGreaterThan(1500);
  await capture(page, 'options-wide-1920.png', { width: 1920, height: 1080 });

  await page.setViewportSize({ width: 2560, height: 1440 });
  const ultraWideMain = await page.getByRole('main').boundingBox();
  expect(ultraWideMain?.width ?? 0).toBeGreaterThan(2100);
  await capture(page, 'options-wide-2560.png', { width: 2560, height: 1440 });

  await capture(page, 'options-desktop.png', { width: 1440, height: 1000 });
  await capture(page, 'options-tablet.png', { width: 1024, height: 900 });
  await capture(page, 'options-mobile.png', { width: 390, height: 844 });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('button', { name: 'Personal', exact: true }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Personal' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Basic information' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Contact' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Links' })).toBeVisible();

  const basicInformationCard = page
    .locator('details')
    .filter({ has: page.getByRole('heading', { name: 'Basic information' }) })
    .first();
  await expect(
    page.getByRole('button', { name: 'About Basic information' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'About Basic information' }).click();
  await expect(
    page.getByText(/canonical identity, preferred name, headline/i),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await basicInformationCard.locator('summary').click();
  await expect(page.getByLabel('First name')).toBeHidden();
  await basicInformationCard.locator('summary').click();
  await expect(page.getByLabel('First name')).toBeVisible();

  await page.getByRole('button', { name: 'Experience', exact: true }).click();
  await page.getByRole('button', { name: 'Add experience' }).click();
  await expect(page.getByLabel('Start date')).toHaveAttribute('type', 'month');
  await expect(page.getByLabel('End date')).toHaveAttribute('type', 'month');
  await expect(page.getByRole('combobox', { name: 'Skills' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Skill level' })).toHaveCount(
    0,
  );

  await page.getByRole('button', { name: 'Preferences', exact: true }).click();
  await expect(page.getByLabel('Availability date')).toHaveAttribute(
    'type',
    'date',
  );

  await page.getByRole('button', { name: 'Personal', exact: true }).click();
  await expect(page.getByLabel('First name')).toBeVisible();
  await capture(page, 'options-personal-desktop.png', {
    width: 1440,
    height: 1000,
  });
  await capture(page, 'options-personal-mobile.png', {
    width: 390,
    height: 844,
  });

  await page.goto(fixture.url);
  const host = page.locator('jobflow-form-assistant');
  await expect(host).toBeAttached();
  const launcher = page.getByRole('button', { name: 'Open Job Flow' });
  await expect(launcher).toBeVisible();
  await expect(page.getByText('Sensitive fields detected')).toHaveCount(0);
  await capture(
    page,
    'floating-launcher-desktop.png',
    {
      width: 1440,
      height: 1000,
    },
    false,
  );

  await launcher.click();
  const workspacePagePromise = context.waitForEvent('page');
  await page.getByRole('button', { name: 'Open profile workspace' }).click();
  const workspacePage = await workspacePagePromise;
  await workspacePage.waitForLoadState('domcontentloaded');
  await expect(
    workspacePage.getByRole('complementary', { name: 'Job Flow sidebar' }),
  ).toBeVisible();
  await expect(
    workspacePage.getByRole('heading', { level: 1, name: 'Pipeline' }),
  ).toBeVisible();
  await workspacePage.close();

  const sensitiveFieldsButton = page.getByRole('button', {
    name: /Sensitive fields/i,
  });
  await expect(sensitiveFieldsButton).toBeVisible();
  await sensitiveFieldsButton.click();
  const sensitiveRegion = page.getByLabel(
    'Sensitive fields requiring approval',
  );
  await expect(page.getByText('Sensitive fields detected')).toBeVisible();
  await expect(
    sensitiveRegion.getByText(/unlocking the vault does not fill anything/i),
  ).toBeVisible();
  await expect(sensitiveRegion.getByText('Date of birth')).toBeVisible();
  await expect(sensitiveRegion.getByText('National ID')).toBeVisible();
  await capture(
    page,
    'floating-panel-desktop.png',
    {
      width: 1440,
      height: 1000,
    },
    false,
  );

  await page.getByRole('button', { name: 'Close Job Flow' }).first().click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open Job Flow' }).click();
  await capture(
    page,
    'floating-panel-mobile.png',
    { width: 390, height: 844 },
    false,
  );

  expect(await page.getByLabel('Date of birth').inputValue()).toBe('');
  expect(await page.getByLabel('National ID').inputValue()).toBe('');
  expect(await page.evaluate(() => globalThis.__submitCount)).toBe(0);
} finally {
  await context?.close();
  await new Promise((resolvePromise) => fixture.server.close(resolvePromise));
  await rm(dataDir, { recursive: true, force: true });
}
