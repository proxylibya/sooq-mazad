/**
 * نظام موحد لرؤوس الجداول القابلة للترتيب
 * Unified Sortable Table Header System
 *
 * يستخدم في جميع جداول الإدارة لتوحيد تجربة الترتيب
 */
import { ArrowDownIcon, ArrowUpIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useMemo, useState } from 'react';

// ==================== الأنواع ====================

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  field: string | null;
  direction: SortDirection;
}

export interface ColumnConfig {
  id: string;
  label: string;
  sortable?: boolean;
  align?: 'right' | 'center' | 'left';
  width?: string;
  className?: string;
}

export interface SortableHeaderCellProps {
  column: ColumnConfig;
  sortState: SortState;
  onSort: (field: string) => void;
  className?: string;
}

export interface SortableTableHeaderProps {
  columns: ColumnConfig[];
  sortState: SortState;
  onSort: (field: string) => void;
  selectable?: boolean;
  selectAll?: boolean;
  onSelectAll?: () => void;
  hasActions?: boolean;
  actionsLabel?: string;
  className?: string;
  compact?: boolean;
}

// ==================== Hook للترتيب ====================

export interface UseTableSortOptions<T> {
  data: T[];
  defaultField?: string;
  defaultDirection?: SortDirection;
}

export interface UseTableSortReturn<T> {
  sortState: SortState;
  sortedData: T[];
  handleSort: (field: string) => void;
  resetSort: () => void;
  setSortState: React.Dispatch<React.SetStateAction<SortState>>;
}

export function useTableSort<T extends Record<string, any>>({
  data,
  defaultField = null,
  defaultDirection = null,
}: UseTableSortOptions<T>): UseTableSortReturn<T> {
  const [sortState, setSortState] = useState<SortState>({
    field: defaultField,
    direction: defaultDirection,
  });

  const handleSort = useCallback((field: string) => {
    setSortState((prev) => {
      if (prev.field === field) {
        // تبديل الاتجاه: asc -> desc -> null -> asc
        if (prev.direction === 'asc') {
          return { field, direction: 'desc' };
        } else if (prev.direction === 'desc') {
          return { field: null, direction: null };
        } else {
          return { field, direction: 'asc' };
        }
      }
      // عمود جديد: ابدأ بـ asc
      return { field, direction: 'asc' };
    });
  }, []);

  const resetSort = useCallback(() => {
    setSortState({ field: null, direction: null });
  }, []);

  const sortedData = useMemo(() => {
    if (!sortState.field || !sortState.direction) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortState.field!];
      const bValue = b[sortState.field!];

      // التعامل مع القيم الفارغة
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortState.direction === 'asc' ? 1 : -1;
      if (bValue == null) return sortState.direction === 'asc' ? -1 : 1;

      // ترتيب التواريخ
      if (aValue instanceof Date && bValue instanceof Date) {
        const diff = aValue.getTime() - bValue.getTime();
        return sortState.direction === 'asc' ? diff : -diff;
      }

      // ترتيب الأرقام
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortState.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // ترتيب النصوص (مع دعم العربية)
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      const comparison = aStr.localeCompare(bStr, 'ar');
      return sortState.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortState.field, sortState.direction]);

  return {
    sortState,
    sortedData,
    handleSort,
    resetSort,
    setSortState,
  };
}

// ==================== مكون خلية الرأس ====================

export function SortableHeaderCell({
  column,
  sortState,
  onSort,
  className = '',
}: SortableHeaderCellProps) {
  const isActive = sortState.field === column.id;
  const isSortable = column.sortable !== false;

  const handleClick = () => {
    if (isSortable) {
      onSort(column.id);
    }
  };

  const alignClass = {
    right: 'text-right',
    center: 'text-center',
    left: 'text-left',
  }[column.align || 'right'];

  const SortIcon = () => {
    if (!isSortable) return null;

    if (isActive && sortState.direction === 'asc') {
      return <ArrowUpIcon className="h-4 w-4 text-blue-400" />;
    }
    if (isActive && sortState.direction === 'desc') {
      return <ArrowDownIcon className="h-4 w-4 text-blue-400" />;
    }
    return (
      <ArrowsUpDownIcon className="h-4 w-4 text-slate-500 opacity-50 group-hover:opacity-100" />
    );
  };

  return (
    <th
      className={`px-6 py-4 text-xs font-medium uppercase text-slate-400 ${alignClass} ${isSortable ? 'group cursor-pointer select-none transition-colors hover:bg-slate-700/30 hover:text-slate-200' : ''} ${isActive ? 'bg-blue-500/5 text-blue-400' : ''} ${className} ${column.className || ''} `}
      style={{ width: column.width }}
      onClick={handleClick}
    >
      <div
        className={`flex items-center gap-2 ${column.align === 'left' ? 'flex-row-reverse justify-end' : ''} ${column.align === 'center' ? 'justify-center' : ''} `}
      >
        <span>{column.label}</span>
        <SortIcon />
      </div>
    </th>
  );
}

// ==================== مكون رأس الجدول الكامل ====================

export default function SortableTableHeader({
  columns,
  sortState,
  onSort,
  selectable = false,
  selectAll = false,
  onSelectAll,
  hasActions = false,
  actionsLabel = 'الإجراءات',
  className = '',
  compact = false,
}: SortableTableHeaderProps) {
  const cellPadding = compact ? 'px-4 py-3' : 'px-6 py-4';

  return (
    <thead className={`border-b border-slate-700 bg-slate-700/50 ${className}`}>
      <tr>
        {/* خانة الاختيار */}
        {selectable && (
          <th className={`${cellPadding} w-10`}>
            <input
              type="checkbox"
              checked={selectAll}
              onChange={onSelectAll}
              className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
            />
          </th>
        )}

        {/* الأعمدة */}
        {columns.map((column) => (
          <SortableHeaderCell
            key={column.id}
            column={column}
            sortState={sortState}
            onSort={onSort}
            className={compact ? 'px-4 py-3' : ''}
          />
        ))}

        {/* عمود الإجراءات */}
        {hasActions && (
          <th
            className={`${cellPadding} w-32 text-center text-xs font-medium uppercase text-slate-400`}
          >
            {actionsLabel}
          </th>
        )}
      </tr>
    </thead>
  );
}

// ==================== Presets للأعمدة الشائعة ====================

export const CommonColumns = {
  // المستخدمين
  user: (): ColumnConfig => ({
    id: 'name',
    label: 'المستخدم',
    sortable: true,
  }),
  phone: (): ColumnConfig => ({
    id: 'phone',
    label: 'رقم الهاتف',
    sortable: true,
  }),
  status: (): ColumnConfig => ({
    id: 'status',
    label: 'الحالة',
    sortable: true,
  }),
  role: (): ColumnConfig => ({
    id: 'role',
    label: 'الدور',
    sortable: true,
  }),
  createdAt: (): ColumnConfig => ({
    id: 'createdAt',
    label: 'تاريخ الإنشاء',
    sortable: true,
  }),
  updatedAt: (): ColumnConfig => ({
    id: 'updatedAt',
    label: 'آخر تحديث',
    sortable: true,
  }),
  lastLogin: (): ColumnConfig => ({
    id: 'lastLogin',
    label: 'آخر دخول',
    sortable: true,
  }),
  username: (): ColumnConfig => ({
    id: 'username',
    label: 'اسم المستخدم',
    sortable: true,
  }),
  email: (): ColumnConfig => ({
    id: 'email',
    label: 'البريد الإلكتروني',
    sortable: true,
  }),

  // المزادات
  title: (): ColumnConfig => ({
    id: 'title',
    label: 'العنوان',
    sortable: true,
  }),
  price: (): ColumnConfig => ({
    id: 'price',
    label: 'السعر',
    sortable: true,
    align: 'left',
  }),
  startPrice: (): ColumnConfig => ({
    id: 'startPrice',
    label: 'سعر البداية',
    sortable: true,
    align: 'left',
  }),
  currentPrice: (): ColumnConfig => ({
    id: 'currentPrice',
    label: 'السعر الحالي',
    sortable: true,
    align: 'left',
  }),
  bidsCount: (): ColumnConfig => ({
    id: 'bidsCount',
    label: 'عدد المزايدات',
    sortable: true,
    align: 'center',
  }),
  endDate: (): ColumnConfig => ({
    id: 'endDate',
    label: 'تاريخ الانتهاء',
    sortable: true,
  }),

  // عام
  id: (): ColumnConfig => ({
    id: 'id',
    label: 'المعرف',
    sortable: true,
    width: '100px',
  }),
  count: (): ColumnConfig => ({
    id: 'count',
    label: 'العدد',
    sortable: true,
    align: 'center',
  }),
};

// ==================== انتهى ====================
