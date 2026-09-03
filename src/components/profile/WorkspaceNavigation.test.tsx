import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WorkspaceNavigation } from './WorkspaceNavigation';

describe('WorkspaceNavigation', () => {
  it('exposes the active category and keeps skills inside career records', () => {
    const onChange = vi.fn();

    render(
      <WorkspaceNavigation activeSection="personal" onChange={onChange} />,
    );

    expect(
      screen
        .getByRole('button', { name: 'Profile' })
        .getAttribute('aria-current'),
    ).toBe('page');
    expect(screen.queryByRole('button', { name: 'Overview' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Contact' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Links' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Skills' })).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Application Profiles' }),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Autofill Memory' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Experience' }));
    expect(onChange).toHaveBeenCalledWith('experience');
  });
});
