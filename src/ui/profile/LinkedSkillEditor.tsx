import { useState } from 'react';
import { Plus, X } from 'lucide-react';

import { Chip, IconButton, TextField } from '../design-system/primitives';

type SkillOption = {
  id: string;
  name: string;
  level: string;
};

type LinkedSkillEditorProps = {
  editorId: string;
  contextLabel: string;
  linkedSkills: string[];
  skills: SkillOption[];
  onAdd: (name: string, level: string) => void;
  onRemove: (name: string) => void;
};

export function LinkedSkillEditor({
  editorId,
  contextLabel,
  linkedSkills,
  skills,
  onAdd,
  onRemove,
}: LinkedSkillEditorProps) {
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  const datalistId = `linked-skill-options-${editorId}`;

  function addSkill() {
    const name = skillName.trim();
    const level = skillLevel.trim();
    if (name === '') return;
    onAdd(name, level);
    setSkillName('');
    setSkillLevel('');
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(140px,0.45fr)_auto] sm:items-end">
        <TextField
          label="Skill"
          list={datalistId}
          placeholder="Type or choose a skill"
          value={skillName}
          onChange={(event) => {
            const nextName = event.target.value;
            setSkillName(nextName);
            const existing = skills.find(
              (skill) =>
                skill.name.trim().toLowerCase() ===
                nextName.trim().toLowerCase(),
            );
            setSkillLevel(existing?.level ?? '');
          }}
        />
        <TextField
          label="Skill level"
          placeholder="e.g. Advanced"
          value={skillLevel}
          onChange={(event) => setSkillLevel(event.target.value)}
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
        {skills
          .filter((skill) => skill.name.trim() !== '')
          .map((skill) => (
            <option value={skill.name} key={skill.id} />
          ))}
      </datalist>

      {linkedSkills.length > 0 ? (
        <div className="flex flex-wrap gap-2" aria-label="Linked skills">
          {linkedSkills.map((linkedName) => {
            const canonicalSkill = skills.find(
              (skill) =>
                skill.name.trim().toLowerCase() === linkedName.toLowerCase(),
            );
            const level = canonicalSkill?.level.trim() ?? '';
            return (
              <Chip strong className="pr-1" key={linkedName}>
                <span>
                  {linkedName}
                  {level === '' ? '' : ` · ${level}`}
                </span>
                <button
                  className="grid h-5 w-5 place-items-center rounded text-app-subtle transition hover:bg-app-muted hover:text-app-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-ink"
                  type="button"
                  aria-label={`Remove ${linkedName} from ${contextLabel}`}
                  onClick={() => onRemove(linkedName)}
                >
                  <X aria-hidden="true" size={12} />
                </button>
              </Chip>
            );
          })}
        </div>
      ) : (
        <p className="m-0 text-[11px] leading-4 text-app-subtle">
          No skills linked yet.
        </p>
      )}
    </div>
  );
}
