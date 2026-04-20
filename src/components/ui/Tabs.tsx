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
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);

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
        role="tablist"
        aria-orientation="horizontal"
        className="flex gap-1 p-1 rounded-xl"
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
      </div>

      {/* Tab Panels */}
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`tabpanel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          tabIndex={0}
          className="mt-4 focus:outline-none"
        >
          {activeTab === tab.id && tab.content}
        </div>
      ))}
    </div>
  );
}
