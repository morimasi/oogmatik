
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
    <div ref={searchContainerRef} className="relative z-[95]" id="tour-search">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex shrink-0 items-center justify-center w-9 h-9 transition-all rounded-lg border border-transparent group/nav focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]/35 ${isOpen ? 'text-[var(--accent-color)] bg-[var(--bg-paper)] shadow-premium-sm border-[var(--border-color)] scale-[0.97]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:border-[var(--border-color)]/30'}`}
        aria-label="Arama yap"
        title="Etkinlik Ara"
      >
        <i className={`fa-solid fa-magnifying-glass text-[15px] leading-none transition-transform ${!isOpen && 'group-hover/nav:scale-105'}`}></i>
      </button>

      {isOpen && (
        <div 
          className="absolute top-[120%] right-0 w-[300px] md:w-[340px] animate-in fade-in slide-in-from-top-2 duration-200 font-['Lexend'] shadow-[0_25px_50px_rgba(0,0,0,0.5)]"
          role="search"
        >
          <div className="bg-[var(--bg-paper)]/95 backdrop-blur-3xl rounded-[1.5rem] border border-[var(--border-color)] overflow-hidden flex flex-col p-2">
            <div className="relative mb-2">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--accent-color)] opacity-70"></i>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Platformda ne arıyorsunuz?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-black/20 text-[var(--text-primary)] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xs font-bold placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-color)]/40 focus:bg-black/30 transition-all font-['Lexend']"
              />
            </div>

            {query.length > 1 && (
              <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
                {searchResults.length > 0 ? (
                  <ul className="space-y-1 px-1 pb-1">
                    {searchResults.map((activity) => (
                      <li key={activity.id + activity.title}>
                        <button
                          onClick={() => handleSelect(activity)}
                          className="w-full text-left flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--accent-color)]/10 transition-colors group/item"
                        >
                          <div className="w-8 h-8 rounded-lg flex flex-col items-center justify-center bg-black/20 border border-[var(--border-color)] group-hover/item:border-[var(--accent-color)]/30 group-hover/item:scale-105 transition-all text-xs text-[var(--text-muted)] group-hover/item:text-[var(--accent-color)]">
                             <i className={`${activity.icon} fa-fw`}></i>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-[11px] font-black text-[var(--text-primary)] group-hover/item:text-[var(--accent-color)] truncate uppercase tracking-tight transition-colors">{activity.title}</p>
                            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5 opacity-60">{getCategoryForActivity(activity.id)}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="py-8 text-center bg-black/10 rounded-xl mt-1">
                    <i className="fa-solid fa-ghost text-xl text-[var(--text-muted)] opacity-30 mb-2"></i>
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Sonuç bulunamadı</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
