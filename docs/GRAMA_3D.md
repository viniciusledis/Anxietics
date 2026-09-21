# Cortar grama 3D — vertical slice

O jogo de cortar grama usa a nova versão 3D na trilha, em Hoje e no modo livre. A versão 2D original continua em `src/minigames/grass/GrassGame.tsx` e pode ser aberta no Laboratório para comparação. Os demais mini games não foram convertidos.

## Como acessar

Execute `npm run dev:games` e abra a primeira etapa, **Cortar grama**, na trilha. Para comparar, abra **Laboratório de desenvolvimento** e escolha **Testar grass · ... · 3D** ou **Comparar grass · ... · 2D original**. O laboratório não altera recompensas nem tarefas. O teste isolado de objeto 3D continua disponível no mesmo menu.

## Arquivos

| Local | Papel |
| --- | --- |
| `src/minigames/grass/GrassGame3D.tsx` | Gesto, projeção do toque no gramado, regra existente de cobertura e comunicação com a cena. |
| `src/minigames/grass/three/sceneModel.ts` | Coordenadas lógicas ↔ mundo 3D e índices das instâncias. |
| `src/minigames/grass/three/LawnController.ts` | Estado visual transitório sem renderizações React por movimento. |
| `src/minigames/grass/three/LawnScene.tsx` | Canvas Expo GL, câmera com acompanhamento discreto e luzes. |
| `src/minigames/grass/three/Lawn.tsx` | Superfície cortada e tufos instanciados, com transição de altura e cor. |
| `src/minigames/grass/three/LawnMower.tsx` | Cortador procedural com corpo arredondado, quatro rodas e microanimação. |
| `src/minigames/grass/three/GardenEnvironment.tsx` | Ilha de terra, cerca, árvore, arbustos, pedras e flores procedurais. |
| `src/minigames/grass/three/GrassParticles.tsx` e `CompletionEffects.tsx` | Partículas limitadas e celebração contida. |
| `tests/grass3d.test.ts` | Projeção do toque, mapeamento das células e transição final. |

Foram modificados `src/minigames/types.ts`, `src/screens/GameScreen.tsx`, `src/screens/DevScreen.tsx`, `src/navigation/AppNavigator.tsx`, `scripts/verify-preview.cjs`, `scripts/verify-economy.cjs` e o README para selecionar o visual, manter a versão 2D no laboratório e registrar o fluxo. `scripts/grass3d-coordinates.cjs` projeta os gestos do roteiro web no gramado em perspectiva; o teste 2D continua usando coordenadas planas.

## Decisões de jogo e performance

- `cutSegment` e a malha lógica de 80×112 células permanecem os mesmos. O raio de corte, inclusive a ferramenta larga, vem do mesmo equipamento. Conclusão continua em 95%, com acabamento visual a 100%.
- O 3D **não** substitui HUD, progresso, textos, confirmação, navegação, recompensa, persistência ou fluxo de pausa. Esses recursos continuam em React Native. Marcos de 25% adicionam um pulso visual contido e mudam a mensagem do HUD sem deslocar o campo.
- Um `InstancedMesh` desenha 2.240 amostras de superfície; outro desenha 560 tufos de três folhas. Apenas instâncias afetadas pelo corte atualizam matriz/cor em cada quadro. Isso evita milhares de componentes React ou draw calls individuais.
- Cerca, pedras, arbustos e flores repetidos são agrupados em instâncias. Os 36 fragmentos de grama e 28 pétalas de celebração usam pools fixos. Não há textura externa, rede em runtime, física, pós-processamento, shadow map ou MSAA.
- A iluminação mistura hemisfério, ambiente e uma luz direcional; sombras suaves são sugeridas por discos estáticos. A câmera segue o cortador com deslocamento pequeno e lento. Ao pausar ou sair da tela, o loop é interrompido/desmontado.
- A preferência **Menos movimento** reduz transições e omite a celebração animada.

## Verificação e limites

Executados nesta implementação: `npm run check` (57 testes, TypeScript), `npx expo install --check` (mapa local do SDK 54), `npm run export:mobile` (bundles Hermes Android/iOS), `npm run test:preview` (14 jogos e ciclo de vida web) e `node scripts/verify-economy.cjs` (recompensas, compras e ferramenta larga). A inspeção visual web foi feita em 390×844, antes e depois de cortar e ao concluir. A ferramenta larga cobriu 13% no gesto de comparação, contra 10% do padrão, sem mudar recompensas.

TypeScript, testes de regras e exportações Hermes para Android/iOS verificam integração e empacotamento, mas não substituem execução em aparelho. A prévia web permite revisar composição e uma interação por mouse, não mede FPS, temperatura, latência do gesto nem compatibilidade GL nativa. O gesto 3D projeta o toque e aplica a regra na thread JavaScript; aparelhos intermediários devem ser medidos para decidir se esse trecho precisa migrar a um worklet. Validar pelo menos um Android intermediário e um iPhone real, incluindo pausa, segundo plano, reinício, cortador largo e visual azul/coral.
