import React from 'react';

interface NoteSearchData {
  slug: string;
  title: string;
  notebook: string;
  notebookTitle: string;
  excerpt: string;
  tags: string[];
  date: string;
  isAI?: boolean;
}

interface SearchResultsProps {
  results: NoteSearchData[];
  query: string;
  selectedIndex: number;
  onResultClick?: (index: number) => void;
  onResultHover?: (index: number) => void;
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query || !query.trim()) return text;
  
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  
  // 使用 split 和正则表达式来分割字符串
  const parts = text.split(regex);
  
  // 如果只有一个部分（没有匹配），返回原文本
  if (parts.length === 1) {
    return text;
  }
  
  // 创建高亮的 JSX
  return parts.map((part, index) => {
    // 检查是否是匹配的部分（索引为奇数的部分）
    // split 会将匹配的部分作为分隔符，所以奇数索引是匹配的部分
    if (index % 2 === 1 && part) {
      return <mark key={index}>{part}</mark>;
    }
    return part ? <React.Fragment key={index}>{part}</React.Fragment> : null;
  });
}

export function SearchResults({ results, query, selectedIndex, onResultClick, onResultHover }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="search-result-item no-results">
        未找到匹配的笔记
      </div>
    );
  }

  return (
    <>
      {results.map((note, index) => {
        const baseUrl = note.isAI ? '/ai-notebooks' : '/notebooks';
        return (
        <a
          key={`${note.notebook}-${note.slug}`}
          href={`${baseUrl}/${note.notebook}/${note.slug}`}
          className={`search-result-item ${selectedIndex === index ? 'selected' : ''}`}
          data-index={index}
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
            if (onResultClick) {
              e.preventDefault();
              onResultClick(index);
            }
          }}
          onMouseEnter={() => {
            if (onResultHover) {
              onResultHover(index);
            }
          }}
        >
          <div className="result-header">
            <h4 className="result-title">{highlightMatch(note.title, query)}</h4>
            <span className="result-notebook">{note.notebookTitle}</span>
          </div>
          {note.excerpt && (
            <p className="result-excerpt">{highlightMatch(note.excerpt, query)}</p>
          )}
          {note.tags.length > 0 && (
            <div className="result-tags">
              {note.tags.map((tag) => (
                <span key={tag} className="result-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </a>
        );
      })}
    </>
  );
}

