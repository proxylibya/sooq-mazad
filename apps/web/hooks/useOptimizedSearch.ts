import { useMemo, useCallback, useState, useEffect } from 'react';
import { debounce } from 'lodash';

// Search index interface
interface SearchIndex<T> {
  [key: string]: {
    items: T[];
    searchableText: string[];
  };
}

// Search configuration
interface SearchConfig<T> {
  searchableFields: (keyof T)[];
  indexFields?: (keyof T)[];
  caseSensitive?: boolean;
  exactMatch?: boolean;
  minSearchLength?: number;
  debounceMs?: number;
  enableFuzzySearch?: boolean;
  fuzzyThreshold?: number;
}

// Search result with relevance scoring
interface SearchResult<T> {
  item: T;
  score: number;
  matchedFields: string[];
  highlightData?: { [key: string]: string };
}

// Optimized search and indexing hook
export function useOptimizedSearch<T extends Record<string, any>>(
  data: T[],
  config: SearchConfig<T> | (keyof T)[],
) {
  // Handle both SearchConfig object and simple array of field names
  const searchConfig = Array.isArray(config) ? { searchableFields: config } : config;

  const {
    searchableFields,
    indexFields = [],
    caseSensitive = false,
    exactMatch = false,
    minSearchLength = 2,
    debounceMs = 300,
    enableFuzzySearch = true,
    fuzzyThreshold = 0.6,
  } = searchConfig;

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Create search index for faster lookups
  const searchIndex = useMemo(() => {
    const index: SearchIndex<T> = {};

    // Add safety checks for data and searchableFields
    if (!data || !Array.isArray(data) || !searchableFields || !Array.isArray(searchableFields)) {
      return index;
    }

    data.forEach((item, itemIndex) => {
      // Create searchable text for this item
      const searchableText = searchableFields.map((field) => {
        const value = item[field];
        if (value === null || value === undefined) return '';
        return String(value);
      });

      // Index by specified fields for faster filtering
      indexFields.forEach((field) => {
        const fieldValue = String(item[field] || '');
        const normalizedValue = caseSensitive ? fieldValue : fieldValue.toLowerCase();

        if (!index[normalizedValue]) {
          index[normalizedValue] = {
            items: [],
            searchableText: [],
          };
        }

        index[normalizedValue].items.push(item);
        index[normalizedValue].searchableText.push(...searchableText);
      });

      // Also add to global index
      const globalKey = itemIndex.toString();
      index[globalKey] = {
        items: [item],
        searchableText,
      };
    });

    return index;
  }, [data, searchableFields, indexFields, caseSensitive]);

  // Debounced search term update
  const debouncedSetSearchTerm = useCallback(
    (term: string) => {
      const debouncedFn = debounce(() => {
        setDebouncedSearchTerm(term);
        setIsSearching(false);
      }, debounceMs);
      debouncedFn();
    },
    [debounceMs],
  );

  // Update search term
  const updateSearchTerm = useCallback(
    (term: string) => {
      setSearchTerm(term);
      setIsSearching(true);
      debouncedSetSearchTerm(term);
    },
    [debouncedSetSearchTerm],
  );

  // Fuzzy string matching
  const fuzzyMatch = useCallback(
    (text: string, pattern: string): number => {
      if (!enableFuzzySearch) {
        return text.includes(pattern) ? 1 : 0;
      }

      // Simple fuzzy matching algorithm
      const textLower = text.toLowerCase();
      const patternLower = pattern.toLowerCase();

      if (textLower.includes(patternLower)) return 1;

      // Calculate similarity using Levenshtein-like approach
      let matches = 0;
      let patternIndex = 0;

      for (let i = 0; i < textLower.length && patternIndex < patternLower.length; i++) {
        if (textLower[i] === patternLower[patternIndex]) {
          matches++;
          patternIndex++;
        }
      }

      const similarity = matches / patternLower.length;
      return similarity >= fuzzyThreshold ? similarity : 0;
    },
    [enableFuzzySearch, fuzzyThreshold],
  );

  // Highlight matching text
  const highlightText = useCallback(
    (text: string, searchTerm: string): string => {
      if (!searchTerm || !text) return text;

      const regex = new RegExp(
        `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
        caseSensitive ? 'g' : 'gi',
      );
      return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    },
    [caseSensitive],
  );

  // Search function with scoring
  const searchResults = useMemo(() => {
    // Add safety checks
    if (!data || !Array.isArray(data)) {
      return [];
    }

    if (!debouncedSearchTerm || debouncedSearchTerm.length < minSearchLength) {
      return data.map((item) => ({ item, score: 1, matchedFields: [] }));
    }

    if (!searchableFields || !Array.isArray(searchableFields)) {
      return data.map((item) => ({ item, score: 1, matchedFields: [] }));
    }

    const searchPattern = caseSensitive ? debouncedSearchTerm : debouncedSearchTerm.toLowerCase();
    const results: SearchResult<T>[] = [];

    // Search through all items
    data.forEach((item) => {
      let totalScore = 0;
      const matchedFields: string[] = [];
      const highlightData: { [key: string]: string } = {};

      searchableFields.forEach((field) => {
        const fieldValue = String(item[field] || '');
        const searchText = caseSensitive ? fieldValue : fieldValue.toLowerCase();

        let fieldScore = 0;

        if (exactMatch) {
          fieldScore = searchText === searchPattern ? 1 : 0;
        } else {
          fieldScore = fuzzyMatch(searchText, searchPattern);
        }

        if (fieldScore > 0) {
          totalScore += fieldScore;
          matchedFields.push(String(field));
          highlightData[String(field)] = highlightText(fieldValue, debouncedSearchTerm);
        }
      });

      if (totalScore > 0) {
        results.push({
          item,
          score: totalScore,
          matchedFields,
          highlightData,
        });
      }
    });

    // Sort by relevance score (higher first)
    return results.sort((a, b) => b.score - a.score);
  }, [
    data,
    debouncedSearchTerm,
    minSearchLength,
    searchableFields,
    caseSensitive,
    exactMatch,
    fuzzyMatch,
    highlightText,
  ]);

  // Filter by indexed fields
  const filterByIndex = useCallback(
    (indexKey: string) => {
      const indexEntry = searchIndex[indexKey];
      return indexEntry ? indexEntry.items : [];
    },
    [searchIndex],
  );

  // Get available index values
  const getIndexValues = useCallback(
    (field: keyof T) => {
      if (!data || !Array.isArray(data)) {
        return [];
      }
      const values = new Set<string>();
      data.forEach((item) => {
        const value = String(item[field] || '');
        values.add(value);
      });
      return Array.from(values).sort();
    },
    [data],
  );

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setIsSearching(false);
  }, []);

  return {
    // Search state
    searchTerm,
    debouncedSearchTerm,
    isSearching,

    // Search results
    results: searchResults,
    totalResults: searchResults.length,
    filteredData: searchResults.map((r) => r.item),

    // Search functions
    updateSearchTerm,
    clearSearch,
    highlightText,

    // Index functions
    filterByIndex,
    getIndexValues,
    searchIndex,

    // Utilities
    hasResults: searchResults.length > 0,
    isEmpty: !debouncedSearchTerm || debouncedSearchTerm.length < minSearchLength,
  };
}

// Advanced filtering hook
interface FilterConfig<T> {
  filters: {
    [key: string]: {
      field: keyof T;
      type: 'text' | 'select' | 'range' | 'boolean' | 'date';
      value: any;
      operator?:
        | 'equals'
        | 'contains'
        | 'startsWith'
        | 'endsWith'
        | 'gt'
        | 'lt'
        | 'gte'
        | 'lte'
        | 'between';
    };
  };
}

export function useAdvancedFilter<T extends Record<string, any>>(
  data: T[],
  config: FilterConfig<T> | Record<string, string>,
) {
  // Handle both FilterConfig structure and simple object structure
  const filters = 'filters' in config ? config.filters : config;

  const filteredData = useMemo(() => {
    if (!filters) {
      return data;
    }

    return data.filter((item) => {
      return Object.entries(filters).every(([key, filterValue]) => {
        // Handle simple string filters (like from the component)
        if (typeof filterValue === 'string') {
          if (filterValue === null || filterValue === undefined || filterValue === '') {
            return true; // Skip empty filters
          }

          const itemValue = item[key as keyof T];
          if (itemValue === null || itemValue === undefined) {
            return false;
          }

          return String(itemValue).toLowerCase().includes(filterValue.toLowerCase());
        }

        // Handle complex filter objects
        const filter = filterValue as any;
        const { field, type, value, operator = 'equals' } = filter;

        if (value === null || value === undefined || value === '') {
          return true; // Skip empty filters
        }

        const itemValue = item[field];

        switch (type) {
          case 'text':
            const textValue = String(itemValue || '').toLowerCase();
            const searchValue = String(value).toLowerCase();

            switch (operator) {
              case 'contains':
                return textValue.includes(searchValue);
              case 'startsWith':
                return textValue.startsWith(searchValue);
              case 'endsWith':
                return textValue.endsWith(searchValue);
              case 'equals':
              default:
                return textValue === searchValue;
            }

          case 'select':
            return itemValue === value;

          case 'boolean':
            return Boolean(itemValue) === Boolean(value);

          case 'range':
            const numValue = Number(itemValue);
            const filterValue = Number(value);

            switch (operator) {
              case 'gt':
                return numValue > filterValue;
              case 'lt':
                return numValue < filterValue;
              case 'gte':
                return numValue >= filterValue;
              case 'lte':
                return numValue <= filterValue;
              case 'equals':
              default:
                return numValue === filterValue;
            }

          case 'date':
            const itemDate = new Date(itemValue);
            const filterDate = new Date(value);

            switch (operator) {
              case 'gt':
                return itemDate > filterDate;
              case 'lt':
                return itemDate < filterDate;
              case 'gte':
                return itemDate >= filterDate;
              case 'lte':
                return itemDate <= filterDate;
              case 'equals':
              default:
                return itemDate.toDateString() === filterDate.toDateString();
            }

          default:
            return true;
        }
      });
    });
  }, [data, filters]);

  return {
    filteredData,
    totalFiltered: filteredData.length,
    hasFilters: filters
      ? Object.values(filters).some((f) => {
          if (typeof f === 'string') {
            return f !== null && f !== undefined && f !== '';
          }
          return (
            f &&
            typeof f === 'object' &&
            f.value !== null &&
            f.value !== undefined &&
            f.value !== ''
          );
        })
      : false,
  };
}

// Virtual scrolling for large datasets
export function useVirtualScrolling<T>(
  data: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5,
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      data.length,
    );

    return {
      startIndex: Math.max(0, startIndex - overscan),
      endIndex,
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, data.length]);

  const visibleItems = useMemo(() => {
    return data.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [data, visibleRange]);

  const totalHeight = data.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return {
    visibleItems,
    visibleRange,
    totalHeight,
    offsetY,
    setScrollTop,
  };
}

export default useOptimizedSearch;
