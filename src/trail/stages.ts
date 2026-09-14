import { GAME_IDS, GameId } from '../minigames/types';
import { GAME_INFO } from '../minigames/definitions';

export type GrassPalette = {
  tall: string;
  blade: string;
  highlight: string;
  cut: string;
  stripe: string;
};

export const GRASS_VARIATIONS = [
  {
    variation: 'meadow' as const,
    palette: {
      tall: '#497349',
      blade: '#325638',
      highlight: '#74955B',
      cut: '#BBD18A',
      stripe: '#ADC57B',
    },
  },
  {
    variation: 'bands' as const,
    palette: {
      tall: '#7A7E42',
      blade: '#555F35',
      highlight: '#A3A45F',
      cut: '#DFD39A',
      stripe: '#CFC48A',
    },
  },
  {
    variation: 'patchwork' as const,
    palette: {
      tall: '#436D60',
      blade: '#2D5148',
      highlight: '#709783',
      cut: '#B4D3B4',
      stripe: '#A0C2A5',
    },
  },
];
export type GrassConfig = (typeof GRASS_VARIATIONS)[number];
export type Stage = {
  id: string;
  title: string;
  game: GameId;
  variation: number;
};
export const STAGES: readonly Stage[] = GAME_IDS.map((game, index) => ({
  id: index === 0 ? 'jardim' : game,
  title: GAME_INFO[game].name,
  game,
  variation: 0,
}));
export const LEGACY_STAGE_IDS = ['clareira', 'bosque'];
export type StageStatus = 'locked' | 'available' | 'completed';
export function getStageStatus(
  id: string,
  completed: readonly string[],
): StageStatus {
  const index = STAGES.findIndex((stage) => stage.id === id);
  if (index < 0) return 'locked';
  if (completed.includes(id)) return 'completed';
  return STAGES.slice(0, index).every((stage) => completed.includes(stage.id))
    ? 'available'
    : 'locked';
}
export function unlockedGames(completed: readonly string[]): GameId[] {
  return STAGES.filter(
    (stage) => getStageStatus(stage.id, completed) !== 'locked',
  ).map((stage) => stage.game);
}
