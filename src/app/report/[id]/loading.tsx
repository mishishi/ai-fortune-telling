'use client';

import { Skeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <main className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      {/* Header Skeleton */}
      <div className="text-center mb-10 relative">
        <div className="absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 border-[var(--color-accent)] opacity-40" />
        <div className="absolute -top-4 -right-4 w-8 h-8 border-r-2 border-t-2 border-[var(--color-accent)] opacity-40" />
        <div className="absolute -bottom-4 -left-4 w-8 h-8 border-l-2 border-b-2 border-[var(--color-accent)] opacity-40" />
        <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r-2 border-b-2 border-[var(--color-accent)] opacity-40" />

        <Skeleton className="h-10 w-64 mx-auto mb-3" />
        <Skeleton className="h-4 w-40 mx-auto" />
      </div>

      {/* BaziRing Skeleton */}
      <div className="flex flex-col items-center py-6">
        <Skeleton variant="circular" className="w-80 h-80" />
        <div className="mt-4">
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* BaZi Detail Chart Skeleton */}
      <div className="mt-8 corner-brackets px-4 py-4">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-40 w-full" />
      </div>

      {/* Radar Chart Section Skeleton */}
      <div className="mt-8">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="flex flex-col items-center">
          {/* Radar Chart skeleton - pentagon shape approximation */}
          <div className="relative w-[300px] h-[300px] flex items-center justify-center">
            <Skeleton variant="circular" className="w-64 h-64" />
          </div>
          {/* Score bars skeleton */}
          <div className="w-full max-w-md mt-6 space-y-3">
            {[80, 62, 91, 78, 85].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fortune Display Skeleton */}
      <div className="mt-8">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      {/* Timeline Skeleton */}
      <div className="mt-8 corner-brackets px-4 py-4">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>

      {/* Extended Tools Skeleton */}
      <div className="mt-8 corner-brackets px-4 py-4">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/10">
              <Skeleton className="h-4 w-24 mx-auto mb-3" />
              <Skeleton className="h-56 w-full" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
