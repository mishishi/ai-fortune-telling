'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useMemo } from 'react';

interface NavItem {
  path: string;
  label: string;
  icon: 'home' | 'history' | 'profile';
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: '首页', icon: 'home' },
  { path: '/history', label: '历史', icon: 'history' },
  { path: '/profile', label: '我的', icon: 'profile' },
];

// Layout constants
const NAV_HEIGHT = '64px';
const ICON_SIZE = 28;
const FONT_SIZE = '10px';
const ITEM_GAP = '4px';
const INDICATOR_WIDTH = '72px';
const GRADIENT_ID = 'bottom-nav-gold-gradient';

// SVG Icons as components
function HomeIcon({ active }: { active: boolean }) {
  const strokeColor = active ? `url(#${GRADIENT_ID})` : '#666';
  const fillColor = active ? `url(#${GRADIENT_ID})` : 'none';

  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fillColor}
      />
    </svg>
  );
}

function HistoryIcon({ active }: { active: boolean }) {
  const strokeColor = active ? `url(#${GRADIENT_ID})` : '#666';
  const fillColor = active ? `url(#${GRADIENT_ID})` : 'none';

  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fillColor}
      />
      <path
        d="M12 6V5M12 19V18"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  const strokeColor = active ? `url(#${GRADIENT_ID})` : '#666';
  const fillColor = active ? `url(#${GRADIENT_ID})` : 'none';

  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle
        cx="12"
        cy="8"
        r="4"
        stroke={strokeColor}
        strokeWidth="2"
        fill={fillColor}
      />
      <path
        d="M5 20C5 16.6863 7.68629 14 11 14H13C16.3137 14 19 16.6863 19 20"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function getIcon(icon: NavItem['icon'], active: boolean) {
  switch (icon) {
    case 'home':
      return <HomeIcon active={active} />;
    case 'history':
      return <HistoryIcon active={active} />;
    case 'profile':
      return <ProfileIcon active={active} />;
  }
}

export default function BottomNav() {
  const pathname = usePathname();

  // Determine active index based on pathname
  // /report/[id] should inherit home tab active state
  // /login should hide nav (handled in layout)
  const activeIndex = useMemo(() => {
    if (pathname === '/login') return -1;
    if (pathname.startsWith('/report/')) return 0;
    const index = NAV_ITEMS.findIndex((item) => item.path === pathname);
    return index;
  }, [pathname]);

  // Don't render on login page
  if (pathname === '/login') {
    return null;
  }

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: NAV_HEIGHT,
    background: 'rgba(10, 10, 15, 0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 'env(safe-area-inset-bottom)',
    zIndex: 100,
  };

  const navItemStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ITEM_GAP,
    textDecoration: 'none',
    position: 'relative',
    padding: '8px 16px',
    cursor: 'pointer',
  };

  const getIndicatorStyle = (): React.CSSProperties => ({
    position: 'absolute',
    left: '50%',
    bottom: '0',
    transform: 'translateX(-50%)',
    width: INDICATOR_WIDTH,
    height: '2px',
    background: 'linear-gradient(90deg, #f0c674, #d4af37)',
    borderRadius: '1px',
    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  });

  const textStyle: React.CSSProperties = {
    fontSize: FONT_SIZE,
    lineHeight: 1,
    fontWeight: 500,
  };

  return (
    <nav style={containerStyle}>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient id={GRADIENT_ID} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0c674" />
            <stop offset="100%" stopColor="#d4af37" />
          </linearGradient>
        </defs>
      </svg>
      {NAV_ITEMS.map((item, index) => {
        const isActive = activeIndex === index;
        return (
          <Link
            key={item.path}
            href={item.path}
            style={navItemStyle}
          >
            {isActive && (
              <div style={getIndicatorStyle()} />
            )}
            {getIcon(item.icon, isActive)}
            <span
              style={{
                ...textStyle,
                color: isActive ? '#d4af37' : '#666',
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
