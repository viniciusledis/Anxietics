import { GAME_IDS, GameId, Session } from '../minigames/types';
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
export type Progress = {
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
): Progress['daily'] {
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
export function initialProgress(now = new Date()): Progress {
  return {
    version: 2,
    completedStageIds: [],
    daily: makeDaily(localDay(now), []),
    preferences: { reducedMotion: false },
    recentSessionIds: [],
  };
}
export function renewDay(progress: Progress, now = new Date()): Progress {
  const date = localDay(now);
  return progress.daily.date === date
    ? progress
    : { ...progress, daily: makeDaily(date, progress.completedStageIds) };
}

// Uma partida pertence a exatamente um contexto. Modo livre nunca concede conquista.
export function completeSession(
  progress: Progress,
  session: Session,
  now = new Date(),
): Progress {
  const current = renewDay(progress, now);
  if (
    session.mode === 'dev' ||
    session.sandbox ||
    current.recentSessionIds.includes(session.id)
  )
    return current;
  if (!unlockedGames(current.completedStageIds).includes(session.game))
    return current;
  let completedStageIds = current.completedStageIds;
  let daily = current.daily;
  if (session.mode === 'trail') {
    const stage = STAGES.find((item) => item.id === session.stageId);
    if (
      !stage ||
      stage.game !== session.game ||
      stage.variation !== session.variation ||
      getStageStatus(stage.id, completedStageIds) === 'locked'
    )
      return current;
    if (!completedStageIds.includes(stage.id))
      completedStageIds = [...completedStageIds, stage.id];
  } else if (session.mode === 'daily') {
    // Não marca uma tarefa nova com o callback de uma rodada do dia anterior.
    if (session.day !== daily.date) return current;
    const task = daily.tasks.find(
      (item) =>
        item.id === session.taskId &&
        item.game === session.game &&
        item.variation === session.variation,
    );
    if (!task) return current;
    daily = {
      ...daily,
      tasks: daily.tasks.map((item) =>
        item.id === task.id ? { ...item, completed: true } : item,
      ),
    };
  }
  return {
    ...current,
    completedStageIds,
    daily,
    recentSessionIds: [...current.recentSessionIds.slice(-63), session.id],
  };
}

// Conveniência para testes de trilha; na interface cada tentativa recebe seu próprio id.
export function completeStage(
  progress: Progress,
  id: string,
  now = new Date(),
): Progress {
  const stage = STAGES.find((item) => item.id === id);
  if (!stage) return progress;
  return completeSession(
    progress,
    {
      id: `trail:${id}`,
      mode: 'trail',
      game: stage.game,
      variation: stage.variation,
      stageId: id,
    },
    now,
  );
}

export function decodeProgress(raw: string, now = new Date()): Progress {
  const value = JSON.parse(raw);
  if (
    !value ||
    ![1, 2].includes(value.version) ||
    !Array.isArray(value.completedStageIds) ||
    !value.daily ||
    typeof value.daily.date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value.daily.date) ||
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
  let daily: Progress['daily'];
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
