import React, { useState, useEffect, useRef } from 'react';
import { SearchResults } from './SearchResults';

interface NoteSearchData {
  slug: string;
  title: string;
  notebook: string;
  notebookTitle: string;
  excerpt: string;
  tags: string[];
  date: string;
}

interface SearchBoxReactProps {
  notesData: NoteSearchData[];
}

export default function SearchBoxReact({ notesData }: SearchBoxReactProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NoteSearchData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isActive, setIsActive] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);

  // 搜索函数
  function searchNotes(searchQuery: string) {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setResults([]);
      setIsActive(false);
      setSelectedIndex(-1);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase().trim();
    const filteredResults = notesData.filter((note) => {
      const titleMatch = note.title.toLowerCase().includes(lowerQuery);
      const excerptMatch = note.excerpt.toLowerCase().includes(lowerQuery);
      const tagsMatch = note.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
      const notebookMatch = note.notebookTitle.toLowerCase().includes(lowerQuery);
      
      return titleMatch || excerptMatch || tagsMatch || notebookMatch;
    }).slice(0, 10); // 最多显示10个结果

    setResults(filteredResults);
    setIsActive(true); // 无论是否有结果，都显示结果容器
    setSelectedIndex(-1);
  }

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    searchNotes(value);
  };

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const container = searchContainerRef.current;
      if (container && !container.contains(e.target as Node)) {
        setIsActive(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // 键盘导航
  useEffect(() => {
    const searchInput = searchInputRef.current;
    if (!searchInput || !isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev: number) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev: number) => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0 && results[selectedIndex]) {
        e.preventDefault();
        window.location.href = `/notebooks/${results[selectedIndex].notebook}/${results[selectedIndex].slug}`;
      } else if (e.key === 'Escape') {
        setIsActive(false);
        searchInput.blur();
      }
    };

    searchInput.addEventListener('keydown', handleKeyDown);
    return () => {
      searchInput.removeEventListener('keydown', handleKeyDown);
    };
  }, [results, selectedIndex, isActive]);

  // 滚动到选中项
  useEffect(() => {
    if (selectedIndex >= 0 && searchResultsRef.current) {
      const selectedItem = searchResultsRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      );
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleResultClick = (index: number) => {
    if (results[index]) {
      window.location.href = `/notebooks/${results[index].notebook}/${results[index].slug}`;
    }
  };

  return (
    <div className="search-container" ref={searchContainerRef}>
      <div className="search-box">
        <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          ref={searchInputRef}
          type="text"
          className="search-input"
          placeholder="搜索笔记..."
          autoComplete="off"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim().length > 0) {
              setIsActive(true);
            }
          }}
        />
      </div>
      <div 
        ref={searchResultsRef}
        className={`search-results ${isActive ? 'active' : ''}`}
      >
        <SearchResults
          results={results}
          query={query}
          selectedIndex={selectedIndex}
          onResultClick={handleResultClick}
        />
      </div>
    </div>
  );
}

