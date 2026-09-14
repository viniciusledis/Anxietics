import { ComponentType } from 'react';
import { GameId, GameProps } from './types';
import { GAME_INFO } from './definitions';
import { SandGame } from './sand/SandGame';
import { FlowersGame } from './flowers/FlowersGame';
import { InkGame } from './ink/InkGame';
import { FruitGame } from './fruit/FruitGame';
import { ArrangeGame } from './arrange/ArrangeGame';
import { WaterGame } from './water/WaterGame';
import { LightsGame } from './lights/LightsGame';
import { SurfaceGame } from './surface/SurfaceGame';
import { GrassGame } from './grass/GrassGame';

// Cada componente recebe o mesmo contrato, mas conserva seu próprio motor.
export const GAME_COMPONENTS: Record<GameId, ComponentType<GameProps>> = {
  grass: GrassGame,
  window: SurfaceGame,
  wash: SurfaceGame,
  paint: SurfaceGame,
  reveal: SurfaceGame,
  stones: ArrangeGame,
  balls: ArrangeGame,
  water: WaterGame,
  lights: LightsGame,
  sand: SandGame,
  flowers: FlowersGame,
  clay: SurfaceGame,
  ink: InkGame,
  fruit: FruitGame,
};
export const GAME_CATALOG = Object.entries(GAME_INFO).map(([id, info]) => ({
  id: id as GameId,
  ...info,
  component: GAME_COMPONENTS[id as GameId],
}));
