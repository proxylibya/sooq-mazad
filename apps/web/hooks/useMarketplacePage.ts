/**
 * useMarketplacePage - High Performance Hook
 * Hook محسن لصفحة تفاصيل السوق الفوري
 * 
 * @description يوفر إدارة موحدة لتفاصيل السيارة والتفاعلات
 * محسن لتحمل مئات الآلاف من الزيارات
 */

import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import { useFavorites } from './useFavorites';

// ============ Types ============

export interface CarImage {
    id?: string;
    url: string;
    isPrimary?: boolean;
}

export interface CarSeller {
    id: string;
    name: string;
    phone?: string;
    profileImage?: string;
    verified?: boolean;
    accountType?: string;
    rating?: number;
    totalListings?: number;
    memberSince?: string;
}

export interface CarListing {
    id: string;
    title: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    mileage?: number;
    condition?: string;
    fuelType?: string;
    transmission?: string;
    bodyType?: string;
    color?: string;
    description?: string;
    images: string[];
    location?: {
        city?: string;
        area?: string;
        lat?: number;
        lng?: number;
    };
    features?: string[];
    seller: CarSeller;
    status?: string;
    viewCount?: number;
    favoritesCount?: number;
    createdAt?: string;
    // Promotion
    featured?: boolean;
    promotionPackage?: string;
}

export interface NotificationState {
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'info' | '';
    message: string;
}

// ============ Main Hook ============

export function useMarketplacePage(listingId?: string) {
    const router = useRouter();
    const { user } = useAuth();
    const { isFavorite: isFavoriteFn, toggleFavorite } = useFavorites();

    // ========== State ==========
    const [listing, setListing] = useState<CarListing | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showContactInfo, setShowContactInfo] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

    // Notification
    const [notification, setNotification] = useState<NotificationState>({
        show: false,
        type: '',
        message: '',
    });

    // ========== Computed Values ==========
    const isFavorite = useMemo(() => {
        return listingId ? isFavoriteFn(listingId, undefined) : false;
    }, [listingId, isFavoriteFn]);

    const isOwner = useMemo(() => {
        return user?.id === listing?.seller?.id;
    }, [user?.id, listing?.seller?.id]);

    const images = useMemo(() => {
        if (!listing?.images?.length) return ['/images/car-placeholder.jpg'];
        return listing.images;
    }, [listing?.images]);

    const formattedPrice = useMemo(() => {
        if (!listing?.price) return 'السعر عند الاتصال';
        return new Intl.NumberFormat('ar-LY', {
            style: 'decimal',
            maximumFractionDigits: 0,
        }).format(listing.price) + ' د.ل';
    }, [listing?.price]);

    // ========== Fetch Listing ==========
    useEffect(() => {
        if (!listingId) return;

        const fetchListing = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/cars/${listingId}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('السيارة غير موجودة');
                    }
                    throw new Error('فشل في تحميل بيانات السيارة');
                }

                const data = await response.json();
                if (data.success && data.data) {
                    setListing(data.data);
                } else {
                    throw new Error('بيانات غير صالحة');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'خطأ في تحميل السيارة');
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, [listingId]);

    // ========== Image Navigation ==========
    const nextImage = useCallback(() => {
        setCurrentImageIndex(prev => (prev + 1) % images.length);
    }, [images.length]);

    const prevImage = useCallback(() => {
        setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    const goToImage = useCallback((index: number) => {
        setCurrentImageIndex(index);
    }, []);

    const handleImageError = useCallback((index: number) => {
        setImageErrors(prev => ({ ...prev, [index]: true }));
    }, []);

    // ========== Actions ==========
    const showNotification = useCallback((type: NotificationState['type'], message: string) => {
        setNotification({ show: true, type, message });
        setTimeout(() => {
            setNotification({ show: false, type: '', message: '' });
        }, 4000);
    }, []);

    const handleToggleFavorite = useCallback(() => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }
        if (listingId) {
            toggleFavorite(listingId, undefined);
            showNotification('success', isFavorite ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة');
        }
    }, [user, listingId, toggleFavorite, isFavorite, showNotification]);

    const handleContact = useCallback(() => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }
        setShowContactInfo(true);
    }, [user]);

    const handleStartChat = useCallback(async () => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }
        if (!listing?.seller?.id) return;

        try {
            const response = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    participantId: listing.seller.id,
                    carId: listingId,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                router.push(`/messages?conversationId=${data.conversation?.id || data.id}`);
            } else {
                showNotification('error', 'فشل في بدء المحادثة');
            }
        } catch {
            showNotification('error', 'حدث خطأ في الاتصال');
        }
    }, [user, listing?.seller?.id, listingId, router, showNotification]);

    const handleShare = useCallback(async () => {
        const url = window.location.href;
        const title = listing?.title || 'سيارة للبيع';

        if (navigator.share) {
            try {
                await navigator.share({ title, url });
            } catch {
                // User cancelled or error
            }
        } else {
            setShowShareModal(true);
        }
    }, [listing?.title]);

    const copyLink = useCallback(() => {
        navigator.clipboard.writeText(window.location.href);
        showNotification('success', 'تم نسخ الرابط');
        setShowShareModal(false);
    }, [showNotification]);

    const handleAuthSuccess = useCallback(() => {
        setShowAuthModal(false);
        showNotification('success', 'تم تسجيل الدخول بنجاح');
    }, [showNotification]);

    // ========== Return ==========
    return {
        // Router
        router,
        listingId,

        // Auth
        user,
        showAuthModal,
        setShowAuthModal,
        handleAuthSuccess,

        // Data
        listing,
        loading,
        error,

        // Images
        images,
        currentImageIndex,
        imageErrors,
        nextImage,
        prevImage,
        goToImage,
        handleImageError,

        // Computed
        isFavorite,
        isOwner,
        formattedPrice,

        // UI State
        showContactInfo,
        setShowContactInfo,
        showContactModal,
        setShowContactModal,
        showShareModal,
        setShowShareModal,
        notification,

        // Actions
        handleToggleFavorite,
        handleContact,
        handleStartChat,
        handleShare,
        copyLink,
        showNotification,
        setListing,
    };
}

export default useMarketplacePage;
