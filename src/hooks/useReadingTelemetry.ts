// useReadingTelemetry.ts - Attention Heatmap Hook
// Pattern: IntersectionObserver + Time Tracking + Anti-AFK Validation

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    segmentArticle,
    calculateAttentionScore,
    type ReadingSegment
} from '../engines/ContentResonanceEngine';

interface ReadingTelemetryState {
    segments: ReadingSegment[];
    activeSegmentIndex: number | null;
    totalReadingTimeMs: number;
    completionPercent: number;
    engagementLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    focusedKeywords: string[];
    isUserActive: boolean;
    hasUnlockedReward: boolean;
}

interface UseReadingTelemetryReturn extends ReadingTelemetryState {
    containerRef: React.RefObject<HTMLDivElement | null>;
    getSegmentRef: (index: number) => (el: HTMLDivElement | null) => void;
    resetTelemetry: () => void;
}

const ACTIVITY_TIMEOUT_MS = 3000; // Consider inactive after 3s no movement
const UPDATE_INTERVAL_MS = 1000;  // Update time every second
const UNLOCK_THRESHOLD = 80;      // 80% completion to unlock reward

export const useReadingTelemetry = (content: string): UseReadingTelemetryReturn => {
    const [state, setState] = useState<ReadingTelemetryState>({
        segments: [],
        activeSegmentIndex: null,
        totalReadingTimeMs: 0,
        completionPercent: 0,
        engagementLevel: 'LOW',
        focusedKeywords: [],
        isUserActive: false,
        hasUnlockedReward: false
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const segmentRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const activeSegmentRef = useRef<number | null>(null);
    const lastActivityRef = useRef<number>(Date.now());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const intervalRef = useRef<any>(null);

    // Initialize segments from content
    useEffect(() => {
        const segments = segmentArticle(content);
        setState(prev => ({ ...prev, segments }));
    }, [content]);

    // Get ref callback for segment
    const getSegmentRef = useCallback((index: number) => {
        return (el: HTMLDivElement | null) => {
            if (el) {
                segmentRefs.current.set(index, el);
            } else {
                segmentRefs.current.delete(index);
            }
        };
    }, []);

    // Track user activity (mouse movement, scroll)
    useEffect(() => {
        const handleActivity = () => {
            lastActivityRef.current = Date.now();
            setState(prev => ({ ...prev, isUserActive: true }));
        };

        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('mousemove', handleActivity);
        container.addEventListener('scroll', handleActivity);
        container.addEventListener('click', handleActivity);
        container.addEventListener('touchmove', handleActivity);

        return () => {
            container.removeEventListener('mousemove', handleActivity);
            container.removeEventListener('scroll', handleActivity);
            container.removeEventListener('click', handleActivity);
            container.removeEventListener('touchmove', handleActivity);
        };
    }, []);

    // IntersectionObserver for segment visibility
    useEffect(() => {
        const observers: IntersectionObserver[] = [];

        segmentRefs.current.forEach((el, index) => {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                            activeSegmentRef.current = index;
                            setState(prev => ({
                                ...prev,
                                activeSegmentIndex: index,
                                segments: prev.segments.map((s, i) => ({
                                    ...s,
                                    isActive: i === index
                                }))
                            }));
                        }
                    });
                },
                { threshold: 0.5, root: containerRef.current }
            );

            observer.observe(el);
            observers.push(observer);
        });

        return () => {
            observers.forEach(obs => obs.disconnect());
        };
    }, [state.segments.length]);

    // Time tracking interval
    useEffect(() => {
        intervalRef.current = window.setInterval(() => {
            const now = Date.now();
            const isActive = now - lastActivityRef.current < ACTIVITY_TIMEOUT_MS;
            const activeIndex = activeSegmentRef.current;

            setState(prev => {
                // Only count time if user is active
                if (!isActive || activeIndex === null) {
                    return { ...prev, isUserActive: false };
                }

                // Update segment time
                const updatedSegments = prev.segments.map((s, i) => ({
                    ...s,
                    timeSpentMs: i === activeIndex ? s.timeSpentMs + UPDATE_INTERVAL_MS : s.timeSpentMs
                }));

                // Calculate attention metrics
                const metrics = calculateAttentionScore(updatedSegments);
                const hasUnlockedReward = metrics.completionPercent >= UNLOCK_THRESHOLD;

                return {
                    ...prev,
                    segments: updatedSegments,
                    totalReadingTimeMs: metrics.totalReadingTime,
                    completionPercent: metrics.completionPercent,
                    engagementLevel: metrics.engagementLevel,
                    focusedKeywords: metrics.focusedKeywords,
                    isUserActive: true,
                    hasUnlockedReward: prev.hasUnlockedReward || hasUnlockedReward
                };
            });
        }, UPDATE_INTERVAL_MS) as unknown as number;

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Reset telemetry
    const resetTelemetry = useCallback(() => {
        const segments = segmentArticle(content);
        setState({
            segments,
            activeSegmentIndex: null,
            totalReadingTimeMs: 0,
            completionPercent: 0,
            engagementLevel: 'LOW',
            focusedKeywords: [],
            isUserActive: false,
            hasUnlockedReward: false
        });
    }, [content]);

    return {
        ...state,
        containerRef,
        getSegmentRef,
        resetTelemetry
    };
};
