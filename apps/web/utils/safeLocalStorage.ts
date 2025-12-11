/**
 * Safe LocalStorage
 * نظام تخزين آمن يعمل في بيئة SSR
 */

class SafeLocalStorage {
    private isAvailable: boolean;

    constructor() {
        this.isAvailable = this.checkAvailability();
    }

    private checkAvailability(): boolean {
        if (typeof window === 'undefined') return false;
        try {
            const test = '__storage_test__';
            window.localStorage.setItem(test, test);
            window.localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    // Instance methods
    getItem(key: string): string | null {
        if (!this.isAvailable) return null;
        try {
            return window.localStorage.getItem(key);
        } catch {
            return null;
        }
    }

    setItem(key: string, value: string): boolean {
        if (!this.isAvailable) return false;
        try {
            window.localStorage.setItem(key, value);
            return true;
        } catch {
            return false;
        }
    }

    removeItem(key: string): boolean {
        if (!this.isAvailable) return false;
        try {
            window.localStorage.removeItem(key);
            return true;
        } catch {
            return false;
        }
    }

    clear(): boolean {
        if (!this.isAvailable) return false;
        try {
            window.localStorage.clear();
            return true;
        } catch {
            return false;
        }
    }

    get length(): number {
        if (!this.isAvailable) return 0;
        return window.localStorage.length;
    }

    key(index: number): string | null {
        if (!this.isAvailable) return null;
        return window.localStorage.key(index);
    }

    // JSON methods for instance
    getJSON<T>(key: string, defaultValue: T): T {
        try {
            const value = this.getItem(key);
            if (value === null || value === 'undefined') return defaultValue;
            return JSON.parse(value) as T;
        } catch {
            return defaultValue;
        }
    }

    setJSON<T>(key: string, value: T): boolean {
        try {
            return this.setItem(key, JSON.stringify(value));
        } catch {
            return false;
        }
    }

    // ============ Static Methods ============
    private static checkStaticAvailability(): boolean {
        if (typeof window === 'undefined') return false;
        try {
            const test = '__storage_test__';
            window.localStorage.setItem(test, test);
            window.localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    static getItem(key: string): string | null {
        if (!SafeLocalStorage.checkStaticAvailability()) return null;
        try {
            return window.localStorage.getItem(key);
        } catch {
            return null;
        }
    }

    static setItem(key: string, value: string): boolean {
        if (!SafeLocalStorage.checkStaticAvailability()) return false;
        try {
            window.localStorage.setItem(key, value);
            return true;
        } catch {
            return false;
        }
    }

    static removeItem(key: string): boolean {
        if (!SafeLocalStorage.checkStaticAvailability()) return false;
        try {
            window.localStorage.removeItem(key);
            return true;
        } catch {
            return false;
        }
    }

    static clear(): boolean {
        if (!SafeLocalStorage.checkStaticAvailability()) return false;
        try {
            window.localStorage.clear();
            return true;
        } catch {
            return false;
        }
    }

    static getJSON<T>(key: string, defaultValue: T): T {
        try {
            const value = SafeLocalStorage.getItem(key);
            if (value === null || value === 'undefined') return defaultValue;
            return JSON.parse(value) as T;
        } catch {
            return defaultValue;
        }
    }

    static setJSON<T>(key: string, value: T): boolean {
        try {
            return SafeLocalStorage.setItem(key, JSON.stringify(value));
        } catch {
            return false;
        }
    }
}

export const safeLocalStorage = new SafeLocalStorage();
export { SafeLocalStorage };
export default safeLocalStorage;
