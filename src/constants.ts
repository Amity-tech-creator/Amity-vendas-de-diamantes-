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
    startingPrice: 85,
    packages: [
      { id: 'ff-110', name: '💠 110💎', amount: 110, price: 85, exactAmount: '100 + 10 Bônus', bonus: '10% Adicional' },
      { id: 'ff-341', name: '💠 341💎', amount: 341, price: 190, exactAmount: '310 + 31 Bônus', bonus: 'Promo 2026' },
      { id: 'ff-572', name: '💠 572💎', amount: 572, price: 320, exactAmount: '520 + 52 Bônus' },
      { id: 'ff-1166', name: '💠 1166💎', amount: 1166, price: 620, exactAmount: '1060 + 106 Bônus' },
      { id: 'ff-2398', name: '💠 2398💎', amount: 2398, price: 1200, exactAmount: '2180 + 218 Bônus' },
      { id: 'ff-6160', name: '💠 6160💎', amount: 6160, price: 3000, exactAmount: '5600 + 560 Bônus' },
      { id: 'ff-booyah', name: '🎫 Booyah Pass', amount: 1, price: 280, exactAmount: 'Premium Pass' },
      { id: 'ff-booyah-plus', name: '🎫 Booyah Pass Premium Plus', amount: 1, price: 520, exactAmount: 'Elite Pass' },
      { id: 'ff-weekly', name: '📅 Assinatura Semanal', amount: 450, price: 190, bonus: 'Melhor Custo Benefício' },
      { id: 'ff-monthly', name: '📅 Assinatura Mensal', amount: 2600, price: 760, bonus: 'VIP Mensal' },
      { id: 'ff-weekly-card', name: '💳 Cartão Semanal', amount: 1, price: 180 },
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
      { id: 'pubg-325', name: '325 UC', amount: 325, price: 340 },
      { id: 'pubg-660', name: '660 UC', amount: 660, price: 650 },
      { id: 'pubg-1800', name: '1800 UC', amount: 1800, price: 1650 },
      { id: 'pubg-3850', name: '3850 UC', amount: 3850, price: 3200 },
      { id: 'pubg-8100', name: '8100 UC', amount: 8100, price: 6200 },
      { id: 'pubg-rp', name: 'Royale Pass', amount: 1, price: 350 },
      { id: 'pubg-elite', name: 'Elite Pass', amount: 1, price: 690 },
      { id: 'pubg-plus', name: 'Elite Plus Pass', amount: 1, price: 1150 },
    ]
  },
  {
    id: GameType.COD_MOBILE,
    name: 'COD Mobile',
    description: 'CP para Battle Pass e Loja Activision.',
    icon: Smartphone,
    color: 'bg-zinc-800',
    accent: 'text-zinc-400',
    startingPrice: 90,
    packages: [
      { id: 'cod-80', name: '80 CP', amount: 80, price: 90 },
      { id: 'cod-420', name: '420 CP', amount: 420, price: 340 },
      { id: 'cod-880', name: '880 CP', amount: 880, price: 620 },
      { id: 'cod-2400', name: '2400 CP', amount: 2400, price: 1550 },
      { id: 'cod-5000', name: '5000 CP', amount: 5000, price: 3100 },
      { id: 'cod-bp', name: 'Battle Pass', amount: 1, price: 360 },
      { id: 'cod-bp-bundle', name: 'Battle Pass Bundle', amount: 1, price: 690 },
    ]
  },
  {
    id: GameType.EFOOTBALL,
    name: 'eFootball',
    description: 'Coins oficiais para o seu time dos sonhos.',
    icon: Gamepad2,
    color: 'bg-blue-900',
    accent: 'text-blue-400',
    startingPrice: 95,
    packages: [
      { id: 'ef-130', name: '130 Coins', amount: 130, price: 95 },
      { id: 'ef-550', name: '550 Coins', amount: 550, price: 350 },
      { id: 'ef-1040', name: '1040 Coins', amount: 1040, price: 650 },
      { id: 'ef-2130', name: '2130 Coins', amount: 2130, price: 1250 },
      { id: 'ef-5700', name: '5700 Coins', amount: 5700, price: 3250 },
      { id: 'ef-mp', name: 'Match Pass', amount: 1, price: 290 },
      { id: 'ef-pmp', name: 'Premium Match Pass', amount: 1, price: 520 },
    ]
  },
  {
    id: GameType.ROBLOX,
    name: 'Roblox',
    description: 'Robux para skins, acessórios e passes.',
    icon: Smartphone,
    color: 'bg-zinc-100',
    accent: 'text-zinc-900',
    startingPrice: 120,
    packages: [
      { id: 'rb-80', name: '80 Robux', amount: 80, price: 120 },
      { id: 'rb-400', name: '400 Robux', amount: 400, price: 420 },
      { id: 'rb-800', name: '800 Robux', amount: 800, price: 760 },
      { id: 'rb-1700', name: '1700 Robux', amount: 1700, price: 1500 },
      { id: 'rb-4500', name: '4500 Robux', amount: 4500, price: 3700 },
      { id: 'rb-pb', name: 'Premium Básico', amount: 1, price: 420 },
      { id: 'rb-pm', name: 'Premium Médio', amount: 1, price: 820 },
      { id: 'rb-pg', name: 'Premium Grande', amount: 1, price: 1650 },
    ]
  },
  {
    id: GameType.MOBILE_LEGENDS,
    name: 'Mobile Legends',
    description: 'Diamonds e Passes para MLBB.',
    icon: Smartphone,
    color: 'bg-blue-600',
    accent: 'text-blue-500',
    startingPrice: 110,
    packages: [
      { id: 'ml-86', name: '💠 86 💎', amount: 86, price: 110 },
      { id: 'ml-172', name: '💠 172 💎', amount: 172, price: 210 },
      { id: 'ml-257', name: '💠 257 💎', amount: 257, price: 320 },
      { id: 'ml-706', name: '💠 706 💎', amount: 706, price: 780 },
      { id: 'ml-1446', name: '💠 1446 💎', amount: 1446, price: 1550 },
      { id: 'ml-sl', name: 'Starlight Pass', amount: 1, price: 420 },
      { id: 'ml-slp', name: 'Starlight Plus', amount: 1, price: 760 },
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
