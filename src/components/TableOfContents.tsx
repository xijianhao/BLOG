import { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // 从内容区域提取所有标题
    const contentArea = document.querySelector('.note-content');
    if (!contentArea) return;

    const headingElements = contentArea.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const extractedHeadings: Heading[] = [];

    headingElements.forEach((heading, index) => {
      let id = heading.id;
      const text = heading.textContent || '';
      
      // 如果没有 id，生成一个唯一的 id
      if (!id) {
        id = text
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\u4e00-\u9fa5-]/g, '') || `heading-${index}`;
        
        // 确保 id 唯一（处理重复标题）
        let uniqueId = id;
        let counter = 1;
        while (document.getElementById(uniqueId)) {
          uniqueId = `${id}-${counter}`;
          counter++;
        }
        id = uniqueId;
        heading.id = id;
      }

      const level = parseInt(heading.tagName.charAt(1));
      extractedHeadings.push({ id, text, level });
    });

    setHeadings(extractedHeadings);

    // 设置滚动监听
    const scrollContainer = document.querySelector('.main');
    const observerOptions = {
      root: scrollContainer, // 使用 .main 作为滚动容器
      rootMargin: '-20% 0% -35% 0%',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    }, observerOptions);

    headingElements.forEach((heading) => {
      observer.observe(heading);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  if (headings.length === 0) {
    return null;
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (!element) return;

    // 找到滚动的容器（.main 元素）
    const scrollContainer = document.querySelector('.main') as HTMLElement;
    if (!scrollContainer) return;

    // 获取元素和容器的位置信息
    const elementRect = element.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();
    
    // 计算元素相对于滚动容器的位置
    // elementRect.top 是元素相对于视口的位置
    // containerRect.top 是容器相对于视口的位置
    // scrollContainer.scrollTop 是容器当前的滚动位置
    const elementTopRelativeToContainer = elementRect.top - containerRect.top + scrollContainer.scrollTop;
    
    // 考虑 header 的高度（大约 80px）
    const headerOffset = 80;
    const targetScrollTop = elementTopRelativeToContainer - headerOffset;

    // 滚动到目标位置
    scrollContainer.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: 'smooth',
    });

    // 更新 URL hash
    const currentHash = window.location.hash;
    if (currentHash !== `#${id}`) {
      window.history.pushState(null, '', `#${id}`);
    }
    
    // 更新激活状态
    setActiveId(id);
  };

  return (
    <nav className="table-of-contents" aria-label="目录">
      <div className="toc-header">目录</div>
      <ul className="toc-list">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={`toc-item toc-level-${heading.level} ${activeId === heading.id ? 'active' : ''}`}
          >
            <a
              href={`#${heading.id}`}
              onClick={(e) => handleClick(e, heading.id)}
              className="toc-link"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

