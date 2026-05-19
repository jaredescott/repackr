import { useEffect, useRef } from 'react';
import type { User } from 'firebase/auth';
import {
  isFirebaseConfigured,
  loadCloudState,
  saveCloudState,
} from '../lib/firebase';
import type { RepackrCloudState } from '../types';

function isValidCloudState(data: unknown): data is RepackrCloudState {
  if (!data || typeof data !== 'object') return false;
  const cloud = data as RepackrCloudState;
  return (
    Array.isArray(cloud.masterItems) &&
    Array.isArray(cloud.dailyBoards) &&
    typeof cloud.packedItems === 'object' &&
    cloud.packedItems !== null
  );
}

/** Loads and saves trip data when signed in. Never blocks the UI. */
export function useCloudSync(
  user: User | null,
  state: RepackrCloudState,
  applyCloudState: (data: RepackrCloudState) => void,
): void {
  const hydratedForUser = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSave = useRef(false);

  useEffect(() => {
    if (!isFirebaseConfigured() || !user) {
      hydratedForUser.current = null;
      return;
    }

    if (hydratedForUser.current === user.uid) return;

    let cancelled = false;

    void loadCloudState(user.uid)
      .then((cloud) => {
        if (cancelled || !cloud || !isValidCloudState(cloud)) return;
        skipNextSave.current = true;
        applyCloudState(cloud);
      })
      .catch((err) => {
        console.error('Failed to load cloud state', err);
      })
      .finally(() => {
        if (!cancelled) hydratedForUser.current = user.uid;
      });

    return () => {
      cancelled = true;
    };
  }, [user, applyCloudState]);

  useEffect(() => {
    if (!user || !isFirebaseConfigured()) return;
    if (hydratedForUser.current !== user.uid) return;

    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void saveCloudState(user.uid, state).catch((err) => {
        console.error('Cloud sync failed', err);
      });
    }, 800);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [user, state]);

  useEffect(() => {
    if (!user) {
      hydratedForUser.current = null;
    }
  }, [user]);
}
