/**
 * useAuctionsPage - High Performance Hook
 * Hook محسن لصفحة قائمة المزادات
 * 
 * @description يوفر إدارة موحدة للفلاتر والمزادات
 * محسن لتحمل مئات الآلاف من الزيارات
 */

import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useAuthProtection from './useAuthProtection';
import { useFavorites } from './useFavorites';
import { usePagination } from './usePagination';

// ============ Types ============

export interface AuctionFilters {
    status: 'all' | 'active' | 'upcoming' | 'ended';
    sortBy: 'newest' | 'ending-soon' | 'price-low' | 'price-high' | 'most-bids';
    location: string;
    brand: string;
    model: string;
    minYear: number | null;
    maxYear: number | null;
    minPrice: number | null;
    maxPrice: number | null;
    searchQuery: string;
}

export interface AuctionStats {
    live: number;
    upcoming: number;
    ended: number;
    total: number;
}

export interface AuctionItem {
    id: string;
    title: string;
    startingPrice: number;
    currentPrice: number;
    endTime: string | Date;
    status: string;
    car: {
        id: string;
        brand: string;
        model: string;
        year: number | null;
        images: string[];
        mileage?: number;
        location?: string;
    };
    bids: Array<{ id: string; amount: number; }>;
    featured?: boolean;
}

// ============ Default Values ============

const DEFAULT_FILTERS: AuctionFilters = {
    status: 'all',
    sortBy: 'newest',
    location: 'جميع المدن',
    brand: '',
    model: '',
    minYear: null,
    maxYear: null,
    minPrice: null,
    maxPrice: null,
    searchQuery: '',
};

// ============ Main Hook ============

export function useAuctionsPage(
    initialAuctions: AuctionItem[] = [],
    initialStats: AuctionStats = { live: 0, upcoming: 0, ended: 0, total: 0 }
) {
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
    const { isFavorite, toggleFavorite } = useFavorites();

    // ========== State ==========
    const [auctions, setAuctions] = useState<AuctionItem[]>(initialAuctions);
    const [stats, setStats] = useState<AuctionStats>(initialStats);
    const [filters, setFilters] = useState<AuctionFilters>(DEFAULT_FILTERS);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFiltersPanel, setShowFiltersPanel] = useState(false);

    // Pagination
    const pagination = usePagination({
        totalItems: stats.total,
        itemsPerPage: 12,
    });

    // ========== Filter Handlers ==========
    const updateFilter = useCallback(<K extends keyof AuctionFilters>(
        key: K,
        value: AuctionFilters[K]
    ) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        pagination.setPage(1);
    }, [pagination]);

    const resetFilters = useCallback(() => {
        setFilters(DEFAULT_FILTERS);
        pagination.setPage(1);
    }, [pagination]);

    const setSearchQuery = useCallback((query: string) => {
        updateFilter('searchQuery', query);
    }, [updateFilter]);

    const setStatus = useCallback((status: AuctionFilters['status']) => {
        updateFilter('status', status);
    }, [updateFilter]);

    const setSortBy = useCallback((sortBy: AuctionFilters['sortBy']) => {
        updateFilter('sortBy', sortBy);
    }, [updateFilter]);

    const setLocation = useCallback((location: string) => {
        updateFilter('location', location);
    }, [updateFilter]);

    const setBrandModel = useCallback((brand: string, model: string) => {
        setFilters(prev => ({ ...prev, brand, model }));
        pagination.setPage(1);
    }, [pagination]);

    const setYearRange = useCallback((minYear: number | null, maxYear: number | null) => {
        setFilters(prev => ({ ...prev, minYear, maxYear }));
        pagination.setPage(1);
    }, [pagination]);

    const setPriceRange = useCallback((minPrice: number | null, maxPrice: number | null) => {
        setFilters(prev => ({ ...prev, minPrice, maxPrice }));
        pagination.setPage(1);
    }, [pagination]);

    // ========== Filtered & Sorted Auctions ==========
    const filteredAuctions = useMemo(() => {
        let result = [...auctions];

        // Filter by status
        if (filters.status !== 'all') {
            result = result.filter(a => {
                const status = a.status.toLowerCase();
                if (filters.status === 'active') return status === 'active';
                if (filters.status === 'upcoming') return status === 'upcoming' || status === 'scheduled';
                if (filters.status === 'ended') return status === 'ended' || status === 'sold';
                return true;
            });
        }

        // Filter by search query
        if (filters.searchQuery.trim()) {
            const query = filters.searchQuery.toLowerCase();
            result = result.filter(a =>
                a.title.toLowerCase().includes(query) ||
                a.car.brand.toLowerCase().includes(query) ||
                a.car.model.toLowerCase().includes(query)
            );
        }

        // Filter by location
        if (filters.location && filters.location !== 'جميع المدن') {
            result = result.filter(a => a.car.location === filters.location);
        }

        // Filter by brand
        if (filters.brand) {
            result = result.filter(a => a.car.brand === filters.brand);
        }

        // Filter by model
        if (filters.model) {
            result = result.filter(a => a.car.model === filters.model);
        }

        // Filter by year range
        if (filters.minYear) {
            result = result.filter(a => a.car.year && a.car.year >= filters.minYear!);
        }
        if (filters.maxYear) {
            result = result.filter(a => a.car.year && a.car.year <= filters.maxYear!);
        }

        // Filter by price range
        if (filters.minPrice) {
            result = result.filter(a => a.currentPrice >= filters.minPrice!);
        }
        if (filters.maxPrice) {
            result = result.filter(a => a.currentPrice <= filters.maxPrice!);
        }

        // Sort
        switch (filters.sortBy) {
            case 'ending-soon':
                result.sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime());
                break;
            case 'price-low':
                result.sort((a, b) => a.currentPrice - b.currentPrice);
                break;
            case 'price-high':
                result.sort((a, b) => b.currentPrice - a.currentPrice);
                break;
            case 'most-bids':
                result.sort((a, b) => b.bids.length - a.bids.length);
                break;
            case 'newest':
            default:
                // Keep original order (newest first from server)
                break;
        }

        // Featured auctions first
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

        return result;
    }, [auctions, filters]);

    // ========== Paginated Auctions ==========
    const paginatedAuctions = useMemo(() => {
        const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
        const end = start + pagination.itemsPerPage;
        return filteredAuctions.slice(start, end);
    }, [filteredAuctions, pagination.currentPage, pagination.itemsPerPage]);

    // ========== Active Filters Count ==========
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.status !== 'all') count++;
        if (filters.location !== 'جميع المدن') count++;
        if (filters.brand) count++;
        if (filters.model) count++;
        if (filters.minYear || filters.maxYear) count++;
        if (filters.minPrice || filters.maxPrice) count++;
        if (filters.searchQuery) count++;
        return count;
    }, [filters]);

    // ========== Favorite Handler ==========
    const handleToggleFavorite = useCallback((auctionId: string) => {
        if (!isAuthenticated) {
            requireLogin();
            return;
        }
        toggleFavorite(undefined, auctionId);
    }, [isAuthenticated, requireLogin, toggleFavorite]);

    // ========== Fetch Fresh Data ==========
    const refreshAuctions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/auctions');
            if (!response.ok) throw new Error('فشل في تحميل المزادات');

            const data = await response.json();
            setAuctions(data.auctions || []);
            if (data.stats) setStats(data.stats);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'خطأ في تحميل المزادات');
        } finally {
            setLoading(false);
        }
    }, []);

    // ========== URL Sync ==========
    useEffect(() => {
        const { status, sort, location, brand, model, q } = router.query;

        setFilters(prev => ({
            ...prev,
            status: (status as AuctionFilters['status']) || 'all',
            sortBy: (sort as AuctionFilters['sortBy']) || 'newest',
            location: (location as string) || 'جميع المدن',
            brand: (brand as string) || '',
            model: (model as string) || '',
            searchQuery: (q as string) || '',
        }));
    }, [router.query]);

    // ========== Return ==========
    return {
        // Auth
        isAuthenticated,
        user,
        showAuthModal,
        setShowAuthModal,
        handleAuthSuccess,
        handleAuthClose,

        // Data
        auctions: paginatedAuctions,
        allAuctions: filteredAuctions,
        stats,
        loading,
        error,

        // Filters
        filters,
        updateFilter,
        resetFilters,
        setSearchQuery,
        setStatus,
        setSortBy,
        setLocation,
        setBrandModel,
        setYearRange,
        setPriceRange,
        activeFiltersCount,

        // View
        viewMode,
        setViewMode,
        showFiltersPanel,
        setShowFiltersPanel,

        // Pagination
        pagination,

        // Actions
        handleToggleFavorite,
        isFavorite,
        refreshAuctions,
        setAuctions,
    };
}

export default useAuctionsPage;
