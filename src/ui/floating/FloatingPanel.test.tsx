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
});
