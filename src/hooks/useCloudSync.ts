import { useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  isFirebaseConfigured,
  loadCloudState,
  saveCloudState,
} from '../lib/firebase';
import type { RepackrCloudState } from '../types';

export function useCloudSync(
  user: User | null,
  localMode: boolean,
  state: RepackrCloudState,
  applyCloudState: (data: RepackrCloudState) => void,
): boolean {
  const [cloudReady, setCloudReady] = useState(
    () => localMode || !isFirebaseConfigured() || !user,
  );
  const hydratedForUser = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSave = useRef(false);

  useEffect(() => {
    if (localMode || !isFirebaseConfigured() || !user) {
      setCloudReady(true);
      hydratedForUser.current = null;
      return;
    }

    if (hydratedForUser.current === user.uid) return;

    let cancelled = false;
    setCloudReady(false);

    void loadCloudState(user.uid).then((cloud) => {
      if (cancelled) return;
      if (cloud) {
        skipNextSave.current = true;
        applyCloudState(cloud);
      }
      hydratedForUser.current = user.uid;
      setCloudReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [user, localMode, applyCloudState]);

  useEffect(() => {
    if (!user || localMode || !isFirebaseConfigured() || !cloudReady) return;

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
  }, [user, localMode, cloudReady, state]);

  useEffect(() => {
    if (!user) {
      hydratedForUser.current = null;
    }
  }, [user]);

  return cloudReady;
}
