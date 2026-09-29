import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
import { colors, common, radius, space, type } from '../ui/theme';
import {
  Badge,
  CurrencyIndicator,
  EmptyState,
  FilterChips,
  SectionHeader,
  TopBar,
} from '../ui/primitives';
import { Icon } from '../ui/Icon';

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
    <ScrollView style={common.screen} contentContainerStyle={common.content}>
      <TopBar
        title={
          item
            ? 'Detalhes do item'
            : inventory
              ? 'Meu inventário'
              : 'Loja do jardim'
        }
        onBack={back}
        backLabel={item ? 'Voltar aos itens' : 'Voltar à trilha'}
        disabled={busy}
      />
      <EconomySummary progress={progress} compact />
      {!!message && (!failedAt || failedAt === progress.economy) && (
        <View style={[styles.notice, failedAt && styles.errorNotice]}>
          <Icon
            name={failedAt ? 'alert' : 'check'}
            color={failedAt ? colors.error : colors.green}
          />
          <Text accessibilityLiveRegion="polite" style={styles.noticeText}>
            {message}
          </Text>
        </View>
      )}
      {item ? (
        <>
          <View style={styles.itemHero}>
            <ItemPreview item={item} size={180} />
          </View>
          <View style={styles.detailHeading}>
            <Badge
              label={CATEGORIES.find((c) => c.id === item.category)?.name ?? ''}
            />
            <Text accessibilityRole="header" style={common.title}>
              {item.name}
            </Text>
            <Text style={common.body}>{item.description}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name={item.target === 'grass' ? 'grass' : 'tree'} />
            <View style={{ flex: 1, gap: space.xs }}>
              <Text style={styles.itemTitle}>Como usar</Text>
              <Text style={common.body}>{item.effect}</Text>
              <Text style={common.caption}>
                Uso:{' '}
                {item.target === 'grass' ? 'Cortar grama' : 'Jardim pessoal'}
              </Text>
            </View>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.itemTitle}>
              {owned(item.id)
                ? used(item.id)
                  ? 'Em uso'
                  : 'Adquirido'
                : 'Preço do item'}
            </Text>
            {!owned(item.id) && <CurrencyIndicator value={item.price} />}
          </View>
          {!owned(item.id) ? (
            <>
              {progress.economy.seeds < item.price && (
                <Text style={styles.shortfall}>
                  Saldo insuficiente. Faltam{' '}
                  {item.price - progress.economy.seeds} sementes.
                </Text>
              )}
              <Button
                label={`Confirmar compra · ${item.price} sementes`}
                icon="seed"
                disabled={busy || progress.economy.seeds < item.price}
                loading={busy}
                onPress={() => {
                  void act(() => onBuy(item.id));
                }}
              />
              <Text style={styles.footnote}>
                Item permanente. Uma compra por perfil, sem dinheiro real.
              </Text>
            </>
          ) : item.category === 'garden' ? (
            <>
              <Button
                label="Usar no jardim"
                icon="tree"
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
              icon={used(item.id) ? 'restart' : 'check'}
              disabled={busy}
              loading={busy}
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
          {!inventory && (
            <View style={styles.shopHero}>
              <Image
                source={require('../../docs/visual-3d/references/Anxietics - Identidade Visual 3.png')}
                resizeMode="cover"
                style={[
                  StyleSheet.absoluteFill,
                  { width: '100%', height: '100%' },
                ]}
                accessible={false}
              />
              <View style={styles.heroCopy}>
                <Text style={common.eyebrow}>FEITO PARA CUIDAR</Text>
                <Text style={styles.heroTitle}>Um jardim com seu jeito.</Text>
              </View>
            </View>
          )}
          {inventory && (
            <>
              <SectionHeader
                title="Tudo o que é seu"
                detail="Troque a aparência e a ferramenta quando quiser."
              />
              <View style={styles.defaults}>
                <Button
                  secondary
                  compact
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
                  compact
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
              </View>
            </>
          )}
          <FilterChips
            options={[{ id: 'all' as const, name: 'Todos' }, ...CATEGORIES]}
            value={category}
            onChange={setCategory}
          />
          <View>
            {ITEMS.filter(
              (i) =>
                (category === 'all' || i.category === category) &&
                (!inventory || owned(i.id)),
            ).map((i) => (
              <Pressable
                key={i.id}
                accessibilityRole="button"
                accessibilityLabel={`Ver ${i.name}`}
                onPress={() => {
                  setSelected(i.id);
                  setMessage('');
                }}
                style={({ pressed }) => [
                  styles.itemRow,
                  pressed && { backgroundColor: colors.lightGreen },
                ]}
              >
                <ItemPreview item={i} size={92} />
                <View style={styles.itemCopy}>
                  <Text style={styles.itemTitle}>{i.name}</Text>
                  <Text style={common.caption}>{i.description}</Text>
                  {owned(i.id) ? (
                    <Badge
                      icon="check"
                      label={used(i.id) ? 'Em uso' : 'Adquirido'}
                    />
                  ) : (
                    <View style={styles.price}>
                      <Icon name="seed" size={18} color={colors.gold} />
                      <Text style={styles.priceText}>{i.price} sementes</Text>
                    </View>
                  )}
                </View>
                <Icon name="next" size={22} color={colors.muted} />
              </Pressable>
            ))}
          </View>
          {inventory &&
            !ITEMS.some(
              (i) =>
                owned(i.id) && (category === 'all' || i.category === category),
            ) && (
              <EmptyState
                title="Espaço para florescer"
                message="Você ainda não tem itens nesta categoria. As opções padrão continuam disponíveis."
              />
            )}
          {!inventory && (
            <Text style={styles.footnote}>
              O presente inicial de 50 sementes é concedido uma vez por perfil.
              Compras gastam apenas sementes, preservando XP e trilha.
            </Text>
          )}
        </>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  shopHero: {
    height: 160,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: '#FFF8EB',
    justifyContent: 'center',
  },
  heroCopy: { width: '49%', paddingLeft: space.lg, gap: space.sm },
  heroTitle: { ...type.section, color: colors.ink },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    borderRadius: radius.sm,
  },
  itemCopy: { flex: 1, gap: space.sm },
  itemTitle: { ...type.label, color: colors.ink },
  price: { flexDirection: 'row', gap: space.xs, alignItems: 'center' },
  priceText: { ...type.caption, color: colors.gold, fontWeight: '700' },
  defaults: { gap: space.sm },
  itemHero: {
    alignItems: 'center',
    paddingVertical: space.lg,
    backgroundColor: colors.lightGreen,
    borderRadius: radius.xl,
  },
  detailHeading: { gap: space.sm },
  detailRow: {
    flexDirection: 'row',
    gap: space.md,
    paddingVertical: space.lg,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.lightGreen,
    padding: space.md,
    borderRadius: radius.md,
  },
  errorNotice: { backgroundColor: colors.lightError },
  noticeText: { ...type.caption, color: colors.ink, flex: 1 },
  shortfall: { ...type.body, color: colors.muted },
  footnote: { ...type.caption, color: colors.muted, textAlign: 'center' },
});
