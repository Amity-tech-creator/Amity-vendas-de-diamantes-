import { Gamepad2, Smartphone } from 'lucide-react';
import { Game, GameType } from './types';

export const GAMES: Game[] = [
  {
    id: GameType.FREE_FIRE,
    name: 'Free Fire',
    description: 'Diamantes, Passes e Assinaturas oficiais Garena.',
    icon: Gamepad2,
    color: 'bg-orange-600',
    accent: 'text-orange-500',
    startingPrice: 60,
    packages: [
      { id: 'ff-110', name: '💠 110💎', amount: 110, price: 85 },
      { id: 'ff-231', name: '💠 231💎', amount: 231, price: 175 },
      { id: 'ff-583', name: '💠 583💎', amount: 583, price: 400 },
      { id: 'ff-1188', name: '💠 1188💎', amount: 1188, price: 790 },
      { id: 'ff-2420', name: '💠 2420💎', amount: 2420, price: 1600 },
      { id: 'ff-6160', name: '💠 6160💎', amount: 6160, price: 4050 },
      { id: 'ff-lvl-400', name: '🎁 Pacote de Nível (400💎)', amount: 400, price: 200 },
      { id: 'ff-lvl-200', name: '🎁 Pacote de Nível (200💎)', amount: 200, price: 120 },
      { id: 'ff-lvl-120', name: '🎁 Pacote de Nível (120💎)', amount: 120, price: 60 },
      { id: 'ff-weekly', name: '📅 Assinatura Semanal (450💎)', amount: 450, price: 190 },
      { id: 'ff-monthly', name: '📅 Assinatura Mensal (2600💎)', amount: 2600, price: 810 },
      { id: 'ff-booyah', name: '🎫 Atualizar Passe Booyah', amount: 1, price: 130 },
    ]
  },
  {
    id: GameType.COD_MOBILE,
    name: 'COD Mobile',
    description: 'CP para Battle Pass e Loja Activision.',
    icon: Smartphone,
    color: 'bg-green-700',
    accent: 'text-green-500',
    startingPrice: 95,
    packages: [
      { id: 'cod-80', name: '80 CP', amount: 80, price: 95 },
      { id: 'cod-420', name: '420 CP (Battle Pass)', amount: 420, price: 480 },
      { id: 'cod-880', name: '880 CP', amount: 880, price: 950 },
      { id: 'cod-2400', name: '2400 CP', amount: 2400, price: 2350 },
      { id: 'cod-5000', name: '5000 CP', amount: 5000, price: 4600 },
    ]
  },
  {
    id: GameType.PUBG_MOBILE,
    name: 'PUBG Mobile',
    description: 'Unknown Cash (UC) e Royale Pass.',
    icon: Gamepad2,
    color: 'bg-yellow-600',
    accent: 'text-yellow-500',
    startingPrice: 90,
    packages: [
      { id: 'pubg-60', name: '60 UC', amount: 60, price: 90 },
      { id: 'pubg-325', name: '325 UC', amount: 325, price: 460 },
      { id: 'pubg-660', name: '660 UC', amount: 660, price: 920 },
      { id: 'pubg-1800', name: '1800 UC', amount: 1800, price: 2450 },
    ]
  },
  {
    id: GameType.MOBILE_LEGENDS,
    name: 'Mobile Legends',
    description: 'Diamonds e Passes para MLBB.',
    icon: Smartphone,
    color: 'bg-blue-600',
    accent: 'text-blue-500',
    startingPrice: 120,
    packages: [
      { id: 'ml-86', name: '💠 86 Diamonds', amount: 86, price: 120 },
      { id: 'ml-172', name: '💠 172 Diamonds', amount: 172, price: 230 },
      { id: 'ml-257', name: '💠 257 Diamonds', amount: 257, price: 340 },
      { id: 'ml-706', name: '💠 706 Diamonds', amount: 706, price: 920 },
    ]
  },
  {
    id: GameType.VALORANT,
    name: 'Valorant',
    description: 'Valorant Points (VP) oficiais para skins e passes.',
    icon: Gamepad2,
    color: 'bg-red-600',
    accent: 'text-red-500',
    startingPrice: 350,
    packages: [
      { id: 'val-500', name: '🔴 500 VP', amount: 500, price: 350 },
      { id: 'val-1050', name: '🔴 1050 VP', amount: 1050, price: 700 },
      { id: 'val-2100', name: '🔴 2100 VP', amount: 2100, price: 1350 },
    ]
  }
];

export const PAYMENT_NUMBERS = {
  MPESA: '856295597',
  EMOLA: '871087088'
};

export const WHATSAPP_NUMBER = '258871087088';
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

export const WHATSAPP_SUPPORT_NUMBER = '258856295597';
export const WHATSAPP_SUPPORT_LINK = `https://wa.me/${WHATSAPP_SUPPORT_NUMBER}`;
