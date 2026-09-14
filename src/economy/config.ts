// Ajuste a economia aqui. XP é permanente; apenas sementes são gastas.
export const ECONOMY = {
  initialGift: 50,
  stage: { seeds: 20, xp: 30 },
  daily: { seeds: 15, xp: 20 },
  dailyBonus: 15,
  xpPerLevel: 100,
  achievements: { 'first-step': 10, explorer: 25, 'my-corner': 10 },
};
export const levelFor = (xp: number) => 1 + Math.floor(xp / ECONOMY.xpPerLevel);
export const levelProgress = (xp: number) => xp % ECONOMY.xpPerLevel;
