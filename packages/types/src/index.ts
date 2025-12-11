/**
 * @sooq-mazad/types
 * Shared TypeScript types for the entire monorepo
 * 
 * High Performance - Optimized for large-scale applications
 */

// ============ Base Types ============

export type ID = string | number;

export type Timestamp = string | Date;

export type Currency = 'LYD' | 'USD';

// ============ User Types ============

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'MODERATOR';

export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'SUSPENDED' | 'PENDING';

export type AccountType = 'REGULAR_USER' | 'TRANSPORT_OWNER' | 'SHOWROOM' | 'COMPANY';

export interface User {
    id: string;
    name: string;
    phone: string;
    email?: string;
    profileImage?: string;
    role: UserRole;
    status: UserStatus;
    accountType?: AccountType;
    verified?: boolean;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export interface UserSlim {
    id: string;
    name?: string;
    phone?: string;
    profileImage?: string;
    accountType?: AccountType;
    verified?: boolean;
}

// ============ Car Types ============

export type CarCondition = 'NEW' | 'USED' | 'EXCELLENT' | 'GOOD' | 'FAIR';

export type FuelType = 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'GAS';

export type Transmission = 'AUTOMATIC' | 'MANUAL' | 'CVT';

export interface Car {
    id: string;
    title: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    mileage?: number;
    condition?: CarCondition;
    fuelType?: FuelType;
    transmission?: Transmission;
    color?: string;
    images?: string[];
    description?: string;
    sellerId?: string;
    seller?: UserSlim;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

// ============ Auction Types ============

export type AuctionStatus =
    | 'DRAFT'
    | 'PENDING'
    | 'SCHEDULED'
    | 'ACTIVE'
    | 'ENDED'
    | 'SOLD'
    | 'CANCELLED'
    | 'EXPIRED';

export type AuctionType = 'STANDARD' | 'RESERVE' | 'BUY_NOW' | 'TIMED';

export interface Auction {
    id: string;
    title: string;
    startingPrice: number;
    currentPrice: number;
    buyNowPrice?: number;
    minimumBidIncrement?: number;
    status: AuctionStatus;
    type?: AuctionType;
    startTime?: Timestamp;
    endTime?: Timestamp;
    totalBids?: number;
    viewCount?: number;
    carId?: string;
    car?: Car;
    sellerId?: string;
    seller?: UserSlim;
    winnerId?: string;
    winner?: UserSlim;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export interface Bid {
    id: string;
    auctionId: string;
    bidderId: string;
    bidder?: UserSlim;
    amount: number;
    isWinning?: boolean;
    createdAt: Timestamp;
}

// ============ Message Types ============

export type MessageType = 'text' | 'image' | 'file' | 'voice' | 'location' | 'bid' | 'video';

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    sender?: UserSlim;
    type: MessageType;
    content: string;
    status?: MessageStatus;
    imageUrl?: string;
    createdAt: Timestamp;
}

export interface Conversation {
    id: string;
    title?: string;
    participants: UserSlim[];
    lastMessage?: string;
    lastMessageTime?: Timestamp;
    unreadCount?: number;
    carId?: string;
    car?: Car;
    auctionId?: string;
    auction?: Auction;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

// ============ Transport Types ============

export type TransportStatus = 'PENDING' | 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

export interface TransportService {
    id: string;
    ownerId: string;
    owner?: UserSlim;
    title: string;
    description?: string;
    fromCity: string;
    toCity: string;
    price: number;
    vehicleType?: string;
    capacity?: number;
    rating?: number;
    status: TransportStatus;
    createdAt?: Timestamp;
}

// ============ Showroom Types ============

export interface Showroom {
    id: string;
    ownerId: string;
    owner?: UserSlim;
    name: string;
    description?: string;
    logo?: string;
    coverImage?: string;
    address?: string;
    city?: string;
    phone?: string;
    rating?: number;
    vehicleCount?: number;
    verified?: boolean;
    createdAt?: Timestamp;
}

// ============ API Types ============

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ApiError {
    code: string;
    message: string;
    field?: string;
}

// ============ Notification Types ============

export type NotificationType =
    | 'BID_PLACED'
    | 'BID_OUTBID'
    | 'AUCTION_WON'
    | 'AUCTION_ENDED'
    | 'MESSAGE_RECEIVED'
    | 'PAYMENT_RECEIVED'
    | 'SYSTEM';

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    read?: boolean;
    data?: Record<string, unknown>;
    createdAt: Timestamp;
}

// ============ UI Component Types ============

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface TableColumn<T = unknown> {
    key: keyof T | string;
    title: string;
    sortable?: boolean;
    render?: (value: unknown, record: T) => React.ReactNode;
}

export interface FilterOption {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';
    value: unknown;
}

// ============ Socket Event Types ============

export interface SocketEvents {
    // Chat events
    'chat:message:new': (data: { conversationId: string; message: Message; }) => void;
    'chat:typing': (data: { conversationId: string; userId: string; }) => void;

    // Auction events
    'auction:bid:new': (data: { auctionId: string; bid: Bid; }) => void;
    'auction:ended': (data: { auctionId: string; winnerId?: string; }) => void;

    // Notification events
    'notification:new': (data: Notification) => void;
}
