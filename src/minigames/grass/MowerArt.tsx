import { Circle, Group, RoundedRect } from '@shopify/react-native-skia';
// Mesma geometria no jogo e na prévia da loja. Cor e largura são independentes.
export function MowerArt({
  color = '#E8C86D',
  width = 1,
}: {
  color?: string;
  width?: number;
}) {
  return (
    <>
      <Circle cx={0} cy={0} r={25 * width} color="#FFFBE0" opacity={0.2} />
      <Group transform={[{ scaleX: width }]}>
        <RoundedRect
          x={-20}
          y={-12}
          width={9}
          height={26}
          r={4}
          color="#233C32"
        />
        <RoundedRect
          x={11}
          y={-12}
          width={9}
          height={26}
          r={4}
          color="#233C32"
        />
        <RoundedRect
          x={-15}
          y={-20}
          width={30}
          height={40}
          r={10}
          color="#274D38"
        />
        <RoundedRect
          x={-14}
          y={-21}
          width={28}
          height={33}
          r={9}
          color={color}
        />
        <RoundedRect
          x={-9}
          y={-17}
          width={18}
          height={10}
          r={4}
          color="#FFFFFF"
          opacity={0.35}
        />
        <Circle cx={0} cy={2} r={5} color="#536353" />
        <RoundedRect
          x={-9}
          y={14}
          width={18}
          height={4}
          r={2}
          color="#E6E9D2"
        />
      </Group>
    </>
  );
}
