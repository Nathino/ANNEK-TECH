import React, { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { useAppRefresh } from '../hooks/useAppRefresh';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh?: () => void | Promise<void>;
  pullThreshold?: number;
  refreshDelay?: number;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  pullThreshold = 80,
  refreshDelay = 300
}) => {
  const isMobile = useIsMobile();
  const { refreshApp, isRefreshing } = useAppRefresh({
    onRefresh,
    pullThreshold,
    refreshDelay
  });

  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [canPull, setCanPull] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Check if we're at the top of the page
  useEffect(() => {
    const checkScrollPosition = () => {
      setCanPull(window.scrollY === 0);
    };

    checkScrollPosition();
    window.addEventListener('scroll', checkScrollPosition);
    return () => window.removeEventListener('scroll', checkScrollPosition);
  }, []);

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || !canPull || isRefreshing) return;

    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
    setIsPulling(true);
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !isPulling || isRefreshing) return;

    const touchY = e.touches[0].clientY;
    setCurrentY(touchY);
    const distance = Math.max(0, currentY - startY);
    
    // Only allow pull if we're at the top
    if (window.scrollY === 0 && distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, pullThreshold * 1.5));
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    if (!isMobile || !isPulling || isRefreshing) return;

    setIsPulling(false);

    if (pullDistance >= pullThreshold) {
      refreshApp();
    }

    setPullDistance(0);
    setStartY(0);
    setCurrentY(0);
  };

  // Don't render pull-to-refresh on desktop
  if (!isMobile) {
    return <>{children}</>;
  }

  const pullProgress = Math.min(pullDistance / pullThreshold, 1);
  const shouldRefresh = pullDistance >= pullThreshold;

  return (
    <div
      ref={containerRef}
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {isPulling && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 transition-all duration-200"
          style={{
            height: `${Math.min(pullDistance, 100)}px`,
            transform: `translateY(${Math.min(pullDistance - 100, 0)}px)`,
          }}
        >
          <div className="flex flex-col items-center space-y-2">
            <div
              className={`transition-all duration-200 ${
                shouldRefresh ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <RefreshCw
                className={`h-6 w-6 transition-transform duration-200 ${
                  shouldRefresh ? 'rotate-180' : ''
                }`}
                style={{
                  transform: `rotate(${pullProgress * 180}deg)`,
                }}
              />
            </div>
            <p
              className={`text-sm font-medium transition-colors duration-200 ${
                shouldRefresh
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {shouldRefresh ? 'Release to refresh' : 'Pull to refresh'}
            </p>
          </div>
        </div>
      )}

      {/* Main content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: isPulling ? `translateY(${Math.min(pullDistance, 100)}px)` : 'translateY(0)',
        }}
      >
        {children}
      </div>

      {/* Loading overlay when refreshing */}
      {isRefreshing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-8 w-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
            <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
              Refreshing app...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PullToRefresh;
