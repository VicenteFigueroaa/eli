import { Prize, MysteryProduct } from '../types/game';

export const MYSTERY_PRODUCTS: MysteryProduct[] = [
  {
    id: 'avene-cleanance',
    name: 'Avène Cleanance Gel Limpiador Facial (400ml)',
    brand: 'Eau Thermale Avène',
    category: 'Limpiador Facial • Piel Grasa',
    store: 'Amazon',
    url: 'https://a.co/d/0cvRXbPQ',
    color: '#0284C7', // Sky Blue
    accentColor: '#0369A1',
    icon: 'sparkles',
    description: 'Gel limpiador dermatológico purificante y matificante para rostro y piel con imperfecciones.',
  },
  {
    id: 'lbel-mascara',
    name: "L'BEL Máscara Tratante y Sérum para Pestañas (6g)",
    brand: "L'BEL",
    category: 'Tratamiento Pestañas AM/PM',
    store: 'Amazon',
    url: 'https://a.co/d/0fYYbeDt',
    color: '#8B5CF6', // Purple
    accentColor: '#7C3AED',
    icon: 'sparkles',
    description: 'Tratamiento especializado con queratina, pantenol y vitaminas para pestañas más largas y fuertes.',
  },
  {
    id: 'huda-powder',
    name: 'Huda Beauty Easy Bake Loose Powder Mini',
    brand: 'Huda Beauty',
    category: 'Mini Polvo Fijador de Maquillaje',
    store: 'Sephora',
    url: 'https://prod.sfcc.sephora.com.mx/products-748602.html',
    color: '#EC4899', // Pink
    accentColor: '#DB2777',
    icon: 'sparkles',
    description: 'Polvo fijador traslúcido de alta duración para un acabado mate y aterciopelado perfecto.',
  },
  {
    id: 'toofaced-concealer',
    name: 'Too Faced Born This Way Super Coverage Travel Size',
    brand: 'Too Faced',
    category: 'Corrector Multiusos para Rostro',
    store: 'Sephora',
    url: 'https://prod.sfcc.sephora.com.mx/products-757496.html',
    color: '#F97316', // Orange
    accentColor: '#EA580C',
    icon: 'sparkles',
    description: 'Corrector hidratante con infusión de agua de coco y rosa alpina para máxima cobertura.',
  },
];

export const PRIZES: Prize[] = [
  {
    id: 'shein-cart',
    name: 'Carrito de SHEIN',
    type: 'product',
    value: 500,
    valueText: 'Carrito SHEIN',
    badgeText: 'PREMIO MAYOR 🛍️',
    color: '#EC4899', // Pink / Magenta
    accentColor: '#DB2777',
    textColor: '#FFFFFF',
    icon: 'shopping-bag',
    description: '¡Premio Mayor! Ganaste un carrito de compras de SHEIN para estrenar lo que quieras.',
    weight: 7, // Probability weight
  },
  {
    id: 'prod-1',
    name: 'Producto',
    type: 'product',
    value: 350,
    valueText: 'Caja Misteriosa',
    badgeText: 'PRODUCTO 🎁',
    color: '#8B5CF6', // Purple
    accentColor: '#7C3AED',
    textColor: '#FFFFFF',
    icon: 'gift',
    description: '¡Premio de producto! Toca una caja misteriosa con "?" para descubrir tu regalo de belleza.',
    weight: 16,
  },
  {
    id: 'cash-300',
    name: '$300 MXN en Efectivo',
    type: 'cash',
    value: 300,
    valueText: '$300 MXN',
    badgeText: 'PREMIO MAYOR 👑',
    color: '#F59E0B', // Amber / Gold
    accentColor: '#D97706',
    textColor: '#FFFFFF',
    icon: 'crown',
    description: '¡Felicidades! Ganaste el premio mayor de $300 pesos en efectivo directo para ti.',
    weight: 8,
  },
  {
    id: 'prod-2',
    name: 'Producto',
    type: 'product',
    value: 350,
    valueText: 'Caja Misteriosa',
    badgeText: 'PRODUCTO 🎁',
    color: '#3B82F6', // Blue
    accentColor: '#2563EB',
    textColor: '#FFFFFF',
    icon: 'package',
    description: '¡Premio de producto! Toca una caja misteriosa con "?" para descubrir tu regalo de belleza.',
    weight: 16,
  },
  {
    id: 'cash-200',
    name: '$200 MXN en Efectivo',
    type: 'cash',
    value: 200,
    valueText: '$200 MXN',
    badgeText: 'PREMIO MAYOR 💰',
    color: '#10B981', // Emerald
    accentColor: '#059669',
    textColor: '#FFFFFF',
    icon: 'wallet',
    description: '¡Excelente tiro! $200 pesos mexicanos en efectivo transferibles a tu cuenta.',
    weight: 10,
  },
  {
    id: 'prod-3',
    name: 'Producto',
    type: 'product',
    value: 350,
    valueText: 'Caja Misteriosa',
    badgeText: 'PRODUCTO 🎁',
    color: '#F97316', // Orange
    accentColor: '#EA580C',
    textColor: '#FFFFFF',
    icon: 'gift',
    description: '¡Premio de producto! Toca una caja misteriosa con "?" para descubrir tu regalo de belleza.',
    weight: 16,
  },
  {
    id: 'cash-150',
    name: '$150 MXN en Efectivo',
    type: 'cash',
    value: 150,
    valueText: '$150 MXN',
    badgeText: 'PREMIO MAYOR 💵',
    color: '#06B6D4', // Cyan
    accentColor: '#0891B2',
    textColor: '#FFFFFF',
    icon: 'banknote',
    description: '¡Enhorabuena! $150 pesos mexicanos en efectivo directo para ti.',
    weight: 12,
  },
  {
    id: 'prod-4',
    name: 'Producto',
    type: 'product',
    value: 350,
    valueText: 'Caja Misteriosa',
    badgeText: 'PRODUCTO 🎁',
    color: '#6366F1', // Indigo
    accentColor: '#4F46E5',
    textColor: '#FFFFFF',
    icon: 'package',
    description: '¡Premio de producto! Toca una caja misteriosa con "?" para descubrir tu regalo de belleza.',
    weight: 15,
  },
];

// Helper to choose a prize based on probability weights
export function getRandomPrize(): Prize {
  const totalWeight = PRIZES.reduce((sum, p) => sum + p.weight, 0);
  let random = Math.random() * totalWeight;

  for (const prize of PRIZES) {
    if (random < prize.weight) {
      return prize;
    }
    random -= prize.weight;
  }
  return PRIZES[0];
}
