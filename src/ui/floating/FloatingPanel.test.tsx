import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FloatingPanel } from './FloatingPanel';

describe('FloatingPanel', () => {
  it('shows analysis counts and requires an explicit fill action', () => {
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

    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getAllByText('1')).toHaveLength(2);
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('Ready')).toBeTruthy();
    expect(screen.getByText('Review')).toBeTruthy();
    expect(screen.getByText('Sensitive')).toBeTruthy();
    expect(screen.getByText('Unknown')).toBeTruthy();
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

    const button = screen.getByRole('button', {
      name: 'No safe fields ready to fill yet',
    });
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });
});
