/**
 * useAuctionPage - High Performance Hook
 * Hook محسن لصفحة تفاصيل المزاد
 * يجمع كل المنطق في مكان واحد لتقليل re-renders
 * 
 * @description هذا Hook يوفر إدارة موحدة لحالة صفحة المزاد
 * مما يقلل من تعقيد الصفحة الرئيسية ويحسن الأداء
 */

import { calculateMinimumBid } from '@/utils/auctionHelpers';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useAuthProtection from './useAuthProtection';
import { useBidders } from './useBidders';
import { useFavorites } from './useFavorites';

// Types
export interface AuctionPageData {
    id?: string;
    title?: string;
    brand?: string;
    model?: string;
    year?: number;
    status?: string;
    currentPrice?: number;
    startingPrice?: number;
    buyNowPrice?: number;
    minimumBidIncrement?: number;
    sellerId?: string;
    seller?: {
        id: string;
        name?: string;
        phone?: string;
        profileImage?: string;
    };
    car?: {
        id: string;
        title?: string;
        images?: string[];
        mileage?: number;
        condition?: string;
        fuelType?: string;
        transmission?: string;
    };
    endTime?: string;
    totalBids?: number;
    viewCount?: number;
}

export interface BidHistoryItem {
    id: number;
    bidder: string;
    amount: string;
    time: string;
    isWinning: boolean;
}

export interface NotificationState {
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'info' | '';
    message: string;
}

/**
 * useAuctionPage - Main hook for auction page
 * محسن للأداء العالي مع مئات الآلاف من الزيارات
 */
export function useAuctionPage(auctionId?: string) {
    const router = useRouter();

    // Auth protection
    const {
        isAuthenticated,
        user,
        showAuthModal,
        setShowAuthModal,
        requireLogin,
        handleAuthSuccess,
        handleAuthClose,
    } = useAuthProtection({
        showModal: false,
        requireAuth: false,
    });

    // Favorites
    const { isFavorite: isFavoriteFn, toggleFavorite } = useFavorites();
    const isFavorite = useMemo(
        () => (auctionId ? isFavoriteFn(undefined, auctionId) : false),
        [auctionId, isFavoriteFn]
    );

    // UI State - مجمعة للأداء
    const [uiState, setUiState] = useState({
        activeImageIndex: 0,
        bidIncrease: '',
        showBidModal: false,
        showShareModal: false,
        showRelistModal: false,
        isSubmittingBid: false,
        isCurrentBidAnimating: false,
    });

    // Notification state
    const [notification, setNotification] = useState<NotificationState>({
        show: false,
        type: '',
        message: '',
    });

    // Auction data state
    const [auctionData, setAuctionData] = useState<AuctionPageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Bid history
    const [bidHistory, setBidHistory] = useState<BidHistoryItem[]>([]);

    // Bidders hook
    const { bidders, isLoading: biddersLoading, refetch: refetchBidders } = useBidders(auctionId);

    // Fetch auction data
    useEffect(() => {
        if (!auctionId) return;

        const fetchAuction = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/auctions/${auctionId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch auction');
                }

                const data = await response.json();
                setAuctionData(data.auction || data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'خطأ في تحميل المزاد');
            } finally {
                setLoading(false);
            }
        };

        fetchAuction();
    }, [auctionId]);

    // Computed values - memoized
    const computedValues = useMemo(() => {
        if (!auctionData) return null;

        const currentPrice = auctionData.currentPrice || auctionData.startingPrice || 0;
        const minimumBid = calculateMinimumBid(String(currentPrice));
        const isOwner = user?.id === auctionData.sellerId;
        const canBid = isAuthenticated && !isOwner;

        return {
            currentPrice,
            minimumBid,
            isOwner,
            canBid,
            totalBids: auctionData.totalBids || 0,
            viewCount: auctionData.viewCount || 0,
        };
    }, [auctionData, user?.id, isAuthenticated]);

    // Actions - memoized callbacks
    const actions = useMemo(() => ({
        // Toggle favorite
        handleToggleFavorite: () => {
            if (!isAuthenticated) {
                requireLogin();
                return;
            }
            if (auctionId) {
                toggleFavorite(undefined, auctionId);
            }
        },

        // Open bid modal
        openBidModal: () => {
            if (!isAuthenticated) {
                requireLogin();
                return;
            }
            setUiState(prev => ({ ...prev, showBidModal: true }));
        },

        // Close bid modal
        closeBidModal: () => {
            setUiState(prev => ({ ...prev, showBidModal: false }));
        },

        // Set bid amount
        setBidAmount: (amount: string) => {
            setUiState(prev => ({ ...prev, bidIncrease: amount }));
        },

        // Set active image
        setActiveImage: (index: number) => {
            setUiState(prev => ({ ...prev, activeImageIndex: index }));
        },

        // Show notification
        showNotification: (type: NotificationState['type'], message: string) => {
            setNotification({ show: true, type, message });
            setTimeout(() => {
                setNotification({ show: false, type: '', message: '' });
            }, 5000);
        },

        // Share modal
        openShareModal: () => setUiState(prev => ({ ...prev, showShareModal: true })),
        closeShareModal: () => setUiState(prev => ({ ...prev, showShareModal: false })),

        // Relist modal
        openRelistModal: () => setUiState(prev => ({ ...prev, showRelistModal: true })),
        closeRelistModal: () => setUiState(prev => ({ ...prev, showRelistModal: false })),
    }), [isAuthenticated, requireLogin, auctionId, toggleFavorite]);

    // Submit bid - separate memoized callback
    const submitBid = useCallback(async (amount: number) => {
        if (!isAuthenticated || !auctionId) {
            requireLogin();
            return { success: false, error: 'يجب تسجيل الدخول' };
        }

        setUiState(prev => ({ ...prev, isSubmittingBid: true }));

        try {
            const response = await fetch(`/api/auctions/${auctionId}/bid`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'فشل في تقديم العرض');
            }

            actions.showNotification('success', 'تم تقديم عرضك بنجاح!');
            actions.closeBidModal();
            refetchBidders();

            return { success: true, data };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'حدث خطأ';
            actions.showNotification('error', message);
            return { success: false, error: message };
        } finally {
            setUiState(prev => ({ ...prev, isSubmittingBid: false }));
        }
    }, [isAuthenticated, auctionId, requireLogin, actions, refetchBidders]);

    return {
        // Router
        router,
        auctionId,

        // Auth
        isAuthenticated,
        user,
        showAuthModal,
        setShowAuthModal,
        handleAuthSuccess,
        handleAuthClose,

        // Data
        auctionData,
        loading,
        error,
        bidHistory,
        bidders,
        biddersLoading,

        // Computed
        ...computedValues,

        // Favorites
        isFavorite,

        // UI State
        ...uiState,

        // Notification
        notification,

        // Actions
        ...actions,
        submitBid,
        refetchBidders,
        setBidHistory,
    };
}

export default useAuctionPage;
