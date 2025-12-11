/**
 * Session Manager - للتوافقية مع الكود القديم
 */

// دوال مساعدة للتوافقية
export class SessionManager {
    static getCurrentUser(): any {
        if (typeof window === 'undefined') return null;
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch {
            return null;
        }
    }

    static getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('token');
    }

    // Alias للتوافق مع useAuth
    static getCurrentToken(): string | null {
        return this.getToken();
    }

    static isAuthenticated(): boolean {
        return !!this.getCurrentUser() && !!this.getToken();
    }

    static clearSession(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authSession');
        localStorage.removeItem('wallet');

        // مسح الـ cookie أيضاً عبر API
        fetch('/api/auth/logout', { method: 'POST' }).catch(() => { });
    }

    static setUser(user: any): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem('user', JSON.stringify(user));
    }

    static setToken(token: string): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem('token', token);
    }

    static updateUser(userData: Partial<any>): void {
        if (typeof window === 'undefined') return;
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            const updatedUser = { ...currentUser, ...userData };
            this.setUser(updatedUser);
        }
    }

    static updateProfileImage(imageUrl: string): void {
        this.updateUser({ profileImage: imageUrl });
    }

    static async logout(redirectUrl: string = '/'): Promise<void> {
        this.clearSession();

        // مسح الـ cookie عبر API
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'same-origin'
            });
        } catch (error) {
            console.error('Error during logout:', error);
        }

        // إعادة التوجيه
        if (typeof window !== 'undefined' && redirectUrl) {
            window.location.href = redirectUrl;
        }
    }
}

export default SessionManager;
