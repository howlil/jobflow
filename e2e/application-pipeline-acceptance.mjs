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

async function createApplication(workspace, application) {
  await workspace.getByRole('button', { name: 'Add job' }).click();
  await workspace.getByLabel(/^Company$/).fill(application.company);
  await workspace.getByLabel(/^Role$/).fill(application.role);
  await workspace.getByLabel(/^Job URL$/).fill(application.jobUrl);
  await workspace.getByLabel(/^Stage/).selectOption(application.stage);
  await workspace.getByLabel(/^Source$/).fill(application.source);
  await workspace.getByLabel(/^Next action$/).fill(application.nextAction);
  await workspace
    .getByLabel(/^Next action date$/)
    .fill(application.nextActionAt);
  await workspace.getByLabel(/^Notes$/).fill(application.notes);
  await workspace.getByRole('button', { name: 'Add to pipeline' }).click();
  await expect(workspace.getByRole('status')).toHaveText(
    'Job added to pipeline.',
  );
}

function applicationCard(workspace, company) {
  return workspace.locator('article').filter({ hasText: company }).first();
}

async function expectCardVisible(workspace, company) {
  const card = applicationCard(workspace, company);
  await card.scrollIntoViewIfNeeded();
  await expect(card).toBeVisible();
  return card;
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
  await page.getByRole('button', { name: 'Pipeline', exact: true }).click();

  const workspace = page.locator('#applications');
  await expect(
    workspace.getByRole('heading', { name: 'Job pipeline' }),
  ).toBeVisible();

  await createApplication(workspace, {
    company: 'Gojek',
    role: 'Backend Engineer',
    jobUrl: 'https://example.com/gojek-backend',
    stage: 'applied',
    source: 'LinkedIn',
    nextAction: 'Follow up recruiter',
    nextActionAt: '2020-01-01',
    notes: 'Follow up with recruiter.',
  });
  await createApplication(workspace, {
    company: 'Traveloka',
    role: 'Platform Engineer',
    jobUrl: 'https://example.com/traveloka-platform',
    stage: 'interview',
    source: 'Careers page',
    nextAction: 'Prepare system design',
    nextActionAt: '2099-01-01',
    notes: 'Prepare system design examples.',
  });

  await expect(
    workspace.getByText('2 active opportunities · 1 need action'),
  ).toBeVisible();

  const search = workspace.getByLabel(/^Search jobs$/);
  await search.fill('gojek');
  let gojekCard = await expectCardVisible(workspace, 'Gojek');
  await expect(gojekCard).toContainText('Backend Engineer');
  await expect(gojekCard).not.toContainText('Follow up with recruiter.');
  await expect(workspace.getByText('Traveloka')).toHaveCount(0);

  await search.fill('');
  await workspace.getByRole('button', { name: 'Needs action 1' }).click();
  gojekCard = await expectCardVisible(workspace, 'Gojek');
  await expect(gojekCard).toContainText('Backend Engineer');
  await expect(gojekCard).toContainText('Follow up with recruiter.');
  await expect(workspace.getByText('Traveloka')).toHaveCount(0);

  await gojekCard.getByRole('button', { name: 'Mark done' }).click();
  await expect(workspace.getByRole('status')).toHaveText(
    'Follow-up completed.',
  );
  await expect(
    workspace.getByRole('button', { name: 'Needs action 0' }),
  ).toBeVisible();
  await expect(workspace.getByText('No jobs match this view.')).toBeVisible();

  await workspace.getByRole('button', { name: 'Board', exact: true }).click();
  gojekCard = await expectCardVisible(workspace, 'Gojek');
  await gojekCard.getByRole('button', { name: 'Assessment →' }).click();
  await expect(workspace.getByRole('status')).toHaveText(
    'Moved to Assessment.',
  );

  gojekCard = await expectCardVisible(workspace, 'Gojek');
  await gojekCard.getByRole('button', { name: 'Interview →' }).click();
  await expect(workspace.getByRole('status')).toHaveText('Moved to Interview.');

  await page.reload();
  await page.getByRole('button', { name: 'Pipeline', exact: true }).click();

  const persistedWorkspace = page.locator('#applications');
  const interviewHeading = persistedWorkspace.getByRole('heading', {
    name: 'Interview',
    exact: true,
  });
  await expect(interviewHeading).toBeAttached();
  const interviewColumn = interviewHeading.locator(
    'xpath=ancestor::section[1]',
  );
  await interviewColumn.scrollIntoViewIfNeeded();
  await expect(interviewColumn).toBeVisible();
  await expect(interviewColumn).toContainText('Gojek');
  await expect(interviewColumn).toContainText('Traveloka');
  await expect(
    persistedWorkspace.getByText('2 active opportunities · 0 need action'),
  ).toBeVisible();
} finally {
  await context?.close();
  await rm(dataDir, { recursive: true, force: true });
}
