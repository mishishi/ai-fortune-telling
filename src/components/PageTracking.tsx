'use client';

import { usePageTracking } from '@/lib/analytics';

export default function PageTracking() {
  usePageTracking();
  return null;
}