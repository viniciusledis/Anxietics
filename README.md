# Anxietics

MVP 0.3 do TCC **Anxietics: Gamificação no Cuidado da Ansiedade**, de Vinícius Peres Ledis dos Santos. React Native, Expo e TypeScript, com 14 minijogos, trilha progressiva, três atividades diárias, modo livre, economia virtual e jardim pessoal.

O aplicativo oferece momentos de jogo, pausa e distração. **Progresso no app não mede melhora da saúde mental.** Benefícios para ansiedade são hipóteses de pesquisa; esta implementação não realizou estudo com participantes nem demonstra eficácia clínica. O projeto acadêmico original está preservado na raiz.

## Abrir no celular

Use Node.js 22 LTS e npm:

```sh
npm ci
npm start
```

1. Instale um **Expo Go compatível com SDK 54**: [distribuições oficiais](https://expo.dev/go?sdkVersion=54&platform=android&device=true). Confira também a [compatibilidade do Expo Go](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/), pois a disponibilidade nas lojas muda.
2. Deixe computador e celular na mesma rede Wi-Fi.
3. Android: abra o Expo Go e escaneie o QR code. iPhone: use a Câmera e abra o link no Expo Go.
4. Abra a primeira etapa e arraste a máquina. Concluir libera a próxima; etapas concluídas podem ser repetidas.
5. Para verificar persistência, espere “Salvando no aparelho…” desaparecer, feche o app e abra novamente.

**As dependências utilizadas estão incluídas no Expo Go do SDK 54. Não exigem um development build.** Se não houver Expo Go compatível para seu dispositivo, será necessário usar uma compilação própria ou planejar uma atualização conjunta do SDK; não atualize módulos nativos isoladamente. Um binário iOS próprio depende das ferramentas e regras de assinatura da Apple. Suporte do SDK: Android 7+ e iOS 15.1+.

No desenvolvimento, o Expo Go carrega o código pelo Metro. O app não usa API de jogos, login, backend, anúncios ou serviços pagos, mas uma nova abertura pelo Expo Go pode precisar do servidor de desenvolvimento. A execução offline de um binário independente ainda precisa ser validada no aparelho. Problemas de conexão: confira a rede e o firewall; `npx expo start --tunnel` é uma alternativa de desenvolvimento que depende de internet.

## Jogos disponíveis

Todos têm instrução visível, pausa, saída e reinício com confirmação. Cada um possui três variações de paleta, padrão ou ilustração; **são variações do mesmo jogo**, não jogos adicionais.

| Jogo | Interação e conclusão guiada |
| --- | --- |
| Cortar grama | Máquina transforma a área única sob o gesto; conclui em 95%. |
| Janela embaçada | Pano remove vapor e revela uma paisagem; 95%. |
| Jardim de areia | Rastelo deixa cinco sulcos paralelos; quatro gestos amplos. |
| Lavar objetos | Jato limpa um vaso; somente a superfície do vaso conta; 95%. |
| Pintar com rolinho | Três cores; cobertura única da parede; 95%. Faixas já pintadas preservam sua cor. |
| Tapete de flores | Flores espaçadas; oito em cada uma de quatro regiões amplas. |
| Organizar pedrinhas | Quatro formas, encaixe com tolerância; soltura fora retorna sem punição. |
| Bolinhas por cor | Seis bolinhas; recipientes identificados por cor **e símbolo**. |
| Revelar ilustração | Pincel remove papel texturizado; revela casa, barco ou borboleta; 95%. |
| Regar um jardim | Segure o bico do regador sobre quatro vasos; cada um floresce após cerca de quatro segundos de água acumulada. |
| Alisar argila | Espátula remove os relevos de uma superfície 2D; 95%. |
| Pequenas luzes | Siga o círculo maior; pode levantar o dedo e continuar do próximo ponto. |
| Tinta na água | Manchas coloridas se expandem; três gestos com cada uma das três cores. |
| Cortar frutas | Seis frutas estáticas; o gesto divide cada fruta visualmente. |

Areia, flores e tinta têm **modo livre sem meta obrigatória**, com botão “Encerrar por aqui”. Os outros jogos mantêm sua conclusão natural no modo livre e podem ser repetidos. Não há tempo limite, derrota, vidas, ranking, sequência ou punição. Sessões de um a três minutos são intenção de design, não duração medida: alguns objetivos simples podem ser alcançados em menos de um minuto.

A trilha continua ganhando flores e desbloqueios. A economia acrescenta sementes e XP, descritos abaixo. Nada disso mede saúde mental.

## Economia, inventário e jardim

Valores em [`src/economy/config.ts`](src/economy/config.ts):

| Origem | Sementes | XP |
| --- | ---: | ---: |
| Presente inicial, uma vez por perfil | 50 | 0 |
| Nova etapa concluída | 20 | 30 |
| Atividade diária concluída | 15 | 20 |
| Bônus das três atividades, uma vez por data local | 15 | 0 |
| Primeiro passo: primeira etapa | 10 | 0 |
| Explorador: três tipos de jogo em partidas guiadas | 25 | 0 |
| Meu cantinho: primeira decoração colocada | 10 | 0 |
| Modo livre e laboratório | 0 | 0 |

**XP nunca é gasto.** Nível = `1 + Math.floor(xp / 100)`; a quantidade de XP por nível também fica na configuração. Comprar não reduz XP, nível, conquistas ou etapas liberadas. Não há bloqueios por nível nesta versão.

Uma partida pode pagar etapa **e** tarefa diária: a tarefa precisa corresponder ao mesmo jogo e variação, na mesma data da partida. Ela marca no máximo uma tarefa. Ao iniciar pela tela Hoje, qualquer variação do jogo pode concluir sua etapa disponível; ao repetir pela trilha, o modo livre não remunera. As tarefas do dia continuam fixas mesmo quando você abre etapas novas.

Por exemplo, em um perfil novo, a primeira etapa de grama também corresponde a uma das três tarefas iniciais. O resultado mostra **20 + 15 + 10 = 45 sementes** e **30 + 20 = 50 XP**, incluindo Primeiro passo. O saldo passa de 50 para 95. As duas tarefas restantes completam o trio e concedem o bônus. A composição só aparece como recebida depois de salva.

### Catálogo funcional

Preços e metadados ficam em [`src/economy/catalog.ts`](src/economy/catalog.ts). A loja mostra prévia original, descrição, destino, efeito, preço, saldo e estado. Abrir detalhes não compra; é necessário confirmar. Saldo insuficiente desabilita a confirmação e informa quanto falta, sem dinheiro real.

| ID estável | Item | Categoria | Preço | Uso/efeito |
| --- | --- | --- | ---: | --- |
| `mower-blue` | Cortador azul | Visuais | 30 | Aparência da grama, compatível com ambas as ferramentas |
| `mower-coral` | Cortador coral | Visuais | 40 | Aparência da grama, compatível com ambas as ferramentas |
| `mower-wide` | Cortador largo | Ferramentas | 150 | Faixa de corte 25% maior |
| `garden-pot` | Vaso de flores | Jardim | 60 | Decoração |
| `garden-stones` | Pedras decorativas | Jardim | 80 | Decoração |
| `garden-bench` | Banco | Jardim | 100 | Decoração |
| `garden-tree` | Árvore ornamental | Jardim | 150 | Decoração |
| `garden-fountain` | Fonte | Jardim | 250 | Decoração estática, sem som |

Todos são permanentes, comprados uma vez. Não há consumíveis, revenda, aluguel, caixas aleatórias, anúncios ou compras com dinheiro real. O inventário filtra categorias e mostra itens em uso. Restaurar a aparência padrão ou o cortador padrão é gratuito e independente; não remove os itens adquiridos.

O cortador largo passa o raio **31,25** ao mesmo motor de cobertura que usa **25** no padrão. Assim a faixa nominal passa de 50 para 62,5 unidades. O campo mantém 320 × 448 unidades; células já cortadas continuam contando uma vez. O desenho do cortador também se alarga. A malha de quatro unidades e o percentual inteiro são aproximações, portanto não espere exatamente 25% de diferença no número exibido para qualquer gesto. A ferramenta não muda a recompensa. O equipamento é capturado no início de cada rodada.

O jardim tem cinco posições predefinidas. Selecione uma posição e uma decoração do inventário. Todas as cinco decorações cabem nessas posições. Mover libera a posição anterior; substituir devolve a decoração anterior ao inventário; remover não destrói o item. Cada decoração ocupa no máximo uma posição. Meu cantinho é concedida somente na primeira colocação.

### Como adicionar itens

1. Adicione um `Item` ao catálogo com ID que não será renomeado, nome, descrição, categoria, preço, destino, prévia e efeito. `requiredLevel` está disponível para requisitos futuros; nenhum item atual o utiliza.
2. Desenhe a prévia em `ItemArt.tsx` e implemente o efeito real no jogo/destino **antes** de disponibilizar a compra. MowerArt é compartilhado entre prévia e jogo.
3. Para novos jogos ou tipos de equipamento, amplie os destinos/slots e a validação em `rules.ts` e `decode.ts`. Não aceite equipar itens de outro destino.
4. Novas posições de jardim ou mudanças de estrutura exigem migração do esquema. Preserve IDs e itens adquiridos; nunca limpe propriedade silenciosamente.
5. Acrescente testes de compra, equipamento, persistência e efeito real. Confira a prévia e o uso em Android/iOS.

### Migração e pagamentos únicos

Etapas e tarefas já concluídas em v1/v2 entram no registro de eventos como **já processadas**. Marcos já alcançados, como Primeiro passo, ficam conquistados sem pagamento retroativo. Só são inferidos tipos de jogo conhecidos pelas etapas antigas; partidas livres antigas não tinham histórico para recuperar.

Na primeira ativação, o perfil recebe 50 sementes e começa com zero XP. A migração e o presente são salvos juntos, antes de abrir a interface; reabrir não concede outro presente. Os leitores v1/v2 foram mantidos para preservar a trilha e as antigas Clareira/Bosque.

Eventos usam IDs como `stage:jardim`, `daily:2026-09-14:0`, `daily-bonus:2026-09-14`, `achievement:first-step` e `gift:initial`. Esse registro não é descartado ao virar o dia. Os últimos 64 comprovantes de partidas são guardados para exibir/reconhecer resultados; a proteção dos pagamentos permanece no registro de eventos. Ele cresce lentamente com os dias usados. Alterar o relógio pode mudar as tarefas, mas não repaga IDs já processados.

### Experimentar o ciclo completo

1. Inicie `npm start`, abra no Expo Go compatível e conclua a primeira etapa de grama. Confira o resultado composto e as 95 sementes do perfil novo.
2. Visite a loja pelo resultado, compre Cortador azul (30) e equipe. Repita a grama no modo livre para ver a cor; não haverá novas sementes.
3. Com as 65 sementes restantes, compre Vaso de flores (60), escolha “Usar no jardim” e coloque-o. Meu cantinho concede 10 sementes. Mova, remova e coloque novamente para conferir que o bônus não se repete.
4. Continue etapas e atividades diárias para juntar 150 sementes. Compre o cortador largo e equipe junto da cor azul. Compare a faixa no mesmo campo, sem mudar as recompensas.
5. Aguarde a confirmação de salvamento, feche e reabra. Confira saldo, XP, compras, equipamentos e posição da decoração.

Perfis migrados recebem o presente inicial, mas não recebem os 45 do exemplo por uma etapa já concluída. Nesse caso, use a próxima etapa disponível ou as atividades diárias ainda não realizadas.

## Trilha, dia e armazenamento

São três registros separados:

- **Trilha:** 14 etapas, uma para cada jogo. Concluir uma etapa disponível libera a seguinte. Repetir uma concluída abre o modo livre.
- **Hoje:** três tarefas escolhidas entre os jogos liberados no início daquele dia. Com poucas opções, usam variações diferentes. Uma partida guiada marca a tarefa correspondente ao mesmo jogo e variação, quando houver. Qualquer variação guiada também pode concluir a etapa disponível daquele jogo.
- **Livre:** permite repetir jogos liberados; não concede sementes ou XP, não avança conquistas remuneradas e não marca tarefas. Completar o trio diário não bloqueia o acesso.

As três escolhas são salvas e ficam fixas durante a **data local do aparelho (`AAAA-MM-DD`)**, mesmo se outra etapa for desbloqueada. O dia é verificado ao carregar, ao voltar ao primeiro plano, ao concluir e a cada 30 segundos com o app aberto. Uma nova data substitui apenas o trio diário; conquistas e preferências permanecem. Não há compensação obrigatória por dias ausentes.

Uma tarefa iniciada ontem pode ser terminada, mas **não completa uma tarefa do novo dia**. Uma etapa ainda disponível pode ser reconhecida nessa conclusão. Uma nova tentativa de salvar usa a data atual, preservando o trio atual em vez de restaurar o de ontem. Alterar manualmente relógio/fuso pode renovar o trio; não há proteção antifraude neste protótipo. Não existe histórico/calendário de dias anteriores.

AsyncStorage grava JSON com esquema **versão 3**, mantendo a chave histórica `@anxietics/progress/v1` para migrar instalações anteriores. A migração preserva o Jardim concluído, as conquistas antigas Clareira/Bosque, o registro diário compatível e a preferência. As conquistas antigas não pulam os novos jogos. Versões desconhecidas ou dados inválidos mostram erro sem substituição automática.

Uma fila central calcula cada alteração sobre o estado confirmado mais recente, grava o JSON completo e só então publica o resultado. Saldo e aquisição são uma única alteração. Se houver erro, o último estado confirmado é preservado; compras e recompensas não aparecem como recebidas. Tente novamente antes de sair. Fechar o processo antes de gravar pode perder a última ação. “Ajustes → Apagar dados deste aparelho” pede confirmação e apaga também XP, saldo, compras, equipamentos e jardim, iniciando um novo perfil com o presente inicial.

O desenho, posições e percentual **parciais da rodada não são persistidos**. Sair ou reiniciar descarta apenas essa rodada. Segundo plano pausa o jogo e preserva a rodada se o sistema mantiver o processo vivo; voltar exige “Continuar”. Não há sincronização entre aparelhos. AsyncStorage não é criptografado; não são coletados dados pessoais, clínicos ou emocionais. Backup/desinstalação seguem a política do aparelho.

## Entendendo a arquitetura

```text
App.tsx                       Provedores de gestos e áreas seguras
src/navigation/               Escolha da tela e criação de partidas
src/screens/                  Trilha, jogo, ajustes, laboratório, teste 3D, loja, inventário, conquistas e jardim
src/three/                    Prova de conceito 3D isolada com React Three Fiber
src/trail/stages.ts            Ordem e estado das 14 etapas
src/minigames/types.ts         Contratos simples: jogo, modo e partida
src/minigames/definitions.ts   Nomes, instruções e variações
src/minigames/catalog.ts       Catálogo com componentes dos jogos
src/minigames/shared/          Campo, gesto, máscara e conclusão comuns
src/minigames/grass/           Grama e cálculo reutilizável de cobertura
src/minigames/surface/         Janela, lavagem, pintura, revelação e argila
src/minigames/*/rules.ts       Regras puras de cada interação
src/domain/progress.ts         Conclusão, recompensas, tarefas e migração
src/economy/                  Valores, catálogo, regras, validação e arte dos itens
src/domain/legacy.ts           Leitor preservado dos esquemas v1/v2
src/storage/transactions.ts    Fila: calcular → gravar → publicar
src/storage/                  Leitura e gravação do JSON local
src/ui/                       Botões, confirmações e movimento reduzido
tests/                        Testes de regras e armazenamento
scripts/verify-preview.cjs     Roteiro de gestos reais no navegador
docs/                         Decisões e evidências de validação
```

Para estudar a economia, leia `economy/config.ts`, `catalog.ts`, `rules.ts` e depois `storage/transactions.ts`: uma regra recebe o estado e retorna uma proposta de alteração; a fila salva e publica essa proposta. Componentes não descontam sementes diretamente.

Comece por `types.ts`, `definitions.ts` e `stages.ts`; depois leia `grass/coverage.ts` e um `rules.ts`. A tela `GameScreen` controla a rodada; os jogos só informam percentual e conclusão. `completeSession` decide o efeito da conclusão no progresso persistente. Navegação por estado foi preservada: poucas telas não justificaram trocar a arquitetura.

**Por que Skia?** A versão 2D original da grama e os demais jogos usam Skia para desenhar muitos elementos sem criar milhares de Views. Gesture Handler recebe o gesto e Reanimated compartilha dados com a camada visual; no Android/iOS, funções marcadas com `'worklet'` podem rodar na thread de interface. O novo vertical slice da grama usa Three.js/Expo GL somente dentro da área jogável e mantém as regras e o HUD compartilhados. Nenhuma das duas abordagens comprova fluidez sem medir no celular.

O campo tem 320 × 448 unidades lógicas e escala uniforme. A cobertura usa 80 × 112 células: cada célula conta uma vez. A distância ao **segmento inteiro** entre eventos cobre gestos rápidos; a máscara desenha as mesmas células contabilizadas. O vaso filtra as células elegíveis. Aos 95%, a máscara termina os resíduos; 100% é o acabamento automático, não uma exigência de precisão.

Desenhar areia, encaixar, regar e cortar têm regras próprias. Caminhos/partículas são limitados: 12 blocos de 100 segmentos na areia, 352 flores, 24 manchas de tinta, seis frutas. Não se armazena um histórico infinito de movimentos. React recebe mudanças de percentual inteiro e conclusão, não cada posição do dedo. A rodada protege a conclusão e ignora callbacks atrasados de tentativas anteriores; as regras também impedem recompensa duplicada.

## Laboratório de desenvolvimento

Para abrir qualquer jogo sem percorrer a trilha:

```sh
npm run dev:games
# Ou, para a prévia auxiliar no navegador:
npm run web:games
```

Abra **Laboratório de desenvolvimento** no fim da tela da trilha. Há botões para as três variações de cada jogo e para os três modos livres abertos. Essas partidas não modificam conquistas ou tarefas.

O botão **Abrir teste 3D isolado** mantém a prova de conceito inicial com `three`, `@react-three/fiber/native` e `expo-gl`. O jogo **Cortar grama** agora usa o vertical slice 3D na trilha, Hoje e modo livre. No Laboratório, é possível abrir cada variação em **3D** ou **2D original** para comparar. Todos os outros jogos permanecem como estavam. Consulte [GRAMA_3D.md](docs/GRAMA_3D.md) para arquivos, decisões de performance e validação pendente em aparelhos físicos.

O atalho só aparece quando `__DEV__` é verdadeiro **e** `EXPO_PUBLIC_DEV_TOOLS=1`. `npm start` normal não o habilita. Uma exportação de produção não o mostra mesmo com a variável. O script inicializador define a variável sem depender da sintaxe de ambiente do sistema operacional.

## Como adicionar um jogo

1. Acrescente o identificador em `GAME_IDS` e os metadados em `GAME_INFO`.
2. Crie um componente que receba `GameProps`; use as regras puras em um `rules.ts` quando possível.
3. Registre o componente em `GAME_COMPONENTS`. O TypeScript aponta registros faltantes. A trilha inicial acompanha a ordem de `GAME_IDS`.
4. Respeite `enabled`, `reducedMotion`, `mode` e `scale`. Desative callbacks de quadro e cancele animações ao desmontar. Reinício remonta o componente.
5. Envie `onProgress` e `onComplete`, sem gravar recompensas diretamente. Para regras novas de tarefa/persistência, altere o domínio e planeje a migração.
6. Teste conclusão alcançável, reinício, pausa, limites de memória e integração. Adicione a interação ao roteiro de prévia e valide em Android/iOS.

## Verificar

```sh
npm run check
npm run doctor
npx expo install --check
npm run export:mobile
```

`check` executa TypeScript e testes das regras. O repositório de testes usa armazenamento simulado; isso não prova persistência nativa. `export:mobile` gera bundles JavaScript/Hermes para Android e iOS, **não APK/IPA**, e não mede desempenho.

Prévia auxiliar:

```sh
npm run web:games
# Em outro terminal, com Chrome instalado e servidor em localhost:8081:
npm run test:preview
npm run test:economy
```

O preparo web copia o CanvasKit instalado para `public/`, sem CDN. O teste usa Chrome headless em perfil temporário. Capturas e `resultado.json` ficam na pasta `anxietics-preview` do diretório temporário do sistema; o caminho exato é impresso no fim. O roteiro usa mouse: não equivale a toque nativo. `test:economy` executa o ciclo completo sem injetar saldo, testa falhas simuladas de gravação e salva capturas em `anxietics-economy` no diretório temporário. Depois executa uma inspeção de todos os itens com saldo de fixture de 1.000 sementes, identificada separadamente em `anxietics-catalog`. Esse segundo roteiro não representa a progressão normal. Os testes de regras também cobrem todas as cinco decorações. `npm run web` abre a experiência normal sem laboratório.

Consulte [VALIDACAO.md](docs/VALIDACAO.md) para os resultados anteriores e [GRAMA_3D.md](docs/GRAMA_3D.md) para a validação do vertical slice 3D. [DECISOES.md](docs/DECISOES.md) registra fontes oficiais, limites, migração e os alertas transitivos de dependências ainda pendentes. Sons e vibração não foram adicionados.

## O que observar no celular

Observe resposta ao toque, continuidade de gestos rápidos, clareza e satisfação da transformação, facilidade de completar e vontade de repetir. Nos encaixes, solte um pouco fora; na rega, confira se entende onde posicionar o bico; na tinta, experimente as três cores. Teste pausa, segundo plano, reinício, fechamento após salvar e reabertura. Registre modelo, sistema e passos de eventuais atrasos.

Essas observações orientam melhorias de interação e usabilidade. Não demonstram benefício clínico nem substituem acompanhamento profissional.
