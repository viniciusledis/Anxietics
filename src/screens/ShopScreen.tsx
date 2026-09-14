import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Progress } from '../domain/progress';
import {
  CATEGORIES,
  Category,
  findItem,
  GARDEN_SLOTS,
  ITEMS,
} from '../economy/catalog';
import { ItemPreview } from '../economy/ItemArt';
import { EconomySummary } from '../economy/EconomySummary';
import { TransactionResult } from '../storage/transactions';
import { Button } from '../ui/Button';
import { colors, common } from '../ui/theme';

type Props = {
  progress: Progress;
  busy: boolean;
  inventory?: boolean;
  onExit: () => void;
  onGarden: () => void;
  onBuy: (id: string) => Promise<TransactionResult>;
  onEquip: (
    slot: 'grassTool' | 'grassAppearance',
    id: string | null,
  ) => Promise<TransactionResult>;
};
export function ShopScreen({
  progress,
  busy,
  inventory = false,
  onExit,
  onGarden,
  onBuy,
  onEquip,
}: Props) {
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [failedAt, setFailedAt] = useState<Progress['economy'] | null>(null);
  const item = selected ? findItem(selected) : undefined;
  const owned = (id: string) => progress.economy.ownedItemIds.includes(id);
  const used = (id: string) =>
    Object.values(progress.economy.equipped).includes(id) ||
    Object.values(progress.economy.garden).includes(id);
  const act = async (action: () => Promise<TransactionResult>) => {
    setMessage('');
    const result = await action();
    setMessage(result.message);
    setFailedAt(result.ok ? null : result.progress.economy);
  };
  const back = () => {
    if (item) {
      setSelected(null);
      setMessage('');
    } else onExit();
  };
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
        label={item ? 'Voltar aos itens' : 'Voltar à trilha'}
        onPress={back}
        disabled={busy}
      />
      <Text style={common.title}>
        {inventory ? 'Meu inventário' : 'Loja do jardim'}
      </Text>
      <EconomySummary progress={progress} compact />
      {!!message && (!failedAt || failedAt === progress.economy) && (
        <Text accessibilityLiveRegion="polite" style={common.body}>
          {message}
        </Text>
      )}
      {item ? (
        <>
          <View style={{ alignSelf: 'center' }}>
            <ItemPreview item={item} />
          </View>
          <Text style={{ ...common.title, fontSize: 24 }}>{item.name}</Text>
          <Text style={common.body}>{item.description}</Text>
          <Text style={common.body}>{item.effect}</Text>
          <Text style={common.body}>
            Uso: {item.target === 'grass' ? 'Cortar grama' : 'Jardim pessoal'}
          </Text>
          <Text style={common.body}>
            {owned(item.id)
              ? used(item.id)
                ? 'Em uso'
                : 'Adquirido'
              : `Preço: ${item.price} sementes · Saldo: ${progress.economy.seeds}`}
          </Text>
          {!owned(item.id) ? (
            <>
              {progress.economy.seeds < item.price && (
                <Text style={common.body}>
                  Saldo insuficiente. Faltam{' '}
                  {item.price - progress.economy.seeds} sementes.
                </Text>
              )}
              <Button
                label={`Confirmar compra · ${item.price} sementes`}
                disabled={busy || progress.economy.seeds < item.price}
                onPress={() => {
                  void act(() => onBuy(item.id));
                }}
              />
              <Text style={{ color: colors.muted, fontSize: 12 }}>
                Item permanente. Uma compra por perfil, sem dinheiro real.
              </Text>
            </>
          ) : item.category === 'garden' ? (
            <>
              <Button
                label="Usar no jardim"
                disabled={busy}
                onPress={onGarden}
              />
              {used(item.id) && (
                <Text style={common.body}>
                  Em{' '}
                  {GARDEN_SLOTS.find(
                    (s) => progress.economy.garden[s.id] === item.id,
                  )?.name.toLowerCase()}
                  . Você pode mover ou remover no jardim.
                </Text>
              )}
            </>
          ) : (
            <Button
              label={used(item.id) ? 'Restaurar padrão' : 'Equipar item'}
              disabled={busy}
              onPress={() => {
                void act(() =>
                  onEquip(
                    item.category === 'tool' ? 'grassTool' : 'grassAppearance',
                    used(item.id) ? null : item.id,
                  ),
                );
              }}
            />
          )}
        </>
      ) : (
        <>
          {inventory && (
            <>
              <Text style={common.body}>
                Aparência e ferramenta são independentes. Trocar é sempre
                gratuito.
              </Text>
              <Button
                secondary
                label={
                  progress.economy.equipped.grassTool
                    ? 'Usar cortador padrão'
                    : 'Cortador padrão em uso'
                }
                disabled={busy || !progress.economy.equipped.grassTool}
                onPress={() => {
                  void act(() => onEquip('grassTool', null));
                }}
              />
              <Button
                secondary
                label={
                  progress.economy.equipped.grassAppearance
                    ? 'Usar aparência padrão'
                    : 'Aparência padrão em uso'
                }
                disabled={busy || !progress.economy.equipped.grassAppearance}
                onPress={() => {
                  void act(() => onEquip('grassAppearance', null));
                }}
              />
            </>
          )}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[{ id: 'all' as const, name: 'Todos' }, ...CATEGORIES].map((c) => (
              <Button
                key={c.id}
                secondary={category !== c.id}
                label={c.name}
                onPress={() => setCategory(c.id)}
              />
            ))}
          </View>
          {ITEMS.filter(
            (i) =>
              (category === 'all' || i.category === category) &&
              (!inventory || owned(i.id)),
          ).map((i) => (
            <View
              key={i.id}
              style={{
                borderWidth: 1,
                borderColor: colors.line,
                padding: 16,
                borderRadius: 20,
                backgroundColor: colors.paper,
                gap: 12,
              }}
            >
              <View
                style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}
              >
                <ItemPreview item={i} />
                <View style={{ flex: 1, gap: 6 }}>
                  <Text
                    style={{
                      color: colors.ink,
                      fontWeight: '600',
                      fontSize: 18,
                    }}
                  >
                    {i.name}
                  </Text>
                  <Text style={common.body}>
                    {owned(i.id)
                      ? used(i.id)
                        ? 'Em uso'
                        : 'Adquirido'
                      : `${i.price} sementes · Disponível`}
                  </Text>
                </View>
              </View>
              <Button
                secondary
                label={`Ver ${i.name}`}
                onPress={() => {
                  setSelected(i.id);
                  setMessage('');
                }}
              />
            </View>
          ))}
          {inventory &&
            !ITEMS.some(
              (i) =>
                owned(i.id) && (category === 'all' || i.category === category),
            ) && (
              <Text style={common.body}>
                Você ainda não tem itens nesta categoria. As opções padrão
                continuam disponíveis.
              </Text>
            )}
          {!inventory && (
            <Text style={common.body}>
              O presente inicial de 50 sementes é concedido uma vez por perfil.
              Compras gastam apenas sementes, preservando XP e trilha.
            </Text>
          )}
        </>
      )}
    </ScrollView>
  );
}
