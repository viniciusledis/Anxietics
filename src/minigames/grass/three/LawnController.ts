import { Camera } from 'three';
import { Point } from '../coverage';
import {
  TILES,
  TUFTS,
  logicalToWorld,
  tileIndexForCell,
  tuftIndexForCell,
} from './sceneModel';

type Particle = {
  x: number;
  z: number;
  age: number;
  life: number;
  phase: number;
};

export class LawnController {
  camera: Camera | null = null;
  mower = logicalToWorld({ x: 160, y: 310 });
  moving = false;
  completed = false;
  celebrationTime = 0;
  cutPulse = 0;
  milestones = 0;
  tileTargets = new Float32Array(TILES);
  tuftTargets = new Float32Array(TUFTS);
  activeTiles = new Set<number>();
  activeTufts = new Set<number>();
  particles: Particle[] = Array.from({ length: 36 }, (_, phase) => ({
    x: 0,
    z: 0,
    age: 2,
    life: 1,
    phase,
  }));
  private nextParticle = 0;

  move(point: Point) {
    this.mower = logicalToWorld(point);
    this.moving = true;
  }

  cut(changed: readonly number[], point: Point) {
    if (changed.length === 0) return;
    for (const cell of changed) {
      const tile = tileIndexForCell(cell);
      const tuft = tuftIndexForCell(cell);
      this.tileTargets[tile] = Math.min(1, this.tileTargets[tile]! + 0.25);
      this.tuftTargets[tuft] = Math.min(1, this.tuftTargets[tuft]! + 0.0625);
      this.activeTiles.add(tile);
      this.activeTufts.add(tuft);
    }
    this.cutPulse = Math.min(1, this.cutPulse + changed.length / 75);
    const amount = Math.min(7, Math.max(2, Math.floor(changed.length / 28)));
    const position = logicalToWorld(point);
    for (let i = 0; i < amount; i++) {
      const particle = this.particles[this.nextParticle]!;
      this.nextParticle = (this.nextParticle + 1) % this.particles.length;
      particle.x = position.x;
      particle.z = position.z;
      particle.age = 0;
      particle.life = 0.45 + ((particle.phase * 7) % 8) * 0.045;
    }
  }

  milestone(point: Point) {
    this.milestones += 1;
    this.cutPulse = 1;
    const center = logicalToWorld(point);
    for (let i = 0; i < 10; i++) {
      const particle = this.particles[this.nextParticle]!;
      this.nextParticle = (this.nextParticle + 1) % this.particles.length;
      const angle = i * (Math.PI * 2 / 10);
      particle.x = center.x + Math.cos(angle) * 0.12;
      particle.z = center.z + Math.sin(angle) * 0.12;
      particle.age = 0;
      particle.life = 0.68;
    }
  }

  celebrate() {
    this.completed = true;
    this.celebrationTime = 0.0001;
    for (let i = 0; i < this.tileTargets.length; i++) {
      this.tileTargets[i] = 1;
      this.activeTiles.add(i);
    }
    for (let i = 0; i < this.tuftTargets.length; i++) {
      this.tuftTargets[i] = 1;
      this.activeTufts.add(i);
    }
  }
}
