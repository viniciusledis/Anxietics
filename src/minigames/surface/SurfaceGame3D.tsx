import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { colors } from '../../ui/theme';
import { GAME_INFO } from '../definitions';
import { Point, createCoverage, cutSegment } from '../grass/coverage';
import { SceneFrame } from '../three/SceneFrame';
import { GameId, GameProps } from '../types';
import { insideVase } from './geometry';
import { SurfaceEnvironment } from './three/SurfaceEnvironment';
import { SurfaceController, SurfaceTiles } from './three/SurfaceTiles';
import { SurfaceFinish, SurfaceTool } from './three/SurfaceTool';
import { ToolParticles } from '../three/ToolParticles';

const cameraPositions: Record<string, [number, number, number]> = {
  window: [1.7, 13.3, 10.8],
  wash: [2.2, 12.5, 10.5],
  paint: [1.4, 12.6, 10.2],
  reveal: [-2, 12.5, 10],
  clay: [-2.3, 12.6, 10.4],
};

function SurfaceScene({ controller, game, variation, pointer, touching, color, reducedMotion, complete }: {
  controller: SurfaceController; game: GameId; variation: number; pointer: Point; touching: boolean; color: number; reducedMotion: boolean; complete: boolean;
}) {
  return <>
    <SurfaceEnvironment game={game} variation={variation} reducedMotion={reducedMotion} complete={complete} />
    <SurfaceTiles controller={controller} game={game} reducedMotion={reducedMotion} />
    <SurfaceTool game={game} pointer={pointer} touching={touching} color={color} reducedMotion={reducedMotion} />
    <ToolParticles point={pointer} active={touching && !complete} reducedMotion={reducedMotion} color={game === 'paint' ? GAME_INFO.paint.colors![color]! : game === 'wash' || game === 'window' ? '#DFEFEB' : '#DFBE94'} kind={game === 'wash' ? 'bubble' : game === 'window' || game === 'paint' ? 'drop' : 'dust'} />
    {complete && <SurfaceFinish game={game} reducedMotion={reducedMotion} />}
  </>;
}

export const SurfaceGame3D = memo(function SurfaceGame3D(props: GameProps) {
  const { game } = props;
  const controller = useMemo<SurfaceController>(() => ({
    camera: null,
    coverage: createCoverage(game === 'wash' ? insideVase : undefined),
    changes: [],
  }), [game]);
  const previous = useRef<Point | null>(null);
  const reported = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pointer, setPointer] = useState<Point>({ x: 160, y: 320 });
  const [touching, setTouching] = useState(false);
  const [complete, setComplete] = useState(false);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); controller.camera = null; }, [controller]);
  const move = (point: Point, start: boolean) => {
    if (complete || controller.coverage.completed) return;
    const from = start || !previous.current ? point : previous.current;
    previous.current = point;
    setPointer(point);
    if (start) setTouching(true);
    const result = cutSegment(controller.coverage, from, point, game === 'paint' ? 28 : game === 'wash' ? 22 : 30);
    if (!result.changed.length) return;
    for (const index of result.changed) controller.changes.push({ index, color: props.color });
    const percent = result.justCompleted ? 100 : Math.floor(controller.coverage.count / controller.coverage.total * 100);
    if (percent !== reported.current) { reported.current = percent; props.onProgress(percent); }
    if (result.justCompleted) {
      setTouching(false);
      setComplete(true);
      timer.current = setTimeout(props.onComplete, props.reducedMotion ? 0 : 850);
    }
  };
  const end = () => { previous.current = null; setTouching(false); };
  return <SceneFrame controller={controller} enabled={props.enabled} background={colors.background} cameraPosition={cameraPositions[game] ?? [0, 10, 7.5]} fov={58} label={`${GAME_INFO[game].instruction} Cena 3D; controles e progresso ficam acima.`} onPoint={move} onEnd={end}>
    <SurfaceScene controller={controller} game={game} variation={props.variation} pointer={pointer} touching={touching} color={props.color} reducedMotion={props.reducedMotion} complete={complete} />
  </SceneFrame>;
});
