import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';

interface SearchSuggestion {
  id: string;
  type: 'brand' | 'model' | 'location' | 'recent' | 'popular';
  text: string;
  subtitle?: string;
  count?: number;
}

interface SmartSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSuggestions?: boolean;
  autoFocus?: boolean;
}

const SmartSearch: React.FC<SmartSearchProps> = ({
  placeholder = 'ابحث عن سيارة، ماركة، أو موديل...',
  onSearch,
  className = '',
  size = 'md',
  showSuggestions = true,
  autoFocus = false,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // تحميل البحثات الأخيرة من localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('خطأ في تحميل البحثات الأخيرة:', error);
      }
    }
  }, []);

  // حفظ البحثات الأخيرة
  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 5); // الاحتفاظ بآخر 5 بحثات

    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // بيانات الاقتراحات الثابتة (يمكن جلبها من API لاحقاً)
  const staticSuggestions: SearchSuggestion[] = [
    // الماركات الشائعة
    { id: '1', type: 'brand', text: 'تويوتا', subtitle: 'Toyota', count: 245 },
    { id: '2', type: 'brand', text: 'نيسان', subtitle: 'Nissan', count: 189 },
    { id: '3', type: 'brand', text: 'هوندا', subtitle: 'Honda', count: 156 },
    {
      id: '4',
      type: 'brand',
      text: 'هيونداي',
      subtitle: 'Hyundai',
      count: 134,
    },
    { id: '5', type: 'brand', text: 'كيا', subtitle: 'Kia', count: 98 },

    // الموديلات الشائعة
    {
      id: '6',
      type: 'model',
      text: 'كامري',
      subtitle: 'Camry - تويوتا',
      count: 67,
    },
    {
      id: '7',
      type: 'model',
      text: 'كورولا',
      subtitle: 'Corolla - تويوتا',
      count: 89,
    },
    {
      id: '8',
      type: 'model',
      text: 'التيما',
      subtitle: 'Altima - نيسان',
      count: 45,
    },
    {
      id: '9',
      type: 'model',
      text: 'أكورد',
      subtitle: 'Accord - هوندا',
      count: 34,
    },
    {
      id: '10',
      type: 'model',
      text: 'إلنترا',
      subtitle: 'Elantra - هيونداي',
      count: 56,
    },

    // المواقع
    { id: '11', type: 'location', text: 'طرابلس', count: 456 },
    { id: '12', type: 'location', text: 'بنغازي', count: 234 },
    { id: '13', type: 'location', text: 'مصراتة', count: 123 },

    // البحثات الشائعة
    { id: '14', type: 'popular', text: 'سيارات جديدة', count: 89 },
    { id: '15', type: 'popular', text: 'سيارات مستعملة', count: 567 },
    { id: '16', type: 'popular', text: 'سيمنرات اقتصادية', count: 234 },
  ];

  // فلترة الاقتراحات بناءً على النص المدخل
  const filterSuggestions = (searchQuery: string): SearchSuggestion[] => {
    if (!searchQuery.trim()) {
      // إظهار البحثات الأخيرة والشائعة عند عدم وجود نص
      const recentSuggestions: SearchSuggestion[] = recentSearches.map((search, index) => ({
        id: `recent-${index}`,
        type: 'recent',
        text: search,
      }));

      const popularSuggestions = staticSuggestions.filter((s) => s.type === 'popular').slice(0, 3);

      return [...recentSuggestions, ...popularSuggestions];
    }

    const query = searchQuery.toLowerCase().trim();
    return staticSuggestions
      .filter(
        (suggestion) =>
          suggestion.text.toLowerCase().includes(query) ||
          (suggestion.subtitle && suggestion.subtitle.toLowerCase().includes(query)),
      )
      .sort((a, b) => {
        // ترتيب حسب الأولوية: مطابقة تامة، ثم بداية النص، ثم العدد
        const aExact = a.text.toLowerCase() === query;
        const bExact = b.text.toLowerCase() === query;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        const aStarts = a.text.toLowerCase().startsWith(query);
        const bStarts = b.text.toLowerCase().startsWith(query);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        return (b.count || 0) - (a.count || 0);
      })
      .slice(0, 8);
  };

  // تحديث الاقتراحات عند تغيير النص
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (showSuggestions) {
        setIsLoading(true);
        // محاكاة تأخير API
        setTimeout(() => {
          setSuggestions(filterSuggestions(query));
          setIsLoading(false);
        }, 200);
      }
    }, 300); // debounce

    return () => clearTimeout(timeoutId);
  }, [query, showSuggestions]);

  // معالجة تغيير النص
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    setShowSuggestionsList(true);
  };

  // معالجة الضغط على المفاتيح
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestionsList || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch(query);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch(query);
        }
        break;
      case 'Escape':
        setShowSuggestionsList(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // معالجة البحث
  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    saveRecentSearch(searchQuery);
    setShowSuggestionsList(false);

    if (onSearch) {
      onSearch(searchQuery);
    } else {
      // التوجه لصفحة البحث
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // معالجة النقر على اقتراح
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  // مسح النص
  const clearQuery = () => {
    setQuery('');
    setShowSuggestionsList(false);
    inputRef.current?.focus();
  };

  // إخفاء الاقتراحات عند النقمن خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestionsList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // تحديد أحجام المكونات
  const sizeClasses = {
    sm: {
      input: 'px-3 py-2 text-sm',
      icon: 'h-4 w-4',
      suggestions: 'text-sm',
    },
    md: {
      input: 'px-4 py-3 text-base',
      icon: 'h-5 w-5',
      suggestions: 'text-sm',
    },
    lg: {
      input: 'px-6 py-4 text-lg',
      icon: 'h-6 w-6',
      suggestions: 'text-base',
    },
  };

  const currentSize = sizeClasses[size];

  // أيقونة نوع الاقتراح
  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return <ClockIcon className="h-4 w-4 text-gray-400" />;
      case 'brand':
        return (
          <div className="flex h-4 w-4 items-center justify-center rounded bg-blue-100 text-xs font-bold text-blue-600">
            B
          </div>
        );
      case 'model':
        return (
          <div className="flex h-4 w-4 items-center justify-center rounded bg-green-100 text-xs font-bold text-green-600">
            M
          </div>
        );
      case 'location':
        return (
          <div className="flex h-4 w-4 items-center justify-center rounded bg-red-100 text-xs font-bold text-red-600">
            L
          </div>
        );
      case 'popular':
        return (
          <div className="flex h-4 w-4 items-center justify-center rounded bg-yellow-100 text-xs font-bold text-yellow-600">
            ★
          </div>
        );
      default:
        return <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* حقل البحث */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestionsList(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full rounded-lg border border-gray-300 bg-white ${currentSize.input} pl-4 pr-12 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
          dir="rtl"
        />

        {/* أيقونة البحث */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <MagnifyingGlassIcon className={`${currentSize.icon} text-gray-400`} />
        </div>

        {/* زر المسح */}
        {query && (
          <button
            onClick={clearQuery}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-gray-100"
          >
            <XMarkIcon className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* قائمة الاقتراحات */}
      {showSuggestionsList && showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          {isLoading ? (
            <div className="p-4 text-center text-gray-500" role="status" aria-live="polite" aria-busy="true">
              <div className="inline-flex items-center gap-2">
                <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
                <span className="sr-only">جاري البحث</span>
              </div>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-gray-50 ${index === selectedIndex ? 'border-r-2 border-blue-500 bg-blue-50' : ''} ${currentSize.suggestions} `}
                >
                  {getSuggestionIcon(suggestion.type)}

                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900">{suggestion.text}</div>
                    {suggestion.subtitle && (
                      <div className="mt-0.5 text-xs text-gray-500">{suggestion.subtitle}</div>
                    )}
                  </div>

                  {suggestion.count && (
                    <div className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-400">
                      {suggestion.count}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="p-4 text-center text-gray-500">لا توجد اقتراحات لـ "{query}"</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
