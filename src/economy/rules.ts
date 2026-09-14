import type { Progress } from '../domain/progress';
import { STAGES } from '../trail/stages';
import { BRUSH_RADIUS } from '../minigames/grass/coverage';
import { ECONOMY, levelFor } from './config';
import { findItem, GARDEN_SLOTS, SlotId } from './catalog';
import { AchievementId, Economy, RewardLine } from './types';

export const ACHIEVEMENTS: {
  id: AchievementId;
  name: string;
  description: string;
  target: number;
}[] = [
  {
    id: 'first-step',
    name: 'Primeiro passo',
    description: 'Conclua a primeira etapa da trilha.',
    target: 1,
  },
  {
    id: 'explorer',
    name: 'Explorador',
    description:
      'Conclua três tipos de minijogo na trilha ou nas atividades do dia.',
    target: 3,
  },
  {
    id: 'my-corner',
    name: 'Meu cantinho',
    description: 'Coloque a primeira decoração no jardim.',
    target: 1,
  },
];
export function createEconomy(): Economy {
  return {
    seeds: ECONOMY.initialGift,
    xp: 0,
    ownedItemIds: [],
    equipped: { grassTool: null, grassAppearance: null },
    garden: Object.fromEntries(
      GARDEN_SLOTS.map((slot) => [slot.id, null]),
    ) as Economy['garden'],
    processedEventIds: ['gift:initial'],
    completedGameIds: [],
    achievementIds: [],
    receipts: [],
  };
}
// Trabalha numa cópia para que uma transação que falhar não altere o estado anterior.
export function copyEconomy(e: Economy): Economy {
  return {
    ...e,
    ownedItemIds: [...e.ownedItemIds],
    equipped: { ...e.equipped },
    garden: { ...e.garden },
    processedEventIds: [...e.processedEventIds],
    completedGameIds: [...e.completedGameIds],
    achievementIds: [...e.achievementIds],
    receipts: [...e.receipts],
  };
}
export function award(e: Economy, line: RewardLine, lines: RewardLine[]) {
  if (e.processedEventIds.includes(line.eventId)) return;
  e.processedEventIds.push(line.eventId);
  e.seeds += line.seeds;
  e.xp += line.xp;
  lines.push(line);
}
export function achievementProgress(p: Progress, id: AchievementId) {
  if (p.economy.achievementIds.includes(id))
    return ACHIEVEMENTS.find((a) => a.id === id)!.target;
  if (id === 'first-step')
    return p.completedStageIds.includes(STAGES[0]!.id) ? 1 : 0;
  if (id === 'explorer') return Math.min(3, p.economy.completedGameIds.length);
  return Object.values(p.economy.garden).some(Boolean) ? 1 : 0;
}
export function grantAchievements(
  p: Progress,
  lines: RewardLine[],
): AchievementId[] {
  const earned: AchievementId[] = [];
  for (const a of ACHIEVEMENTS) {
    if (
      achievementProgress(p, a.id) < a.target ||
      p.economy.achievementIds.includes(a.id)
    )
      continue;
    p.economy.achievementIds.push(a.id);
    earned.push(a.id);
    award(
      p.economy,
      {
        eventId: `achievement:${a.id}`,
        label: a.name,
        seeds: ECONOMY.achievements[a.id],
        xp: 0,
      },
      lines,
    );
  }
  return earned;
}
export type ActionResult = { progress: Progress; ok: boolean; message: string };
function unchanged(p: Progress, message: string, ok = false): ActionResult {
  return { progress: p, ok, message };
}
export function buyItem(p: Progress, id: string): ActionResult {
  const item = findItem(id);
  if (!item) return unchanged(p, 'Item não encontrado.');
  if (p.economy.ownedItemIds.includes(id))
    return unchanged(
      p,
      'Este item já é seu. Nenhuma semente foi descontada.',
      true,
    );
  if (item.requiredLevel && levelFor(p.economy.xp) < item.requiredLevel)
    return unchanged(p, 'Este item ainda não está disponível.');
  if (p.economy.seeds < item.price)
    return unchanged(
      p,
      `Saldo insuficiente. Faltam ${item.price - p.economy.seeds} sementes.`,
    );
  const economy = copyEconomy(p.economy);
  economy.seeds -= item.price;
  economy.ownedItemIds.push(id);
  return {
    progress: { ...p, economy },
    ok: true,
    message: 'Compra salva. O item agora é seu.',
  };
}
export function equipItem(
  p: Progress,
  slot: 'grassTool' | 'grassAppearance',
  id: string | null,
): ActionResult {
  if (id !== null) {
    const item = findItem(id);
    if (
      !item ||
      !p.economy.ownedItemIds.includes(id) ||
      item.target !== 'grass' ||
      item.category !== (slot === 'grassTool' ? 'tool' : 'visual')
    )
      return unchanged(p, 'Esse item não pode ser equipado aqui.');
  }
  if (p.economy.equipped[slot] === id)
    return unchanged(p, 'Esta opção já está em uso.', true);
  const economy = copyEconomy(p.economy);
  economy.equipped[slot] = id;
  return {
    progress: { ...p, economy },
    ok: true,
    message: id ? 'Item equipado e salvo.' : 'Opção padrão restaurada e salva.',
  };
}
export function placeDecoration(
  p: Progress,
  slot: SlotId,
  id: string | null,
): ActionResult {
  if (!GARDEN_SLOTS.some((s) => s.id === slot))
    return unchanged(p, 'Posição inválida.');
  if (id !== null) {
    const item = findItem(id);
    if (
      !item ||
      item.category !== 'garden' ||
      !p.economy.ownedItemIds.includes(id)
    )
      return unchanged(p, 'Escolha uma decoração adquirida.');
  }
  const economy = copyEconomy(p.economy);
  // Mover ou substituir nunca destrói o item e nunca o duplica.
  if (id !== null)
    for (const s of GARDEN_SLOTS)
      if (economy.garden[s.id] === id) economy.garden[s.id] = null;
  economy.garden[slot] = id;
  const next = { ...p, economy };
  const lines: RewardLine[] = [];
  grantAchievements(next, lines);
  const bonus = lines.reduce((sum, line) => sum + line.seeds, 0);
  return {
    progress: next,
    ok: true,
    message: `${id ? 'Decoração posicionada' : 'Decoração devolvida ao inventário'}. Jardim salvo.${bonus ? ` Conquista Meu cantinho: +${bonus} sementes.` : ''}`,
  };
}
export function grassEquipment(e: Economy) {
  const tool = e.equipped.grassTool
    ? findItem(e.equipped.grassTool)
    : undefined;
  const appearance = e.equipped.grassAppearance
    ? findItem(e.equipped.grassAppearance)
    : undefined;
  return {
    radius: BRUSH_RADIUS * (tool?.widthMultiplier ?? 1),
    width: tool?.widthMultiplier ?? 1,
    color: appearance?.color ?? '#E8C86D',
    name: `${tool?.name ?? 'Cortador padrão'} · ${appearance?.name.replace('Cortador ', '') ?? 'cor padrão'}`,
  };
}
