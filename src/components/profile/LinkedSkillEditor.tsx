import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';

import { Chip, IconButton, TextField } from '../ui';

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
            <Chip
              strong
              className="min-h-9 pr-0"
              key={`${normalize(linkedName)}:${linkedName}`}
            >
              <span className="pl-1">{linkedName}</span>
              <IconButton
                size="xs"
                className="border-transparent text-app-subtle hover:border-transparent hover:text-app-ink"
                aria-label={`Remove ${linkedName} from ${contextLabel}`}
                title={`Remove ${linkedName}`}
                onClick={() => onRemove(linkedName)}
              >
                <X aria-hidden="true" size={14} />
              </IconButton>
            </Chip>
          ))}
        </div>
      ) : (
        <p className="m-0 text-[13px] leading-5 text-app-subtle">
          No skills linked yet.
        </p>
      )}
    </div>
  );
}
