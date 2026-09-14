import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { completeStage, Progress, renewDay } from '../domain/progress';
import { createProgressRepository } from './repository';

const repository = createProgressRepository(AsyncStorage);
export type SaveStatus = 'saved' | 'saving' | 'error';

export function useProgress() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const latest = useRef<Progress | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const revision = useRef(0);
  const mounted = useRef(true);

  const persist = useCallback((value: Progress) => {
    const version = ++revision.current;
    setSaveStatus('saving');
    repository.save(value).then(() => {
      if (mounted.current && version === revision.current) setSaveStatus('saved');
    }).catch(() => {
      if (mounted.current && version === revision.current) setSaveStatus('error');
    });
  }, []);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const value = await repository.load();
      if (!mounted.current) return;
      latest.current = value;
      setProgress(value);
    } catch {
      if (mounted.current) setLoadError(true);
    }
  }, []);

  const update = useCallback((transform: (current: Progress) => Progress) => {
    if (!latest.current) return;
    const value = transform(latest.current);
    if (value === latest.current) return;
    latest.current = value;
    setProgress(value);
    persist(value);
  }, [persist]);

  useEffect(() => {
    mounted.current = true;
    void load();
    return () => { mounted.current = false; };
  }, [load]);

  useEffect(() => {
    const checkDay = () => update(current => renewDay(current));
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') checkDay();
    });
    // Sem serviço em background: só atualiza o pequeno resumo enquanto o app está aberto.
    const interval = setInterval(checkDay, 30_000);
    return () => { subscription.remove(); clearInterval(interval); };
  }, [update]);

  return {
    progress, loadError, saveStatus,
    reload: load,
    retrySave: () => { if (latest.current) persist(latest.current); },
    finishStage: useCallback((id: string) => update(current => completeStage(current, id)), [update]),
    setReducedMotion: (enabled: boolean) => update(current => ({ ...current, preferences: { ...current.preferences, reducedMotion: enabled } })),
  };
}
