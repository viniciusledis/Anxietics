import { View } from 'react-native';
import { colors, radius } from '../ui/theme';
import {
  Canvas,
  Circle,
  Group,
  Path,
  RoundedRect,
} from '@shopify/react-native-skia';
import { Item } from './catalog';
import { MowerArt } from '../minigames/grass/MowerArt';
// Desenhos originais simples, ancorados na base (0, 0), usados também no jardim.
export function ItemArt({ item }: { item: Item }) {
  if (item.preview === 'mower')
    return (
      <Group transform={[{ translateY: -30 }, { scale: 1.5 }]}>
        <MowerArt color={item.color} width={item.widthMultiplier} />
      </Group>
    );
  if (item.preview === 'pot')
    return (
      <>
        <Path path="M-20 -28 L20 -28 L14 0 L-14 0Z" color="#BB896F" />
        <RoundedRect
          x={-23}
          y={-33}
          width={46}
          height={9}
          r={4}
          color="#D3A086"
        />
        {[-13, 0, 13].map((x, i) => (
          <Group key={x}>
            <Path
              path={`M${x} -30 L${x} ${-48 - (i % 2) * 12}`}
              color="#68825A"
              style="stroke"
              strokeWidth={3}
            />
            <Circle
              cx={x}
              cy={-50 - (i % 2) * 12}
              r={10}
              color={i === 1 ? '#DDBF67' : '#C8879D'}
            />
            <Circle cx={x} cy={-50 - (i % 2) * 12} r={4} color="#F1D98D" />
          </Group>
        ))}
      </>
    );
  if (item.preview === 'stones')
    return (
      <>
        <RoundedRect
          x={-35}
          y={-26}
          width={44}
          height={23}
          r={11}
          color="#929D96"
        />
        <RoundedRect
          x={3}
          y={-21}
          width={34}
          height={21}
          r={10}
          color="#B6B3A0"
        />
        <RoundedRect
          x={-10}
          y={-43}
          width={32}
          height={27}
          r={13}
          color="#808F88"
        />
        <Path
          path="M-24 -20 L-9 -20 M0 -35 L12 -35"
          color="#CAD0BD"
          style="stroke"
          strokeWidth={3}
        />
      </>
    );
  if (item.preview === 'bench')
    return (
      <>
        <Path
          path="M-27 -22 L-29 0 M27 -22 L29 0"
          color="#597268"
          style="stroke"
          strokeWidth={6}
        />
        <RoundedRect
          x={-38}
          y={-53}
          width={76}
          height={12}
          r={4}
          color="#A8815D"
        />
        <RoundedRect
          x={-38}
          y={-37}
          width={76}
          height={11}
          r={4}
          color="#BB9470"
        />
        <RoundedRect
          x={-41}
          y={-22}
          width={82}
          height={10}
          r={4}
          color="#C7A27B"
        />
      </>
    );
  if (item.preview === 'tree')
    return (
      <>
        <RoundedRect
          x={-6}
          y={-52}
          width={12}
          height={52}
          r={4}
          color="#98775C"
        />
        <Circle cx={0} cy={-57} r={28} color="#71916B" />
        <Circle cx={-16} cy={-46} r={20} color="#71916B" />
        <Circle cx={20} cy={-46} r={19} color="#87A479" />
        <Circle cx={-9} cy={-65} r={14} color="#98B084" />
      </>
    );
  return (
    <>
      <RoundedRect
        x={-39}
        y={-18}
        width={78}
        height={18}
        r={9}
        color="#98ACAA"
      />
      <RoundedRect
        x={-31}
        y={-23}
        width={62}
        height={12}
        r={6}
        color="#A8CED0"
      />
      <RoundedRect
        x={-5}
        y={-58}
        width={10}
        height={36}
        r={4}
        color="#8B9F9C"
      />
      <Path
        path="M0 -65 Q-24 -63 -25 -31 M0 -65 Q24 -63 25 -31"
        style="stroke"
        strokeWidth={4}
        color="#A1CDD2"
      />
      <Circle cx={0} cy={-64} r={5} color="#C7E2DE" />
    </>
  );
}
export function ItemPreview({
  item,
  size = 112,
}: {
  item: Item;
  size?: number;
}) {
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Prévia: ${item.name}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius.lg,
        overflow: 'hidden',
        backgroundColor: colors.lightGreen,
      }}
    >
      <Canvas style={{ width: size, height: size }}>
        <Group transform={[{ scale: size / 112 }]}>
          <Group transform={[{ translateX: 56 }, { translateY: 96 }]}>
            <ItemArt item={item} />
          </Group>
        </Group>
      </Canvas>
    </View>
  );
}
