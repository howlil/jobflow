import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';
import { format } from 'prettier';

const files = [
  'src/components/floating/FloatingPanel.tsx',
  'src/components/floating/FloatingPanel.test.tsx',
];

describe('prettier diagnostic', () => {
  it('prints the exact formatter patch', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'jobflow-prettier-'));
    let hasDiff = false;

    try {
      for (const file of files) {
        const source = readFileSync(file, 'utf8');
        const formatted = await format(source, {
          filepath: file,
          semi: true,
          singleQuote: true,
          trailingComma: 'all',
        });
        if (source === formatted) continue;

        hasDiff = true;
        const before = join(directory, 'before');
        const after = join(directory, 'after');
        writeFileSync(before, source);
        writeFileSync(after, formatted);
        try {
          execFileSync('diff', ['-u', '--label', file, before, '--label', file, after], {
            encoding: 'utf8',
          });
        } catch (error) {
          const output = (error as { stdout?: string }).stdout ?? '';
          console.log(`PRETTIER_PATCH_START\n${output}PRETTIER_PATCH_END`);
        }
      }
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }

    expect(hasDiff).toBe(false);
  });
});
