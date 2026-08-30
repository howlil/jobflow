import { chromium, expect } from '@playwright/test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const extensionDir = resolve('.output/chrome-mv3');
const manifest = JSON.parse(
  await readFile(join(extensionDir, 'manifest.json'), 'utf8'),
);
const optionsPath = manifest.options_ui?.page ?? manifest.options_page;
if (!optionsPath) throw new Error('Expected options entrypoint');

async function getExtensionId(context) {
  let [serviceWorker] = context.serviceWorkers();
  serviceWorker ??= await context.waitForEvent('serviceworker');
  const extensionId = serviceWorker.url().split('/')[2];
  if (!extensionId) throw new Error('Could not determine extension id');
  return extensionId;
}

async function createApplication(page, application) {
  await page.getByLabel('Company').fill(application.company);
  await page.getByLabel('Role').fill(application.role);
  await page.getByLabel('Job URL').fill(application.jobUrl);
  await page.getByLabel('Stage').selectOption(application.stage);
  await page.getByLabel('Source').fill(application.source);
  await page.getByLabel('Next action').fill(application.nextActionAt);
  await page.getByLabel('Notes').fill(application.notes);
  await page.getByRole('button', { name: 'Create application' }).click();
  await expect(page.getByRole('status')).toHaveText('Application saved.');
}

const dataDir = await mkdtemp(join(tmpdir(), 'jobflow-applications-'));
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
  await page.getByRole('button', { name: 'Applications', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Applications' }),
  ).toBeVisible();

  await createApplication(page, {
    company: 'Gojek',
    role: 'Backend Engineer',
    jobUrl: 'https://example.com/gojek-backend',
    stage: 'applied',
    source: 'LinkedIn',
    nextActionAt: '2020-01-01',
    notes: 'Follow up with recruiter.',
  });
  await createApplication(page, {
    company: 'Traveloka',
    role: 'Platform Engineer',
    jobUrl: 'https://example.com/traveloka-platform',
    stage: 'interview',
    source: 'Careers page',
    nextActionAt: '2099-01-01',
    notes: 'Prepare system design examples.',
  });

  await expect(page.getByText('1 application needs attention.')).toBeVisible();

  const search = page.getByLabel('Search applications');
  await search.fill('gojek');
  await expect(page.getByText('Backend Engineer')).toBeVisible();
  await expect(page.getByText('Traveloka')).toHaveCount(0);

  await search.fill('');
  await page.getByRole('button', { name: 'Needs action' }).click();
  await expect(page.getByText('Gojek')).toBeVisible();
  await expect(page.getByText('Traveloka')).toHaveCount(0);

  await page.getByRole('button', { name: 'All', exact: true }).click();
  const gojekCard = page
    .locator('article')
    .filter({ hasText: 'Gojek' })
    .first();
  await gojekCard.getByLabel('Move stage').selectOption('interview');
  await expect(page.getByRole('status')).toHaveText(
    'Application stage updated.',
  );

  await page.reload();
  await page.getByRole('button', { name: 'Applications', exact: true }).click();

  const persistedGojekCard = page
    .locator('article')
    .filter({ hasText: 'Gojek' })
    .first();
  await expect(persistedGojekCard).toBeVisible();
  await expect(persistedGojekCard.getByLabel('Move stage')).toHaveValue(
    'interview',
  );
  await expect(page.getByText('Traveloka')).toBeVisible();
  await expect(page.getByText('1 application needs attention.')).toBeVisible();
} finally {
  await context?.close();
  await rm(dataDir, { recursive: true, force: true });
}
