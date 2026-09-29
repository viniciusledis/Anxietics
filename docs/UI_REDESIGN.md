# Anxietics — revisão visual da interface

## Escopo e análise inicial

Revisão da camada de apresentação do aplicativo Expo/React Native existente. A navegação continua por estado, os dados dos jogos permanecem no mesmo repositório e os fluxos de autenticação usam o mesmo AuthProvider/Supabase.

A análise anterior à implementação incluiu a árvore de arquivos, todas as telas, componentes comuns, os dois navegadores, pontos de integração com armazenamento/economia, contratos dos minigames, configuração mobile/web, scripts de validação e os quatro conceitos visuais do Anxietics. Capturas da implementação anterior foram inspecionadas antes das mudanças de UI.

| Área existente | Aplicação da revisão |
| --- | --- |
| Trilha / Home | Hierarquia compacta, etapa disponível em destaque, caminho com deslocamentos suaves, estados com ícones e rótulos, atalhos existentes na barra inferior |
| Hoje | Progresso diário com gota, três atividades e indicação de conclusão; sem sequência ou calendário inventado |
| Livre | Jogos liberados e suas variações, com a mesma abertura de partidas |
| Loja / detalhe de item | Filtros horizontais, lista compacta com arte própria, preço e propriedade, detalhes e confirmação de compra |
| Inventário | Mesmos filtros/equipamentos; opções padrão e estado vazio ilustrado |
| Jardim | Mapa e arte existentes preservados; seleção, alvos, hierarquia e estado vazio refinados |
| Conquistas | Medalhas de broto/flor/árvore e barras que representam os valores existentes |
| Ajustes | Bloco compacto da conta existente, seções claras, preferência de movimento, saída e confirmação destrutiva |
| Login | Arte de jardim existente, formulário sem card exterior, foco/erro/loading e ação principal |
| Cadastro / confirmação por e-mail | Formulário compacto e rolável, mesmos campos, validações e envio; confirmação ilustrada |
| Splash / carregamento / erro de progresso | Marca consistente, muda e estados de recuperação existentes |
| Jogo | Cabeçalho, instruções, progresso e controles comuns aos 14 minigames; pausa e conclusão com espaço próprio |
| Laboratório / teste 3D | Tokens, botões e cabeçalho compartilhados; conteúdo e comportamento técnico preservados |

Não foram criados onboarding, perfil independente, streak ou estados de “atividade perfeita”: esses fluxos/regras não existem nesta versão. O bloco de conta em Ajustes foi apenas reorganizado visualmente. Os desenhos internos dos minigames 2D/3D e o mapa do jardim não foram substituídos; já representam a identidade do produto e sua mecânica está fora deste escopo.

## Direção e referências

- **Duolingo:** hierarquia, tamanho dos alvos, estados claros, navegação simples, densidade e botões com profundidade discreta. Não foram reutilizados seus ícones, cores de marca ou personagens.
- **Anxietics:** creme, vegetação, materiais suaves, vasos, sementes, ferramentas e sensação de cuidado.
- O caminho usa somente os três estados reais: bloqueado, disponível e concluído. A flor marca conclusão; não adiciona recompensas ou regras.

## Design System

Arquivo central: `src/ui/theme.ts`.

| Token | Definição |
| --- | --- |
| Cores | Fundo `#FBF9F2`, superfície branca, texto `#203D30`, auxiliar `#617064`, ação `#477D32`, base `#2E5926`, verde suave `#EAF2DF`, sementes/dourado `#F2C458`/`#8A5B0B`, água `#397C91`, erro `#A83F38` |
| Tipografia | Fonte de sistema; hero 28/34, título 24/30, seção 20/26, corpo 15/22, label 15/20, legenda 13/18 e auxiliar 12/16; pesos 400–800 |
| Espaçamento | 4, 8, 12, 16, 20, 24, 32 e 40 |
| Raios | 8, 12, 16, 24 e circular |
| Sombra | Uma sombra suave para superfícies sobrepostas |
| Toque | Botões principais de pelo menos 52 px; ícones 48 px; filtros/controles compactos 44 px |
| Feedback | Botão pressionado com deslocamento de 2 px/escala 0,98, foco e estados selecionados explícitos; conclusão mantém a animação existente e preferência de movimento reduzido |

Contrastes calculados para os pares principais: botão verde/branco **4,94:1**, texto auxiliar/fundo **4,97:1**, título/fundo **11,25:1**, dourado/fundo suave **5,26:1**, erro/fundo suave **5,33:1**. Isso não equivale a auditoria completa de acessibilidade nativa.

### Componentes novos

- `Icon` e o mapeamento visual `gameIcon`: uma família de ícones, MaterialCommunityIcons via Expo.
- `BottomNavigation`: apresenta os quatro atalhos já existentes da Home e retorno visual ao início da tela. Destinos e callbacks permanecem iguais.
- `Brand`, `IconButton`, `TopBar`, `SectionHeader`, `ProgressBar`, `Badge`, `CurrencyIndicator`, `SproutArt`, `EmptyState`, `SegmentedControl` e `FilterChips`, agrupados em `primitives.tsx`.

Não foram criados Card, BottomSheet ou outros componentes sem necessidade de repetição real.

### Componentes evoluídos

`Button`, `ConfirmDialog`, `SaveNotice`, `EconomySummary`, `AuthShell`, `AuthInput` e o contêiner `ItemPreview`. A arte `ItemArt` mantém seus desenhos; a prévia passou a aceitar tamanho para listagem e detalhe.

As confirmações usam o Modal existente com safe area, rolagem e tratamento explícito de ação destrutiva. Os botões agora fornecem seus nomes acessíveis sem incorporar glifos decorativos. O conteúdo do jogo encoberto por pausa/conclusão fica oculto da árvore de acessibilidade.

## Arquivos principais

- `src/ui/theme.ts`, `Button.tsx`, `Icon.tsx`, `primitives.tsx`, `BottomNavigation.tsx`, `ConfirmDialog.tsx`, `SaveNotice.tsx`.
- `src/screens/TrailScreen.tsx`, `ShopScreen.tsx`, `GardenScreen.tsx`, `AchievementsScreen.tsx`, `SettingsScreen.tsx`, `GameScreen.tsx`.
- `src/components/auth/AuthShell.tsx`, `AuthInput.tsx` e `src/screens/auth/*`.
- `src/economy/EconomySummary.tsx`, `ItemArt.tsx`.
- `src/navigation/AppNavigator.tsx`: somente apresentação do carregamento/erro/confirmação. Nenhum destino, guarda ou handler de navegação alterado.
- `app.json`: cor de splash alinhada e plugin expo-font. `package.json`/lock: suporte oficial de ícones/fontes Expo e comando `test:ui`.

## Inconsistências removidas

Símbolos Unicode decorativos nas telas; botões de navegação misturados ao conteúdo; repetição de resumos com fundos verdes; fontes/raios/espaçamentos dispersos nos componentes principais; listagem da loja com botão e card para cada pedaço; inventário vazio sem ilustração; pausa/conclusão apertadas dentro do campo de jogo; diferenças de cabeçalho entre telas.

A versão compacta da Home mantém a primeira atividade visível em 320×568. As telas de conteúdo continuam roláveis e limitadas em largura no tablet.

## Assets

- `docs/visual-3d/references/Anxietics - Identidade Visual 1.png`: imagem fornecida, usada na entrada.
- `docs/visual-3d/references/Anxietics - Identidade Visual 3.png`: imagem fornecida, usada no cabeçalho da loja.
- Arte existente de `ItemArt.tsx`/`MowerArt.tsx`: itens e jardim.
- `assets/illustrations/sprout.png`: asset novo gerado com ImageGen integrado, PNG RGBA, 1254×1254, 975.134 bytes, compartilhado entre estados vazios, loading e conclusão.
- MaterialCommunityIcons: uma única família de ícones; fonte incluída no bundle, sem dependência de CDN.

Prompt do novo asset: “One standalone square raster UI illustration for Anxietics, a small young plant with two large plump green leaves and one small emerging leaf in a squat rounded terracotta flowerpot with visible soil. Polished miniature 3D clay, matte natural materials, subtle tactile texture, soft upper-left illumination. Centered three-quarter view, whole object visible, balanced margins, genuinely transparent background, minimal contact shadow. No text, logos, faces, people, sparkles, extra plants, scenery or frames.”

## Validação e reprodução

`npm run check` executa TypeScript e os 63 testes de domínio existentes. Não há configuração de lint neste repositório; a formatação foi verificada com Prettier. Uma comparação estrutural de AST confirmou que 24 handlers/cálculos de jogo, trilha, compra, equipamento, jardim, login, cadastro e navegação não mudaram. Os diretórios de regras, autenticação, persistência e migrations permanecem sem diff.

Para validar sem contas reais, os scripts de navegador usam sessão fictícia somente no contexto isolado do Playwright e host local:

```sh
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 \
EXPO_PUBLIC_SUPABASE_ANON_KEY=anxietics-local-visual-preview \
npm run web:games -- --port 8081

npm run test:ui
NODE_OPTIONS='--require ./scripts/with-preview-auth.cjs' npm run test:preview
NODE_OPTIONS='--require ./scripts/with-preview-auth.cjs' npm run test:economy
NODE_OPTIONS='--require ./scripts/with-preview-auth.cjs' npm run test:3d-preview
npm run export:mobile
```

A fixture não é importada pelo aplicativo. Os scripts existentes receberam ajustes de seletores para rótulos redesenhados e para ler o valor do HUD oculto sob a conclusão. A varredura automatizada da grama ganhou gestos verticais complementares para cobrir a área restante após o ajuste responsivo do canvas; o teste continua exigindo 100%. Regras e asserções de negócio foram mantidas.

Resultados: TypeScript e **63 testes** aprovados; **46 capturas** de UI sem overflow horizontal ou exceções de runtime; os **14 minigames** concluídos pela suíte de interação; **13 cenas 3D** renderizadas e concluídas por gestos; fluxos de ciclo de vida, economia, catálogo, compra/equipamento, jardim e persistência aprovados. Bundles **Android e iOS** exportados com sucesso. Prettier verificado nos componentes alterados e `git diff --check` sem erros. Não existe script de lint no projeto.

A configuração continua em **retrato**. Também foi exercitado o redimensionamento web para 844×390. O tratamento de safe area foi preservado no navegador raiz e nas telas de autenticação e adicionado ao modal de confirmação. A redução da área disponível no navegador verifica rolagem de formulário, mas não substitui teclado nativo. **Não havia dispositivo Android conectado nem simulador iOS disponível**; validação visual em aparelho, teclado nativo e recortes físicos de tela permanecem pendentes.

Veja [design-qa.md](../design-qa.md) para resultado final, histórico de correções e limitações. Capturas selecionadas estão em `docs/ui-review/before` e `docs/ui-review/after`; a suíte visual salva a coleção completa no diretório temporário `anxietics-ui`. O índice das 46 capturas está em [resultado-ui.json](ui-review/resultado-ui.json).
