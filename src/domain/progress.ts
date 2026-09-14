import { GameId, Session } from '../minigames/types';
import { GAME_INFO } from '../minigames/definitions';
import { STAGES, getStageStatus, unlockedGames } from '../trail/stages';
import { ECONOMY, levelFor } from '../economy/config';
import {
  ACHIEVEMENTS,
  achievementProgress,
  award,
  copyEconomy,
  createEconomy,
  grantAchievements,
} from '../economy/rules';
import { Economy, RewardReceipt } from '../economy/types';
import { decodeEconomy } from '../economy/decode';
import {
  decodeLegacyProgress,
  initialLegacyProgress,
  LegacyProgress,
  makeDaily,
  localDay,
} from './legacy';
export { makeDaily, localDay, DAILY_TARGET } from './legacy';
export type { DailyTask } from './legacy';
export type Progress = Omit<LegacyProgress, 'version'> & {
  version: 3;
  economy: Economy;
};
export function initialProgress(now = new Date()): Progress {
  return {
    ...initialLegacyProgress(now),
    version: 3,
    economy: createEconomy(),
  };
}
export function renewDay(p: Progress, now = new Date()): Progress {
  const date = localDay(now);
  return p.daily.date === date
    ? p
    : { ...p, daily: makeDaily(date, p.completedStageIds) };
}
export function completeSession(
  p: Progress,
  session: Session,
  now = new Date(),
): Progress {
  // Laboratório e livre não alteram a economia nem os marcos remunerados.
  if (!['trail', 'daily'].includes(session.mode) || session.sandbox) return p;
  const current = renewDay(p, now);
  if (current.recentSessionIds.includes(session.id)) return current;
  if (!unlockedGames(current.completedStageIds).includes(session.game))
    return current;
  if (
    !Number.isInteger(session.variation) ||
    session.variation < 0 ||
    session.variation >= GAME_INFO[session.game].variations.length
  )
    return current;
  const stage = STAGES.find((s) => s.game === session.game);
  if (!stage) return current;
  if (session.mode === 'trail' && session.stageId !== stage.id) return current;
  const sameDay = (session.day ?? localDay(now)) === current.daily.date;
  if (
    session.mode === 'daily' &&
    sameDay &&
    !current.daily.tasks.some(
      (t) =>
        t.id === session.taskId &&
        t.game === session.game &&
        t.variation === session.variation,
    )
  )
    return current;
  const economy = copyEconomy(current.economy);
  const next: Progress = {
    ...current,
    completedStageIds: [...current.completedStageIds],
    economy,
    daily: {
      ...current.daily,
      tasks: current.daily.tasks.map((t) => ({ ...t })),
    },
    recentSessionIds: [...current.recentSessionIds.slice(-63), session.id],
  };
  const receipt: RewardReceipt = {
    sessionId: session.id,
    completed: [],
    lines: [],
    achievements: [],
    levelBefore: levelFor(economy.xp),
    levelAfter: levelFor(economy.xp),
  };
  // Qualquer variação guiada do jogo pode concluir sua etapa disponível.
  if (getStageStatus(stage.id, next.completedStageIds) === 'available') {
    next.completedStageIds.push(stage.id);
    receipt.completed.push(`Etapa: ${stage.title}`);
    award(
      economy,
      {
        eventId: `stage:${stage.id}`,
        label: 'Nova etapa da trilha',
        ...ECONOMY.stage,
      },
      receipt.lines,
    );
  }
  // Uma partida marca no máximo uma tarefa: mesmo jogo E mesma variação, no mesmo dia.
  const task = sameDay
    ? next.daily.tasks.find(
        (t) =>
          !t.completed &&
          t.game === session.game &&
          t.variation === session.variation &&
          (session.mode !== 'daily' || t.id === session.taskId),
      )
    : undefined;
  if (task) {
    task.completed = true;
    receipt.completed.push('Atividade diária');
    award(
      economy,
      {
        eventId: `daily:${task.id}`,
        label: 'Atividade diária',
        ...ECONOMY.daily,
      },
      receipt.lines,
    );
  }
  if (sameDay && next.daily.tasks.every((t) => t.completed)) {
    award(
      economy,
      {
        eventId: `daily-bonus:${next.daily.date}`,
        label: 'Três atividades do dia',
        seeds: ECONOMY.dailyBonus,
        xp: 0,
      },
      receipt.lines,
    );
  }
  if (!economy.completedGameIds.includes(session.game))
    economy.completedGameIds.push(session.game);
  receipt.achievements = grantAchievements(next, receipt.lines);
  receipt.levelAfter = levelFor(economy.xp);
  if (!receipt.completed.length)
    receipt.completed.push('Rodada guiada concluída');
  economy.receipts = [...economy.receipts.slice(-63), receipt];
  return next;
}
export function completeStage(
  p: Progress,
  id: string,
  now = new Date(),
): Progress {
  const stage = STAGES.find((s) => s.id === id);
  return stage
    ? completeSession(
        p,
        {
          id: `trail:${id}`,
          game: stage.game,
          variation: stage.variation,
          stageId: id,
          mode: 'trail',
          day: localDay(now),
        },
        now,
      )
    : p;
}
export function decodeProgress(raw: string, now = new Date()): Progress {
  const value = JSON.parse(raw);
  if (value?.version === 3) {
    // Reutiliza a validação da trilha e do trio; economia é validada separadamente.
    const base = decodeLegacyProgress(
      JSON.stringify({ ...value, version: 2 }),
      now,
    );
    return { ...base, version: 3, economy: decodeEconomy(value.economy) };
  }
  // Migra antes de renovar o dia, para registrar também tarefas antigas já concluídas.
  const date =
    typeof value?.daily?.date === 'string'
      ? new Date(`${value.daily.date}T12:00:00`)
      : now;
  const base = decodeLegacyProgress(raw, date);
  const economy = createEconomy();
  const next: Progress = { ...base, version: 3, economy };
  economy.completedGameIds = [
    ...new Set(
      STAGES.filter((s) => base.completedStageIds.includes(s.id)).map(
        (s) => s.game,
      ),
    ),
  ] as GameId[];
  economy.processedEventIds.push(
    ...base.completedStageIds.map((id) => `stage:${id}`),
  );
  economy.processedEventIds.push(
    ...base.daily.tasks.filter((t) => t.completed).map((t) => `daily:${t.id}`),
  );
  if (base.daily.tasks.every((t) => t.completed))
    economy.processedEventIds.push(`daily-bonus:${base.daily.date}`);
  for (const a of ACHIEVEMENTS)
    if (achievementProgress(next, a.id) >= a.target) {
      economy.achievementIds.push(a.id);
      economy.processedEventIds.push(`achievement:${a.id}`);
    }
  return renewDay(next, now);
}
