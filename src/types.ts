import { FC } from 'react';
import { Gamepad2 } from 'lucide-react';

export enum GameType {
  FREE_FIRE = 'Free Fire',
  COD_MOBILE = 'Call of Duty Mobile',
  PUBG_MOBILE = 'PUBG Mobile',
  MOBILE_LEGENDS = 'Mobile Legends',
  VALORANT = 'Valorant'
}

export interface Package {
  id: string;
  name: string;
  amount: number;
  price: number;
  category?: string;
  active?: boolean;
  icon?: string;
}

export interface Game {
  id: GameType;
  name: string;
  description: string;
  icon: typeof Gamepad2;
  color: string;
  accent: string;
  packages?: Package[];
  startingPrice?: number;
}

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  PROMO = 'promo',
  UPDATE = 'update'
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon: any;
}
