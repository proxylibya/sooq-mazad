/**
 * Prisma Type Aliases
 * توحيد أسماء الأنواع لتوافق الكود القديم مع schema الجديد
 */

import { Prisma } from '@prisma/client';

// Car Types
export type CarWhereInput = Prisma.carsWhereInput;
export type CarFindManyArgs = Prisma.carsFindManyArgs;
export type CarCreateInput = Prisma.carsCreateInput;
export type CarUpdateInput = Prisma.carsUpdateInput;
export type CarSelect = Prisma.carsSelect;
export type CarInclude = Prisma.carsInclude;

// User Types
export type UserWhereInput = Prisma.usersWhereInput;
export type UserFindManyArgs = Prisma.usersFindManyArgs;
export type UserCreateInput = Prisma.usersCreateInput;
export type UserUpdateInput = Prisma.usersUpdateInput;
export type UserSelect = Prisma.usersSelect;

// Auction Types
export type AuctionWhereInput = Prisma.auctionsWhereInput;
export type AuctionFindManyArgs = Prisma.auctionsFindManyArgs;
export type AuctionCreateInput = Prisma.auctionsCreateInput;
export type AuctionUpdateInput = Prisma.auctionsUpdateInput;

// Bid Types
export type BidWhereInput = Prisma.bidsWhereInput;
export type BidCreateInput = Prisma.bidsCreateInput;

// Review Types
export type ReviewWhereInput = Prisma.reviewsWhereInput;
export type ReviewCreateInput = Prisma.reviewsCreateInput;

// Conversation Types
export type ConversationWhereInput = Prisma.conversationsWhereInput;
export type MessageWhereInput = Prisma.messagesWhereInput;

// Showroom Types
export type ShowroomWhereInput = Prisma.showroomsWhereInput;
export type ShowroomFindManyArgs = Prisma.showroomsFindManyArgs;

// Transaction Types
export type TransactionWhereInput = Prisma.transactionsWhereInput;
export type TransactionCreateInput = Prisma.transactionsCreateInput;

// Wallet Types
export type WalletWhereInput = Prisma.walletsWhereInput;

// Notification Types
export type NotificationWhereInput = Prisma.notificationsWhereInput;
export type NotificationCreateInput = Prisma.notificationsCreateInput;

// Favorite Types
export type FavoriteWhereInput = Prisma.favoritesWhereInput;
export type FavoriteCreateInput = Prisma.favoritesCreateInput;

// Common filter types
export type IntFilter = Prisma.IntFilter;
export type FloatFilter = Prisma.FloatFilter;
export type StringFilter = Prisma.StringFilter;
export type DateTimeFilter = Prisma.DateTimeFilter;
export type BoolFilter = Prisma.BoolFilter;

// Re-export all Prisma types
export * from '@prisma/client';
