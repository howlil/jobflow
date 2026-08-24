import { chromium, expect } from '@playwright/test';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { readFile } from 'node:fs/promises';

const extensionDir = resolve('.output/chrome-mv3');
const manifest = JSON.parse(
  await readFile(join(extensionDir, 'manifest.json'), 'utf8'),
);
const optionsPath = manifest.options_ui?.page ?? manifest.options_page;
if (!optionsPath) throw new Error('Expected options entrypoint');

const fixtureHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Sensitive vault fixture</title>
  </head>
  <body>
    <main>
      <h1>Engineering Application</h1>
      <form id="application">
        <label for="first">First name</label>
        <input id="first" name="first_name" />

        <label for="email">Email</label>
        <input id="email" name="email" type="email" />

        <label for="birth-date">Date of birth</label>
        <input id="birth-date" name="date_of_birth" />

        <label for="nik">NIK</label>
        <input id="nik" name="nik" />

        <label for="expected-salary">Expected salary</label>
        <input id="expected-salary" name="expected_salary" />

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
    throw new Error('Could not determine fixture server port');
  }
  return {
    server,
    url: `http://127.0.0.1:${address.port}/apply`,
    host: `127.0.0.1:${address.port}`,
  };
}

async function getServiceWorker(context) {
  let [serviceWorker] = context.serviceWorkers();
  serviceWorker ??= await context.waitForEvent('serviceworker');
  return serviceWorker;
}

async function getExtensionId(context) {
  const serviceWorker = await getServiceWorker(context);
  const extensionId = serviceWorker.url().split('/')[2];
  if (!extensionId) throw new Error('Could not determine extension id');
  return extensionId;
}

async function vaultStorage(context) {
  const serviceWorker = await getServiceWorker(context);
  return serviceWorker.evaluate(async () => {
    const stored = await globalThis.chrome.storage.local.get('fillio.vault');
    return stored['fillio.vault'] ?? null;
  });
}

const dataDir = await mkdtemp(join(tmpdir(), 'fillio-i4-'));
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
  const page = await context.newPage();

  await page.goto(`chrome-extension://${extensionId}/${optionsPath}`);
  await page.getByLabel('First name').fill('Vault');
  await page.getByLabel('Primary email').fill('vault@example.com');
  await expect(page.getByText('Vault not set up')).toBeVisible();
  await expect(page.getByLabel('Birth date')).toHaveCount(0);
  await page.getByLabel('New vault passphrase').fill('local-passphrase');
  await page.getByLabel('Confirm vault passphrase').fill('local-passphrase');
  await page.getByRole('button', { name: 'Set up vault' }).click();
  await expect(page.getByText('Sensitive vault is unlocked.')).toBeVisible();
  await page.getByLabel('Birth date').fill('2001-02-03');
  await page.getByLabel('National ID').fill('3174000000000001');
  await page.getByLabel('Expected salary', { exact: true }).fill('15000000');
  await page.getByLabel('Expected salary currency').fill('IDR');
  await page.getByRole('button', { name: 'Save sensitive data' }).click();
  await expect(page.getByText('Sensitive data saved.')).toBeVisible();
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.getByText('Profile saved.')).toBeVisible();

  const storedVault = await vaultStorage(context);
  expect(storedVault).not.toBeNull();
  const serializedVault = JSON.stringify(storedVault);
  expect(serializedVault).not.toContain('local-passphrase');
  expect(serializedVault).not.toContain('3174000000000001');
  expect(serializedVault).not.toContain('2001-02-03');
  expect(serializedVault).not.toContain('15000000');

  await page.getByRole('button', { name: 'Lock vault' }).click();
  await expect(page.getByLabel('Vault passphrase')).toBeVisible();

  await page.goto(fixture.url);
  await expect(
    page.getByRole('button', { name: 'Fill 2 ready fields' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Fill 2 ready fields' }).click();
  await expect(page.getByLabel('First name')).toHaveValue('Vault');
  await expect(page.getByLabel('Email')).toHaveValue('vault@example.com');
  await expect(page.getByLabel('Date of birth')).toHaveValue('');
  await expect(page.getByLabel('NIK')).toHaveValue('');
  await expect(page.getByLabel('Expected salary')).toHaveValue('');

  await expect(page.getByLabel('Vault passphrase')).toBeVisible();
  await page.getByLabel('Vault passphrase').fill('wrong-passphrase');
  await page.getByRole('button', { name: 'Unlock vault' }).click();
  await expect(page.getByRole('alert')).toHaveText(
    'Could not unlock the vault.',
  );
  await expect(page.getByLabel('Date of birth')).toHaveValue('');

  await page.getByLabel('Vault passphrase').fill('local-passphrase');
  await page.getByRole('button', { name: 'Unlock vault' }).click();
  await expect(
    page.getByRole('button', {
      name: `Fill sensitive fields on ${fixture.host}`,
    }),
  ).toBeVisible();
  await expect(page.getByLabel('Date of birth')).toHaveValue('');
  await expect(page.getByLabel('NIK')).toHaveValue('');

  await page
    .getByRole('button', { name: `Fill sensitive fields on ${fixture.host}` })
    .click();
  await expect(page.getByLabel('Date of birth')).toHaveValue('2001-02-03');
  await expect(page.getByLabel('NIK')).toHaveValue('3174000000000001');
  await expect(page.getByLabel('Expected salary')).toHaveValue('15000000');
  expect(await page.evaluate(() => globalThis.__submitCount)).toBe(0);

  await page.goto(`chrome-extension://${extensionId}/${optionsPath}`);
  await expect(page.getByRole('button', { name: 'Reset vault' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset vault' }).click();
  await page.getByRole('button', { name: 'Delete encrypted vault' }).click();
  await expect(page.getByText('Vault not set up')).toBeVisible();
  expect(await vaultStorage(context)).toBeNull();
} finally {
  await context?.close();
  await new Promise((resolvePromise) => fixture.server.close(resolvePromise));
  await rm(dataDir, { recursive: true, force: true });
}
