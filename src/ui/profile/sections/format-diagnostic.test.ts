import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import * as prettier from 'prettier';

const FILES = [
  'src/ui/profile/sections/CareerRecordsSection.tsx',
  'src/ui/profile/sections/PersonalDetailsSection.tsx',
];

describe('format diagnostic', () => {
  it('prints canonical formatter output', async () => {
    for (const file of FILES) {
      const input = await readFile(file, 'utf8');
      const config = (await prettier.resolveConfig(file)) ?? {};
      const formatted = await prettier.format(input, { ...config, filepath: file });
      if (formatted !== input) {
        console.log(`FORMAT_START:${file}\n${formatted}FORMAT_END:${file}`);
      }
    }

    expect(true).toBe(true);
  });
});
