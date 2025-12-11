import { CheckCircleIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

export default function AdSearch({ onSelect = () => {}, selectedItem }) {
  const [searchMode, setSearchMode] = useState('query');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchId, setSearchId] = useState('');
  const [searchType, setSearchType] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selected, setSelected] = useState(selectedItem || null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchMode === 'query' && searchQuery.length >= 2) {
        performSearch();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, searchType, searchMode]);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (searchMode === 'id') {
        params.append('id', searchId);
        if (searchType) params.append('type', searchType);
      } else {
        params.append('query', searchQuery);
        if (searchType) params.append('type', searchType);
      }

      const res = await fetch(`/api/admin/ad-placements/search?${params}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchById = () => {
    if (searchId) {
      performSearch();
    }
  };

  const handleSelect = (item) => {
    setSelected(item);
    onSelect(item);
  };

  const handleClear = () => {
    setSelected(null);
    setSearchQuery('');
    setSearchId('');
    setResults([]);
    onSelect(null);
  };

  if (selected) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-300">المنشور المحدد</label>
        <div className="relative overflow-hidden rounded-lg border-2 border-amber-500 bg-slate-700/50 p-4">
          <button
            type="button"
            onClick={handleClear}
            className="absolute left-2 top-2 rounded-full bg-slate-800 p-1 text-slate-400 hover:text-white"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>

          <div className="flex gap-4">
            {selected.imageUrl && (
              <img
                src={selected.imageUrl}
                alt={selected.title}
                className="h-20 w-20 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-500">
                  {selected.type}
                </span>
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
              </div>
              <h3 className="mt-1 font-bold text-white">{selected.title}</h3>
              {selected.description && (
                <p className="mt-1 line-clamp-2 text-sm text-slate-400">{selected.description}</p>
              )}
              {selected.price && (
                <p className="mt-2 text-sm font-bold text-amber-500">
                  {selected.price.toLocaleString()} دينار
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-slate-300">البحث عن منشور</label>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setSearchMode('query')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            searchMode === 'query'
              ? 'bg-amber-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          بحث بالاسم
        </button>
        <button
          type="button"
          onClick={() => setSearchMode('id')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            searchMode === 'id'
              ? 'bg-amber-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          بحث بالـ ID
        </button>
      </div>

      <div className="flex gap-2">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="w-40 rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
        >
          <option value="">الكل</option>
          <option value="AUCTION">سوق المزاد</option>
          <option value="CAR">سوق الفوري</option>
          <option value="TRANSPORT">خدمات النقل</option>
          <option value="YARD">الساحات</option>
          <option value="SHOWROOM">المعارض</option>
          <option value="COMPANY">شركات</option>
        </select>

        {searchMode === 'query' ? (
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث بالعنوان أو الوصف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 pr-10 text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
            />
          </div>
        ) : (
          <>
            <input
              type="text"
              placeholder="أدخل ID المنشور..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="flex-1 rounded-lg border border-slate-600 bg-slate-700 p-3 text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSearchById}
              disabled={!searchId}
              className="rounded-lg bg-amber-500 px-6 py-3 font-bold text-white hover:bg-amber-600 disabled:opacity-50"
            >
              بحث
            </button>
          </>
        )}
      </div>

      {isSearching && (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
        </div>
      )}

      {results.length > 0 && (
        <div className="max-h-96 space-y-2 overflow-y-auto rounded-lg border border-slate-700 bg-slate-800/50 p-3">
          {results.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item)}
              className="flex w-full gap-3 rounded-lg border border-slate-700 bg-slate-700/50 p-3 text-right transition-colors hover:border-amber-500 hover:bg-slate-700"
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-600 px-2 py-0.5 text-xs font-bold text-white">
                    {item.type}
                  </span>
                </div>
                <h4 className="mt-1 font-bold text-white">{item.title}</h4>
                {item.description && (
                  <p className="mt-1 line-clamp-1 text-sm text-slate-400">{item.description}</p>
                )}
                {item.price && (
                  <p className="mt-1 text-sm font-bold text-amber-500">
                    {item.price.toLocaleString()} دينار
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {!isSearching && results.length === 0 && searchQuery.length >= 2 && (
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-8 text-center">
          <p className="text-slate-400">لا توجد نتائج</p>
        </div>
      )}
    </div>
  );
}
