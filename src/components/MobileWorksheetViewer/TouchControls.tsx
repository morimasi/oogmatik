import React, { useRef, useCallback, useEffect, useState } from 'react';
import styles from './TouchControls.module.css';

interface TouchControlsProps {
  children: React.ReactNode;
  /** Called when user swipes left */
  onSwipeLeft?: () => void;
  /** Called when user swipes right */
  onSwipeRight?: () => void;
  /** Called when user swipes up */
  onSwipeUp?: () => void;
  /** Called when user swipes down (pull-to-refresh) */
  onPullRefresh?: () => void;
  /** Called on pinch zoom with scale delta */
  onPinchZoom?: (scaleDelta: number) => void;
  /** Called on long press */
  onLongPress?: (x: number, y: number) => void;
  /** Called on double tap */
  onDoubleTap?: (x: number, y: number) => void;
  /** Minimum swipe distance in px (default: 50) */
  swipeThreshold?: number;
  className?: string;
}

const LONG_PRESS_MS = 600;
const DOUBLE_TAP_MS = 300;

export const TouchControls: React.FC<TouchControlsProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onPullRefresh,
  onPinchZoom,
  onLongPress,
  onDoubleTap,
  swipeThreshold = 50,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const initialPinchDistRef = useRef<number | null>(null);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);

  const getDistance = (t1: React.Touch, t2: React.Touch): number => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch start
        initialPinchDistRef.current = getDistance(e.touches[0], e.touches[1]);
        clearLongPress();
        return;
      }

      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };

      // Long press
      if (onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          if (touchStartRef.current) {
            onLongPress(touchStartRef.current.x, touchStartRef.current.y);
            // Haptic feedback (if supported)
            if ('vibrate' in navigator) navigator.vibrate(50);
          }
        }, LONG_PRESS_MS);
      }
    },
    [onLongPress, clearLongPress],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && onPinchZoom && initialPinchDistRef.current !== null) {
        // Pinch zoom
        const newDist = getDistance(e.touches[0], e.touches[1]);
        const delta = newDist - initialPinchDistRef.current;
        onPinchZoom(delta);
        initialPinchDistRef.current = newDist;
        return;
      }

      if (!touchStartRef.current) return;
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;

      // Cancel long press if moved significantly
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        clearLongPress();
      }

      // Pull to refresh indicator
      if (onPullRefresh && dy > 80 && Math.abs(dy) > Math.abs(dx)) {
        setIsPullRefreshing(true);
      }
    },
    [onPinchZoom, onPullRefresh, clearLongPress],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      clearLongPress();
      initialPinchDistRef.current = null;

      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const dt = Date.now() - touchStartRef.current.time;

      // Swipe detection
      if (Math.abs(dx) > swipeThreshold && Math.abs(dx) > Math.abs(dy) && dt < 300) {
        if (dx < 0 && onSwipeLeft) onSwipeLeft();
        else if (dx > 0 && onSwipeRight) onSwipeRight();
      } else if (dy < -swipeThreshold && Math.abs(dy) > Math.abs(dx) && dt < 300) {
        if (onSwipeUp) onSwipeUp();
      }

      // Pull to refresh
      if (isPullRefreshing && onPullRefresh) {
        setIsPullRefreshing(false);
        onPullRefresh();
        if ('vibrate' in navigator) navigator.vibrate([30, 20, 30]);
      } else {
        setIsPullRefreshing(false);
      }

      // Double tap
      const now = Date.now();
      if (
        onDoubleTap &&
        lastTapRef.current &&
        now - lastTapRef.current.time < DOUBLE_TAP_MS &&
        Math.abs(touch.clientX - lastTapRef.current.x) < 30 &&
        Math.abs(touch.clientY - lastTapRef.current.y) < 30
      ) {
        onDoubleTap(touch.clientX, touch.clientY);
        lastTapRef.current = null;
      } else {
        lastTapRef.current = { x: touch.clientX, y: touch.clientY, time: now };
      }

      touchStartRef.current = null;
    },
    [clearLongPress, swipeThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, isPullRefreshing, onPullRefresh, onDoubleTap],
  );

  // Clean up on unmount
  useEffect(() => () => clearLongPress(), [clearLongPress]);

  return (
    <div
      ref={containerRef}
      className={`${styles.touchContainer} ${className ?? ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'pan-y' }}
    >
      {isPullRefreshing && (
        <div className={styles.pullIndicator} aria-live="polite">
          🔄 Yenileniyor...
        </div>
      )}
      {children}
    </div>
  );
};

TouchControls.displayName = 'TouchControls';
