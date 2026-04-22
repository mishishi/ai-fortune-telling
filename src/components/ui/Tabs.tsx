'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export function Tabs({ tabs, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [focusedTabId, setFocusedTabId] = useState<string | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [contentVisible, setContentVisible] = useState<string | null>(activeTab);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabListRef = useRef<HTMLDivElement>(null);

  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);

  // Update sliding indicator position
  useEffect(() => {
    const updateIndicator = () => {
      const activeButton = tabRefs.current[activeIndex];
      const tabList = tabListRef.current;
      if (activeButton && tabList) {
        const listRect = tabList.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();
        setIndicatorStyle({
          left: buttonRect.left - listRect.left,
          width: buttonRect.width,
        });
      }
    };

    updateIndicator();
    // Use resize observer for responsive updates
    const resizeObserver = new ResizeObserver(updateIndicator);
    if (tabListRef.current) {
      resizeObserver.observe(tabListRef.current);
    }
    window.addEventListener('resize', updateIndicator);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activeIndex]);

  // Content entrance animation
  useEffect(() => {
    setContentVisible(null); // Trigger exit animation briefly
    const timeoutId = setTimeout(() => {
      setContentVisible(activeTab);
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [activeTab]);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let newIndex = currentIndex;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      newIndex = currentIndex + 1 >= tabs.length ? 0 : currentIndex + 1;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      newIndex = currentIndex - 1 < 0 ? tabs.length - 1 : currentIndex - 1;
    }

    if (newIndex !== currentIndex) {
      setActiveTab(tabs[newIndex].id);
      tabRefs.current[newIndex]?.focus();
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const activeButton = tabRefs.current[activeIndex];
      if (activeButton) {
        activeButton.focus();
      }
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [activeIndex]);

  return (
    <div>
      {/* Tab List */}
      <div
        ref={tabListRef}
        role="tablist"
        aria-orientation="horizontal"
        className="relative flex gap-1 p-1 rounded-xl"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
        }}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              focus:outline-none focus-visible:ring-2
            `}
            onFocus={() => setFocusedTabId(tab.id)}
            onBlur={() => setFocusedTabId(null)}
            style={{
              background: activeTab === tab.id ? 'var(--color-surface)' : 'transparent',
              color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              boxShadow: (activeTab === tab.id || focusedTabId === tab.id) ? '0 0 0 2px var(--color-focus)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
        {/* Sliding Indicator */}
        <div
          className="absolute bottom-1 h-[3px] rounded-full"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            background: 'var(--color-accent)',
            transform: `translateX(0)`,
            transition: 'left 300ms var(--ease-smooth), width 300ms var(--ease-smooth)',
          }}
        />
      </div>

      {/* Tab Panels */}
      {tabs.map((tab) => (
        contentVisible === tab.id && (
          <div
            key={tab.id}
            role="tabpanel"
            id={`tabpanel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            tabIndex={0}
            className="mt-4 focus:outline-none"
            style={{
              animation: 'fadeInUp 400ms ease-out',
            }}
          >
            {tab.content}
          </div>
        )
      ))}
    </div>
  );
}
