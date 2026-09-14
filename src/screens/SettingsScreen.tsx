import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Button } from '../ui/Button';
import { colors, common } from '../ui/theme';

type Props = { reducedMotion: boolean; onReducedMotion: (value: boolean) => void; onExit: () => void };

export function SettingsScreen({ reducedMotion, onReducedMotion, onExit }: Props) {
  return (
    <ScrollView style={common.screen} contentContainerStyle={styles.content}>
      <Button secondary label="‹  Voltar à trilha" onPress={onExit} style={{ alignSelf: 'flex-start' }} />
      <Text style={[common.eyebrow, { marginTop: 32 }]}>DO SEU JEITO</Text>
      <Text style={[common.title, { marginTop: 10 }]}>Ajustes e cuidados</Text>
      <View style={styles.preference}>
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={styles.subtitle}>Menos movimento</Text>
          <Text style={styles.body}>Exibe a conclusão sem animação. A preferência do sistema também é respeitada.</Text>
        </View>
        <Switch accessibilityLabel="Menos movimento" value={reducedMotion} onValueChange={onReducedMotion} trackColor={{ false: '#CED5C2', true: colors.green }} thumbColor={colors.paper} />
      </View>
      <Text style={styles.subtitle}>Um espaço para jogar</Text>
      <Text style={styles.body}>O Anxietics oferece minijogos para momentos de pausa. O progresso mostra campos concluídos no aplicativo e não mede melhora da saúde mental.</Text>
      <Text style={styles.body}>O aplicativo não substitui acompanhamento profissional, não faz diagnósticos e não oferece tratamento.</Text>
      <Text style={styles.subtitle}>Seu progresso, neste aparelho</Text>
      <Text style={styles.body}>Não há conta, anúncios ou envio de dados para um servidor do Anxietics. Etapas, atividades do dia e esta preferência ficam no armazenamento local do aplicativo. A política de backup do aparelho pode incluir esses dados.</Text>
      <Text style={styles.body}>Não existe sequência para manter. A cada dia, a sugestão de três atividades é renovada. Etapas abertas permanecem abertas, e repetir é sempre permitido.</Text>
      <Text style={styles.body}>Sair de um campo descarta apenas o corte parcial da rodada. Etapas concluídas ficam salvas. Desinstalar o aplicativo ou limpar seus dados pode apagar o progresso.</Text>
      <Text style={styles.version}>ANXIETICS · MVP 0.1{ '\n' }Projeto de TCC · Vinícius Peres Ledis dos Santos</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, gap: 16, maxWidth: 580, alignSelf: 'center', width: '100%' },
  preference: { flexDirection: 'row', gap: 16, alignItems: 'center', paddingVertical: 24, borderBottomWidth: 1, borderColor: colors.line, marginBottom: 10 },
  subtitle: { fontSize: 18, color: colors.ink, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 23, color: colors.muted },
  version: { marginTop: 16, fontSize: 11, lineHeight: 19, color: colors.muted, letterSpacing: 0.5 },
});
