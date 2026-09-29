import { ScrollView, Text, View } from 'react-native';
import { GAME_CATALOG } from '../minigames/catalog';
import { GAME_3D_COMPONENTS } from '../minigames/three/catalog';
import { Session } from '../minigames/types';
import { Button } from '../ui/Button';
import { common } from '../ui/theme';
export function DevScreen({
  onPlay,
  onThreeTest,
  onExit,
}: {
  onPlay: (session: Omit<Session, 'id'>) => void;
  onThreeTest: () => void;
  onExit: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
      <Button secondary label="Voltar à trilha" onPress={onExit} />
      <Text style={common.title}>Laboratório</Text>
      <Text style={common.body}>
        Somente desenvolvimento. Nenhuma partida daqui altera conquistas ou
        tarefas.
      </Text>
      <View style={{ gap: 8, marginBottom: 16 }}>
        <Text style={common.body}>Experimentos técnicos</Text>
        <Button label="Abrir teste 3D isolado" onPress={onThreeTest} />
      </View>
      {GAME_CATALOG.map((game) => (
        <View key={game.id} style={{ gap: 8, marginBottom: 16 }}>
          <Text style={common.body}>{game.name}</Text>
          {game.variations.map((name, variation) => (
            <View key={name} style={{ gap: 7 }}>
              <Button
                disabled={!game.component}
                label={`Testar ${game.id} · ${name}${GAME_3D_COMPONENTS[game.id] ? ' · 3D' : ''}`}
                onPress={() => onPlay({ mode: 'dev', game: game.id, variation, visual: '3d' })}
              />
              {!!GAME_3D_COMPONENTS[game.id] && (
                <Button
                  secondary
                  label={`Comparar ${game.id} · ${name} · 2D original`}
                  onPress={() => onPlay({ mode: 'dev', game: game.id, variation, visual: '2d' })}
                />
              )}
            </View>
          ))}
          {game.openEnded && (
            <>
              <Button
                secondary
                label={`Livre · ${game.id}${GAME_3D_COMPONENTS[game.id] ? ' · 3D' : ''}`}
                onPress={() =>
                  onPlay({
                    mode: 'free',
                    game: game.id,
                    variation: 0,
                    sandbox: true,
                    visual: '3d',
                  })
                }
              />
              {!!GAME_3D_COMPONENTS[game.id] && (
                <Button
                  secondary
                  label={`Livre · ${game.id} · 2D original`}
                  onPress={() => onPlay({ mode: 'free', game: game.id, variation: 0, sandbox: true, visual: '2d' })}
                />
              )}
            </>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
