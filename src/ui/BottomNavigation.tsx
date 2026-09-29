import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon, IconName } from './Icon';
import { colors, radius, space, type } from './theme';

type Destination = 'shop' | 'inventory' | 'garden' | 'achievements';
// The same four shortcuts from the trail, with the same destination callbacks.
export function BottomNavigation({
  onHome,
  onNavigate,
}: {
  onHome: () => void;
  onNavigate: (destination: Destination) => void;
}) {
  const items: {
    id: 'trail' | Destination;
    label: string;
    accessibleLabel: string;
    icon: IconName;
  }[] = [
    {
      id: 'trail',
      label: 'Trilha',
      accessibleLabel: 'Início da trilha',
      icon: 'sprout',
    },
    {
      id: 'garden',
      label: 'Jardim',
      accessibleLabel: 'Meu jardim',
      icon: 'tree',
    },
    { id: 'shop', label: 'Loja', accessibleLabel: 'Loja', icon: 'shop' },
    {
      id: 'inventory',
      label: 'Itens',
      accessibleLabel: 'Inventário',
      icon: 'inventory',
    },
    {
      id: 'achievements',
      label: 'Conquistas',
      accessibleLabel: 'Conquistas',
      icon: 'achievement',
    },
  ];
  return (
    <View style={styles.bar}>
      {items.map((item) => (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          accessibilityLabel={item.accessibleLabel}
          accessibilityState={{ selected: item.id === 'trail' }}
          onPress={() => (item.id === 'trail' ? onHome() : onNavigate(item.id))}
          style={({ pressed }) => [styles.item, pressed && { opacity: 0.65 }]}
        >
          <View style={[styles.icon, item.id === 'trail' && styles.selected]}>
            <Icon
              name={item.icon}
              size={26}
              color={item.id === 'trail' ? colors.green : colors.muted}
            />
          </View>
          <Text
            style={[
              styles.label,
              item.id === 'trail' && { color: colors.greenDark },
            ]}
          >
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.paper,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingHorizontal: space.sm,
    paddingTop: space.sm,
    paddingBottom: space.sm,
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
  },
  item: {
    flex: 1,
    minHeight: 60,
    alignItems: 'center',
    gap: space.xs,
    justifyContent: 'center',
  },
  icon: {
    width: 48,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  selected: { backgroundColor: colors.lightGreen },
  label: { ...type.small, color: colors.muted, textAlign: 'center' },
});
