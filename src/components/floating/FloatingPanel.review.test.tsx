import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { FloatingPanel } from './FloatingPanel';

it('lets the user remember or ignore a Review field after opening review', () => {
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

  fireEvent.click(screen.getByRole('button', { name: 'Open Job Flow' }));
  fireEvent.click(
    screen.getByRole('button', { name: /Review reusable fields/i }),
  );
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Use First name for Name',
    }),
  );
  expect(remember).toHaveBeenCalledWith(context, 'personal.legalName.first');
  expect(screen.queryByText('personal.legalName.first')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Ignore Name' }));
  expect(remember).toHaveBeenCalledWith(context, 'ignore');
});

it('lets the user teach an unknown field with an existing reusable answer', () => {
  const remember = vi.fn();
  const context = {
    controlKind: 'textarea' as const,
    inputType: 'textarea',
    label: 'Motivation statement',
    name: 'motivation',
    id: '',
    placeholder: '',
    ariaLabel: '',
    options: [],
    sectionText: '',
    origin: 'site',
    formFingerprint: 'form',
    fieldFingerprint: 'unknown-field',
  };

  render(
    <FloatingPanel
      summary={{ ready: 0, needsReview: 0, sensitive: 0, unknown: 1, total: 1 }}
      unknownItems={[
        {
          context,
          match: { status: 'unknown', reason: 'no-match' },
        },
      ]}
      reusableAnswers={[{ id: 'answer-1', label: 'Why this role?' }]}
      onFill={vi.fn()}
      onRemember={remember}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Open Job Flow' }));
  fireEvent.click(
    screen.getByRole('button', { name: /Review reusable fields/i }),
  );
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Use Why this role? for Motivation statement',
    }),
  );

  expect(remember).toHaveBeenCalledWith(context, 'answer:answer-1');
});
