import { GameId } from './types';

// Metadados puros: regras e testes não precisam carregar React Native.
export const GAME_INFO: Record<
  GameId,
  {
    name: string;
    instruction: string;
    freeInstruction?: string;
    accent: string;
    symbol: string;
    openEnded?: boolean;
    colors?: readonly string[];
    variations: readonly string[];
  }
> = {
  grass: {
    name: 'Cortar grama',
    instruction: 'Arraste a máquina e corte quase todo o campo.',
    accent: '#547547',
    symbol: '♧',
    variations: ['Jardim', 'Dourado', 'Bosque'],
  },
  window: {
    name: 'Janela embaçada',
    instruction: 'Passe o pano para descobrir a paisagem.',
    accent: '#547E8C',
    symbol: '□',
    variations: ['Amanhecer', 'Lago', 'Entardecer'],
  },
  sand: {
    name: 'Jardim de areia',
    instruction: 'Trace quatro caminhos amplos com o rastelo.',
    freeInstruction: 'Desenhe sulcos. Encerre quando quiser.',
    accent: '#9A784E',
    symbol: '≋',
    openEnded: true,
    variations: ['Areia clara', 'Areia rosada', 'Areia dourada'],
  },
  wash: {
    name: 'Lavar objetos',
    instruction: 'Leve o jato sobre a sujeira do vaso.',
    accent: '#4C8490',
    symbol: '◇',
    variations: ['Vaso azul', 'Vaso verde', 'Vaso terracota'],
  },
  paint: {
    name: 'Pintar com rolinho',
    instruction: 'Escolha uma cor e pinte quase toda a parede.',
    accent: '#9B6570',
    symbol: '▤',
    colors: ['#B88D99', '#90A78F', '#B8A3CC'],
    variations: ['Parede clara', 'Painel creme', 'Painel azul'],
  },
  flowers: {
    name: 'Tapete de flores',
    instruction: 'Plante flores nas quatro regiões pontilhadas.',
    freeInstruction: 'Desenhe com flores. Encerre quando quiser.',
    accent: '#A46180',
    symbol: '✿',
    openEnded: true,
    variations: ['Rosas', 'Margaridas', 'Lavandas'],
  },
  stones: {
    name: 'Organizar pedrinhas',
    instruction: 'Arraste cada pedra para o contorno parecido.',
    accent: '#707888',
    symbol: '⬡',
    variations: ['Rio', 'Terra', 'Serra'],
  },
  balls: {
    name: 'Bolinhas por cor',
    instruction: 'Combine a cor e o símbolo de cada recipiente.',
    accent: '#9B7F42',
    symbol: '●',
    variations: ['Jardim', 'Lago', 'Pôr do sol'],
  },
  reveal: {
    name: 'Revelar ilustração',
    instruction: 'Varra o papel com o pincel e descubra o desenho.',
    accent: '#8C7153',
    symbol: '✧',
    variations: ['Casa', 'Barquinho', 'Borboleta'],
  },
  water: {
    name: 'Regar um jardim',
    instruction: 'Arraste o regador. Mantenha o bico sobre cada vaso.',
    accent: '#54816A',
    symbol: '❀',
    variations: ['Rosas', 'Flores douradas', 'Lavandas'],
  },
  clay: {
    name: 'Alisar argila',
    instruction: 'Passe a espátula e suavize os relevos.',
    accent: '#A37258',
    symbol: '≈',
    variations: ['Terracota', 'Argila clara', 'Argila rosada'],
  },
  lights: {
    name: 'Pequenas luzes',
    instruction: 'Siga os pontos a partir do círculo maior.',
    accent: '#617495',
    symbol: '✦',
    variations: ['Folha', 'Montanha', 'Barco'],
  },
  ink: {
    name: 'Tinta na água',
    instruction: 'Faça três gestos com cada uma das três cores.',
    freeInstruction: 'Toque, arraste e misture as cores sem uma meta.',
    accent: '#7279A2',
    symbol: '◉',
    openEnded: true,
    colors: ['#C78194', '#7299BC', '#BDA361'],
    variations: ['Água clara', 'Lago azul', 'Pérola'],
  },
  fruit: {
    name: 'Cortar frutas',
    instruction: 'Passe o dedo pelas seis frutas, no seu ritmo.',
    accent: '#AF7950',
    symbol: '◒',
    variations: ['Cítricas', 'Kiwi', 'Melancia'],
  },
};
