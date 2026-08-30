import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LinkedSkillEditor } from './LinkedSkillEditor';

describe('LinkedSkillEditor', () => {
  it('adds a skill on Enter without exposing skill levels', () => {
    const onAdd = vi.fn();

    render(
      <LinkedSkillEditor
        editorId="experience-1"
        contextLabel="experience 1"
        linkedSkills={[]}
        skills={['TypeScript', 'PostgreSQL']}
        onAdd={onAdd}
        onRemove={vi.fn()}
      />,
    );

    const input = screen.getByRole('combobox', { name: 'Skills' });
    fireEvent.change(input, { target: { value: 'TypeScript' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onAdd).toHaveBeenCalledWith('TypeScript');
    expect(
      screen.queryByRole('textbox', { name: 'Skill level' }),
    ).toBeNull();
  });

  it('does not add a case-insensitive duplicate already linked to the record', () => {
    const onAdd = vi.fn();

    render(
      <LinkedSkillEditor
        editorId="project-1"
        contextLabel="project 1"
        linkedSkills={['PostgreSQL']}
        skills={['PostgreSQL']}
        onAdd={onAdd}
        onRemove={vi.fn()}
      />,
    );

    const input = screen.getByRole('combobox', { name: 'Skills' });
    fireEvent.change(input, { target: { value: ' postgresql ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onAdd).not.toHaveBeenCalled();
  });
});
