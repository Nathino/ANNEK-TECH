import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface UseAppRefreshOptions {
  onRefresh?: () => void | Promise<void>;
  pullThreshold?: number;
  refreshDelay?: number;
}

interface UseAppRefreshReturn {
  refreshApp: () => Promise<void>;
  isRefreshing: boolean;
  clearCaches: () => Promise<void>;
  pullThreshold: number;
}

/**
 * Custom hook for app refresh functionality
 * Provides cache clearing and page refresh capabilities
 */
export const useAppRefresh = (options: UseAppRefreshOptions = {}): UseAppRefreshReturn => {
  const {
    onRefresh,
    pullThreshold = 80,
    refreshDelay = 300
  } = options;

  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Clear all caches including service worker caches
   */
  const clearCaches = useCallback(async (): Promise<void> => {
    try {
      // Clear service worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();

      // Clear IndexedDB if available
      if ('indexedDB' in window) {
        try {
          const databases = await indexedDB.databases?.();
          if (databases) {
            await Promise.all(
              databases.map(db => {
                if (db.name) {
                  return new Promise<void>((resolve, reject) => {
                    const deleteReq = indexedDB.deleteDatabase(db.name!);
                    deleteReq.onsuccess = () => resolve();
                    deleteReq.onerror = () => reject(deleteReq.error);
                  });
                }
                return Promise.resolve();
              })
            );
          }
        } catch (error) {
          console.warn('Could not clear IndexedDB:', error);
        }
      }

      console.log('All caches cleared successfully');
    } catch (error) {
      console.error('Error clearing caches:', error);
      throw error;
    }
  }, []);

  /**
   * Main refresh function that clears caches and reloads the page
   */
  const refreshApp = useCallback(async (): Promise<void> => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    try {
      // Show loading toast
      const loadingToast = toast.loading('Refreshing app...', {
        duration: 2000,
      });

      // Run custom refresh logic if provided
      if (onRefresh) {
        await onRefresh();
      }

      // Clear all caches
      await clearCaches();

      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, refreshDelay));

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Show success message
      toast.success('App refreshed successfully!', {
        duration: 2000,
      });

      // Reload the page
      window.location.reload();
    } catch (error) {
      console.error('Error during app refresh:', error);
      toast.error('Failed to refresh app. Please try again.');
      setIsRefreshing(false);
    }
  }, [isRefreshing, onRefresh, clearCaches, refreshDelay]);

  return {
    refreshApp,
    isRefreshing,
    clearCaches,
    pullThreshold
  };
};
