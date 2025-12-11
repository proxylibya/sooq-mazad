/**
 * أنواع البيانات للمزادات ونظام المزايدة
 * Auction and bidding system types
 */

import { ImageData, LocationData } from './common';
import type { AccountType } from './account';

// أنواع المستخدمين
export interface User {
  id: number | string;
  name: string;
  phone?: string;
  email?: string;
  verified: boolean;
  profileImage?: string;
  accountType?: AccountType;
  role?: 'USER' | 'ADMIN' | 'MODERATOR' | 'SUPER_ADMIN';
  createdAt?: Date;
  rating?: number;
  totalAuctions?: number;
  successfulBids?: number;
}

// أنواع السيارات
export interface Car {
  id: number | string;
  brand: string;
  model: string;
  year: number;
  price: number;
  images: string[] | ImageData[];
  condition: 'NEW' | 'USED' | 'NEEDS_REPAIR';
  mileage?: number;
  location: string;
  coordinates?: LocationData['coordinates'];
  seller: User;
  description?: string;
  features?: string[];
  specifications?: CarSpecifications;
  fuelType?: 'GASOLINE' | 'DIESEL' | 'HYBRID' | 'ELECTRIC';
  transmission?: 'MANUAL' | 'AUTOMATIC';
  bodyType?: 'SEDAN' | 'SUV' | 'HATCHBACK' | 'COUPE' | 'TRUCK' | 'VAN';
  color?: string;
  engineSize?: number;
  doors?: number;
  seats?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// مواصفات السيارة
export interface CarSpecifications {
  engine?: string;
  horsepower?: number;
  torque?: number;
  acceleration?: string;
  topSpeed?: number;
  fuelConsumption?: string;
  safetyRating?: number;
  warranty?: string;
  [key: string]: any;
}

// أنواع المزايدات
export interface Bid {
  id: number | string;
  amount: number;
  bidder: User;
  auctionId: number | string;
  createdAt: Date;
  isWinning: boolean;
  isVerified?: boolean;
  bidRank?: number;
  timeAgo?: string;
  status?: 'ACTIVE' | 'OUTBID' | 'WINNING' | 'CANCELLED';
}

// المزايدون
export interface Bidder {
  id: number | string;
  name: string;
  amount: number;
  timestamp: Date;
  isWinning: boolean;
  isVerified: boolean;
  avatar?: string;
  bidRank: number;
  timeAgo: string;
  user?: User;
}

export interface Auction {
  id: number | string;
  title: string;
  description?: string;
  startingPrice: number;
  currentPrice: number;
  minimumIncrement: number;
  startTime: Date;
  endTime: Date;
  status: 'upcoming' | 'active' | 'ended' | 'cancelled' | 'paused';
  car: Car;
  bids: Bid[];
  bidders?: Bidder[];
  totalBids: number;
  participants: number;
  winner?: User | null;
  createdAt: Date;
  updatedAt?: Date;
  seller: User;
  auctionType?: 'live' | 'timed';
  viewCount?: number;
  watchlistCount?: number;
}

export interface AuctionStats {
  totalAuctions: number;
  activeAuctions: number;
  endedAuctions: number;
  totalBids: number;
  totalParticipants: number;
  averageBidAmount: number;
  highestBid: number;
  mostPopularBrand: string;
  successRate: number;
}

export interface BidHistory {
  id: number | string;
  bidder: string;
  amount: string;
  time: string;
  timestamp: Date;
  isWinning: boolean;
  isVerified?: boolean;
  user?: User;
}

export interface AuctionFilters {
  brand?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  priceFrom?: number;
  priceTo?: number;
  condition?: string;
  location?: string;
  status?: string;
  sortBy?: 'price' | 'time' | 'bids' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface AuctionNotification {
  id: string;
  type: 'bid_placed' | 'bid_outbid' | 'auction_ending' | 'auction_won' | 'auction_lost';
  title: string;
  message: string;
  auctionId: string;
  userId: string;
  isRead: boolean;
  createdAt: Date;
  data?: Record<string, any>;
}

export interface AuctionSettings {
  maxBidAmount: number;
  auctionDuration: number; // in hours
  extendTimeOnLastMinuteBid: boolean;
  extensionTime: number; // in minutes
  requireVerificationToBid: boolean;
  allowProxyBidding: boolean;
  chargeListingFee: boolean;
  listingFeeAmount: number;
  chargeSuccessFee: boolean;
  successFeePercentage: number;
}

// أنواع الأحداث في المزاد
export type AuctionEvent =
  | 'auction_created'
  | 'auction_started'
  | 'bid_placed'
  | 'bid_retracted'
  | 'auction_extended'
  | 'auction_ended'
  | 'auction_cancelled'
  | 'winner_declared'
  | 'payment_completed';

export interface AuctionEventLog {
  id: string;
  auctionId: string;
  event: AuctionEvent;
  userId?: string;
  data: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

// حالات المزاد
export type AuctionStatus = 'draft' | 'scheduled' | 'active' | 'ended' | 'cancelled' | 'suspended';

// أنواع المزادات
export type AuctionType = 'standard' | 'dutch' | 'sealed_bid' | 'live';

// مستويات التحقق المطلوبة للمزايدة
export type VerificationLevel = 'none' | 'phone' | 'email' | 'identity' | 'full';

export interface AuctionPermissions {
  canBid: boolean;
  canViewBidders: boolean;
  canViewBidHistory: boolean;
  canContactSeller: boolean;
  canReportAuction: boolean;
  requiredVerificationLevel: VerificationLevel;
}

// واجهة للمزايدة التلقائية (Proxy Bidding)
export interface ProxyBid {
  id: string;
  userId: string;
  auctionId: string;
  maxAmount: number;
  currentAmount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// إحصائيات المزايد
export interface BidderStats {
  userId: string;
  totalBids: number;
  wonAuctions: number;
  lostAuctions: number;
  averageBidAmount: number;
  highestBid: number;
  successRate: number;
  totalSpent: number;
  favoriteCategories: string[];
  biddingPattern: 'early' | 'late' | 'consistent';
}

// Remove default export to fix TypeScript errors
