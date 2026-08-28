import { useCallback, useEffect, useRef, useState } from 'react';

import {
  createProfileBackup,
  parseProfileBackup,
  serializeProfileBackup,
} from '../../application/profile/profile-backup';
import type { ProfileRepository } from '../../application/profile/profile-repository';
import { createEmptyStoredProfile } from '../../domain/profile/create-empty-profile';
import type { StoredProfileEnvelope } from '../../domain/profile/profile-schema';
import type { VaultClient } from '../vault/SensitiveVaultSection';
import {
  ProfileFormSections,
  type ProfileMutation,
} from './sections/ProfileFormSections';
import type { WorkspaceSection } from './workspace-sections';

type ProfilePageProps = {
  repository: ProfileRepository;
  vaultClient?: VaultClient;
  activeSection?: WorkspaceSection;
};

type ProfileSaveState = 'clean' | 'dirty' | 'saving' | 'saved' | 'error';

const AUTOSAVE_DEBOUNCE_MS = 800;
const AUTOSAVE_MAX_WAIT_MS = 5_000;

const saveIndicatorTone: Record<ProfileSaveState, string> = {
  clean: 'bg-app-border-strong',
  dirty: 'bg-amber-600',
  saving: 'bg-app-ink',
  saved: 'bg-emerald-700',
  error: 'bg-red-700',
};

export function ProfilePage({
  repository,
  vaultClient,
  activeSection = 'personal',
}: ProfilePageProps) {
  const [profile, setProfile] = useState<StoredProfileEnvelope | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<ProfileSaveState>('clean');
  const profileRef = useRef<StoredProfileEnvelope | null>(null);
  const revisionRef = useRef(0);
  const savedRevisionRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxWaitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveInFlightRef = useRef<Promise<void> | null>(null);
  const saveQueuedRef = useRef(false);
  const mountedRef = useRef(true);
  const persistLatestRef = useRef<() => Promise<void>>(async () => undefined);

  const clearAutosaveTimers = useCallback(() => {
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (maxWaitTimerRef.current !== null) {
      clearTimeout(maxWaitTimerRef.current);
      maxWaitTimerRef.current = null;
    }
  }, []);

  const persistLatestProfile = useCallback(async () => {
    clearAutosaveTimers();

    if (saveInFlightRef.current !== null) {
      saveQueuedRef.current = true;
      return saveInFlightRef.current;
    }

    const current = profileRef.current;
    if (current === null || revisionRef.current === savedRevisionRef.current) {
      return;
    }

    const savingRevision = revisionRef.current;
    const next = {
      ...current,
      metadata: { ...current.metadata, updatedAt: new Date().toISOString() },
    };

    if (mountedRef.current) {
      setSaveState('saving');
      setError(null);
    }

    const operation = repository
      .save(next)
      .then(() => {
        savedRevisionRef.current = savingRevision;
        if (revisionRef.current === savingRevision) {
          profileRef.current = next;
          if (mountedRef.current) {
            setProfile(next);
            setSaveState('saved');
          }
        } else {
          saveQueuedRef.current = true;
          if (mountedRef.current) setSaveState('dirty');
        }
      })
      .catch(() => {
        if (mountedRef.current) {
          setError('Could not save your profile.');
          setSaveState('error');
        }
      })
      .finally(() => {
        saveInFlightRef.current = null;
        if (saveQueuedRef.current) {
          saveQueuedRef.current = false;
          void persistLatestRef.current();
        }
      });

    saveInFlightRef.current = operation;
    return operation;
  }, [clearAutosaveTimers, repository]);

  persistLatestRef.current = persistLatestProfile;

  const scheduleAutosave = useCallback(() => {
    if (saveInFlightRef.current !== null) {
      saveQueuedRef.current = true;
      return;
    }

    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      void persistLatestRef.current();
    }, AUTOSAVE_DEBOUNCE_MS);

    maxWaitTimerRef.current ??= setTimeout(() => {
      void persistLatestRef.current();
    }, AUTOSAVE_MAX_WAIT_MS);
  }, []);

  useEffect(() => {
    let active = true;
    void repository
      .load()
      .then((stored) => {
        if (active) {
          const loaded = stored ?? createEmptyStoredProfile();
          profileRef.current = loaded;
          revisionRef.current = 0;
          savedRevisionRef.current = 0;
          setProfile(loaded);
          setSaveState('clean');
        }
      })
      .catch(() => {
        if (active) setError('Could not load your profile.');
      });
    return () => {
      active = false;
    };
  }, [repository]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearAutosaveTimers();
    };
  }, [clearAutosaveTimers]);

  useEffect(() => {
    const flushWhenHidden = () => {
      if (document.visibilityState === 'hidden') {
        void persistLatestRef.current();
      }
    };
    document.addEventListener('visibilitychange', flushWhenHidden);
    return () => {
      document.removeEventListener('visibilitychange', flushWhenHidden);
    };
  }, []);

  function changeProfile(mutate: ProfileMutation) {
    const current = profileRef.current;
    if (current === null) return;
    const next = structuredClone(current);
    mutate(next);
    profileRef.current = next;
    revisionRef.current += 1;
    setProfile(next);
    setError(null);
    setSaveState('dirty');
    scheduleAutosave();
  }

  function exportProfile() {
    if (profile === null) return;
    const json = serializeProfileBackup(createProfileBackup(profile));
    const url = URL.createObjectURL(
      new Blob([json], { type: 'application/json;charset=utf-8' }),
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `jobflow-profile-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importProfile(file: File) {
    try {
      const imported = parseProfileBackup(await file.text()).profile;
      clearAutosaveTimers();
      while (saveInFlightRef.current !== null) {
        await saveInFlightRef.current;
      }
      await repository.save(imported);
      revisionRef.current += 1;
      savedRevisionRef.current = revisionRef.current;
      profileRef.current = imported;
      setProfile(imported);
      setError(null);
      setSaveState('saved');
    } catch {
      setError('Could not import this Job Flow backup.');
    }
  }

  if (error !== null && profile === null) {
    return (
      <section className="profile-page w-full pb-10 text-sm text-red-700">
        {error}
      </section>
    );
  }
  if (profile === null) {
    return (
      <section className="profile-page w-full pb-10 text-sm text-app-text">
        Loading profile…
      </section>
    );
  }

  const saveStateText =
    saveState === 'saving'
      ? 'Saving profile...'
      : saveState === 'saved'
        ? 'Profile saved.'
        : saveState === 'dirty'
          ? 'Changes pending.'
          : saveState === 'error'
            ? 'Autosave failed. Edit again to retry.'
            : 'All changes saved.';

  return (
    <section className="profile-page w-full pb-10">
      <div className="mb-4 flex min-h-8 items-center justify-end gap-2 border-b border-app-border pb-3">
        <span
          className={`profile-save-indicator h-2 w-2 shrink-0 rounded-full ${saveIndicatorTone[saveState]}`}
          data-state={saveState}
          aria-hidden="true"
        />
        <p
          className="m-0 text-[11px] leading-4 text-app-subtle"
          role="status"
          aria-live="polite"
        >
          {saveStateText}
        </p>
      </div>

      {error !== null ? (
        <p
          className="mb-4 rounded-control border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <ProfileFormSections
        activeSection={activeSection}
        changeProfile={changeProfile}
        exportProfile={exportProfile}
        importProfile={importProfile}
        profile={profile}
        vaultClient={vaultClient}
      />
    </section>
  );
}
