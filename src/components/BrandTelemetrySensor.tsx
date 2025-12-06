// BrandTelemetrySensor.tsx - Invisible Hover Detection Wrapper
import { useRef, useCallback, type ReactNode } from 'react';

interface BrandTelemetrySensorProps {
    brandId: string;
    onInterest: (brandId: string, duration: number) => void;
    onClick: (brandId: string) => void;
    children: ReactNode;
}

export const BrandTelemetrySensor = ({
    brandId,
    onInterest,
    onClick,
    children
}: BrandTelemetrySensorProps) => {
    const hoverStartRef = useRef<number | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = useCallback(() => {
        hoverStartRef.current = Date.now();

        // Debounce: Only fire after 200ms of continuous hover
        debounceRef.current = setTimeout(() => {
            if (hoverStartRef.current) {
                const duration = Date.now() - hoverStartRef.current;
                onInterest(brandId, duration);
            }
        }, 200);
    }, [brandId, onInterest]);

    const handleMouseLeave = useCallback(() => {
        // Clear debounce if leaving before 200ms
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
            debounceRef.current = null;
        }

        // Record total hover duration if meaningful
        if (hoverStartRef.current) {
            const duration = Date.now() - hoverStartRef.current;
            if (duration >= 200) {
                onInterest(brandId, duration);
            }
        }

        hoverStartRef.current = null;
    }, [brandId, onInterest]);

    const handleClick = useCallback(() => {
        onClick(brandId);
    }, [brandId, onClick]);

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            className="inline-block"
        >
            {children}
        </div>
    );
};
