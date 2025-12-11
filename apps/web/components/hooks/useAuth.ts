/**
 * Hook للمصادقة الموحدة
 */

import { useCallback, useEffect, useState } from 'react';

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    profileImage?: string;
    role?: string;
    verified?: boolean;
    accountType?: 'individual' | 'dealer' | 'company';
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface UseAuthReturn extends AuthState {
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    register: (data: RegisterData) => Promise<boolean>;
    refreshUser: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<boolean>;
}

export interface RegisterData {
    name: string;
    email: string;
    phone: string;
    password: string;
}

export function useAuth(): UseAuthReturn {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
    });

    const refreshUser = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const data = await response.json();
                setState({
                    user: data.user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });
            } else {
                setState({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: null,
                });
            }
        } catch {
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: 'فشل في تحميل بيانات المستخدم',
            }));
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                setState({
                    user: data.user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });
                return true;
            } else {
                const error = await response.json();
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: error.message || 'فشل تسجيل الدخول',
                }));
                return false;
            }
        } catch {
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: 'خطأ في الاتصال',
            }));
            return false;
        }
    }, []);

    const logout = useCallback(async (): Promise<void> => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } finally {
            setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        }
    }, []);

    const register = useCallback(async (data: RegisterData): Promise<boolean> => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const result = await response.json();
                setState({
                    user: result.user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });
                return true;
            } else {
                const error = await response.json();
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: error.message || 'فشل التسجيل',
                }));
                return false;
            }
        } catch {
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: 'خطأ في الاتصال',
            }));
            return false;
        }
    }, []);

    const updateProfile = useCallback(async (data: Partial<User>): Promise<boolean> => {
        try {
            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const result = await response.json();
                setState((prev) => ({
                    ...prev,
                    user: result.user,
                }));
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }, []);

    return {
        ...state,
        login,
        logout,
        register,
        refreshUser,
        updateProfile,
    };
}

export default useAuth;
