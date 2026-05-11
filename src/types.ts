import { FC } from 'react';
import { Gamepad2 } from 'lucide-react';

export enum GameType {
  FREE_FIRE = 'Free Fire',
  COD_MOBILE = 'Call of Duty Mobile',
  PUBG_MOBILE = 'PUBG Mobile',
  MOBILE_LEGENDS = 'Mobile Legends',
  EFOOTBALL = 'eFootball',
  ROBLOX = 'Roblox',
  VALORANT = 'Valorant'
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  balance: number;
  role: 'user' | 'admin' | 'reseller';
  vipLevel: number;
  createdAt: any;
  lastPlayerId?: string;
}

export interface Order {
  id: string;
  userId: string;
  gameId: string;
  packageName: string;
  packagePrice: number;
  amount: number;
  playerId: string;
  status: OrderStatus;
  createdAt: any;
  updatedAt: any;
  paymentMethod: 'mpesa' | 'emola' | 'balance';
  transactionId?: string;
}

export interface Package {
  id: string;
  name: string;
  amount: number;
  price: number;
  category?: string;
  active?: boolean;
  icon?: string;
  bonus?: string;
  exactAmount?: string;
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
