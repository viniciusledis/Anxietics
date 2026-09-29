import { ScrollView, Text, View } from 'react-native';
import { GAME_CATALOG } from '../minigames/catalog';
import { GAME_3D_COMPONENTS } from '../minigames/three/catalog';
import { Session } from '../minigames/types';
import { Button } from '../ui/Button';
import { TopBar } from '../ui/primitives';
import { common, space } from '../ui/theme';
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
    <ScrollView contentContainerStyle={common.content}>
      <TopBar title="Laboratório" onBack={onExit} />
      <Text style={common.body}>
        Somente desenvolvimento. Nenhuma partida daqui altera conquistas ou
        tarefas.
      </Text>
      <View style={{ gap: space.sm, marginBottom: space.lg }}>
        <Text style={common.body}>Experimentos técnicos</Text>
        <Button label="Abrir teste 3D isolado" onPress={onThreeTest} />
      </View>
      {GAME_CATALOG.map((game) => (
        <View key={game.id} style={{ gap: space.sm, marginBottom: space.lg }}>
          <Text style={common.body}>{game.name}</Text>
          {game.variations.map((name, variation) => (
            <View key={name} style={{ gap: space.sm }}>
              <Button
                disabled={!game.component}
                label={`Testar ${game.id} · ${name}${GAME_3D_COMPONENTS[game.id] ? ' · 3D' : ''}`}
                onPress={() =>
                  onPlay({
                    mode: 'dev',
                    game: game.id,
                    variation,
                    visual: '3d',
                  })
                }
              />
              {!!GAME_3D_COMPONENTS[game.id] && (
                <Button
                  secondary
                  label={`Comparar ${game.id} · ${name} · 2D original`}
                  onPress={() =>
                    onPlay({
                      mode: 'dev',
                      game: game.id,
                      variation,
                      visual: '2d',
                    })
                  }
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
                  onPress={() =>
                    onPlay({
                      mode: 'free',
                      game: game.id,
                      variation: 0,
                      sandbox: true,
                      visual: '2d',
                    })
                  }
                />
              )}
            </>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
