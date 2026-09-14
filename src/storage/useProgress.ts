import { Session } from '../minigames/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
  completeSession,
  initialProgress,
  Progress,
  renewDay,
} from '../domain/progress';
import { createProgressRepository } from './repository';

const repository = createProgressRepository(AsyncStorage);
export type SaveStatus = 'saved' | 'saving' | 'error';

export function useProgress() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const latest = useRef<Progress | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const resetting = useRef(false);
  const [resetError, setResetError] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const revision = useRef(0);
  const mounted = useRef(true);

  const persist = useCallback((value: Progress) => {
    const version = ++revision.current;
    setSaveStatus('saving');
    repository
      .save(value)
      .then(() => {
        if (mounted.current && version === revision.current)
          setSaveStatus('saved');
      })
      .catch(() => {
        if (mounted.current && version === revision.current)
          setSaveStatus('error');
      });
  }, []);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const value = await repository.load();
      if (!mounted.current) return;
      latest.current = value;
      setProgress(value);
      persist(value);
    } catch {
      if (mounted.current) setLoadError(true);
    }
  }, [persist]);

  const update = useCallback(
    (transform: (current: Progress) => Progress) => {
      if (!latest.current || resetting.current) return;
      const value = transform(latest.current);
      if (value === latest.current) return;
      latest.current = value;
      setProgress(value);
      persist(value);
    },
    [persist],
  );

  useEffect(() => {
    mounted.current = true;
    void load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  useEffect(() => {
    const checkDay = () => update((current) => renewDay(current));
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkDay();
    });
    // Sem serviço em background: só atualiza o pequeno resumo enquanto o app está aberto.
    const interval = setInterval(checkDay, 30_000);
    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [update]);

  return {
    progress,
    loadError,
    saveStatus,
    resetError,
    resetBusy,
    reset: async () => {
      if (resetting.current) return false;
      resetting.current = true;
      setResetBusy(true);
      setResetError(false);
      // Invalida respostas de gravações anteriores; a fila salva o estado vazio por último.
      revision.current += 1;
      try {
        const clean = initialProgress();
        await repository.save(clean);
        latest.current = clean;
        setProgress(clean);
        setSaveStatus('saved');
        return true;
      } catch {
        setResetError(true);
        setSaveStatus('error');
        return false;
      } finally {
        resetting.current = false;
        setResetBusy(false);
      }
    },
    reload: load,
    retrySave: () => {
      if (latest.current && !resetting.current) persist(latest.current);
    },
    finishSession: useCallback(
      (session: Session) =>
        update((current) => completeSession(current, session)),
      [update],
    ),
    setReducedMotion: (enabled: boolean) =>
      update((current) => ({
        ...current,
        preferences: { ...current.preferences, reducedMotion: enabled },
      })),
  };
}
