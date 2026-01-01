/**
 * أنواع النماذج الأساسية
 * Base Model Types
 */

// === أنواع المستخدم ===
export interface User {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    profileImage?: string;
    avatar?: string;
    verified?: boolean;
    rating?: number;
    accountType?: 'individual' | 'dealer' | 'company';
    role?: string;
    status?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

// === أنواع السيارة ===
export interface Car {
    id: string;
    title: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    images?: string | string[];
    condition?: string;
    mileage?: number;
    location?: string;
    description?: string;
    fuelType?: string;
    transmission?: string;
    bodyType?: string;
    color?: string;
    sellerId?: string;
    seller?: User;
    users?: User;
    status?: string;
    featured?: boolean;
    views?: number;
    isAuction?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    car_images?: CarImage[];
    auctions?: Auction[];
}

export interface CarImage {
    id?: string;
    fileUrl: string;
    fileName?: string;
    isPrimary?: boolean;
    createdAt?: Date | string;
}

// === أنواع المزاد ===
export interface Auction {
    id: string;
    title: string;
    description?: string;
    carId?: string;
    car?: Car;
    cars?: Car;
    sellerId: string;
    seller?: User;
    users?: User;
    currentPrice: number;
    startPrice: number;
    status: AuctionStatus;
    startTime?: Date | string;
    startDate?: Date | string;
    endTime?: Date | string;
    endDate?: Date | string;
    featured?: boolean;
    views?: number;
    totalBids?: number;
    bids?: Bid[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export type AuctionStatus = 'PENDING' | 'UPCOMING' | 'ACTIVE' | 'ENDED' | 'CANCELLED' | 'SOLD' | 'live' | 'ended' | 'upcoming' | 'sold';

// === أنواع المزايدة ===
export interface Bid {
    id: string;
    amount: number;
    auctionId?: string;
    auction?: Auction;
    bidderId: string;
    bidder?: User;
    users?: User;
    createdAt?: Date | string;
}

// === أنواع المحادثة ===
export interface Conversation {
    id: string;
    participants?: User[];
    messages?: Message[];
    lastMessage?: Message;
    unreadCount?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface Message {
    id: string;
    content: string;
    senderId: string;
    sender?: User;
    conversationId: string;
    read?: boolean;
    createdAt?: Date | string;
}

// === أنواع المعرض ===
export interface Showroom {
    id: string;
    name: string;
    description?: string;
    logo?: string;
    coverImage?: string;
    location?: string;
    phone?: string;
    email?: string;
    website?: string;
    verified?: boolean;
    rating?: number;
    ownerId?: string;
    owner?: User;
    cars?: Car[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

// === أنواع التقييم ===
export interface Review {
    id: string;
    rating: number;
    comment?: string;
    reviewerId: string;
    reviewer?: User;
    targetUserId?: string;
    targetUser?: User;
    carId?: string;
    auctionId?: string;
    parentId?: string;
    replies?: Review[];
    createdAt?: Date | string;
}

// === أنواع المحفظة ===
export interface Wallet {
    id: string;
    userId: string;
    balance: number;
    currency?: string;
    transactions?: Transaction[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface Transaction {
    id: string;
    amount: number;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'REFUND';
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    description?: string;
    walletId?: string;
    userId?: string;
    createdAt?: Date | string;
}

// === أنواع الإشعار ===
export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    userId: string;
    read?: boolean;
    actionUrl?: string;
    createdAt?: Date | string;
}

// === أنواع المفضلة ===
export interface Favorite {
    id: string;
    userId: string;
    carId?: string;
    auctionId?: string;
    car?: Car;
    auction?: Auction;
    createdAt?: Date | string;
}

// === أنواع النقل ===
export interface TransportService {
    id: string;
    title: string;
    description?: string;
    providerId: string;
    provider?: User;
    truckType?: string;
    capacity?: string;
    pricePerKm?: number;
    serviceArea?: string;
    rating?: number;
    status?: string;
    createdAt?: Date | string;
}

// === أنواع الفلاتر ===
export interface CarFilters {
    brand?: string;
    model?: string;
    year?: number;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    fuelType?: string;
    transmission?: string;
    bodyType?: string;
    location?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface AuctionFilters extends CarFilters {
    auctionStatus?: AuctionStatus;
}

// === تصدير جميع الأنواع ===
export type {
    Auction as AuctionType,
    Bid as BidType, Car as CarType, User as UserType
};

