import { Plus, Trash2 } from 'lucide-react';

import {
  EmptyState,
  IconButton,
  RecordCard,
  RecordHeader,
  TextareaField,
  TextField,
} from '../../design-system/primitives';
import {
  WorkspaceSection,
  WorkspaceSectionHeader,
} from '../../design-system/WorkspaceSectionCard';
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
    <WorkspaceSection hidden={activeSection !== 'documents'}>
      <WorkspaceSectionHeader
        title="Reusable answers"
        description="Keep answers you reuse across application forms. Resume files are managed above as stored documents."
        action={
          <IconButton
            size="sm"
            aria-label="Add answer"
            title="Add answer"
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
          </IconButton>
        }
      />

      {profile.baseProfile.customAnswers.length === 0 ? (
        <EmptyState>No reusable answers added yet.</EmptyState>
      ) : (
        <div className="grid gap-4">
          {profile.baseProfile.customAnswers.map((answer, index) => (
            <RecordCard
              key={answer.id}
              action={
                <IconButton
                  size="xs"
                  tone="danger"
                  aria-label={`Remove answer ${index + 1}`}
                  title={`Remove answer ${index + 1}`}
                  onClick={() =>
                    changeProfile((draft) =>
                      draft.baseProfile.customAnswers.splice(index, 1),
                    )
                  }
                >
                  <Trash2 aria-hidden="true" size={14} />
                </IconButton>
              }
            >
              <RecordHeader
                title={answer.question || `Reusable answer ${index + 1}`}
                context={
                  answer.tags.length > 0
                    ? answer.tags.join(' · ')
                    : 'Reusable application response'
                }
              />
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
            </RecordCard>
          ))}
        </div>
      )}
    </WorkspaceSection>
  );
}
