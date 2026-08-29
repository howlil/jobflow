import { Plus, Trash2 } from 'lucide-react';

import {
  Button,
  EmptyState,
  Section,
  SectionHeader,
  TextareaField,
  TextField,
} from '../../design-system/primitives';
import {
  createProfileItemId,
  listValue,
  parseList,
} from './profile-section-helpers';
import type { ProfileSectionProps } from './profile-section-types';

export function DocumentsSection({
  activeSection,
  changeProfile,
  profile,
}: ProfileSectionProps) {
  return (
    <Section hidden={activeSection !== 'documents'}>
      <SectionHeader
        title="Reusable answers"
        description="Keep answers you reuse across application forms. Resume files are managed above as stored documents."
        action={
          <Button
            onClick={() =>
              changeProfile((draft) =>
                draft.baseProfile.customAnswers.push({
                  id: createProfileItemId(),
                  question: '',
                  answer: '',
                  canonicalIntent: '',
                  tags: [],
                }),
              )
            }
          >
            <Plus aria-hidden="true" size={16} />
            Add answer
          </Button>
        }
      />

      {profile.baseProfile.customAnswers.length === 0 ? (
        <EmptyState>No reusable answers added yet.</EmptyState>
      ) : (
        <div className="grid gap-3">
          {profile.baseProfile.customAnswers.map((answer, index) => (
            <article
              className="grid gap-4 rounded-app border border-app-border bg-app-muted p-4"
              key={answer.id}
            >
              <TextField
                label="Question"
                value={answer.question}
                onChange={(event) =>
                  changeProfile((draft) => {
                    const item = draft.baseProfile.customAnswers[index];
                    if (item !== undefined) item.question = event.target.value;
                  })
                }
              />
              <TextareaField
                label="Answer"
                value={answer.answer}
                onChange={(event) =>
                  changeProfile((draft) => {
                    const item = draft.baseProfile.customAnswers[index];
                    if (item !== undefined) item.answer = event.target.value;
                  })
                }
              />
              <TextField
                label="Tags, comma separated"
                value={listValue(answer.tags)}
                onChange={(event) =>
                  changeProfile((draft) => {
                    const item = draft.baseProfile.customAnswers[index];
                    if (item !== undefined)
                      item.tags = parseList(event.target.value);
                  })
                }
              />
              <Button
                className="justify-self-start"
                variant="danger"
                onClick={() =>
                  changeProfile((draft) =>
                    draft.baseProfile.customAnswers.splice(index, 1),
                  )
                }
              >
                <Trash2 aria-hidden="true" size={16} />
                Remove answer
              </Button>
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
