# Migração visual 3D dos mini games

> Registro da migração funcional inicial. A revisão visual posterior, suas capturas e decisões estão em [POLISH_3D.md](POLISH_3D.md). As descrições técnicas de renderização abaixo refletem a primeira versão e foram parcialmente substituídas pelo polish.

Inventário realizado antes da implementação. A lógica de progresso, economia e conclusão continua no `GameScreen`; os arquivos `rules.ts` são a fonte das regras de cada jogo. Nenhum dos jogos abaixo usa áudio, háptica ou assets de imagem/modelo externos hoje. O campo original é Skia + Gesture Handler em coordenadas 320 × 448; o HUD e a navegação são React Native.

| Jogo (arquivos) | Mecânica, progresso e conclusão | Direção visual e complexidade |
| --- | --- | --- |
| Cortar grama (`grass/`) | Arrasto corta células de cobertura; concluído ao preencher o jardim. Já existe 3D e comparação 2D. | Jardim diorama; referência técnica. |
| Frutas (`fruit/`) | Swipe cruza seis centros; 1/6 por fruta cortada. | Tabuleiro de cozinha aconchegante, frutas volumétricas e corte com separação física. Baixa. |
| Luzes (`lights/`) | Tocar/arrastar pelos pontos da constelação em ordem; pontos acesos / total. | Jardim noturno tranquilo com lanternas, sem brilho agressivo. Baixa. |
| Pedrinhas (`arrange/`) | Arrastar quatro formas até contornos correspondentes; peças colocadas / quatro. | Mesa tátil de pedras lisas. Média. |
| Bolinhas (`arrange/`) | Arrastar seis bolas a cestos por cor e símbolo; peças colocadas / seis. | Brinquedo de classificação com volumes suaves. Média. |
| Areia (`sand/`) | Quatro traços longos de ancinho; no modo livre é aberto. | Jardim zen em bandeja rasa, sulcos e ferramenta 3D. Média. |
| Flores (`flowers/`) | Plantar oito flores em cada uma de quatro regiões; 32 no total; livre aberto. | Canteiro de flores que ganha volume gradualmente. Média. |
| Tinta (`ink/`) | Três gestos em cada uma de três cores; livre aberto. | Tigela de água com gotas cromáticas e difusão calma. Média. |
| Regar (`water/`) | Segurar/arrastar o regador; quatro vasos acumulam aproximadamente 4 s de água cada. | Prateleira de vasos vivos, plantas crescendo. Média. |
| Janela (`surface/`) | Limpar pelo menos 95% da cobertura da janela. | Janela embaçada com paisagem em profundidade. Alta. |
| Revelar (`surface/`) | Remover pelo menos 95% do papel que cobre uma das três ilustrações. | Mesa de descoberta com relevo e objetos em camadas. Alta. |
| Lavar (`surface/`) | Remover pelo menos 95% da sujeira na silhueta do vaso. | Pia/tampo acolhedor, vaso de cerâmica. Alta. |
| Argila (`surface/`) | Alisar pelo menos 95% da superfície. | Oficina de cerâmica e relevo moldável. Alta. |
| Pintar (`surface/`) | Cobrir pelo menos 95% da parede, escolhendo entre três cores. | Ateliê com parede em relevo e rolo. Alta. |

Ordem: frutas → luzes → organização (pedras/bolinhas) → areia → flores → tinta → regar → superfícies (janela, revelar, lavar, argila, pintar). A comparação 2D deve permanecer no Laboratório para cada jogo migrado. As imagens conceituais enviadas inspiram a paleta creme/verde/coral, a vegetação arredondada e a sensação de miniatura artesanal; cada cena mantém sua própria composição.

Critérios: preservar as funções em `rules.ts`, evitar shaders/pós-processamento pesados, limitar draw calls, pausar o render quando o jogo estiver inativo, validar TypeScript/testes/bundles a cada grupo e fazer uma passagem visual separada da funcional.

## Implementação

As 13 novas versões 3D estão ligadas por `src/minigames/three/catalog.ts` e são a apresentação padrão dos jogos já existentes. O código e as regras 2D continuam intactos em `src/minigames/catalog.ts`; o Laboratório oferece “Testar … 3D” e “Comparar … 2D original” para cada variação. Nos modos livres de areia, flores e tinta também há comparação 2D. `Session.visual` seleciona a apresentação; `grassVisual` antigo permanece aceito. O HUD, os controles de cor, a pontuação, as recompensas, pausa/reinício e navegação continuam em React Native.

| Jogo | Cena 3D e feedback | Técnica |
| --- | --- | --- |
| Frutas | Tabuleiro de cozinha, pratos, fruta com volume e metades que se separam com pequenos fragmentos. | `FruitGame3D.tsx`; seis objetos e regra `sliceFruit`. |
| Luzes | Jardim noturno iluminado, pequenas lanternas, caminho dourado e estrelas discretas. | `LightsGame3D.tsx`; regra `lightSegment`, pontos em ordem. |
| Pedrinhas / bolinhas | Mesa tátil de pedras ou cestos de brinquedo com cor e símbolo; objetos se erguem no arrasto e assentam no alvo. | `ArrangeGame3D.tsx`; regras `hitPiece`/`fits`. |
| Areia | Bandeja zen, ancinho 3D e cinco sulcos paralelos por gesto. | `SandGame3D.tsx`; dois `LineSegments` com buffers dinâmicos limitados a 1200 segmentos de movimento; regras `startSand`/`moveSand`/`endSand`. |
| Flores | Quatro canteiros, flores que crescem ao pintar o terreno e sinal de conclusão. | `FlowersGame3D.tsx`; quatro `InstancedMesh` limitados a 352 flores, regra `plantSegment`. |
| Tinta | Bandeja de água com manchas em expansão e pequenos centros de cor. | `InkGame3D.tsx`; três pools instanciados de até 24 gotas; regras `addInk`/`countInk`/`expandInk`. |
| Regar | Quatro vasos de cerâmica, plantas que crescem, flores que desabrocham e regador tridimensional. | `WaterGame3D.tsx`; regra `waterAt`, delta de quadro limitado a 50 ms. |
| Janela | Painel embaçado em relevo com paisagem e moldura. | `SurfaceGame3D.tsx` + `surface/three/`; regra `cutSegment` com cobertura de 95%. |
| Revelar | Papel sobre ilustração em baixo-relevo (casa/barco/borboleta) e pincel. | Mesma malha de cobertura, ambiente e ferramenta próprios. |
| Lavar | Vaso de cerâmica sobre bancada, sujeira somente na silhueta elegível e jato de água. | Mesma malha com `insideVase`; ambiente e ferramenta próprios. |
| Argila | Laje de argila com relevo e espátula; a camada áspera cede ao alisamento. | Mesma malha, ambiente e ferramenta próprios. |
| Pintar | Painel com moldura e rolo; cada célula mantém a cor selecionada quando pintada. | Mesma malha, cor por instância, ambiente e ferramenta próprios. |

Os componentes compartilhados são `SceneFrame` (Canvas Expo/R3F e gesto RN), `projection` (raycasting do dedo para o plano lógico), `RoundedBoard` (base com cantos arredondados) e, apenas para os cinco jogos de cobertura, `SurfaceTiles`, `SurfaceEnvironment` e `SurfaceTool`. A câmera, o cenário, o objeto principal e a iluminação são específicos para cada família de jogo. As cores partem de `ui/theme.ts` e dos acentos/variações de `definitions.ts`, com a direção creme, verde, coral e materiais suaves das imagens conceituais. Nenhum asset remoto nem dependência nova foi adicionado.

## Validação nesta etapa

- `npm run check`: TypeScript e 58 testes passaram, incluindo a nova prova de projeção perspectiva nos cantos do campo.
- `npm run export:mobile`: bundles Hermes Android e iOS gerados.
- `npx expo install --check`: dependências compatíveis conforme mapa local; a verificação online ficou indisponível.
- Regressão web das 14 versões 2D: conclusão, pausa, reinício, modo livre, redimensionamento, persistência e migração aprovados (`scripts/verify-preview.cjs` e `scripts/verify-lifecycle.cjs`).
- Smoke visual web das 13 cenas 3D sem exceções (`scripts/verify-3d-scenes.cjs`), seguido de inspeção das capturas e segunda passagem de câmera, molduras, materiais e profundidade.
- Gesto e conclusão a 100% das 13 novas versões no Chrome (`scripts/verify-3d-interactions.cjs`). Esses testes usam projeção perspectiva, não coordenadas 2D diretas.
- Os modos livres 3D de areia, flores e tinta continuam abertos mesmo após gestos suficientes para a meta guiada; concluem somente ao tocar em “Encerrar por aqui”.
- `npm run test:economy`: recompensas, falha/retry, loja, equipamentos, jardim e catálogo aprovados com os jogos 3D padrão.

## Performance e pendências de aparelho

O Canvas usa `antialias: false`, luz ambiente/hemisférica/direcional sem shadow map, materiais `roughness` alta, geometrias procedurais leves e sem pós-processamento. A malha de cobertura contém no máximo 8960 tiles em um `InstancedMesh` por jogo; só as células alteradas animam. Flores, tinta e sulcos têm memória fixa. O render é interrompido quando o jogo pausa ou sai do primeiro plano.

Ainda é necessário validar Android intermediário e iPhone não recente: FPS real, temperatura/bateria, memória/tempo de criação da malha de superfícies, resposta do toque em multitouch e bordas, contexto GL após background/foreground, legibilidade em diferentes proporções e preferência por movimento reduzido. Não há sistema de áudio/háptica nesses mini games; por isso nenhum som/vibração novo foi introduzido. O teste web e os bundles não comprovam estabilidade ou nível de acabamento em hardware real.
