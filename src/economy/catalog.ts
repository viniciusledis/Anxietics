export type Category = 'visual' | 'tool' | 'garden';
export type Item = {
  id: string;
  name: string;
  description: string;
  category: Category;
  price: number;
  target: 'grass' | 'garden';
  effect: string;
  preview: string;
  color?: string;
  widthMultiplier?: number;
  requiredLevel?: number;
};
export const CATEGORIES: { id: Category; name: string }[] = [
  { id: 'visual', name: 'Visuais' },
  { id: 'tool', name: 'Ferramentas' },
  { id: 'garden', name: 'Jardim' },
];
// preview identifica arte vetorial própria, desenhada em ItemArt; nada é baixado.
export const ITEMS: readonly Item[] = [
  {
    id: 'mower-blue',
    name: 'Cortador azul',
    description: 'Uma aparência em azul sereno.',
    category: 'visual',
    price: 30,
    target: 'grass',
    effect: 'Muda apenas a cor. Combina com os dois cortadores.',
    preview: 'mower',
    color: '#749FB7',
  },
  {
    id: 'mower-coral',
    name: 'Cortador coral',
    description: 'Uma aparência em coral suave.',
    category: 'visual',
    price: 40,
    target: 'grass',
    effect: 'Muda apenas a cor. Combina com os dois cortadores.',
    preview: 'mower',
    color: '#CB8F83',
  },
  {
    id: 'mower-wide',
    name: 'Cortador largo',
    description: 'Um pouco mais de espaço a cada passada.',
    category: 'tool',
    price: 150,
    target: 'grass',
    effect: 'Faixa de corte 25% maior. Não aumenta recompensas.',
    preview: 'mower',
    widthMultiplier: 1.25,
  },
  {
    id: 'garden-pot',
    name: 'Vaso de flores',
    description: 'Flores delicadas em um vaso de barro.',
    category: 'garden',
    price: 60,
    target: 'garden',
    effect: 'Decoração permanente para uma posição do jardim.',
    preview: 'pot',
  },
  {
    id: 'garden-stones',
    name: 'Pedras decorativas',
    description: 'Um pequeno conjunto de pedras arredondadas.',
    category: 'garden',
    price: 80,
    target: 'garden',
    effect: 'Decoração permanente para uma posição do jardim.',
    preview: 'stones',
  },
  {
    id: 'garden-bench',
    name: 'Banco',
    description: 'Um banco de madeira entre os caminhos.',
    category: 'garden',
    price: 100,
    target: 'garden',
    effect: 'Decoração permanente para uma posição do jardim.',
    preview: 'bench',
  },
  {
    id: 'garden-tree',
    name: 'Árvore ornamental',
    description: 'Uma copa redonda em tons de verde.',
    category: 'garden',
    price: 150,
    target: 'garden',
    effect: 'Decoração permanente para uma posição do jardim.',
    preview: 'tree',
  },
  {
    id: 'garden-fountain',
    name: 'Fonte',
    description: 'Uma pequena fonte de água azul.',
    category: 'garden',
    price: 250,
    target: 'garden',
    effect: 'Decoração estática, sem som, para uma posição do jardim.',
    preview: 'fountain',
  },
];
export const findItem = (id: string) => ITEMS.find((item) => item.id === id);
export const GARDEN_SLOTS = [
  { id: 'back-left', name: 'Fundo esquerdo', x: 80, y: 85 },
  { id: 'back-right', name: 'Fundo direito', x: 240, y: 85 },
  { id: 'front-left', name: 'Lado esquerdo', x: 65, y: 190 },
  { id: 'front-right', name: 'Lado direito', x: 255, y: 190 },
  { id: 'entrance', name: 'Entrada', x: 160, y: 290 },
] as const;
export type SlotId = (typeof GARDEN_SLOTS)[number]['id'];
