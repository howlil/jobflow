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
if (!optionsPath) throw new Error('Expected options entrypoint');

const smokeSource = await readFile('e2e/extension-smoke.mjs', 'utf8');
const fixtureMatch = smokeSource.match(
  /const fixtureHtml = `([\s\S]*?)`;\r?\n/,
);
if (!fixtureMatch?.[1]) throw new Error('Could not load shared career fixture');
const fixtureHtml = fixtureMatch[1];

const server = createServer((_request, response) => {
  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  response.end(fixtureHtml);
});
await new Promise((resolvePromise, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolvePromise);
});
const address = server.address();
if (address === null || typeof address === 'string') {
  throw new Error('Could not determine fixture port');
}
const fixtureUrl = `http://127.0.0.1:${address.port}/apply`;
const dataDir = await mkdtemp(join(tmpdir(), 'jobflow-i3-'));
let context;

async function expectReviewCount(page, count) {
  await expect(page.getByLabel('Job Flow assistant menu')).toContainText(
    new RegExp(`${count}\\s+review`),
  );
}

try {
  context = await chromium.launchPersistentContext(dataDir, {
    channel: 'chromium',
    headless: true,
    args: [
      `--disable-extensions-except=${extensionDir}`,
      `--load-extension=${extensionDir}`,
    ],
  });
  let [worker] = context.serviceWorkers();
  worker ??= await context.waitForEvent('serviceworker');
  const extensionId = worker.url().split('/')[2];
  if (!extensionId) throw new Error('Could not determine extension id');
  const page = await context.newPage();

  await page.goto(`chrome-extension://${extensionId}/${optionsPath}`);
  await page.getByRole('button', { name: 'Personal', exact: true }).click();
  await page.getByLabel('First name').fill('Smoke');
  await page.getByLabel('Primary email').fill('smoke@example.com');
  await expect(page.getByRole('status')).toHaveText('Changes pending.');
  await expect(page.getByRole('status')).toHaveText('Profile saved.');

  await page.goto(fixtureUrl);
  await page.getByRole('button', { name: 'Open Job Flow' }).click();
  await expectReviewCount(page, 1);
  await page.getByRole('button', { name: /Review ambiguous fields/i }).click();
  await page.getByRole('button', { name: 'Use First name for Name' }).click();
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('');
  await expect(
    page.getByRole('button', { name: 'Fill 3 ready fields' }),
  ).toBeVisible();
  expect(await page.evaluate(() => globalThis.__submitCount)).toBe(0);

  await page.evaluate(() => {
    const form = document.querySelector('#application');
    const section = document.querySelector('#application section');
    if (!form || !section) throw new Error('Fixture application missing');
    const next = document.createElement('button');
    next.type = 'button';
    next.textContent = 'Next step';
    next.addEventListener('click', () => {
      section.innerHTML =
        '<h2>Second step</h2><label for="step-email">Email</label><input id="step-email" name="step_email" type="email" />';
    });
    form.append(next);
  });
  await page.getByRole('button', { name: 'Next step' }).click();
  await expect(
    page.getByRole('button', { name: 'Fill 1 ready field' }),
  ).toBeVisible();
  await expect(page.getByLabel('Email')).toHaveValue('');
  expect(await page.evaluate(() => globalThis.__submitCount)).toBe(0);

  await page.reload();
  await page.getByRole('button', { name: 'Open Job Flow' }).click();
  await expect(
    page.getByRole('button', { name: 'Fill 3 ready fields' }),
  ).toBeVisible();
  await expectReviewCount(page, 0);
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('');

  await page.evaluate(() => {
    const form = document.querySelector('#application');
    if (!form) throw new Error('Fixture application missing');
    form.id = 'different-application';
    form.setAttribute('action', '/different-apply');
  });
  await expectReviewCount(page, 1);
  await expect(
    page.getByRole('button', { name: 'Fill 2 ready fields' }),
  ).toBeVisible();
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('');
} finally {
  await context?.close();
  await new Promise((resolvePromise) => server.close(resolvePromise));
  await rm(dataDir, { recursive: true, force: true });
}
