import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ComponentProps } from 'react';
import { GameId } from '../minigames/types';
import { colors } from './theme';

const glyphs = {
  sprout: 'sprout',
  flower: 'flower',
  tree: 'tree',
  home: 'home-variant',
  shop: 'storefront',
  inventory: 'bag-personal',
  achievement: 'trophy',
  settings: 'cog',
  back: 'arrow-left',
  next: 'chevron-right',
  check: 'check',
  lock: 'lock',
  play: 'play',
  pause: 'pause',
  restart: 'restart',
  water: 'water',
  seed: 'seed',
  leaf: 'leaf',
  mail: 'email-outline',
  eye: 'eye-outline',
  eyeOff: 'eye-off-outline',
  alert: 'alert-circle-outline',
  close: 'close',
  info: 'information-outline',
  grass: 'shovel',
  window: 'window-closed-variant',
  sand: 'waves',
  wash: 'spray-bottle',
  paint: 'format-paint',
  stones: 'shape',
  balls: 'palette',
  reveal: 'brush',
  clay: 'hand-back-right',
  lights: 'star-four-points',
  ink: 'water',
  fruit: 'fruit-cherries',
  account: 'account',
  lab: 'flask-outline',
  logout: 'logout',
  trash: 'delete-outline',
} satisfies Record<
  string,
  ComponentProps<typeof MaterialCommunityIcons>['name']
>;
export type IconName = keyof typeof glyphs;
export function Icon({
  name,
  size = 24,
  color = colors.green,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return (
    <MaterialCommunityIcons
      name={glyphs[name]}
      size={size}
      color={color}
      accessible={false}
      aria-hidden
      importantForAccessibility="no"
    />
  );
}
export const gameIcon: Record<GameId, IconName> = {
  grass: 'grass',
  window: 'window',
  sand: 'sand',
  wash: 'wash',
  paint: 'paint',
  flowers: 'flower',
  stones: 'stones',
  balls: 'balls',
  reveal: 'reveal',
  water: 'water',
  clay: 'clay',
  lights: 'lights',
  ink: 'ink',
  fruit: 'fruit',
};
