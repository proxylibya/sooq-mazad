/**
 * ═══════════════════════════════════════════════════════════════
 * 🗄️ PRISMA TYPE EXTENSIONS
 * توسعات أنواع Prisma لتوافق الكود القديم
 * ═══════════════════════════════════════════════════════════════
 */

import { Prisma } from '@prisma/client';

// === Type Aliases for backward compatibility ===
declare global {
    namespace PrismaTypes {
        // Car types
        type CarWhereInput = Prisma.carsWhereInput;
        type CarFindManyArgs = Prisma.carsFindManyArgs;
        type CarCreateInput = Prisma.carsCreateInput;
        type CarUpdateInput = Prisma.carsUpdateInput;
        type CarSelect = Prisma.carsSelect;
        type CarInclude = Prisma.carsInclude;

        // User types
        type UserWhereInput = Prisma.usersWhereInput;
        type UserFindManyArgs = Prisma.usersFindManyArgs;
        type UserCreateInput = Prisma.usersCreateInput;
        type UserUpdateInput = Prisma.usersUpdateInput;
        type UserSelect = Prisma.usersSelect;

        // Auction types
        type AuctionWhereInput = Prisma.auctionsWhereInput;
        type AuctionFindManyArgs = Prisma.auctionsFindManyArgs;
        type AuctionCreateInput = Prisma.auctionsCreateInput;
        type AuctionUpdateInput = Prisma.auctionsUpdateInput;

        // Bid types
        type BidWhereInput = Prisma.bidsWhereInput;
        type BidCreateInput = Prisma.bidsCreateInput;

        // Settings types
        type UserSettingsUpdateInput = Prisma.user_settingsUpdateInput;
        type UserSettingsCreateInput = Prisma.user_settingsCreateInput;

        // Transaction types
        type TransactionWhereInput = Prisma.transactionsWhereInput;
        type TransactionCreateInput = Prisma.transactionsCreateInput;

        // Common filter types
        type IntFilter = Prisma.IntFilter;
        type FloatFilter = Prisma.FloatFilter;
        type StringFilter = Prisma.StringFilter;
        type DateTimeFilter = Prisma.DateTimeFilter;
        type BoolFilter = Prisma.BoolFilter;
    }
}

// === Augment Prisma namespace ===
declare module '@prisma/client' {
    namespace Prisma {
        // Legacy type aliases
        export type CarWhereInput = carsWhereInput;
        export type CarFindManyArgs = carsFindManyArgs;
        export type CarCreateInput = carsCreateInput;
        export type CarUpdateInput = carsUpdateInput;

        export type UserWhereInput = usersWhereInput;
        export type UserFindManyArgs = usersFindManyArgs;
        export type UserCreateInput = usersCreateInput;
        export type UserUpdateInput = usersUpdateInput;

        export type AuctionWhereInput = auctionsWhereInput;
        export type AuctionFindManyArgs = auctionsFindManyArgs;
        export type AuctionCreateInput = auctionsCreateInput;

        export type BidWhereInput = bidsWhereInput;
        export type BidCreateInput = bidsCreateInput;

        export type UserSettingsUpdateInput = user_settingsUpdateInput;
        export type UserSettingsCreateInput = user_settingsCreateInput;

        export type TransactionWhereInput = transactionsWhereInput;
        export type TransactionCreateInput = transactionsCreateInput;

        export type ReviewWhereInput = reviewsWhereInput;
        export type NotificationWhereInput = notificationsWhereInput;
        export type FavoriteWhereInput = favoritesWhereInput;
        export type ConversationWhereInput = conversationsWhereInput;
        export type MessageWhereInput = messagesWhereInput;
        export type ShowroomWhereInput = showroomsWhereInput;
        export type WalletWhereInput = walletsWhereInput;
    }
}

export { };

