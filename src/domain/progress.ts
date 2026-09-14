import { getStageStatus, STAGES } from '../trail/stages';

export type Progress = {
  version: 1;
  completedStageIds: string[];
  daily: { date: string; completedStageIds: string[] };
  preferences: { reducedMotion: boolean };
};

export const DAILY_TARGET = 3;

// Usa o dia do aparelho, não UTC: no Brasil o UTC poderia virar antes da meia-noite.
export function localDay(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function initialProgress(now = new Date()): Progress {
  return { version: 1, completedStageIds: [], daily: { date: localDay(now), completedStageIds: [] }, preferences: { reducedMotion: false } };
}

export function renewDay(progress: Progress, now = new Date()): Progress {
  const date = localDay(now);
  if (progress.daily.date === date) return progress;
  return { ...progress, daily: { date, completedStageIds: [] } };
}

export function completeStage(progress: Progress, id: string, now = new Date()): Progress {
  if (getStageStatus(id, progress.completedStageIds) === 'locked') return progress;
  const current = renewDay(progress, now);
  const permanent = current.completedStageIds.includes(id);
  const today = current.daily.completedStageIds.includes(id);
  if (permanent && today) return current;
  return {
    ...current,
    completedStageIds: permanent ? current.completedStageIds : [...current.completedStageIds, id],
    daily: { ...current.daily, completedStageIds: today ? current.daily.completedStageIds : [...current.daily.completedStageIds, id] },
  };
}

// Só aceitamos a sequência válida de etapas; dados inválidos não desbloqueiam atalhos.
export function decodeProgress(raw: string, now = new Date()): Progress {
  const value = JSON.parse(raw);
  if (!value || value.version !== 1 || !Array.isArray(value.completedStageIds)
    || !value.daily || typeof value.daily.date !== 'string' || !Array.isArray(value.daily.completedStageIds)
    || !value.preferences || typeof value.preferences.reducedMotion !== 'boolean') {
    throw new Error('Formato de progresso não reconhecido.');
  }
  const ids: string[] = [];
  for (const stage of STAGES) {
    if (!value.completedStageIds.includes(stage.id)) break;
    ids.push(stage.id);
  }
  return renewDay({
    version: 1,
    completedStageIds: ids,
    daily: { date: value.daily.date, completedStageIds: ids.filter(id => value.daily.completedStageIds.includes(id)) },
    preferences: { reducedMotion: value.preferences.reducedMotion },
  }, now);
}
