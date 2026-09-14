// Leitor das versões 1 e 2: mantido para migrar sem apagar conquistas antigas.
import { GAME_IDS, GameId } from '../minigames/types';
import {
  getStageStatus,
  LEGACY_STAGE_IDS,
  STAGES,
  unlockedGames,
} from '../trail/stages';

export type DailyTask = {
  id: string;
  game: GameId;
  variation: number;
  completed: boolean;
};
export type LegacyProgress = {
  version: 2;
  completedStageIds: string[];
  daily: { date: string; tasks: DailyTask[] };
  preferences: { reducedMotion: boolean };
  recentSessionIds: string[];
};
export const DAILY_TARGET = 3;
export function localDay(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function makeDaily(
  date: string,
  completed: readonly string[],
): LegacyProgress['daily'] {
  const available = unlockedGames(completed);
  const seed = [...date].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const tasks = Array.from({ length: DAILY_TARGET }, (_, index) => ({
    id: `${date}:${index}`,
    game: available[(seed + index) % available.length]!,
    variation: (seed + index) % 3,
    completed: false,
  }));
  return { date, tasks };
}
export function initialLegacyProgress(now = new Date()): LegacyProgress {
  return {
    version: 2,
    completedStageIds: [],
    daily: makeDaily(localDay(now), []),
    preferences: { reducedMotion: false },
    recentSessionIds: [],
  };
}
export function renewDay(
  progress: LegacyProgress,
  now = new Date(),
): LegacyProgress {
  const date = localDay(now);
  return progress.daily.date === date
    ? progress
    : { ...progress, daily: makeDaily(date, progress.completedStageIds) };
}

function validDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  return !Number.isNaN(parsed.getTime()) && localDay(parsed) === date;
}

export function decodeLegacyProgress(
  raw: string,
  now = new Date(),
): LegacyProgress {
  const value = JSON.parse(raw);
  if (
    !value ||
    ![1, 2].includes(value.version) ||
    !Array.isArray(value.completedStageIds) ||
    !value.daily ||
    typeof value.daily.date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value.daily.date) ||
    !validDate(value.daily.date) ||
    typeof value.preferences?.reducedMotion !== 'boolean'
  )
    throw new Error('Formato de progresso não reconhecido.');
  const completed: string[] = [];
  for (const stage of STAGES) {
    if (!value.completedStageIds.includes(stage.id)) break;
    completed.push(stage.id);
  }
  // Clareira e bosque continuam conquistas históricas; não pulam os novos jogos.
  if (completed.includes('jardim'))
    for (const id of LEGACY_STAGE_IDS)
      if (value.completedStageIds.includes(id)) completed.push(id);
  let daily: LegacyProgress['daily'];
  if (value.version === 1) {
    if (!Array.isArray(value.daily.completedStageIds))
      throw new Error('Registro diário inválido.');
    daily = {
      date: value.daily.date,
      tasks: ['jardim', ...LEGACY_STAGE_IDS].map((id, index) => ({
        id: `${value.daily.date}:${index}`,
        game: 'grass',
        variation: index,
        completed:
          completed.includes(id) && value.daily.completedStageIds.includes(id),
      })),
    };
  } else {
    if (
      !Array.isArray(value.daily.tasks) ||
      value.daily.tasks.length !== DAILY_TARGET ||
      !Array.isArray(value.recentSessionIds)
    )
      throw new Error('Registro diário inválido.');
    const allowed = unlockedGames(completed);
    const tasks: DailyTask[] = value.daily.tasks.map(
      (task: DailyTask, index: number) => {
        if (
          !task ||
          task.id !== `${value.daily.date}:${index}` ||
          !GAME_IDS.includes(task.game) ||
          !allowed.includes(task.game) ||
          !Number.isInteger(task.variation) ||
          task.variation < 0 ||
          task.variation > 2 ||
          typeof task.completed !== 'boolean'
        )
          throw new Error('Tarefa inválida.');
        return {
          id: task.id,
          game: task.game,
          variation: task.variation,
          completed: task.completed,
        };
      },
    );
    daily = { date: value.daily.date, tasks };
  }
  return renewDay(
    {
      version: 2,
      completedStageIds: completed,
      daily,
      preferences: { reducedMotion: value.preferences.reducedMotion },
      recentSessionIds:
        value.version === 2
          ? value.recentSessionIds
              .filter((id: unknown) => typeof id === 'string')
              .slice(-64)
          : [],
    },
    now,
  );
}
