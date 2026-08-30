import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

function fail(message) {
  console.error(`preflight:affected: ${message}`);
  process.exit(1);
}

function run(command, args) {
  console.log(`\n> ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    stdio: 'inherit',
  });

  if (result.error) {
    fail(result.error.message);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function captureGit(args) {
  return spawnSync('git', args, {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
}

function parseArgs(argv) {
  let base = 'master';
  const e2e = [];

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === '--help' || argument === '-h') {
      console.log(`Usage: pnpm preflight:affected -- [--base <ref>] [--e2e <e2e/file.mjs>]\n\nRuns formatter, affected Vitest coverage, relevant type/lint checks, and optional selected browser acceptance flows for files changed from the merge-base.`);
      process.exit(0);
    }

    if (argument === '--base') {
      base = argv[index + 1];
      if (!base) fail('--base requires a ref');
      index += 1;
      continue;
    }

    if (argument === '--e2e') {
      const file = argv[index + 1];
      if (!file) fail('--e2e requires an e2e/*.mjs file');
      e2e.push(file.replaceAll('\\', '/'));
      index += 1;
      continue;
    }

    fail(`unknown argument: ${argument}`);
  }

  return { base, e2e };
}

function resolveMergeBase(base) {
  const candidates = [base];
  if (!base.startsWith('origin/')) candidates.push(`origin/${base}`);

  for (const candidate of candidates) {
    const result = captureGit(['merge-base', 'HEAD', candidate]);
    if (result.status === 0) {
      return result.stdout.trim();
    }
  }

  fail(`cannot resolve merge-base for ${base}; fetch or create the base ref first`);
}

function changedFilesSince(mergeBase) {
  const result = captureGit([
    'diff',
    '--name-only',
    '--diff-filter=ACMRTUXB',
    '-z',
    mergeBase,
  ]);

  if (result.error) fail(result.error.message);
  if (result.status !== 0) fail('git diff failed');

  return result.stdout
    .split('\0')
    .filter(Boolean)
    .filter((file) => existsSync(file));
}

function isTypeScript(file) {
  return /\.(?:ts|tsx|mts|cts)$/.test(file);
}

function isLintable(file) {
  return /\.(?:js|jsx|mjs|cjs|ts|tsx|mts|cts)$/.test(file);
}

function needsAffectedTests(files) {
  return files.some(
    (file) =>
      file === 'package.json' ||
      file === 'pnpm-lock.yaml' ||
      file.startsWith('src/') ||
      file.startsWith('entrypoints/') ||
      /(?:vitest|vite|wxt)\.config\.[cm]?[jt]s$/.test(file),
  );
}

function validateE2eFiles(files) {
  for (const file of files) {
    if (!file.startsWith('e2e/') || !file.endsWith('.mjs')) {
      fail(`browser acceptance must be an e2e/*.mjs file: ${file}`);
    }
    if (!existsSync(file)) fail(`browser acceptance file does not exist: ${file}`);
  }
}

const { base, e2e } = parseArgs(process.argv.slice(2));
const mergeBase = resolveMergeBase(base);
const changedFiles = changedFilesSince(mergeBase);

if (changedFiles.length === 0) {
  console.log('preflight:affected: no changed files');
  process.exit(0);
}

console.log(`preflight:affected: ${changedFiles.length} changed file(s) from ${mergeBase.slice(0, 12)}`);
for (const file of changedFiles) console.log(`- ${file}`);

run(pnpm, ['exec', 'prettier', '--write', '--ignore-unknown', ...changedFiles]);

if (needsAffectedTests(changedFiles)) {
  run(pnpm, [
    'exec',
    'vitest',
    'run',
    '--changed',
    mergeBase,
    '--passWithNoTests',
  ]);
}

if (changedFiles.some(isTypeScript)) {
  run(pnpm, ['typecheck']);
}

const lintableFiles = changedFiles.filter(isLintable);
if (lintableFiles.length > 0) {
  run(pnpm, ['exec', 'eslint', ...lintableFiles, '--max-warnings=0']);
}

validateE2eFiles(e2e);
if (e2e.length > 0) {
  run(pnpm, ['build']);
  for (const file of e2e) run(process.execPath, [file]);
}

run('git', ['diff', '--check']);
console.log('\npreflight:affected: green');
