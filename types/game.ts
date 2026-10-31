export type PrizeType = 'cash' | 'product';

export interface Prize {
  id: string;
  name: string;
  type: PrizeType;
  value: number; // For cash: value in MXN (e.g. 150, 200, 300). For product: approximate retail value
  valueText: string;
  badgeText: string;
  color: string;
  accentColor: string;
  textColor: string;
  icon: string;
  description: string;
  weight: number; // Probability weight
  imagePlaceholder?: string;
}

export type MinigameId = 'hunter' | 'memory' | 'bubbles';

export interface MinigameMeta {
  id: MinigameId;
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  color: string;
  difficulty: 'Fácil' | 'Medio' | 'Rápido';
  estimatedTime: string;
  description: string;
}

export interface WonPrize {
  id: string;
  prizeId: string;
  name: string;
  type: PrizeType;
  valueText: string;
  date: string;
  wonFromGame: string;
  icon: string;
  color: string;
}
