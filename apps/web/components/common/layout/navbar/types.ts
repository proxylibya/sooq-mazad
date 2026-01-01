/**
 * Navbar Types - High Performance
 * تعريفات الأنواع للـ Navbar
 */

export interface User {
    id: string;
    name?: string;
    phone?: string;
    email?: string;
    profileImage?: string;
    accountType?: 'REGULAR_USER' | 'TRANSPORT_OWNER' | 'SHOWROOM' | 'COMPANY';
}

export interface MoreOption {
    title: string;
    link: string;
    isMain: boolean;
    icon: React.ReactNode;
    description: string;
    category?: string;
}

export interface NavbarContextType {
    user: User | null;
    isMenuOpen: boolean;
    setIsMenuOpen: (value: boolean) => void;
    showUserMenu: boolean;
    setShowUserMenu: (value: boolean) => void;
    showAuthModal: boolean;
    setShowAuthModal: (value: boolean) => void;
    handleSignOut: () => Promise<void>;
    safeNavigate: (path: string) => void;
    isActivePath: (path: string) => boolean;
    isTransportOwner: () => boolean;
    isShowroom: () => boolean;
}
