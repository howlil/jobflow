import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FloatingPanel } from './FloatingPanel';

describe('FloatingPanel', () => {
  it('starts as a small launcher and expands only after explicit click', () => {
    const fill = vi.fn();

    render(
      <FloatingPanel
        summary={{
          ready: 3,
          needsReview: 1,
          sensitive: 1,
          unknown: 2,
          total: 7,
        }}
        onFill={fill}
      />,
    );

    expect(screen.queryByLabelText('Form analysis summary')).toBeNull();
    const launcher = screen.getByRole('button', { name: 'Open Job Flow' });
    expect(launcher.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(launcher);

    const summary = screen.getByLabelText('Form analysis summary');
    expect(summary.textContent).toContain('3 ready');
    expect(summary.textContent).toContain('1 review');
    expect(summary.textContent).toContain('1 sensitive');
    expect(summary.textContent).toContain('2 unrecognized');
    expect(fill).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole('button', { name: 'Fill 3 ready fields' }),
    );
    expect(fill).toHaveBeenCalledTimes(1);
  });

  it('shows structured application coverage for reusable career records', () => {
    render(
      <FloatingPanel
        summary={{
          ready: 9,
          needsReview: 1,
          sensitive: 0,
          unknown: 1,
          total: 11,
          structured: {
            experience: {
              profileRecords: 2,
              detectedRecords: 2,
              readyRecords: 2,
              readyFields: 6,
              unresolvedFields: 0,
            },
            education: {
              profileRecords: 1,
              detectedRecords: 1,
              readyRecords: 1,
              readyFields: 3,
              unresolvedFields: 0,
            },
          },
        }}
        onFill={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open Job Flow' }));

    const coverage = screen.getByLabelText('Structured application coverage');
    expect(coverage.textContent).toContain('Experience');
    expect(coverage.textContent).toContain('2 / 2 records');
    expect(coverage.textContent).toContain('Education');
    expect(coverage.textContent).toContain('1 / 1 records');
  });

  it('disables fill when no fields are ready', () => {
    render(
      <FloatingPanel
        summary={{
          ready: 0,
          needsReview: 2,
          sensitive: 1,
          unknown: 1,
          total: 4,
        }}
        onFill={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open Job Flow' }));
    const button = screen.getByRole('button', {
      name: 'No safe fields ready to fill yet',
    });
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  it('attaches a recommended document only after the user clicks Attach', async () => {
    const attach = vi.fn().mockResolvedValue('attached');
    render(
      <FloatingPanel
        summary={{
          ready: 0,
          needsReview: 0,
          sensitive: 0,
          unknown: 1,
          total: 1,
        }}
        documentFields={[
          {
            fieldFingerprint: 'resume-field',
            fieldLabel: 'Resume',
            intent: 'resume',
            evidence: ['resume'],
            recommendedDocument: {
              id: 'resume-1',
              label: 'Backend CV',
              fileName: 'backend.pdf',
            },
          },
        ]}
        onFill={vi.fn()}
        onAttachDocument={attach}
      />,
    );

    expect(attach).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Open Job Flow' }));
    fireEvent.click(screen.getByRole('button', { name: 'Attach' }));

    expect(attach).toHaveBeenCalledWith('resume-field', 'resume-1');
  });

  it('requires review and captures follow-up details before saving the current page', async () => {
    const saveApplication = vi.fn().mockResolvedValue(undefined);
    render(
      <FloatingPanel
        summary={{
          ready: 1,
          needsReview: 0,
          sensitive: 0,
          unknown: 0,
          total: 1,
        }}
        applicationDraft={{
          company: 'Acme',
          role: 'Senior Engineer',
          jobUrl: 'https://jobs.example/acme',
          stage: 'saved',
          nextActionAt: '2026-09-01',
          notes: 'Review the role before following up.',
        }}
        onFill={vi.fn()}
        onSaveApplication={saveApplication}
      />,
    );

    expect(saveApplication).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Open Job Flow' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Review and save this job' }),
    );

    expect(screen.getByLabelText<HTMLInputElement>('Company').value).toBe(
      'Acme',
    );
    const nextAction = screen.getByLabelText<HTMLInputElement>('Next action');
    expect(nextAction.type).toBe('date');
    expect(nextAction.value).toBe('2026-09-01');
    expect(screen.getByLabelText<HTMLTextAreaElement>('Notes').value).toBe(
      'Review the role before following up.',
    );

    fireEvent.change(screen.getByLabelText('Company'), {
      target: { value: 'Acme Careers' },
    });
    fireEvent.change(nextAction, {
      target: { value: '2026-09-03' },
    });
    fireEvent.change(screen.getByLabelText('Notes'), {
      target: { value: 'Follow up with the recruiter.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save to pipeline' }));

    expect(saveApplication).toHaveBeenCalledWith({
      company: 'Acme Careers',
      role: 'Senior Engineer',
      jobUrl: 'https://jobs.example/acme',
      stage: 'saved',
      nextActionAt: '2026-09-03',
      notes: 'Follow up with the recruiter.',
    });
  });
});
