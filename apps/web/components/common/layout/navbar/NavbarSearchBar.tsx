import React from 'react';
import UnifiedSearchBar from '@/components/search/UnifiedSearchBar';

interface NavbarSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

/**
 * شريط البحث في الـ Navbar
 * ✅ تم تحديثه ليستخدم UnifiedSearchBar الجديد
 * ✅ يحل مشكلة التوجيه لصفحة /search غير الموجودة
 */
export function NavbarSearchBar({ searchQuery: _searchQuery, setSearchQuery: _setSearchQuery }: NavbarSearchBarProps) {
  return (
    <div className="flex-1">
      <UnifiedSearchBar 
        placeholder="ابحث عن سيارات، معارض، مزادات..."
      />
    </div>
  );
}
