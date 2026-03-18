
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Activity, ActivityType } from '../types';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from '../constants';

interface GlobalSearchProps {
  onSelectActivity: (activityType: ActivityType) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ onSelectActivity }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(''); // Debounce state
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  const searchResults = useMemo(() => {
    if (debouncedQuery.length < 2) {
      return [];
    }
    const lowerCaseQuery = debouncedQuery.toLocaleLowerCase('tr');
    
    // Using a map to ensure unique activities are returned
    const uniqueResults = new Map<ActivityType, Activity>();

    ACTIVITIES.forEach(activity => {
      const matchTitle = activity.title.toLocaleLowerCase('tr').includes(lowerCaseQuery);
      const matchDescription = activity.description.toLocaleLowerCase('tr').includes(lowerCaseQuery);
      
      if ((matchTitle || matchDescription) && !uniqueResults.has(activity.id)) {
        uniqueResults.set(activity.id, activity);
      }
    });

    return Array.from(uniqueResults.values());
  }, [debouncedQuery]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery(''); // Reset immediate query
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSelect = (activity: Activity) => {
    onSelectActivity(activity.id);
    setIsOpen(false);
    setQuery('');
  };

  const getCategoryForActivity = (activityId: ActivityType): string => {
    const category = ACTIVITY_CATEGORIES.find(cat => cat.activities.includes(activityId));
    return category ? category.title.split(' ')[1] : 'Diğer';
  };

  return (
    <div ref={searchContainerRef} className="relative" id="tour-search">
      <button
        onClick={() => setIsOpen(true)}
        className="text-zinc-400 hover:text-white hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] transition-all duration-300 p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-zinc-900"
        aria-label="Arama yap"
        title="Etkinlik Ara"
      >
        <i className="fa-solid fa-magnifying-glass fa-lg"></i>
      </button>

      {isOpen && (
        <div 
          className="absolute top-1/2 -translate-y-1/2 right-0 w-64"
          role="search"
        >
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"></i>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Etkinlik ara..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {query.length > 1 && (
            <div className="absolute top-full right-0 mt-2 w-full max-h-96 overflow-y-auto bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 z-50">
              {searchResults.length > 0 ? (
                <ul>
                  {searchResults.map((activity) => (
                    <li key={activity.id + activity.title}>
                      <button
                        onClick={() => handleSelect(activity)}
                        className="w-full text-left flex items-center gap-3 p-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-colors"
                      >
                        <i className={`${activity.icon} fa-fw text-zinc-400 dark:text-zinc-500`}></i>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{activity.title}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">{getCategoryForActivity(activity.id)}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-4 text-center text-sm text-zinc-500 dark:text-zinc-400">Sonuç bulunamadı.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
