import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';

import { Chip, IconButton, TextField } from '../design-system/primitives';

type LinkedSkillEditorProps = {
  editorId: string;
  contextLabel: string;
  linkedSkills: string[];
  skills: string[];
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
};

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

export function LinkedSkillEditor({
  editorId,
  contextLabel,
  linkedSkills,
  skills,
  onAdd,
  onRemove,
}: LinkedSkillEditorProps) {
  const [skillName, setSkillName] = useState('');
  const datalistId = `linked-skill-options-${editorId}`;
  const linkedKeys = useMemo(
    () => new Set(linkedSkills.map(normalize)),
    [linkedSkills],
  );
  const suggestions = useMemo(() => {
    const byName = new Map<string, string>();
    for (const value of skills) {
      const name = value.trim().replace(/\s+/g, ' ');
      const key = normalize(name);
      if (key === '' || byName.has(key)) continue;
      byName.set(key, name);
    }
    return [...byName.values()];
  }, [skills]);

  function addSkill() {
    const name = skillName.trim().replace(/\s+/g, ' ');
    if (name === '') return;
    if (!linkedKeys.has(normalize(name))) onAdd(name);
    setSkillName('');
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <TextField
          label="Skills"
          list={datalistId}
          placeholder="Type a skill and press Enter"
          value={skillName}
          onChange={(event) => setSkillName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ',') return;
            event.preventDefault();
            addSkill();
          }}
        />
        <IconButton
          size="md"
          className="self-end"
          aria-label={`Add skill to ${contextLabel}`}
          title="Add skill"
          disabled={skillName.trim() === ''}
          onClick={addSkill}
        >
          <Plus aria-hidden="true" size={16} />
        </IconButton>
      </div>

      <datalist id={datalistId}>
        {suggestions.map((name) => (
          <option value={name} key={normalize(name)} />
        ))}
      </datalist>

      {linkedSkills.length > 0 ? (
        <div className="flex flex-wrap gap-2" aria-label="Linked skills">
          {linkedSkills.map((linkedName) => (
            <Chip strong className="pr-1" key={`${normalize(linkedName)}:${linkedName}`}>
              <span>{linkedName}</span>
              <button
                className="grid h-5 w-5 place-items-center rounded text-app-subtle transition hover:bg-app-muted hover:text-app-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-ink"
                type="button"
                aria-label={`Remove ${linkedName} from ${contextLabel}`}
                onClick={() => onRemove(linkedName)}
              >
                <X aria-hidden="true" size={12} />
              </button>
            </Chip>
          ))}
        </div>
      ) : (
        <p className="m-0 text-[11px] leading-4 text-app-subtle">
          No skills linked yet.
        </p>
      )}
    </div>
  );
}
