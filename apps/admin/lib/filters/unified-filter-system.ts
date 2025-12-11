/**
 * نظام الفلاتر الموحد - Enterprise Global Filter System
 * نظام فلترة قوي وموحد لجميع الجداول والقوائم
 */

export type FilterOperator =
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'not_contains'
    | 'starts_with'
    | 'ends_with'
    | 'greater_than'
    | 'less_than'
    | 'greater_or_equal'
    | 'less_or_equal'
    | 'between'
    | 'in'
    | 'not_in'
    | 'is_null'
    | 'is_not_null';

export type FilterType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean' | 'daterange';

export interface FilterOption {
    value: string;
    label: string;
    icon?: string;
    color?: string;
}

export interface FilterDefinition {
    id: string;
    label: string;
    type: FilterType;
    field: string;
    operators?: FilterOperator[];
    options?: FilterOption[];
    placeholder?: string;
    defaultValue?: any;
    min?: number;
    max?: number;
    step?: number;
}

export interface ActiveFilter {
    id: string;
    field: string;
    operator: FilterOperator;
    value: any;
    value2?: any; // للعمليات التي تحتاج قيمتين مثل between
}

export interface FilterPreset {
    id: string;
    name: string;
    filters: ActiveFilter[];
    isDefault?: boolean;
}

export interface SortConfig {
    field: string;
    direction: 'asc' | 'desc';
}

export interface FilterState {
    filters: ActiveFilter[];
    search: string;
    sort: SortConfig | null;
    page: number;
    pageSize: number;
}

// الفلاتر الافتراضية للأقسام المختلفة
export const defaultFilterDefinitions: Record<string, FilterDefinition[]> = {
    users: [
        {
            id: 'status', label: 'الحالة', type: 'select', field: 'status', options: [
                { value: 'ACTIVE', label: 'نشط', color: 'green' },
                { value: 'BLOCKED', label: 'محظور', color: 'red' },
                { value: 'SUSPENDED', label: 'معلق', color: 'yellow' },
                { value: 'PENDING', label: 'قيد الانتظار', color: 'blue' },
            ]
        },
        {
            id: 'role', label: 'الدور', type: 'select', field: 'role', options: [
                { value: 'USER', label: 'مستخدم' },
                { value: 'ADMIN', label: 'مدير' },
                { value: 'MODERATOR', label: 'مشرف' },
                { value: 'SUPER_ADMIN', label: 'مدير عام' },
            ]
        },
        { id: 'verified', label: 'موثق', type: 'boolean', field: 'isVerified' },
        { id: 'createdAt', label: 'تاريخ التسجيل', type: 'daterange', field: 'createdAt' },
        {
            id: 'city', label: 'المدينة', type: 'select', field: 'city', options: [
                { value: 'tripoli', label: 'طرابلس' },
                { value: 'benghazi', label: 'بنغازي' },
                { value: 'misrata', label: 'مصراتة' },
                { value: 'sabha', label: 'سبها' },
            ]
        },
    ],
    auctions: [
        {
            id: 'status', label: 'الحالة', type: 'select', field: 'status', options: [
                { value: 'ACTIVE', label: 'نشط', color: 'green' },
                { value: 'PENDING', label: 'قيد الانتظار', color: 'yellow' },
                { value: 'ENDED', label: 'منتهي', color: 'gray' },
                { value: 'CANCELLED', label: 'ملغي', color: 'red' },
            ]
        },
        {
            id: 'brand', label: 'الماركة', type: 'select', field: 'brand', options: [
                { value: 'toyota', label: 'تويوتا' },
                { value: 'mercedes', label: 'مرسيدس' },
                { value: 'bmw', label: 'بي إم دبليو' },
                { value: 'hyundai', label: 'هيونداي' },
            ]
        },
        { id: 'price', label: 'السعر', type: 'number', field: 'currentBid', min: 0, max: 1000000 },
        { id: 'year', label: 'السنة', type: 'number', field: 'year', min: 1990, max: 2025 },
        {
            id: 'city', label: 'المدينة', type: 'select', field: 'city', options: [
                { value: 'tripoli', label: 'طرابلس' },
                { value: 'benghazi', label: 'بنغازي' },
            ]
        },
    ],
    transactions: [
        {
            id: 'type', label: 'النوع', type: 'select', field: 'type', options: [
                { value: 'DEPOSIT', label: 'إيداع', color: 'green' },
                { value: 'WITHDRAWAL', label: 'سحب', color: 'red' },
                { value: 'TRANSFER', label: 'تحويل', color: 'blue' },
                { value: 'FEE', label: 'رسوم', color: 'yellow' },
            ]
        },
        {
            id: 'status', label: 'الحالة', type: 'select', field: 'status', options: [
                { value: 'COMPLETED', label: 'مكتمل', color: 'green' },
                { value: 'PENDING', label: 'قيد الانتظار', color: 'yellow' },
                { value: 'FAILED', label: 'فشل', color: 'red' },
            ]
        },
        { id: 'amount', label: 'المبلغ', type: 'number', field: 'amount', min: 0 },
        { id: 'date', label: 'التاريخ', type: 'daterange', field: 'createdAt' },
    ],
    support: [
        {
            id: 'status', label: 'الحالة', type: 'select', field: 'status', options: [
                { value: 'OPEN', label: 'مفتوحة', color: 'blue' },
                { value: 'IN_PROGRESS', label: 'قيد المعالجة', color: 'yellow' },
                { value: 'RESOLVED', label: 'تم الحل', color: 'green' },
                { value: 'CLOSED', label: 'مغلقة', color: 'gray' },
            ]
        },
        {
            id: 'priority', label: 'الأولوية', type: 'select', field: 'priority', options: [
                { value: 'LOW', label: 'منخفضة', color: 'gray' },
                { value: 'MEDIUM', label: 'متوسطة', color: 'yellow' },
                { value: 'HIGH', label: 'عالية', color: 'orange' },
                { value: 'URGENT', label: 'عاجلة', color: 'red' },
            ]
        },
        {
            id: 'category', label: 'الفئة', type: 'select', field: 'category', options: [
                { value: 'TECHNICAL', label: 'تقني' },
                { value: 'BILLING', label: 'مالي' },
                { value: 'GENERAL', label: 'عام' },
            ]
        },
    ],
};

// فئة نظام الفلاتر
class UnifiedFilterSystem {
    private state: FilterState = {
        filters: [],
        search: '',
        sort: null,
        page: 1,
        pageSize: 20,
    };

    private listeners: Set<(state: FilterState) => void> = new Set();
    private presets: Map<string, FilterPreset[]> = new Map();

    // إضافة فلتر
    addFilter(filter: ActiveFilter): void {
        const existingIndex = this.state.filters.findIndex(f => f.id === filter.id);
        if (existingIndex >= 0) {
            this.state.filters[existingIndex] = filter;
        } else {
            this.state.filters.push(filter);
        }
        this.state.page = 1; // إعادة للصفحة الأولى
        this.notify();
    }

    // إزالة فلتر
    removeFilter(filterId: string): void {
        this.state.filters = this.state.filters.filter(f => f.id !== filterId);
        this.state.page = 1;
        this.notify();
    }

    // مسح جميع الفلاتر
    clearFilters(): void {
        this.state.filters = [];
        this.state.search = '';
        this.state.page = 1;
        this.notify();
    }

    // تعيين البحث
    setSearch(search: string): void {
        this.state.search = search;
        this.state.page = 1;
        this.notify();
    }

    // تعيين الترتيب
    setSort(sort: SortConfig | null): void {
        this.state.sort = sort;
        this.notify();
    }

    // تعيين الصفحة
    setPage(page: number): void {
        this.state.page = page;
        this.notify();
    }

    // تعيين حجم الصفحة
    setPageSize(pageSize: number): void {
        this.state.pageSize = pageSize;
        this.state.page = 1;
        this.notify();
    }

    // الحصول على الحالة
    getState(): FilterState {
        return { ...this.state };
    }

    // تحويل الحالة إلى query string
    toQueryString(): string {
        const params = new URLSearchParams();

        if (this.state.search) {
            params.set('search', this.state.search);
        }

        this.state.filters.forEach(filter => {
            params.set(`filter_${filter.field}`, JSON.stringify({
                operator: filter.operator,
                value: filter.value,
                value2: filter.value2,
            }));
        });

        if (this.state.sort) {
            params.set('sort', this.state.sort.field);
            params.set('order', this.state.sort.direction);
        }

        params.set('page', String(this.state.page));
        params.set('limit', String(this.state.pageSize));

        return params.toString();
    }

    // تحويل الحالة إلى Prisma where clause
    toPrismaWhere(): Record<string, any> {
        const where: Record<string, any> = {};

        this.state.filters.forEach(filter => {
            const { field, operator, value, value2 } = filter;

            switch (operator) {
                case 'equals':
                    where[field] = value;
                    break;
                case 'not_equals':
                    where[field] = { not: value };
                    break;
                case 'contains':
                    where[field] = { contains: value, mode: 'insensitive' };
                    break;
                case 'starts_with':
                    where[field] = { startsWith: value, mode: 'insensitive' };
                    break;
                case 'ends_with':
                    where[field] = { endsWith: value, mode: 'insensitive' };
                    break;
                case 'greater_than':
                    where[field] = { gt: value };
                    break;
                case 'less_than':
                    where[field] = { lt: value };
                    break;
                case 'greater_or_equal':
                    where[field] = { gte: value };
                    break;
                case 'less_or_equal':
                    where[field] = { lte: value };
                    break;
                case 'between':
                    where[field] = { gte: value, lte: value2 };
                    break;
                case 'in':
                    where[field] = { in: Array.isArray(value) ? value : [value] };
                    break;
                case 'not_in':
                    where[field] = { notIn: Array.isArray(value) ? value : [value] };
                    break;
                case 'is_null':
                    where[field] = null;
                    break;
                case 'is_not_null':
                    where[field] = { not: null };
                    break;
            }
        });

        return where;
    }

    // الاشتراك في التحديثات
    subscribe(listener: (state: FilterState) => void): () => void {
        this.listeners.add(listener);
        listener(this.state);
        return () => this.listeners.delete(listener);
    }

    private notify(): void {
        this.listeners.forEach(listener => listener(this.state));
    }

    // حفظ preset
    savePreset(section: string, preset: FilterPreset): void {
        const sectionPresets = this.presets.get(section) || [];
        const existingIndex = sectionPresets.findIndex(p => p.id === preset.id);
        if (existingIndex >= 0) {
            sectionPresets[existingIndex] = preset;
        } else {
            sectionPresets.push(preset);
        }
        this.presets.set(section, sectionPresets);
    }

    // تحميل preset
    loadPreset(preset: FilterPreset): void {
        this.state.filters = [...preset.filters];
        this.state.page = 1;
        this.notify();
    }

    // الحصول على presets لقسم
    getPresets(section: string): FilterPreset[] {
        return this.presets.get(section) || [];
    }
}

// Singleton instance
export const filterSystem = new UnifiedFilterSystem();

// إنشاء instance جديد للمكونات المستقلة
export function createFilterInstance(): UnifiedFilterSystem {
    return new UnifiedFilterSystem();
}

export default filterSystem;
