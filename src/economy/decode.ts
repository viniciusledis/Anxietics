import { GAME_IDS } from '../minigames/types';
import { findItem, GARDEN_SLOTS } from './catalog';
import { ACHIEVEMENTS } from './rules';
import { Economy } from './types';
const integer = (n: unknown) => Number.isSafeInteger(n) && (n as number) >= 0;
const strings = (a: unknown): a is string[] =>
  Array.isArray(a) &&
  a.every((v) => typeof v === 'string') &&
  new Set(a).size === a.length;
// Dinheiro e propriedade não são corrigidos silenciosamente: esquema inválido exige recuperação explícita.
export function decodeEconomy(e: Economy): Economy {
  const fail = () => {
    throw new Error(
      'Economia local inválida. Os dados não foram substituídos.',
    );
  };
  if (
    !e ||
    !integer(e.seeds) ||
    !integer(e.xp) ||
    !strings(e.ownedItemIds) ||
    !strings(e.processedEventIds) ||
    !e.processedEventIds.includes('gift:initial') ||
    !strings(e.completedGameIds) ||
    !strings(e.achievementIds) ||
    !e.equipped ||
    !e.garden ||
    !Array.isArray(e.receipts) ||
    e.receipts.length > 64
  )
    return fail();
  if (
    e.ownedItemIds.some((id) => !findItem(id)) ||
    e.completedGameIds.some((id) => !GAME_IDS.includes(id)) ||
    e.achievementIds.some(
      (id) =>
        !ACHIEVEMENTS.some((a) => a.id === id) ||
        !e.processedEventIds.includes(`achievement:${id}`),
    )
  )
    return fail();
  for (const slot of ['grassTool', 'grassAppearance'] as const) {
    const id = e.equipped[slot];
    if (id === null) continue;
    const item = findItem(id);
    if (
      !e.ownedItemIds.includes(id) ||
      item?.target !== 'grass' ||
      item.category !== (slot === 'grassTool' ? 'tool' : 'visual')
    )
      return fail();
  }
  if (Object.keys(e.garden).length !== GARDEN_SLOTS.length) return fail();
  const placed: string[] = [];
  for (const slot of GARDEN_SLOTS) {
    const id = e.garden[slot.id];
    if (id === null) continue;
    if (
      typeof id !== 'string' ||
      !e.ownedItemIds.includes(id) ||
      findItem(id)?.category !== 'garden' ||
      placed.includes(id)
    )
      return fail();
    placed.push(id);
  }
  const sessions = new Set<string>();
  for (const receipt of e.receipts) {
    if (
      !receipt ||
      typeof receipt.sessionId !== 'string' ||
      sessions.has(receipt.sessionId) ||
      !Array.isArray(receipt.completed) ||
      !receipt.completed.every((v) => typeof v === 'string') ||
      !Array.isArray(receipt.lines) ||
      !Array.isArray(receipt.achievements) ||
      !integer(receipt.levelBefore) ||
      receipt.levelBefore < 1 ||
      !integer(receipt.levelAfter) ||
      receipt.levelAfter < receipt.levelBefore
    )
      return fail();
    sessions.add(receipt.sessionId);
    if (
      receipt.lines.some(
        (l) =>
          !l ||
          !integer(l.seeds) ||
          !integer(l.xp) ||
          typeof l.label !== 'string' ||
          !e.processedEventIds.includes(l.eventId),
      ) ||
      receipt.achievements.some((id) => !e.achievementIds.includes(id))
    )
      return fail();
  }
  return e;
}
