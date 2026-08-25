import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WorkspaceNavigation } from './WorkspaceNavigation';

describe('WorkspaceNavigation', () => {
  it('exposes the active category and switches without scrolling a long form', () => {
    const onChange = vi.fn();

    render(
      <WorkspaceNavigation activeSection="overview" onChange={onChange} />,
    );

    expect(
      screen
        .getByRole('button', { name: 'Overview' })
        .getAttribute('aria-current'),
    ).toBe('page');

    fireEvent.click(screen.getByRole('button', { name: 'Experience' }));
    expect(onChange).toHaveBeenCalledWith('experience');
  });
});
