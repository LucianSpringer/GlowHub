// useBrandResonance.ts - Hook wrapping BrandResonanceEngine + Telemetry
import { useState, useEffect, useCallback, useMemo } from 'react';
import { getSortedBrands, type ScoredBrand } from '../engines/BrandResonanceEngine';
import {
    recordInteraction,
    getAllInteractions,
    getBrandOfTheDay
} from '../engines/TelemetryHarvestProtocol';

interface UseBrandResonanceReturn {
    brands: ScoredBrand[];
    brandOfTheDay: string | null;
    recordHover: (brandId: string, duration: number) => void;
    recordClick: (brandId: string) => void;
    isLoading: boolean;
}

export const useBrandResonance = (featuredOnly: boolean = true): UseBrandResonanceReturn => {
    const [telemetryData, setTelemetryData] = useState<Record<string, number>>({});
    const [brandOfTheDay, setBrandOfTheDay] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load telemetry on mount
    useEffect(() => {
        setTelemetryData(getAllInteractions());
        setBrandOfTheDay(getBrandOfTheDay());
        setIsLoading(false);
    }, []);

    // Memoized sorted brands
    const brands = useMemo(() =>
        getSortedBrands(telemetryData, featuredOnly),
        [telemetryData, featuredOnly]
    );

    // Record hover interaction
    const recordHover = useCallback((brandId: string, duration: number) => {
        recordInteraction(brandId, 'HOVER', duration);
        // Update local state to reflect new telemetry
        setTelemetryData(getAllInteractions());
        setBrandOfTheDay(getBrandOfTheDay());
    }, []);

    // Record click interaction
    const recordClick = useCallback((brandId: string) => {
        recordInteraction(brandId, 'CLICK');
        setTelemetryData(getAllInteractions());
        setBrandOfTheDay(getBrandOfTheDay());
    }, []);

    return {
        brands,
        brandOfTheDay,
        recordHover,
        recordClick,
        isLoading
    };
};
