/**
 * useMyAccount - High Performance Hook
 * Hook محسن لصفحة حسابي
 * 
 * @description يوفر إدارة موحدة لبيانات الحساب والإعلانات
 * محسن لتحمل مئات الآلاف من الزيارات
 */

import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useAuth from './useAuth';

// ============ Types ============

export interface UserListing {
    id: string;
    title: string;
    type: 'car' | 'auction';
    status: string;
    location: string;
    image?: string;
    price?: string;
    views?: number;
    favorites?: number;
    messages?: number;
    createdAt: string;
    // Auction specific
    bidCount?: number;
    auctionType?: string;
    // Promotion
    isPromoted?: boolean;
    promotionExpiry?: string;
    promotionType?: string;
}

export interface UserReview {
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    reviewer?: {
        name?: string;
        profileImage?: string;
        verified?: boolean;
    };
    serviceType?: string;
}

export interface AccountStats {
    totalListings: number;
    activeListings: number;
    totalViews: number;
    totalFavorites: number;
    totalMessages: number;
    averageRating: number;
    totalReviews: number;
}

export type TabType = 'listings' | 'auctions' | 'favorites' | 'reviews' | 'settings';

// ============ Main Hook ============

export function useMyAccount() {
    const router = useRouter();
    const { user, isLoading: authLoading, updateUser } = useAuth();

    // ========== State ==========
    const [activeTab, setActiveTab] = useState<TabType>('listings');
    const [listings, setListings] = useState<UserListing[]>([]);
    const [reviews, setReviews] = useState<UserReview[]>([]);
    const [stats, setStats] = useState<AccountStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');

    // Modals
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedListing, setSelectedListing] = useState<{ id: string; title: string; } | null>(null);
    const [showMobileMenu, setShowMobileMenu] = useState<string | null>(null);

    // Rating Modal
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);
    const [ratingComment, setRatingComment] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);

    // ========== Auth Check ==========
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (!authLoading && !user) {
                router.push('/?callbackUrl=' + encodeURIComponent('/my-account'));
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [user, authLoading, router]);

    // ========== URL Tab Sync ==========
    useEffect(() => {
        const tab = router.query.tab as string;
        if (tab && ['listings', 'auctions', 'favorites', 'reviews', 'settings'].includes(tab)) {
            setActiveTab(tab as TabType);
        }
    }, [router.query.tab]);

    // ========== Fetch Listings ==========
    const fetchListings = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/my/listings');
            if (!response.ok) throw new Error('فشل في تحميل الإعلانات');

            const data = await response.json();
            setListings(data.listings || []);
            if (data.stats) setStats(data.stats);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'خطأ في تحميل الإعلانات');
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    // ========== Fetch Reviews ==========
    const fetchReviews = useCallback(async () => {
        if (!user?.id) return;

        try {
            setReviewsLoading(true);

            const response = await fetch(`/api/reviews?userId=${user.id}&type=received&limit=20`);
            if (!response.ok) throw new Error('فشل في تحميل التقييمات');

            const data = await response.json();
            setReviews(data.data || []);
        } catch (err) {
            console.error('Error fetching reviews:', err);
        } finally {
            setReviewsLoading(false);
        }
    }, [user?.id]);

    // ========== Initial Load ==========
    useEffect(() => {
        if (user?.id) {
            fetchListings();
        }
    }, [user?.id, fetchListings]);

    useEffect(() => {
        if (user?.id && activeTab === 'reviews') {
            fetchReviews();
        }
    }, [user?.id, activeTab, fetchReviews]);

    // ========== Filtered Listings ==========
    const filteredListings = useMemo(() => {
        let result = [...listings];

        // Filter by search term
        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase();
            result = result.filter(l => l.title.toLowerCase().includes(query));
        }

        // Filter by status
        if (filterStatus !== 'all') {
            result = result.filter(l => l.status.toLowerCase() === filterStatus.toLowerCase());
        }

        // Filter by type
        if (filterType !== 'all') {
            result = result.filter(l => l.type === filterType);
        }

        return result;
    }, [listings, searchTerm, filterStatus, filterType]);

    // ========== Actions ==========
    const handleTabChange = useCallback((tab: TabType) => {
        setActiveTab(tab);
        router.push(`/my-account?tab=${tab}`, undefined, { shallow: true });
    }, [router]);

    const handleDeleteListing = useCallback(async () => {
        if (!selectedListing) return;

        try {
            const response = await fetch(`/api/listings/${selectedListing.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('فشل في حذف الإعلان');

            setListings(prev => prev.filter(l => l.id !== selectedListing.id));
            setShowDeleteModal(false);
            setSelectedListing(null);
        } catch (err) {
            console.error('Error deleting listing:', err);
        }
    }, [selectedListing]);

    const confirmDelete = useCallback((listing: { id: string; title: string; }) => {
        setSelectedListing(listing);
        setShowDeleteModal(true);
    }, []);

    const handleEditListing = useCallback((listingId: string, type: string) => {
        if (type === 'auction') {
            router.push(`/auction/${listingId}/edit`);
        } else {
            router.push(`/edit-listing/${listingId}`);
        }
    }, [router]);

    const handleViewListing = useCallback((listingId: string, type: string) => {
        if (type === 'auction') {
            router.push(`/auction/${listingId}`);
        } else {
            router.push(`/marketplace/${listingId}`);
        }
    }, [router]);

    const submitRating = useCallback(async () => {
        if (!selectedRating) return;

        try {
            setSubmittingRating(true);
            // API call here
            setShowRatingModal(false);
            setSelectedRating(0);
            setRatingComment('');
        } catch (err) {
            console.error('Error submitting rating:', err);
        } finally {
            setSubmittingRating(false);
        }
    }, [selectedRating]);

    // ========== Computed Values ==========
    const listingStats = useMemo(() => {
        const cars = listings.filter(l => l.type === 'car');
        const auctions = listings.filter(l => l.type === 'auction');
        const active = listings.filter(l => l.status.toLowerCase() === 'active');
        const promoted = listings.filter(l => l.isPromoted);

        return {
            total: listings.length,
            cars: cars.length,
            auctions: auctions.length,
            active: active.length,
            promoted: promoted.length,
        };
    }, [listings]);

    const averageRating = useMemo(() => {
        if (!reviews.length) return 0;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return (sum / reviews.length).toFixed(1);
    }, [reviews]);

    // ========== Return ==========
    return {
        // Auth
        user,
        authLoading,
        updateUser,

        // Tabs
        activeTab,
        handleTabChange,

        // Listings
        listings: filteredListings,
        allListings: listings,
        loading,
        error,
        listingStats,

        // Reviews
        reviews,
        reviewsLoading,
        averageRating,

        // Stats
        stats,

        // Filters
        searchTerm,
        setSearchTerm,
        filterStatus,
        setFilterStatus,
        filterType,
        setFilterType,

        // Modals
        showDeleteModal,
        setShowDeleteModal,
        selectedListing,
        showMobileMenu,
        setShowMobileMenu,

        // Rating
        showRatingModal,
        setShowRatingModal,
        selectedRating,
        setSelectedRating,
        ratingComment,
        setRatingComment,
        submittingRating,

        // Actions
        fetchListings,
        fetchReviews,
        handleDeleteListing,
        confirmDelete,
        handleEditListing,
        handleViewListing,
        submitRating,
    };
}

export default useMyAccount;
