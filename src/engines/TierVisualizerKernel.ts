// TierVisualizerKernel.ts - Procedural CSS Generation
// Pattern: Luminance Calculation + Gradient Synthesis

/**
 * Parse HEX color to RGB components
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

/**
 * Calculate relative luminance (WCAG formula)
 * Returns value between 0 (black) and 1 (white)
 */
export const calculateLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0.5;

    const { r, g, b } = rgb;

    // sRGB to linear RGB
    const toLinear = (c: number) => {
        const srgb = c / 255;
        return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
    };

    const linearR = toLinear(r);
    const linearG = toLinear(g);
    const linearB = toLinear(b);

    // WCAG relative luminance formula
    return 0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB;
};

/**
 * Determine optimal text color (white or black) for given background
 */
export const getContrastTextColor = (backgroundHex: string): 'white' | 'black' => {
    const luminance = calculateLuminance(backgroundHex);
    // WCAG threshold: 0.179 for 4.5:1 contrast ratio
    return luminance > 0.4 ? 'black' : 'white';
};

/**
 * Generate gradient string from theme color
 */
export const synthesizeGradient = (
    themeHex: string,
    direction: 'left' | 'right' | 'top' | 'bottom' = 'right',
    fadeToTransparent: boolean = true
): string => {
    const endColor = fadeToTransparent ? 'transparent' : `${themeHex}33`;
    return `linear-gradient(to ${direction}, ${themeHex}, ${endColor})`;
};

/**
 * Generate complete card styling from theme color
 */
export const generateCardStyle = (themeHex: string): {
    background: string;
    textColor: string;
    borderColor: string;
    shadowColor: string;
    accentGradient: string;
} => {
    const rgb = hexToRgb(themeHex);
    const shadowRgba = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : 'rgba(0,0,0,0.1)';

    return {
        background: synthesizeGradient(themeHex, 'right', true),
        textColor: getContrastTextColor(themeHex),
        borderColor: `${themeHex}66`,
        shadowColor: shadowRgba,
        accentGradient: `linear-gradient(135deg, ${themeHex}, ${themeHex}99)`
    };
};

/**
 * Get tier badge properties
 */
export const getTierBadge = (tier: 'PLATINUM' | 'GOLD' | 'SILVER'): {
    icon: 'crown' | 'badge' | 'star';
    color: string;
    label: string;
} => {
    switch (tier) {
        case 'PLATINUM':
            return { icon: 'crown', color: '#FCD34D', label: 'Platinum Partner' };
        case 'GOLD':
            return { icon: 'badge', color: '#F59E0B', label: 'Gold Partner' };
        case 'SILVER':
            return { icon: 'star', color: '#9CA3AF', label: 'Silver Partner' };
    }
};
