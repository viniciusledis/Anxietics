import {
  Circle,
  Group,
  Line,
  Path,
  Rect,
  RoundedRect,
  Skia,
  vec,
} from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { GameId } from '../types';

export function makeVase() {
  const shape = Skia.Path.Make();
  shape.addOval({ x: 58, y: 150, width: 204, height: 240 });
  shape.addRect({ x: 120, y: 70, width: 80, height: 135 });
  return shape;
}
export function Landscape({ variation }: { variation: number }) {
  const mountain = useMemo(
    () =>
      Skia.Path.MakeFromSVGString(
        'M0 290 Q65 125 150 270 Q245 85 320 260 L320 448 L0 448Z',
      )!,
    [],
  );
  return (
    <>
      <Rect
        x={0}
        y={0}
        width={320}
        height={448}
        color={['#BEDBE0', '#C6D9D3', '#E5C7B9'][variation % 3]}
      />
      <Circle cx={235} cy={87} r={33} color="#FAE5A5" />
      <RoundedRect
        x={40}
        y={70}
        width={88}
        height={20}
        r={10}
        color="#EFF3E7"
      />
      <RoundedRect
        x={80}
        y={55}
        width={62}
        height={24}
        r={12}
        color="#EFF3E7"
      />
      <Path path={mountain} color="#729586" />
      <Rect x={0} y={325} width={320} height={123} color="#89B4BA" />
      {[355, 380, 405].map((y, i) => (
        <Line
          key={y}
          p1={vec(40 + i * 40, y)}
          p2={vec(170 + i * 30, y)}
          color="#C4DFDC"
          strokeWidth={3}
        />
      ))}
    </>
  );
}
export function Illustration({ variation }: { variation: number }) {
  return (
    <>
      <Rect x={0} y={0} width={320} height={448} color="#F2E4C5" />
      <Circle cx={160} cy={205} r={118} color="#E1C7AC" />
      {variation % 3 === 0 ? (
        <>
          <RoundedRect
            x={85}
            y={199}
            width={150}
            height={128}
            r={10}
            color="#AD6F5C"
          />
          <Path path="M65 200 L160 115 L255 200Z" color="#536F60" />
          <RoundedRect
            x={141}
            y={250}
            width={38}
            height={77}
            r={19}
            color="#F2D19B"
          />
          {[105, 195].map((x) => (
            <RoundedRect
              key={x}
              x={x}
              y={222}
              width={24}
              height={24}
              r={4}
              color="#AFCED0"
            />
          ))}
        </>
      ) : variation % 3 === 1 ? (
        <>
          <Path path="M60 265 L265 265 L227 312 L94 312Z" color="#8C6652" />
          <Path path="M156 132 L156 250 L69 250Z" color="#F4F0DF" />
          <Path path="M169 155 L169 250 L245 250Z" color="#C78F76" />
          <Line
            p1={vec(162, 121)}
            p2={vec(162, 277)}
            color="#596752"
            strokeWidth={5}
          />
        </>
      ) : (
        <>
          {[
            [-1, '#D4A870'],
            [1, '#A38AB4'],
          ].map(([side, color]) => (
            <Group key={String(side)}>
              <Circle
                cx={160 + Number(side) * 47}
                cy={190}
                r={55}
                color={String(color)}
              />
              <Circle
                cx={160 + Number(side) * 38}
                cy={264}
                r={39}
                color={String(color)}
              />
            </Group>
          ))}
          <RoundedRect
            x={153}
            y={171}
            width={14}
            height={115}
            r={7}
            color="#626756"
          />
          <Path
            path="M155 180 Q130 125 116 148 M165 180 Q190 125 204 148"
            style="stroke"
            strokeWidth={4}
            color="#626756"
          />
        </>
      )}
      {[60, 270].map((x) => (
        <Group key={x}>
          <Line
            p1={vec(x, 395)}
            p2={vec(x, 340)}
            strokeWidth={4}
            color="#63816A"
          />
          <Circle cx={x} cy={336} r={14} color="#CE9B80" />
        </Group>
      ))}
    </>
  );
}
export function SurfaceUnderlay({
  game,
  variation,
}: {
  game: GameId;
  variation: number;
}) {
  const vase = useMemo(makeVase, []);
  if (game === 'window') return <Landscape variation={variation} />;
  if (game === 'reveal') return <Illustration variation={variation} />;
  if (game === 'wash')
    return (
      <>
        <Rect x={0} y={0} width={320} height={448} color="#DCE4DC" />
        <RoundedRect
          x={34}
          y={370}
          width={252}
          height={35}
          r={17}
          color="#B6C9C0"
        />
        <Path
          path={vase}
          color={['#78ADB6', '#7FAB92', '#C78F75'][variation % 3]}
        />
        <Group clip={vase}>
          {[225, 260, 295, 330].map((y) => (
            <Line
              key={y}
              p1={vec(50, y)}
              p2={vec(270, y)}
              color="#E5E9CF"
              strokeWidth={8}
            />
          ))}
        </Group>
        <RoundedRect
          x={114}
          y={65}
          width={92}
          height={18}
          r={7}
          color="#D3E6DF"
        />
      </>
    );
  return (
    <Rect
      x={0}
      y={0}
      width={320}
      height={448}
      color={
        game === 'clay'
          ? ['#C39077', '#CCB79E', '#CA9D94'][variation % 3]
          : ['#E5DFD3', '#E8E1C8', '#CEDADC'][variation % 3]
      }
    />
  );
}
