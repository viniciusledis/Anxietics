import { useState } from 'react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../ui/Button';
import { colors, common, radius, space, type } from '../ui/theme';
import { SectionHeader, TopBar } from '../ui/primitives';
import { Icon } from '../ui/Icon';

type Props = {
  reducedMotion: boolean;
  onReducedMotion: (value: boolean) => void;
  onExit: () => void;
  onReset: () => Promise<boolean>;
  resetBusy: boolean;
  resetError: boolean;
};

export function SettingsScreen({
  reducedMotion,
  onReducedMotion,
  onExit,
  onReset,
  resetBusy,
  resetError,
}: Props) {
  const [confirm, setConfirm] = useState(false);
  const [signOutBusy, setSignOutBusy] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const metadataName = user?.user_metadata.name;
  const displayName =
    typeof metadataName === 'string' && metadataName.trim()
      ? metadataName.trim()
      : null;
  return (
    <ScrollView style={common.screen} contentContainerStyle={styles.content}>
      <TopBar
        title="Ajustes"
        onBack={onExit}
        disabled={resetBusy || signOutBusy}
      />
      <View style={styles.account}>
        <View style={styles.avatar}>
          <Icon name="sprout" size={32} />
        </View>
        <View style={{ flex: 1, gap: space.xs }}>
          <Text style={styles.subtitle}>{displayName ?? 'Seu espaço'}</Text>
          <Text style={styles.body}>{user?.email ?? 'Conta autenticada'}</Text>
        </View>
      </View>
      <SectionHeader
        title="Do seu jeito"
        detail="Um pouco mais de conforto para sua pausa."
      />
      <View style={styles.preference}>
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={styles.subtitle}>Menos movimento</Text>
          <Text style={styles.body}>
            Reduz as animações. O gesto para jogar continua, e a preferência do
            sistema é respeitada.
          </Text>
        </View>
        <Switch
          accessibilityLabel="Menos movimento"
          value={reducedMotion}
          onValueChange={onReducedMotion}
          trackColor={{ false: colors.line, true: colors.green }}
          thumbColor={colors.paper}
        />
      </View>
      <Text style={styles.subtitle}>Um espaço para jogar</Text>
      <Text style={styles.body}>
        O Anxietics oferece minijogos para momentos de pausa. O progresso mostra
        atividades concluídas no aplicativo e não mede melhora da saúde mental.
      </Text>
      <Text style={styles.body}>
        O aplicativo não substitui acompanhamento profissional, não faz
        diagnósticos e não oferece tratamento.
      </Text>
      <View style={common.divider} />
      <Text style={styles.subtitle}>Sua conta</Text>
      <Text style={styles.body}>
        Você continua conectado para voltar com facilidade. Sua senha não é
        armazenada pelo aplicativo.
      </Text>
      <Button
        secondary
        icon="logout"
        label={signOutBusy ? 'Saindo…' : 'Sair da conta'}
        loading={signOutBusy}
        disabled={resetBusy}
        onPress={() => {
          if (signOutBusy) return;
          setSignOutBusy(true);
          setSignOutError(null);
          void signOut().then((result) => {
            setSignOutError(result.error);
            setSignOutBusy(false);
          });
        }}
      />
      {!!signOutError && (
        <Text accessibilityLiveRegion="assertive" style={styles.error}>
          {signOutError}
        </Text>
      )}
      <View style={common.divider} />
      <Text style={styles.subtitle}>Seu progresso, neste aparelho</Text>
      <Text style={styles.body}>
        Etapas, atividades do dia e esta preferência continuam no armazenamento
        local do aplicativo e não são sincronizadas com a conta nesta versão. A
        política de backup do aparelho pode incluir esses dados.
      </Text>
      <Text style={styles.body}>
        Não existe sequência para manter. A cada dia, a sugestão de três
        atividades é renovada. Etapas abertas permanecem abertas, e repetir é
        sempre permitido.
      </Text>
      <Text style={styles.body}>
        Sair de um jogo descarta apenas a rodada parcial. Etapas concluídas
        ficam salvas. Desinstalar o aplicativo ou limpar seus dados pode apagar
        o progresso.
      </Text>
      <Button
        secondary
        destructive
        icon="trash"
        label="Apagar dados deste aparelho"
        disabled={signOutBusy}
        onPress={() => setConfirm(true)}
      />
      {resetError && (
        <Text style={styles.body}>
          Não foi possível apagar. Tente novamente; o progresso atual foi
          preservado.
        </Text>
      )}
      <ConfirmDialog
        visible={confirm}
        destructive
        title="Apagar todos os dados?"
        message="Isso apaga etapas, conquistas, XP, sementes, compras virtuais, equipamentos, jardim, tarefas e preferências. O perfil local reinicia com o presente inicial. Não é possível desfazer."
        confirmLabel="Apagar e recomeçar"
        busy={resetBusy}
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          void onReset().then((ok) => {
            if (ok) {
              setConfirm(false);
              onExit();
            }
          });
        }}
      />
      <Text style={styles.version}>
        ANXIETICS · MVP 0.3{'\n'}Projeto de TCC · Vinícius Peres Ledis dos
        Santos
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { ...common.content, gap: space.lg },
  account: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    paddingVertical: space.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGreen,
  },
  preference: {
    flexDirection: 'row',
    gap: space.lg,
    alignItems: 'center',
    paddingVertical: space.xl,
    borderBottomWidth: 1,
    borderColor: colors.line,
    marginBottom: space.sm,
  },
  subtitle: { ...type.section, color: colors.ink },
  body: { ...type.body, color: colors.muted },
  error: { ...type.caption, color: colors.error },
  version: {
    ...type.small,
    marginTop: space.lg,
    color: colors.muted,
    textAlign: 'center',
  },
});
