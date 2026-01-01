'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * شريط البحث الموحد الجديد
 * يستخدم API حقيقي بدلاً من البيانات الثابتة
 */

interface SearchSuggestion {
  id: string;
  type: string;
  text: string;
  subtitle?: string;
  count?: number;
  icon?: string;
}

interface UnifiedSearchBarProps {
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  onSearch?: (query: string) => void;
}

export default function UnifiedSearchBar({
  placeholder = 'ابحث عن سيارات، مزادات، معارض...',
  autoFocus = false,
  className = '',
  onSearch,
}: UnifiedSearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // جلب الاقتراحات من API
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        fetchSuggestions(query);
      } else if (query.length === 0) {
        fetchSuggestions(''); // جلب الاقتراحات الشائعة
      } else {
        setSuggestions([]);
      }
    }, 300); // debounce

    return () => clearTimeout(timer);
  }, [query]);

  const fetchSuggestions = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=8`
      );
      const data = await response.json();

      if (data.success && data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('خطأ في جلب الاقتراحات:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    setShowSuggestions(false);

    if (onSearch) {
      onSearch(trimmedQuery);
    } else {
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSearch(suggestions[selectedIndex].text);
    } else {
      handleSearch(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
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
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  const clearQuery = () => {
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  // إخفاء الاقتراحات عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-right transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            dir="rtl"
          />

          {/* أيقونة البحث */}
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="بحث"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>

          {/* زر المسح */}
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-gray-100"
              aria-label="مسح"
            >
              <XMarkIcon className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
      </form>

      {/* قائمة الاقتراحات */}
      {showSuggestions && (suggestions.length > 0 || loading) && (
        <div
          ref={suggestionsRef}
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
              <span className="mr-2">جاري البحث...</span>
            </div>
          ) : (
            <div className="py-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-gray-50 ${
                    index === selectedIndex ? 'border-r-2 border-blue-500 bg-blue-50' : ''
                  }`}
                >
                  {/* الأيقونة */}
                  <span className="text-xl">{suggestion.icon || '🔍'}</span>

                  {/* النص */}
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900">{suggestion.text}</div>
                    {suggestion.subtitle && (
                      <div className="mt-0.5 text-xs text-gray-500">{suggestion.subtitle}</div>
                    )}
                  </div>

                  {/* العدد */}
                  {suggestion.count !== undefined && (
                    <div className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                      {suggestion.count}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
