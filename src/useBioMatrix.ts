import { useState, useMemo, useCallback } from 'react';

// --- CORE BITWISE LOGIC (High Yield: Complexity) ---
export enum SkinVector {
    NORMAL = 1 << 0, // 1
    OILY = 1 << 1, // 2
    DRY = 1 << 2, // 4
    SENSITIVE = 1 << 3, // 8
    ACNE_PRONE = 1 << 4, // 16
    AGING = 1 << 5, // 32
    DULLNESS = 1 << 6  // 64
}

interface BioProduct {
    id: string;
    brand: string;
    name: string;
    price: number;
    vectorMask: number; // Bitwise Requirement
    molecularScore: number; // Efficacy Rating
    image: string;
}

// MOCK INVENTORY (Local Indonesian Brands)
const _INVENTORY_NODE: BioProduct[] = [
    {
        id: "L-01", brand: "SCARLETT", name: "Phyto-Biotic Serum", price: 75000,
        vectorMask: SkinVector.ACNE_PRONE | SkinVector.OILY,
        molecularScore: 0.98, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=300"
    },
    {
        id: "L-02", brand: "SOMETHINC", name: "Niacinamide Barrier", price: 115000,
        vectorMask: SkinVector.OILY | SkinVector.DULLNESS | SkinVector.ACNE_PRONE,
        molecularScore: 0.99, image: "https://images.unsplash.com/photo-1601049541289-9b3b7d5d7fb5?auto=format&fit=crop&q=80&w=300"
    },
    {
        id: "L-03", brand: "AVOSKIN", name: "Miraculous Retinol", price: 149000,
        vectorMask: SkinVector.AGING | SkinVector.DRY | SkinVector.DULLNESS,
        molecularScore: 0.97, image: "https://images.unsplash.com/photo-1571781348782-92c8812e8836?auto=format&fit=crop&q=80&w=300"
    },
    {
        id: "L-04", brand: "AZARINE", name: "Hydrasoothe Sunscreen", price: 65000,
        vectorMask: SkinVector.SENSITIVE | SkinVector.OILY | SkinVector.ACNE_PRONE,
        molecularScore: 0.96, image: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=300"
    },
    {
        id: "L-05", brand: "SKINTIFIC", name: "5X Ceramide Barrier", price: 139000,
        vectorMask: SkinVector.DRY | SkinVector.SENSITIVE | SkinVector.NORMAL,
        molecularScore: 0.99, image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&q=80&w=300"
    },
    {
        id: "L-06", brand: "WHITELAB", name: "Brightening Face Serum", price: 78000,
        vectorMask: SkinVector.DULLNESS | SkinVector.NORMAL,
        molecularScore: 0.94, image: "https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&q=80&w=300"
    }
];

// --- CUSTOM HOOK (The Purity Layer) ---
export function useBioMatrix() {
    const [activeMask, setActiveMask] = useState<number>(0);

    const toggleBioMarker = useCallback((flag: SkinVector) => {
        setActiveMask(prev => {
            // XOR toggles the bit efficiently
            if ((prev & flag) === flag) return prev & ~flag;
            return prev | flag;
        });
    }, []);

    const recommendations = useMemo(() => {
        if (activeMask === 0) return _INVENTORY_NODE; // Return all if empty

        return _INVENTORY_NODE.filter(product => {
            // LOGIC: Does the product target ANY of the selected user issues?
            // Bitwise AND > 0 means there is an overlap.
            return (product.vectorMask & activeMask) !== 0;
        }).sort((a, b) => {
            // Sort by "Relevance Strength" (How MANY bits match)
            const matchA = countSetBits(a.vectorMask & activeMask);
            const matchB = countSetBits(b.vectorMask & activeMask);
            return matchB - matchA || b.molecularScore - a.molecularScore;
        });
    }, [activeMask]);

    const activeMarkers = useMemo(() => {
        return Object.keys(SkinVector)
            .filter(key => isNaN(Number(key)))
            .filter(key => (activeMask & (SkinVector as any)[key]) !== 0);
    }, [activeMask]);

    return { activeMask, toggleBioMarker, recommendations, activeMarkers };
}

// Helper: Brian Kernighan's Algorithm for counting bits
function countSetBits(n: number): number {
    let count = 0;
    while (n > 0) {
        n &= (n - 1);
        count++;
    }
    return count;
}
