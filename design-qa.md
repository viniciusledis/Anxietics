# Anxietics — revisão visual final

**final result: passed**

Resultado referente à interface renderizada no navegador e ao escopo exclusivamente visual solicitado. A validação em aparelhos nativos permanece uma lacuna explícita, descrita abaixo.

## Referências e condições da comparação

**Fontes visuais:**

- `/Users/vinicius/Downloads/Homescreen.png` — 5145×1077 px.
- `/Users/vinicius/Downloads/Shop.png` — 2523×1804 px.
- `/Users/vinicius/Downloads/Lessons.png` — 5145×1298 px.
- Demais pranchas fornecidas: Profile, Streak e Onboarding 1.
- `docs/visual-3d/references/Anxietics - Identidade Visual 1.png` e `3.png` — 1672×941 px cada. Os quatro conceitos do projeto foram considerados na análise inicial.

**Implementação:** Expo/React Native Web em `http://localhost:8081`, Chrome 154, tema claro, sessão e dados fictícios somente no contexto de teste. Nenhuma conta real foi usada. A configuração local de autenticação da prévia usa o host de fixture, conforme os comandos em `docs/UI_REDESIGN.md`.

As referências são pranchas com várias telas e conceitos de direção de arte, não mockups finais do Anxietics. A pedido do usuário, a comparação avalia hierarquia, densidade, clareza, identidade e qualidade; não exige igualdade pixel a pixel ou reprodução da tipografia/marca Duolingo.

Capturas da implementação sem moldura ou chrome do navegador: **320×568**, **390×844** e **768×1024** CSS px, `deviceScaleFactor: 1`; dimensões de imagem iguais às do viewport. Formulário também capturado em 320×360 para conferir a área reduzida. A suíte funcional exercitou 844×390. Não foi aplicada normalização de densidade entre uma prancha e uma tela: seus enquadramentos são distintos por definição.

## Evidências comparadas

As fontes e as capturas finais foram abertas juntas nas mesmas entradas de comparação visual:

1. Homescreen + conceito Anxietics 1 + Home em 390 e 320 px.
2. Shop + conceito Anxietics 3 + loja, login, pausa e conclusão.
3. Lessons + confirmação destrutiva, ajustes, conquistas e jardim decorado.

Evidências selecionadas, relativas à raiz do projeto:

| Estado | Captura |
| --- | --- |
| Home anterior | `docs/ui-review/before/home.png` |
| Home atual / atividade disponível e bloqueada | `docs/ui-review/after/390-home.png` |
| Home compacta | `docs/ui-review/after/320-home.png` |
| Loja anterior e atual | `docs/ui-review/before/loja.png`, `docs/ui-review/after/390-loja.png` |
| Login anterior e atual | `docs/ui-review/before/login.png`, `docs/ui-review/after/390-login.png` |
| Inventário vazio | `docs/ui-review/after/390-inventario.png` |
| Conquistas | `docs/ui-review/after/390-conquistas.png` |
| Ajustes / conta | `docs/ui-review/after/390-ajustes.png` |
| Jardim vazio e decorado | `docs/ui-review/after/390-jardim.png`, `docs/ui-review/after/320-jardim-decorado.png` |
| Pausa em tela pequena | `docs/ui-review/after/320-pausa.png` |
| Confirmação destrutiva | `docs/ui-review/after/320-confirmacao.png` |
| Erros no cadastro | `docs/ui-review/after/320-cadastro-erros.png` |
| Loading de autenticação | `docs/ui-review/after/390-login-loading.png` |
| Conclusão e recibo real de recompensas do teste | `docs/ui-review/after/390-recompensas.png` |

A inspeção focada cobriu a primeira atividade e a barra inferior da Home, linhas de produto/preço, campos e botão do login, ações dos modais e recibo de conclusão. Não foram necessários recortes adicionais: nas capturas de uma única tela a 1:1 esses elementos e seus textos estão legíveis. A prancha Duolingo foi usada para organização e prioridade, não como alvo de medidas ou fontes exatas.

## Achados e histórico de correções

| Prioridade | Achado na primeira implementação | Correção | Evidência após a correção |
| --- | --- | --- | --- |
| P2 | Em 320×568, a primeira atividade ficava abaixo da dobra. Isso contrariava a entrada direta na atividade vista na referência. | Variante compacta por altura, reduzindo arte, título e intervalos superiores. | `320-home.png`: atividade disponível e navegação visíveis juntas. |
| P1 | O painel de pausa ocupava o campo de jogo e colidia com os controles no viewport pequeno. | Sobreposição cobrindo a área da tela, superfície central rolável e as mesmas ações. | `320-pausa.png`: continuar, sair e recomeçar legíveis e separados. |
| P2 | A ilustração do cabeçalho da loja não aparecia por falta de dimensões explícitas. | Largura e altura definidas na imagem posicionada; conceito original preservado. | `390-loja.png`: estante visível e texto no espaço livre da composição. |
| P2 | Glifos dos ícones entravam no nome acessível dos botões. O conteúdo sob a conclusão também produzia controles duplicados na árvore web. | Labels explícitos, ícones decorativos ocultos e conteúdo encoberto marcado com `aria-hidden` e equivalentes nativos. | Suítes de UI e interação operam os botões pelos nomes; conclusão, retorno e pausa aprovados. |

As primeiras capturas após a implementação foram consideradas bloqueadas até essas correções. A rodada final recapturou os mesmos viewports e estados. **Não restaram achados visuais P0/P1/P2 acionáveis nas telas verificadas.**

## Superfícies obrigatórias

| Área | Resultado da inspeção |
| --- | --- |
| Tipografia | Fonte de sistema consistente, escala centralizada, títulos fortes e texto auxiliar legível. A família difere deliberadamente da referência Duolingo. Títulos e labels foram conferidos em 320 px, incluindo mensagens de erro. |
| Espaçamento e layout | Alinhamentos, margens e raios coerentes; navegação separada do conteúdo; loja organizada em linhas; conteúdo limitado em largura no tablet. Home compacta e pausa corrigidas. Sem overflow horizontal nos 46 estados capturados. |
| Cores e tokens | Creme/verde como base, dourado para sementes/recompensas, azul para cuidado diário e vermelho para erro/ação destrutiva. Contrastes principais entre 4,94:1 e 11,25:1. Estados também usam texto, ícones, posição e bordas. |
| Qualidade das imagens | Conceitos originais usados em login/loja; nova muda com transparência inspecionada em tamanho de UI. Arte de itens e jardim preservada. Sem emojis, imagens externas aleatórias ou substituição das cenas por placeholders. |
| Conteúdo | Nomes dos jogos, preços, saldos, recibos e descrições funcionais continuam vinculados aos dados existentes. Linguagem de pausa e cuidado sem pressão por sequência. Não há rotas ou recompensas fictícias. |

## Validações executadas

- `npm run check`: TypeScript e **63/63 testes** aprovados.
- Prettier: componentes alterados e novos scripts verificados; `git diff --check` sem erros. O repositório não possui configuração de lint.
- `npm run test:ui`: **46 capturas**, três larguras, estados disponível/bloqueado, Hoje/Livre, loja/detalhe, saldo insuficiente, inventário vazio, jardim, conquistas, ajustes, modal, jogo, pausa, reinício, campos longos, erros de formulário, loading e falha simulada de login. Sem exceções de runtime nem overflow horizontal.
- `npm run test:preview` com fixture local: **14 minigames**, progresso parcial, conclusão, pausa, reinício, modo livre, desbloqueio, tarefas diárias, repetição, persistência e reset. O teste complementar de ciclo de vida cobre retorno, segundo plano simulado, movimento reduzido e migração de dados existente.
- `npm run test:3d-preview` com fixture local: **13 cenas** renderizadas e concluídas por gestos; três modos livres verificados. Sem erros de runtime registrados pelas suítes.
- `npm run test:economy` com fixture local: recompensas, falha/retry de salvamento, compra, equipamento, catálogo, saldo insuficiente, decorações e persistência do jardim aprovados.
- `npm run export:mobile`: bundles **Android e iOS** gerados com os assets e a fonte de ícones.
- Comparação estrutural de 24 handlers/cálculos: sem alteração nos cálculos e ações de jogo, trilha, compras, jardim, login, cadastro e navegação. Sem diff nos módulos de regras, APIs, autenticação, dados e minigames.

O console foi conferido. Permanecem avisos de desenvolvimento/depreciação do React Native Web e Skia, além do fallback de animação no navegador; as suítes não registraram exceções de runtime. A prévia com configuração fictícia foi encerrada ao terminar os testes.

As verificações de browser usam as mesmas asserções de negócio. Seletores foram adaptados à apresentação; a varredura do teste de grama recebeu gestos adicionais para alcançar a área restante no canvas responsivo. Nenhum limiar de sucesso foi relaxado.

## Limites e diferenças aceitas

- **Android/iOS em aparelho:** não havia Android conectado e o simulador iOS não estava disponível. Exportação comprova o empacotamento, não a renderização nativa. Safe areas físicas, teclado e VoiceOver/TalkBack precisam de conferência em dispositivo.
- SafeAreaProvider/SafeAreaView e tratamento de teclado existentes foram preservados; o modal recebeu safe area. A simulação de espaço reduzido no navegador não equivale a teclado nativo.
- Orientação nativa continua em retrato. A redução/expansão e paisagem foram verificadas no navegador, sem ampliar a orientação suportada pelo projeto.
- Autenticação visual usa respostas fictícias isoladas. Cadastro real, entrega de e-mail e login contra Supabase não fazem parte desta validação de UI.
- Não foram criados onboarding, streak, perfil separado ou estado de conclusão perfeita, pois não existem regras/rotas correspondentes. A conta atual aparece em Ajustes.
- A arte dos minigames e as proporções do jardim foram mantidas. A prioridade foi a interface ao redor das atividades, como solicitado.

## Checklist de entrega

- [x] Analisar estrutura e telas antes das edições.
- [x] Evoluir os componentes existentes e centralizar tokens visuais.
- [x] Conferir referências e capturas reais juntas.
- [x] Corrigir regressões de layout identificadas.
- [x] Validar interações e preservar regras de negócio.
- [x] Registrar screenshots, comandos, assets e arquivos alterados.
- [ ] Conferir em aparelhos Android/iOS quando disponíveis.

Relatório completo de implementação: [docs/UI_REDESIGN.md](docs/UI_REDESIGN.md).
