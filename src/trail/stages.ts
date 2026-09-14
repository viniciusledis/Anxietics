export type GrassPalette = {
  tall: string;
  blade: string;
  highlight: string;
  cut: string;
  stripe: string;
};

export type Stage = {
  id: string;
  title: string;
  subtitle: string;
  game: 'grass';
  variation: 'meadow' | 'bands' | 'patchwork';
  palette: GrassPalette;
};

// Conteúdo da trilha, independente do motor do minijogo.
export const STAGES: readonly Stage[] = [
  {
    id: 'jardim', title: 'Jardim de início', subtitle: 'Um caminho para descobrir.',
    game: 'grass', variation: 'meadow',
    palette: { tall: '#497349', blade: '#325638', highlight: '#74955B', cut: '#BBD18A', stripe: '#ADC57B' },
  },
  {
    id: 'clareira', title: 'Clareira dourada', subtitle: 'Outras cores, o mesmo gesto.',
    game: 'grass', variation: 'bands',
    palette: { tall: '#7A7E42', blade: '#555F35', highlight: '#A3A45F', cut: '#DFD39A', stripe: '#CFC48A' },
  },
  {
    id: 'bosque', title: 'Cantinho do bosque', subtitle: 'Um novo desenho no campo.',
    game: 'grass', variation: 'patchwork',
    palette: { tall: '#436D60', blade: '#2D5148', highlight: '#709783', cut: '#B4D3B4', stripe: '#A0C2A5' },
  },
];

export type StageStatus = 'locked' | 'available' | 'completed';

export function getStageStatus(id: string, completed: readonly string[]): StageStatus {
  const index = STAGES.findIndex(stage => stage.id === id);
  if (index < 0) return 'locked';
  if (completed.includes(id)) return 'completed';
  const previous = STAGES[index - 1];
  return index === 0 || (previous && completed.includes(previous.id)) ? 'available' : 'locked';
}
