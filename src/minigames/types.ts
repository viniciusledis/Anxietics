export const GAME_IDS = [
  'grass',
  'window',
  'sand',
  'wash',
  'paint',
  'flowers',
  'stones',
  'balls',
  'reveal',
  'water',
  'clay',
  'lights',
  'ink',
  'fruit',
] as const;
export type GameId = (typeof GAME_IDS)[number];
export type PlayMode = 'trail' | 'daily' | 'free' | 'dev';
export type GameProps = {
  game: GameId;
  variation: number;
  mode: PlayMode;
  scale: number;
  enabled: boolean;
  reducedMotion: boolean;
  color: number;
  grassEquipment?: {
    radius: number;
    width: number;
    color: string;
    name: string;
  };
  onProgress: (percent: number) => void;
  onComplete: () => void;
};
export type Session = {
  id: string;
  game: GameId;
  variation: number;
  mode: PlayMode;
  stageId?: string;
  taskId?: string;
  day?: string;
  sandbox?: boolean;
  grassVisual?: '2d' | '3d';
};
