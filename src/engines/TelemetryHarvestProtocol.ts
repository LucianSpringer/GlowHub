// TelemetryHarvestProtocol.ts - Client-side Behavior Tracking
// Pattern: Event Logging + Session Throttle + Aggregation

const TELEMETRY_STORAGE_KEY = 'glowhub_brand_telemetry';
const SESSION_KEY = 'glowhub_telemetry_session';

export interface BrandInteraction {
    brandId: string;
    type: 'HOVER' | 'CLICK';
    timestamp: number;
    duration?: number; // For hover events
}

export interface TelemetryData {
    interactions: Record<string, number>; // brandId -> interaction count
    lastUpdated: number;
    brandOfTheDay: string | null;
    sessionId: string;
}

/**
 * Generate unique session ID
 */
const generateSessionId = (): string => {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Get or create session ID
 */
const getSessionId = (): string => {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
        sessionId = generateSessionId();
        sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
};

/**
 * Load telemetry data from localStorage
 */
export const loadTelemetry = (): TelemetryData => {
    try {
        const stored = localStorage.getItem(TELEMETRY_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch {
        // Ignore parse errors
    }

    return {
        interactions: {},
        lastUpdated: Date.now(),
        brandOfTheDay: null,
        sessionId: getSessionId()
    };
};

/**
 * Save telemetry data to localStorage
 */
const saveTelemetry = (data: TelemetryData): void => {
    try {
        localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(data));
    } catch {
        // Handle storage quota exceeded
    }
};

/**
 * Record a brand interaction (throttled per session)
 */
export const recordInteraction = (
    brandId: string,
    type: 'HOVER' | 'CLICK',
    duration: number = 0
): void => {
    // Skip short hovers (< 200ms)
    if (type === 'HOVER' && duration < 200) return;

    const data = loadTelemetry();
    const sessionKey = `${getSessionId()}-${brandId}-${type}`;

    // Throttle: Check if already recorded this interaction type this session
    const sessionInteractions = sessionStorage.getItem(sessionKey);
    if (sessionInteractions) {
        const count = parseInt(sessionInteractions, 10);
        if (count >= 3) return; // Max 3 per type per session
        sessionStorage.setItem(sessionKey, String(count + 1));
    } else {
        sessionStorage.setItem(sessionKey, '1');
    }

    // Increment interaction count
    const weight = type === 'CLICK' ? 3 : 1; // Clicks worth more
    data.interactions[brandId] = (data.interactions[brandId] || 0) + weight;
    data.lastUpdated = Date.now();

    // Recalculate "Brand of the Day"
    data.brandOfTheDay = calculateBrandOfTheDay(data.interactions);

    saveTelemetry(data);
};

/**
 * Calculate which brand has highest interaction score
 */
export const calculateBrandOfTheDay = (
    interactions: Record<string, number>
): string | null => {
    const entries = Object.entries(interactions);
    if (entries.length === 0) return null;

    const sorted = entries.sort((a, b) => b[1] - a[1]);
    return sorted[0][0];
};

/**
 * Get interaction count for a specific brand
 */
export const getBrandInteractionCount = (brandId: string): number => {
    const data = loadTelemetry();
    return data.interactions[brandId] || 0;
};

/**
 * Get all interaction data
 */
export const getAllInteractions = (): Record<string, number> => {
    return loadTelemetry().interactions;
};

/**
 * Get Brand of the Day
 */
export const getBrandOfTheDay = (): string | null => {
    return loadTelemetry().brandOfTheDay;
};

/**
 * Clear telemetry data (for testing)
 */
export const clearTelemetry = (): void => {
    localStorage.removeItem(TELEMETRY_STORAGE_KEY);
};
