# Auditoria e direção visual — 23/09/2026

Escopo: somente renderização dos 13 jogos, sem mudanças nos módulos de regras, economia, HUD, navegação ou versões 2D. O Lawn não é redesenhado.

## Evidência inicial

Capturas Chrome 390 × 844 desta rodada: `/var/folders/2d/90qzr8f17rb991tswrzbckx80000gn/T/anxietics-3d-15gge5/`. Benchmark: `/tmp/anxietics-lawn-benchmark.png`. Todas as 13 capturas foram abertas e inspecionadas, além do Lawn.

Cópias persistentes: [antes](visual-3d/before/), [depois](visual-3d/after/), [estados](visual-3d/states/) e [benchmark](visual-3d/lawn-benchmark.png). Relatório completo, jogo por jogo, com imagens lado a lado: [POLISH_3D.md](POLISH_3D.md).

O Lawn funciona como objeto ilustrado: borda espessa visível, composição diagonal, sombras de contato, vegetação que enquadra sem cobrir o percurso, tamanhos variados, textura geométrica do gramado e ferramenta com silhueta própria. Os outros jogos apresentam tabuleiros grandes e recortados, quase sem contexto, contraste fraco e materiais uniformes. Compilar não resolve essas diferenças.

| Ordem / jogo | Problema observado | Direção da revisão |
|---|---|---|
| 1 Frutas | Seis esferas sobre pratos; ausência de cozinha | Bancada com tábua, azulejos, prateleira, louças e frutas táteis |
| 2 Luzes | Discos achatados sobre verde escuro; não parecem lanternas | Pátio de lanternas com armações, luz âmbar e vegetação noturna |
| 3 Pedras | Alvos circulares iguais; pedra retangular com emenda | Mesa de coleção natural, encaixes com silhuetas distintas, objetos de estudo |
| 4 Bolinhas | Símbolos escondidos; recipientes rasos | Mesa de brinquedos com recipientes cerâmicos e marcas legíveis |
| 5 Areia | Retângulo vazio, ancinho minúsculo | Jardim zen em caixa, pedras, bambu, ondas decorativas e jardim lateral |
| 6 Flores | Quatro círculos lisos, sem jardim | Canteiros delimitados por pedras, viveiro e flores com pétalas reais |
| 7 Tinta | Superfície uniforme, sem água reconhecível | Atelier de marmorização, cuba esmaltada, frascos de pigmento e reflexos |
| 8 Água | Vasos genéricos, regador sem contexto | Estufa de vasos, ripas, prateleira, folhas e gotas animadas |
| 9 Janela | Moldura plana; paisagem parece desenho sobre mesa | Janela-diorama com cortinas, peitoril e paisagem em planos |
| 10 Revelação | Papel vazio; desenho oculto pouco elaborado | Mesa de ilustração, moldura trabalhada e composição revelada |
| 11 Lavagem | Sujeira é silhueta pixelada plana | Bancada de cerâmica, cuba, espuma e brilho do esmalte |
| 12 Argila | Retângulo de pixels; sem matéria orgânica | Atelier de cerâmica, slab orgânico e marcas volumétricas |
| 13 Pintura | Tela vazia com rolo pequeno | Mesa de pintura com potes, pincéis, paleta e acabamento molhado |

Limites: screenshots web não comprovam qualidade do Expo GL em aparelho, FPS, temperatura ou conforto dos gestos nativos. Cor não deve ser a única pista dos recipientes; símbolos precisam permanecer visíveis. Animações decorativas devem respeitar redução de movimento. Elementos decorativos não podem ocultar os alvos nem reduzir sua área lógica.
