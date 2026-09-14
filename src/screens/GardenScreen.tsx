import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Canvas, Circle, Group, Path, Rect } from '@shopify/react-native-skia';
import { Progress } from '../domain/progress';
import { GARDEN_SLOTS, SlotId, findItem, ITEMS } from '../economy/catalog';
import { ItemArt, ItemPreview } from '../economy/ItemArt';
import { EconomySummary } from '../economy/EconomySummary';
import { TransactionResult } from '../storage/transactions';
import { Button } from '../ui/Button';
import { colors, common } from '../ui/theme';
type Props = {
  progress: Progress;
  busy: boolean;
  onExit: () => void;
  onShop: () => void;
  onPlace: (slot: SlotId, id: string | null) => Promise<TransactionResult>;
};
export function GardenScreen({
  progress,
  busy,
  onExit,
  onShop,
  onPlace,
}: Props) {
  const [selected, setSelected] = useState<SlotId>('back-left');
  const [width, setWidth] = useState(0);
  const [message, setMessage] = useState('');
  const [failedAt, setFailedAt] = useState<Progress['economy'] | null>(null);
  const place = async (id: string | null) => {
    setMessage('');
    const result = await onPlace(selected, id);
    setMessage(result.message);
    setFailedAt(result.ok ? null : result.progress.economy);
  };
  const items = ITEMS.filter(
    (i) =>
      i.category === 'garden' && progress.economy.ownedItemIds.includes(i.id),
  );
  const slot = GARDEN_SLOTS.find((s) => s.id === selected)!;
  const scale = width / 320;
  return (
    <ScrollView
      style={common.screen}
      contentContainerStyle={{
        padding: 22,
        gap: 16,
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
      }}
    >
      <Button
        secondary
        label="Voltar à trilha"
        onPress={onExit}
        disabled={busy}
      />
      <Text style={common.title}>Meu jardim</Text>
      <EconomySummary progress={progress} compact />
      <Text style={common.body}>
        Toque em uma posição e escolha uma decoração. Você pode mover ou remover
        depois.
      </Text>
      <View
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={{
          width: '100%',
          height: width ? 330 * scale : 330,
          borderRadius: 24,
          overflow: 'hidden',
          backgroundColor: '#DFE9D2',
        }}
      >
        {width > 0 && (
          <Canvas style={{ width, height: 330 * scale }}>
            <Group transform={[{ scale }]}>
              <Rect x={0} y={0} width={320} height={330} color="#DFE9D2" />
              <Path
                path="M0 22 Q70 55 145 20 Q220 -8 320 30 L320 0 L0 0Z"
                color="#B7CDAB"
              />
              <Path
                path="M150 330 Q95 220 150 160 Q210 95 160 0"
                style="stroke"
                strokeWidth={37}
                color="#EFE4CC"
              />
              {[20, 300].map((x) => (
                <Group key={x}>
                  {[50, 110, 260, 310].map((y) => (
                    <Circle key={y} cx={x} cy={y} r={4} color="#ACC29D" />
                  ))}
                </Group>
              ))}
              {GARDEN_SLOTS.map((s) => {
                const item = findItem(progress.economy.garden[s.id] ?? '');
                return (
                  <Group
                    key={s.id}
                    transform={[{ translateX: s.x }, { translateY: s.y }]}
                  >
                    <Path
                      path="M-36 -2 Q0 -18 36 -2 Q0 12 -36 -2Z"
                      color="#B9CEA9"
                      opacity={0.6}
                    />
                    {item && <ItemArt item={item} />}
                  </Group>
                );
              })}
            </Group>
          </Canvas>
        )}
        {GARDEN_SLOTS.map((s, i) => (
          <Pressable
            key={s.id}
            accessibilityRole="button"
            accessibilityLabel={`Posição ${s.name}`}
            accessibilityState={{ selected: selected === s.id }}
            disabled={busy}
            onPress={() => {
              setSelected(s.id);
              setMessage('');
            }}
            style={{
              position: 'absolute',
              left: `${(s.x / 320) * 100}%`,
              top: `${((s.y - 40) / 330) * 100}%`,
              marginLeft: -32,
              width: 64,
              height: 56,
              borderRadius: 12,
              borderWidth: selected === s.id ? 2 : 1,
              borderStyle: 'dashed',
              borderColor: selected === s.id ? colors.green : '#879D7B',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: colors.ink,
                fontSize: 11,
                backgroundColor: '#F5F4EB',
                paddingHorizontal: 5,
                borderRadius: 6,
              }}
            >
              {i + 1}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text
        accessibilityRole="header"
        style={{ color: colors.ink, fontSize: 20, fontWeight: '600' }}
      >
        Posição: {slot.name}
      </Text>
      <Text style={common.body}>
        Atual:{' '}
        {findItem(progress.economy.garden[selected] ?? '')?.name ?? 'vazia'}
      </Text>
      {!!message && (!failedAt || failedAt === progress.economy) && (
        <Text accessibilityLiveRegion="polite" style={common.body}>
          {message}
        </Text>
      )}
      <Button
        secondary
        label="Remover desta posição"
        disabled={busy || !progress.economy.garden[selected]}
        onPress={() => {
          void place(null);
        }}
      />
      {items.map((item) => (
        <View
          key={item.id}
          style={{
            padding: 16,
            backgroundColor: colors.paper,
            borderRadius: 20,
            gap: 10,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <ItemPreview item={item} />
            <View style={{ flex: 1 }}>
              <Text style={common.body}>{item.name}</Text>
              <Text style={common.body}>
                {Object.values(progress.economy.garden).includes(item.id)
                  ? 'No jardim · pode ser movido'
                  : 'No inventário'}
              </Text>
            </View>
          </View>
          <Button
            label={`Colocar ${item.name}`}
            disabled={busy || progress.economy.garden[selected] === item.id}
            onPress={() => {
              void place(item.id);
            }}
          />
        </View>
      ))}
      {!items.length && (
        <Text style={common.body}>
          Seu jardim já está aberto. As decorações adquiridas aparecerão aqui.
        </Text>
      )}
      <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20 }}>
        Ao mover, a posição anterior fica livre. Ao substituir, a decoração
        anterior volta ao inventário. Cada item ocupa uma posição por vez.
      </Text>
      <Button secondary label="Visitar loja" disabled={busy} onPress={onShop} />
    </ScrollView>
  );
}
