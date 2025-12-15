import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastRefreshRef = useRef<number>(0);

    // Threshold to trigger refresh
    const THRESHOLD = 80;
    // Maximum pull distance visually
    const MAX_PULL = 150;

    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            // Only enable pull to refresh if we are at the top of the page
            if (window.scrollY === 0) {
                setStartY(e.touches[0].clientY);
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (startY === 0 || isRefreshing) return;

            const y = e.touches[0].clientY;
            const diff = y - startY;

            // Only allow pulling down if we are at the top and pulling down
            if (diff > 0 && window.scrollY === 0) {
                // Add resistance
                const newY = diff < MAX_PULL ? diff : MAX_PULL + (diff - MAX_PULL) * 0.2;
                setCurrentY(newY);
                // Prevent default browser scrolling when pulling to refresh
                if (newY > 10 && e.cancelable) {
                    e.preventDefault();
                }
            }
        };

        const handleTouchEnd = async () => {
            if (startY === 0 || isRefreshing) return;

            if (currentY > THRESHOLD) {
                // Prevent rapid-fire refreshes (minimum 3 seconds between actions)
                const now = Date.now();
                if (now - lastRefreshRef.current < 3000) {
                    setIsRefreshing(false);
                    setCurrentY(0);
                    setStartY(0);
                    return;
                }

                setIsRefreshing(true);
                setCurrentY(THRESHOLD); // Snap to threshold
                lastRefreshRef.current = now;

                try {
                    await onRefresh();
                } finally {
                    setIsRefreshing(false);
                    setCurrentY(0);
                }
            } else {
                setCurrentY(0);
            }
            setStartY(0);
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('touchstart', handleTouchStart, { passive: true });
            container.addEventListener('touchmove', handleTouchMove, { passive: false }); // non-passive to prevent default
            container.addEventListener('touchend', handleTouchEnd);
        }

        return () => {
            if (container) {
                container.removeEventListener('touchstart', handleTouchStart);
                container.removeEventListener('touchmove', handleTouchMove);
                container.removeEventListener('touchend', handleTouchEnd);
            }
        };
    }, [startY, currentY, isRefreshing, onRefresh]);

    return (
        <div ref={containerRef} className="relative min-h-screen">
            <div
                className="absolute w-full flex justify-center items-center pointer-events-none z-10"
                style={{
                    height: `${THRESHOLD}px`,
                    top: 0,
                    transform: `translateY(${Math.min(currentY, THRESHOLD) - THRESHOLD}px)`,
                    opacity: Math.min(currentY / THRESHOLD, 1)
                }}
            >
                <div className={`p-2 rounded-full bg-white dark:bg-zinc-800 shadow-md transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
                    style={{ transform: `rotate(${currentY * 2}deg)` }}>
                    <Loader2 className="w-5 h-5 text-stone-600 dark:text-zinc-400" />
                </div>
            </div>

            <div
                style={{
                    transform: `translateY(${currentY}px)`,
                    transition: isRefreshing ? 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' : 'transform 0.3s cubic-bezier(0, 0, 0.2, 1)'
                }}
            >
                {children}
            </div>
        </div>
    );
};
