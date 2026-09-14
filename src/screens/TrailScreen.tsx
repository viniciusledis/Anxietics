import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DAILY_TARGET, Progress } from '../domain/progress';
import { getStageStatus, Stage, STAGES } from '../trail/stages';
import { colors, common } from '../ui/theme';

type Props = { progress: Progress; onPlay: (stage: Stage) => void; onSettings: () => void };

export function TrailScreen({ progress, onPlay, onSettings }: Props) {
  const daily = progress.daily.completedStageIds.length;
  return (
    <ScrollView style={common.screen} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <View style={styles.brand}>
          <View style={styles.mark} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <View style={styles.leafLeft} /><View style={styles.leafRight} /><View style={styles.stem} />
          </View>
          <Text style={styles.brandName}>anxietics</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir preferências e informações" onPress={onSettings} style={({ pressed }) => [styles.settings, pressed && { opacity: 0.6 }]}>
          <Text style={styles.settingsText}>Ajustes</Text>
        </Pressable>
      </View>

      <Text style={[common.eyebrow, { marginTop: 26 }]}>SEU TEMPO, SEU RITMO</Text>
      <Text style={styles.heading}>Um pequeno{ '\n' }momento seu.</Text>
      <Text style={common.body}>Escolha um campo e descubra o caminho{ '\n' }que o seu toque pode criar.</Text>

      <View style={styles.dailyCard}>
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={styles.dailyTitle}>{daily >= DAILY_TARGET ? 'Seu trio de hoje está completo' : 'Três pausas para hoje'}</Text>
          <Text style={styles.dailyDescription}>{daily >= DAILY_TARGET ? 'Os campos continuam abertos para repetir.' : 'Uma sugestão. Você decide quanto jogar.'}</Text>
        </View>
        <View style={styles.dailyCounter} accessibilityLabel={`${daily} de ${DAILY_TARGET} atividades hoje`}>
          <Text style={styles.counterText}>{daily}<Text style={styles.counterTotal}> / {DAILY_TARGET}</Text></Text>
          <View style={styles.dots}>{[0, 1, 2].map(i => <View key={i} style={[styles.dot, i < daily && { backgroundColor: colors.green }]} />)}</View>
        </View>
      </View>

      <View style={styles.trailHeader}>
        <Text style={common.eyebrow}>01 — PEQUENOS JARDINS</Text>
        <Text style={styles.chapterCount}>{progress.completedStageIds.length}/3</Text>
      </View>
      <Text style={styles.variationNote}>Três variações do jogo de cortar grama</Text>

      <View style={styles.trail}>
        {STAGES.map((stage, index) => {
          const status = getStageStatus(stage.id, progress.completedStageIds);
          const locked = status === 'locked';
          const complete = status === 'completed';
          const label = locked ? 'Bloqueada' : complete ? 'Concluída · jogar de novo' : 'Disponível · começar';
          return (
            <View key={stage.id} style={[styles.stageRow, { marginLeft: index === 1 ? 36 : 0 }]}>
              {index < STAGES.length - 1 && <View style={[styles.connector, { transform: [{ rotate: index === 0 ? '-17deg' : '17deg' }] }]} />}
              <Pressable disabled={locked} onPress={() => onPlay(stage)} accessibilityRole="button"
                accessibilityLabel={`${stage.title}. ${label}`}
                accessibilityHint={locked ? 'Conclua a etapa anterior para abrir este campo.' : stage.subtitle}
                accessibilityState={{ disabled: locked }}
                style={({ pressed }) => [styles.stageButton, pressed && { opacity: 0.7 }]}>
                <View style={[styles.nodeRing, status === 'available' && styles.availableRing]}>
                  <View style={[styles.node, { backgroundColor: locked ? '#E1E3D9' : complete ? colors.green : stage.palette.cut }]}>
                    <Text style={[styles.nodeNumber, complete && { color: colors.paper }, locked && { color: '#7A8374' }]}>{complete ? '✓' : `0${index + 1}`}</Text>
                    {!locked && !complete && <View style={styles.nodeSprout}><View style={styles.tinyLeaf} /><View style={[styles.tinyLeaf, { transform: [{ rotate: '-45deg' }] }]} /></View>}
                  </View>
                </View>
                <View style={styles.stageText}>
                  <Text style={[styles.stageTitle, locked && { color: '#727A6C' }]}>{stage.title}</Text>
                  <Text style={styles.stageSubtitle}>{stage.subtitle}</Text>
                  <Text style={[styles.status, locked && { color: '#727A6C' }]}>{label}{status === 'available' ? '  →' : ''}</Text>
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Por aqui, não há pressa.</Text>
        <Text style={styles.footerText}>Você pode parar e voltar quando quiser.{ '\n' }Seu caminho fica guardado neste aparelho.</Text>
      </View>
      <Text style={styles.disclaimer}>O Anxietics não substitui acompanhamento profissional.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingBottom: 28, width: '100%', maxWidth: 580, alignSelf: 'center' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { flexDirection: 'row', gap: 9, alignItems: 'center' },
  brandName: { fontSize: 24, letterSpacing: -0.8, fontWeight: '700', color: colors.ink },
  mark: { width: 28, height: 32 },
  leafLeft: { position: 'absolute', width: 17, height: 10, backgroundColor: colors.green, borderTopLeftRadius: 12, borderBottomRightRadius: 12, top: 8 },
  leafRight: { position: 'absolute', width: 19, height: 12, backgroundColor: '#96AB76', borderTopRightRadius: 14, borderBottomLeftRadius: 14, left: 12, top: 2 },
  stem: { position: 'absolute', left: 13, top: 12, width: 2, height: 16, backgroundColor: colors.green },
  settings: { minWidth: 60, minHeight: 48, justifyContent: 'center', alignItems: 'flex-end' },
  settingsText: { color: colors.green, fontSize: 14, fontWeight: '600' },
  heading: { color: colors.ink, fontSize: 38, lineHeight: 43, fontWeight: '600', letterSpacing: -1.5, marginTop: 12, marginBottom: 14 },
  dailyCard: { marginTop: 26, padding: 18, borderRadius: 22, backgroundColor: colors.lightGreen, flexDirection: 'row', alignItems: 'center', gap: 12 },
  dailyTitle: { fontSize: 15, fontWeight: '600', color: colors.ink },
  dailyDescription: { fontSize: 13, lineHeight: 19, color: '#526449' },
  dailyCounter: { alignItems: 'center', gap: 7 },
  counterText: { fontSize: 27, fontWeight: '600', color: colors.ink },
  counterTotal: { fontSize: 15, fontWeight: '400', color: '#526449' },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#B9C6A8' },
  trailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 },
  chapterCount: { color: colors.muted, fontSize: 12 },
  variationNote: { fontSize: 13, color: colors.muted, marginTop: 8 },
  trail: { marginTop: 18 },
  stageRow: { minHeight: 132, justifyContent: 'center' },
  connector: { position: 'absolute', top: 75, left: 53, width: 4, height: 108, backgroundColor: '#D4DDC6', borderRadius: 3 },
  stageButton: { flexDirection: 'row', gap: 14, alignItems: 'center', paddingVertical: 10 },
  nodeRing: { padding: 5, borderRadius: 48, borderWidth: 2, borderColor: 'transparent' },
  availableRing: { borderColor: '#A7BA8A' },
  node: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 4, borderBottomColor: '#00000012' },
  nodeNumber: { fontSize: 24, fontWeight: '600', color: colors.ink },
  nodeSprout: { flexDirection: 'row', marginTop: 3 },
  tinyLeaf: { width: 10, height: 5, backgroundColor: '#517143', borderRadius: 5, transform: [{ rotate: '45deg' }] },
  stageText: { flex: 1, gap: 5 },
  stageTitle: { fontSize: 17, fontWeight: '600', color: colors.ink },
  stageSubtitle: { fontSize: 13, lineHeight: 19, color: colors.muted },
  status: { fontSize: 12, lineHeight: 18, fontWeight: '600', color: colors.green },
  footer: { marginTop: 18, borderTopWidth: 1, borderColor: colors.line, paddingTop: 24, gap: 8 },
  footerTitle: { fontSize: 16, color: colors.ink, fontWeight: '500' },
  footerText: { fontSize: 13, lineHeight: 20, color: colors.muted },
  disclaimer: { fontSize: 11, lineHeight: 17, color: colors.muted, marginTop: 24 },
});
