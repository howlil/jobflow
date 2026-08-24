import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { FloatingPanel } from './FloatingPanel';

it('lets the user remember or ignore a Review field', () => {
  const remember = vi.fn();
  const context = {
    controlKind: 'input' as const,
    inputType: 'text',
    label: 'Name',
    name: '',
    id: '',
    placeholder: '',
    ariaLabel: '',
    options: [],
    sectionText: '',
    origin: 'site',
    formFingerprint: 'form',
    fieldFingerprint: 'field',
  };
  render(
    <FloatingPanel
      summary={{ ready: 0, needsReview: 1, sensitive: 0, unknown: 0, total: 1 }}
      reviewItems={[
        {
          context,
          match: {
            status: 'review',
            reason: 'ambiguous-heuristic',
            sensitivity: 'normal',
            candidates: [{ field: 'personal.legalName.first', score: 0.6 }],
          },
        },
      ]}
      onFill={vi.fn()}
      onRemember={remember}
    />,
  );
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Use personal.legalName.first for Name',
    }),
  );
  expect(remember).toHaveBeenCalledWith(context, 'personal.legalName.first');
  fireEvent.click(screen.getByRole('button', { name: 'Ignore Name' }));
  expect(remember).toHaveBeenCalledWith(context, 'ignore');
});
