import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { Session } from '../minigames/types';
import { completeSession, renewDay, localDay } from '../domain/progress';
import { buyItem, equipItem, placeDecoration } from '../economy/rules';
import { SlotId } from '../economy/catalog';
import { createProgressRepository } from './repository';
import { createTransactions } from './transactions';
export type SaveStatus = 'saved' | 'saving' | 'error';
export function useProgress() {
  const [transactions] = useState(() =>
    createTransactions(createProgressRepository(AsyncStorage)),
  );
  const [snapshot, setSnapshot] = useState(transactions.getSnapshot);
  const [loadError, setLoadError] = useState(false);
  const [resetError, setResetError] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const mounted = useRef(true);
  const load = useCallback(async () => {
    setLoadError(false);
    try {
      await transactions.load();
    } catch {
      if (mounted.current) setLoadError(true);
    }
  }, [transactions]);
  useEffect(() => {
    mounted.current = true;
    const unsubscribe = transactions.subscribe(() => {
      if (mounted.current) setSnapshot(transactions.getSnapshot());
    });
    void load();
    return () => {
      mounted.current = false;
      unsubscribe();
    };
  }, [transactions, load]);
  useEffect(() => {
    const checkDay = () => {
      const current = transactions.getSnapshot().progress;
      if (!current || current.daily.date === localDay()) return;
      void transactions.run(
        (p) => ({ progress: renewDay(p), ok: true, message: '' }),
        'day',
      );
    };
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkDay();
    });
    const timer = setInterval(checkDay, 30_000);
    return () => {
      sub.remove();
      clearInterval(timer);
    };
  }, [transactions]);
  const finishSession = useCallback(
    (session: Session) => {
      return transactions.run(
        (p) => ({
          progress: completeSession(p, session, new Date()),
          ok: true,
          message: 'Conclusão salva.',
        }),
        `session:${session.id}`,
      );
    },
    [transactions],
  );
  return {
    progress: snapshot.progress,
    busy: snapshot.busy,
    loadError,
    resetError,
    resetBusy,
    saveStatus: (snapshot.busy
      ? 'saving'
      : snapshot.error
        ? 'error'
        : 'saved') as SaveStatus,
    reload: load,
    retrySave: () => {
      void transactions.retry();
    },
    finishSession,
    buy: (id: string) => transactions.run((p) => buyItem(p, id), `buy:${id}`),
    equip: (slot: 'grassTool' | 'grassAppearance', id: string | null) =>
      transactions.run((p) => equipItem(p, slot, id), `equip:${slot}:${id}`),
    place: (slot: SlotId, id: string | null) =>
      transactions.run(
        (p) => placeDecoration(p, slot, id),
        `place:${slot}:${id}`,
      ),
    setReducedMotion: (enabled: boolean) => {
      void transactions.run(
        (p) => ({
          progress: {
            ...p,
            preferences: { ...p.preferences, reducedMotion: enabled },
          },
          ok: true,
          message: '',
        }),
        'preferences',
      );
    },
    reset: async () => {
      setResetBusy(true);
      setResetError(false);
      const result = await transactions.reset();
      if (mounted.current) {
        setResetBusy(false);
        setResetError(!result.ok);
      }
      return result.ok;
    },
  };
}
