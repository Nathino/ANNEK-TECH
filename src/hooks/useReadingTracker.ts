import { useEffect, useRef, useState } from 'react';

interface ReadingTrackerOptions {
  postId: string;
  category: string;
  tags: string[];
  estimatedReadTime: number; // in minutes
  onTrackReading?: (data: {
    postId: string;
    category: string;
    tags: string[];
    readingTime: number;
    totalReadingTime: number;
  }) => void;
}

export const useReadingTracker = ({
  postId,
  category,
  tags,
  estimatedReadTime,
  onTrackReading
}: ReadingTrackerOptions) => {
  const [readingTime, setReadingTime] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTrackedTimeRef = useRef(0);
  const onTrackReadingRef = useRef(onTrackReading);

  // Update the ref when the callback changes
  useEffect(() => {
    onTrackReadingRef.current = onTrackReading;
  }, [onTrackReading]);

  // Convert estimated read time to seconds
  const totalReadingTime = estimatedReadTime * 60;

  // Start tracking when user starts reading
  const startReading = () => {
    if (!isReading && postId) {
      setIsReading(true);
      startTimeRef.current = Date.now();
      
      // Track every 5 seconds
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setReadingTime(elapsed);
          
          // Calculate reading progress based on scroll position
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = Math.min((scrollTop / documentHeight) * 100, 100);
          setReadingProgress(progress);
          
          // Track reading every 10 seconds or when significant progress is made
          if (elapsed - lastTrackedTimeRef.current >= 10 || progress - lastTrackedTimeRef.current >= 20) {
            if (onTrackReadingRef.current && postId) {
              onTrackReadingRef.current({
                postId,
                category,
                tags,
                readingTime: elapsed,
                totalReadingTime
              });
            }
            lastTrackedTimeRef.current = elapsed;
          }
        }
      }, 5000);
    }
  };

  // Stop tracking when user stops reading
  const stopReading = () => {
    if (isReading) {
      setIsReading(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Final tracking call
      if (startTimeRef.current && onTrackReadingRef.current && postId) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        onTrackReadingRef.current({
          postId,
          category,
          tags,
          readingTime: elapsed,
          totalReadingTime
        });
      }
    }
  };

  // Track visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopReading();
      } else if (isReading) {
        startReading();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []); // Remove isReading dependency to prevent re-adding listeners

  // Track scroll events to determine reading progress
  useEffect(() => {
    const handleScroll = () => {
      if (isReading) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.min((scrollTop / documentHeight) * 100, 100);
        setReadingProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isReading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    readingTime,
    readingProgress,
    isReading,
    startReading,
    stopReading,
    estimatedReadTime: totalReadingTime
  };
};
