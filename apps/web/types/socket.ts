/**
 * Socket.IO Types and Interfaces for Live Auctions
 * أنواع وواجهات Socket.IO للمزادات المباشرة
 */

import { Socket } from 'socket.io-client';

// Base types for socket communication
export interface SocketUser {
  id: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR' | 'SUPER_ADMIN';
  accountType: string;
  verified: boolean;
}

// Auction bidding types
export interface BidData {
  auctionId: string;
  userId: string;
  amount: number;
  timestamp: number;
  bidId: string;
}

export interface AuctionState {
  auctionId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  status: 'UPCOMING' | 'LIVE' | 'ENDING_SOON' | 'ENDED' | 'CANCELLED' | 'SUSPENDED';
  currentPrice: number;
  startingPrice: number;
  minimumBidIncrement: number;
  reservePrice?: number;
  buyNowPrice?: number;
  startTime: number;
  endTime: number;
  participantsCount: number;
  bidsCount: number;
  lastBidder?: SocketUser;
  seller?: SocketUser;
  categories?: string[];
  location?: string;
  autoExtensionMinutes?: number;
  isActive: boolean;
}

export interface AuctionParticipant {
  user: SocketUser;
  joinedAt: number;
  lastActivity: number;
  totalBids: number;
  isActive: boolean;
}

// Socket Events - Server to Client
export interface ServerToClientEvents {
  // Auction room events
  'auction:joined': (data: {
    auction: AuctionState;
    participants: AuctionParticipant[];
    recentBids: BidData[];
  }) => void;

  'auction:left': (data: { userId: string; participantsCount: number; }) => void;

  'auction:state-updated': (auction: AuctionState) => void;

  // Bidding events
  'bid:placed': (bid: BidData & { user: SocketUser; }) => void;

  'bid:rejected': (data: { reason: string; bidAmount: number; minimumRequired: number; }) => void;

  'bid:outbid': (data: { newBid: BidData & { user: SocketUser; }; yourPreviousBid: number; }) => void;

  // Auction timing events
  'auction:started': (auction: AuctionState) => void;

  'auction:ending-soon': (data: { auction: AuctionState; remainingSeconds: number; }) => void;

  'auction:ended': (data: {
    auction: AuctionState;
    winner: SocketUser | null;
    finalPrice: number;
  }) => void;

  'auction:extended': (data: {
    auction: AuctionState;
    extensionSeconds: number;
    reason: string;
  }) => void;

  // Participant events
  'participants:updated': (participants: AuctionParticipant[]) => void;

  'participant:activity': (data: {
    userId: string;
    activity: 'bid' | 'typing' | 'viewing';
  }) => void;

  // System notifications
  'notification:info': (data: {
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    duration?: number;
  }) => void;

  'notification:auction': (data: {
    auctionId: string;
    message: string;
    type: 'bid_placed' | 'auction_ending' | 'auction_won' | 'auction_lost';
  }) => void;

  // Connection events
  'connection:status': (data: {
    status: 'connected' | 'disconnected' | 'reconnecting';
    latency?: number;
  }) => void;

  'error:auction': (data: { error: string; code: string; auctionId?: string; }) => void;

  // Presence events (global)
  'presence:update': (data: { userId: string; isOnline: boolean; }) => void;

  // Chat events
  'chat:message:new': (data: {
    conversationId: string;
    message: {
      id: string;
      senderId: string;
      type:
      | 'text'
      | 'image'
      | 'location'
      | 'file'
      | 'voice'
      | 'bid'
      | 'video';
      content: string;
      createdAt: string;
      status?: 'sent' | 'delivered' | 'read';
      imageUrl?: string;
      fileUrl?: string;
      fileName?: string;
      clientMessageId?: string;
    };
  }) => void;

  'chat:typing': (data: { conversationId: string; userId: string; typing: boolean; }) => void;

  // Read receipts (bulk per conversation)
  'chat:messages:read': (data: {
    conversationId: string;
    readerId: string;
    readAt: string;
  }) => void;

  // Delivery receipts (per message)
  'chat:message:delivered': (data: {
    conversationId: string;
    messageId: string;
    deliveredTo: string;
    deliveredAt: string;
  }) => void;

  // 🔔 Messages counter updates (real-time badge updates)
  'messages:unread-update': (data: {
    userId: string;
    increment?: number;
    decrement?: number;
  }) => void;

  // 🔔 Notifications counter updates
  'notifications:unread-update': (data: {
    userId: string;
    increment?: number;
    decrement?: number;
  }) => void;

  // ===== Calls (WebRTC signaling)
  'call:ring': (data: {
    conversationId: string;
    callId: string;
    fromUserId: string;
    toUserId: string;
    media: 'video' | 'audio';
    startedAt: string;
  }) => void;
  'call:accepted': (data: { conversationId: string; callId: string; byUserId: string; }) => void;
  'call:rejected': (data: { conversationId: string; callId: string; byUserId: string; reason?: string; }) => void;
  'call:offer': (data: { conversationId: string; callId: string; sdp: unknown; fromUserId: string; }) => void;
  'call:answer': (data: { conversationId: string; callId: string; sdp: unknown; fromUserId: string; }) => void;
  'call:ice-candidate': (data: { conversationId: string; callId: string; candidate: unknown; fromUserId: string; }) => void;
  'call:ended': (data: { conversationId: string; callId: string; byUserId: string; reason?: string; }) => void;
  'call:busy': (data: { conversationId: string; callId: string; toUserId: string; }) => void;
  'call:error': (data: { conversationId?: string; callId?: string; message: string; }) => void;
}

// Socket Events - Client to Server
export interface ClientToServerEvents {
  // Room management
  'auction:join': (
    data: {
      auctionId: string;
      userToken: string;
    },
    callback: (response: { success: boolean; error?: string; auction?: AuctionState; }) => void,
  ) => void;

  'auction:leave': (data: { auctionId: string; }) => void;

  // Bidding
  'bid:place': (
    data: {
      auctionId: string;
      amount: number;
    },
    callback: (response: { success: boolean; error?: string; bid?: BidData; }) => void,
  ) => void;

  'bid:cancel': (data: { auctionId: string; bidId: string; }) => void;

  // Real-time status
  heartbeat: () => void;

  'typing:start': (data: { auctionId: string; }) => void;

  'typing:stop': (data: { auctionId: string; }) => void;

  // Admin actions
  'admin:extend-auction': (data: {
    auctionId: string;
    extensionMinutes: number;
    reason: string;
  }) => void;

  'admin:end-auction': (data: { auctionId: string; reason: string; }) => void;

  'admin:ban-user': (data: { auctionId: string; userId: string; reason: string; }) => void;

  // Presence (global)
  'presence:announce': (data: { userToken: string; }) => void;

  // Chat rooms
  'chat:join': (data: { conversationId: string; userToken: string; }) => void;
  'chat:leave': (data: { conversationId: string; }) => void;
  'chat:typing:start': (data: { conversationId: string; }) => void;
  'chat:typing:stop': (data: { conversationId: string; }) => void;
  'chat:message:new': (data: {
    conversationId: string;
    message: {
      id: string;
      senderId: string;
      type:
      | 'text'
      | 'image'
      | 'location'
      | 'file'
      | 'voice'
      | 'bid'
      | 'video';
      content: string;
      createdAt: string;
      imageUrl?: string;
      clientMessageId?: string;
    };
  }) => void;
  'chat:message:delivered': (data: { conversationId: string; messageId: string; }) => void;
  'chat:message:read': (data: { conversationId: string; }) => void;

  // ===== Calls (WebRTC signaling)
  'call:start': (data: {
    conversationId: string;
    toUserId: string;
    media: 'video' | 'audio';
    callId: string;
  }) => void;
  'call:accept': (data: { conversationId: string; callId: string; }) => void;
  'call:reject': (data: { conversationId: string; callId: string; reason?: string; }) => void;
  'call:cancel': (data: { conversationId: string; callId: string; }) => void;
  'call:ended': (data: { conversationId: string; callId: string; reason?: string; }) => void;
  'call:offer': (data: { conversationId: string; callId: string; sdp: unknown; }) => void;
  'call:answer': (data: { conversationId: string; callId: string; sdp: unknown; }) => void;
  'call:ice-candidate': (data: { conversationId: string; callId: string; candidate: unknown; }) => void;
}

// Socket Data (stored per connection)
export interface SocketData {
  user: SocketUser;
  currentAuction?: string;
  joinedAt: number;
  lastActivity: number;
  isAuthenticated: boolean;
}

// Error codes for socket operations
export enum SocketErrorCodes {
  UNAUTHORIZED = 'UNAUTHORIZED',
  AUCTION_NOT_FOUND = 'AUCTION_NOT_FOUND',
  AUCTION_ENDED = 'AUCTION_ENDED',
  AUCTION_NOT_STARTED = 'AUCTION_NOT_STARTED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  BID_TOO_LOW = 'BID_TOO_LOW',
  RATE_LIMITED = 'RATE_LIMITED',
  USER_BANNED = 'USER_BANNED',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  INVALID_DATA = 'INVALID_DATA',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
}

// Auction room configuration
export interface AuctionRoomConfig {
  maxParticipants: number;
  bidIncrementPercentage: number;
  endingSoonThreshold: number; // seconds
  autoExtensionThreshold: number; // seconds
  maxAutoExtensions: number;
  heartbeatInterval: number; // milliseconds
  inactivityTimeout: number; // milliseconds
}

// Real-time auction statistics
export interface AuctionStats {
  totalBids: number;
  uniqueBidders: number;
  averageBidTime: number;
  priceIncreasePercentage: number;
  participantEngagement: number;
  peakParticipants: number;
}

// Export combined socket interface
export type AuctionSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// Rate limiting configuration
export interface RateLimitConfig {
  bidsPerMinute: number;
  messagesPerMinute: number;
  callsPerMinute?: number;
  connectionsPerIP: number;
  maxReconnectAttempts: number;
  banDurationMinutes: number;
}

// Database models for real-time data
export interface LiveBid {
  id: string;
  auctionId: string;
  userId: string;
  amount: number;
  timestamp: Date;
  socketId: string;
  ipAddress: string;
  userAgent: string;
  status: 'pending' | 'accepted' | 'rejected';
  rejectionReason?: string;
}

export interface AuctionSession {
  id: string;
  auctionId: string;
  startedAt: Date;
  endedAt?: Date;
  totalBids: number;
  peakParticipants: number;
  finalPrice?: number;
  winnerId?: string;
  endReason: 'natural' | 'admin_ended' | 'system_error';
  stats: AuctionStats;
}

// WebSocket connection states
export type ConnectionState =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'error';

