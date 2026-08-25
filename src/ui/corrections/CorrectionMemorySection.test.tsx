import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type {
  CorrectionKey,
  CorrectionRepository,
} from '../../application/corrections/correction-repository';
import type { FieldCorrection } from '../../domain/corrections/correction-schema';
import { CorrectionMemorySection } from './CorrectionMemorySection';

function correction(overrides: Partial<FieldCorrection> = {}): FieldCorrection {
  return {
    origin: 'https://jobs.example.test',
    formFingerprint: 'form-a',
    fieldFingerprint: 'field-a',
    target: 'links.github',
    updatedAt: '2026-08-20T00:00:00.000Z',
    ...overrides,
  };
}

function repository(initial: FieldCorrection[]): CorrectionRepository {
  let entries = [...initial];
  return {
    listAll: vi.fn(async () => [...entries]),
    listForOrigin: vi.fn(async (origin: string) =>
      entries.filter((entry) => entry.origin === origin),
    ),
    upsert: vi.fn(async (entry: FieldCorrection) => {
      entries = entries.filter(
        (candidate) =>
          candidate.origin !== entry.origin ||
          candidate.formFingerprint !== entry.formFingerprint ||
          candidate.fieldFingerprint !== entry.fieldFingerprint,
      );
      entries.push(entry);
    }),
    remove: vi.fn(async (key: CorrectionKey) => {
      entries = entries.filter(
        (entry) =>
          entry.origin !== key.origin ||
          entry.formFingerprint !== key.formFingerprint ||
          entry.fieldFingerprint !== key.fieldFingerprint,
      );
    }),
    removeForOrigin: vi.fn(async (origin: string) => {
      entries = entries.filter((entry) => entry.origin !== origin);
    }),
    clear: vi.fn(async () => {
      entries = [];
    }),
  };
}

describe('CorrectionMemorySection', () => {
  it('lists learned mappings by site and flags stale entries', async () => {
    const repo = repository([
      correction(),
      correction({
        origin: 'https://old.example.test',
        fieldFingerprint: 'field-old',
        updatedAt: '2025-01-01T00:00:00.000Z',
      }),
    ]);

    render(
      <CorrectionMemorySection
        repository={repo}
        now={new Date('2026-08-25T00:00:00.000Z')}
      />,
    );

    expect(await screen.findByText('jobs.example.test')).toBeTruthy();
    expect(screen.getByText('old.example.test')).toBeTruthy();
    expect(screen.getByText('Review stale')).toBeTruthy();
    expect(screen.getAllByText('links.github').length).toBe(2);
  });

  it('deletes an exact learned mapping', async () => {
    const repo = repository([correction()]);
    render(<CorrectionMemorySection repository={repo} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Delete mapping' }));

    await waitFor(() => expect(repo.remove).toHaveBeenCalledTimes(1));
    expect(screen.queryByText('links.github')).toBeNull();
  });

  it('resets a site without deleting mappings from other origins', async () => {
    const repo = repository([
      correction(),
      correction({ origin: 'https://other.example.test', fieldFingerprint: 'b' }),
    ]);
    render(<CorrectionMemorySection repository={repo} />);

    fireEvent.click(
      await screen.findByRole('button', { name: 'Reset jobs.example.test' }),
    );

    await waitFor(() =>
      expect(repo.removeForOrigin).toHaveBeenCalledWith(
        'https://jobs.example.test',
      ),
    );
    expect(screen.queryByText('jobs.example.test')).toBeNull();
    expect(screen.getByText('other.example.test')).toBeTruthy();
  });

  it('requires an explicit second action before clearing all mappings', async () => {
    const repo = repository([correction()]);
    render(<CorrectionMemorySection repository={repo} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Reset all learned mappings' }));
    expect(repo.clear).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Confirm reset all' }));
    await waitFor(() => expect(repo.clear).toHaveBeenCalledTimes(1));
    expect(screen.getByText(/no learned mappings yet/i)).toBeTruthy();
  });
});
