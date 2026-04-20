'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Trigger entrance animation on route change
    setIsAnimating(true);
  }, [pathname]);

  return (
    <div
      className={`page-transition-container ${isAnimating ? 'animate-fade-in-up' : ''}`}
      onAnimationEnd={() => setIsAnimating(false)}
    >
      {children}
    </div>
  );
}
