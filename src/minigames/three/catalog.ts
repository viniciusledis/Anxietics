import { ComponentType } from 'react';
import { ArrangeGame3D } from '../arrange/ArrangeGame3D';
import { FruitGame3D } from '../fruit/FruitGame3D';
import { FlowersGame3D } from '../flowers/FlowersGame3D';
import { GrassGame3D } from '../grass/GrassGame3D';
import { InkGame3D } from '../ink/InkGame3D';
import { LightsGame3D } from '../lights/LightsGame3D';
import { SandGame3D } from '../sand/SandGame3D';
import { SurfaceGame3D } from '../surface/SurfaceGame3D';
import { WaterGame3D } from '../water/WaterGame3D';
import { GameId, GameProps } from '../types';

export const GAME_3D_COMPONENTS: Partial<Record<GameId, ComponentType<GameProps>>> = {
  grass: GrassGame3D,
  fruit: FruitGame3D,
  lights: LightsGame3D,
  stones: ArrangeGame3D,
  balls: ArrangeGame3D,
  sand: SandGame3D,
  flowers: FlowersGame3D,
  ink: InkGame3D,
  water: WaterGame3D,
  window: SurfaceGame3D,
  wash: SurfaceGame3D,
  paint: SurfaceGame3D,
  reveal: SurfaceGame3D,
  clay: SurfaceGame3D,
};
