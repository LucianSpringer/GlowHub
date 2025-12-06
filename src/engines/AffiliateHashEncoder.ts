// AffiliateHashEncoder.ts - Base64 Link Encoding & Attribution
// Pattern: Serialization & Parameter Encoding

export interface AffiliateLinkData {
    userId: string;
    productId: string;
    campaignId?: string;
    timestamp: number;
}

export interface GeneratedLink {
    shortHash: string;
    fullUrl: string;
    qrDataUrl: string;
    expiresAt: number;
}

export interface ClickTelemetry {
    linkHash: string;
    clickCount: number;
    lastClickAt: number;
    uniqueVisitors: number;
}

// Base64 Encode (Browser-safe)
function encodeBase64(str: string): string {
    return btoa(unescape(encodeURIComponent(str)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

// Base64 Decode
function decodeBase64(str: string): string {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    return decodeURIComponent(escape(atob(base64)));
}

// Generate Short Hash
export function generateAffiliateHash(data: AffiliateLinkData): string {
    const payload = `${data.userId}|${data.productId}|${data.campaignId || 'direct'}|${data.timestamp}`;
    return encodeBase64(payload);
}

// Decode Hash to Original Data
export function decodeAffiliateHash(hash: string): AffiliateLinkData | null {
    try {
        const decoded = decodeBase64(hash);
        const parts = decoded.split('|');
        if (parts.length < 4) return null;

        return {
            userId: parts[0],
            productId: parts[1],
            campaignId: parts[2] === 'direct' ? undefined : parts[2],
            timestamp: parseInt(parts[3], 10)
        };
    } catch {
        return null;
    }
}

// Generate Full Affiliate Link
export function generateAffiliateLink(
    baseUrl: string,
    userId: string,
    productId: string,
    campaignId?: string
): GeneratedLink {
    const timestamp = Date.now();
    const data: AffiliateLinkData = { userId, productId, campaignId, timestamp };
    const shortHash = generateAffiliateHash(data);

    const fullUrl = `${baseUrl}/p/${shortHash}`;
    const expiresAt = timestamp + (30 * 24 * 60 * 60 * 1000); // 30 days

    // Generate QR Code Data URL (Simple SVG-based)
    const qrDataUrl = generateSimpleQRDataUrl(fullUrl);

    return { shortHash, fullUrl, qrDataUrl, expiresAt };
}

// Simple QR Code Generator (Canvas-based pattern)
function generateSimpleQRDataUrl(url: string): string {
    // For production, use a proper QR library
    // This returns a placeholder pattern
    const size = 200;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Generate pseudo-random pattern based on URL hash
    ctx.fillStyle = '#000000';
    const hash = url.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
    const modules = 21; // QR Code v1 is 21x21
    const moduleSize = Math.floor(size / modules);

    for (let row = 0; row < modules; row++) {
        for (let col = 0; col < modules; col++) {
            // Finder patterns (corners)
            if (
                (row < 7 && col < 7) ||
                (row < 7 && col >= modules - 7) ||
                (row >= modules - 7 && col < 7)
            ) {
                const isOuter = row === 0 || row === 6 || col === 0 || col === 6 ||
                    (col === modules - 7 || col === modules - 1) ||
                    (row === modules - 7 || row === modules - 1);
                const isInner = (row >= 2 && row <= 4 && col >= 2 && col <= 4) ||
                    (row >= 2 && row <= 4 && col >= modules - 5 && col <= modules - 3) ||
                    (row >= modules - 5 && row <= modules - 3 && col >= 2 && col <= 4);
                if (isOuter || isInner) {
                    ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
                }
            } else {
                // Random data modules based on hash
                if ((hash * (row + 1) * (col + 1)) % 3 === 0) {
                    ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
                }
            }
        }
    }

    return canvas.toDataURL('image/png');
}

// Telemetry Storage (LocalStorage simulation)
const TELEMETRY_KEY = 'glowhub_affiliate_telemetry';

export function recordClick(linkHash: string): void {
    const stored = localStorage.getItem(TELEMETRY_KEY);
    const telemetry: Record<string, ClickTelemetry> = stored ? JSON.parse(stored) : {};

    if (!telemetry[linkHash]) {
        telemetry[linkHash] = {
            linkHash,
            clickCount: 0,
            lastClickAt: 0,
            uniqueVisitors: 0
        };
    }

    telemetry[linkHash].clickCount++;
    telemetry[linkHash].lastClickAt = Date.now();
    telemetry[linkHash].uniqueVisitors++; // Simplified - would need proper tracking

    localStorage.setItem(TELEMETRY_KEY, JSON.stringify(telemetry));
}

export function getTelemetry(linkHash: string): ClickTelemetry | null {
    const stored = localStorage.getItem(TELEMETRY_KEY);
    if (!stored) return null;

    const telemetry: Record<string, ClickTelemetry> = JSON.parse(stored);
    return telemetry[linkHash] || null;
}

export function getAllTelemetry(): ClickTelemetry[] {
    const stored = localStorage.getItem(TELEMETRY_KEY);
    if (!stored) return [];

    const telemetry: Record<string, ClickTelemetry> = JSON.parse(stored);
    return Object.values(telemetry);
}

// Mock Data Generator
export function generateMockTelemetry(): void {
    const mockData: Record<string, ClickTelemetry> = {
        'abc123': { linkHash: 'abc123', clickCount: 45, lastClickAt: Date.now() - 3600000, uniqueVisitors: 38 },
        'def456': { linkHash: 'def456', clickCount: 127, lastClickAt: Date.now() - 1800000, uniqueVisitors: 98 },
        'ghi789': { linkHash: 'ghi789', clickCount: 23, lastClickAt: Date.now() - 7200000, uniqueVisitors: 21 }
    };
    localStorage.setItem(TELEMETRY_KEY, JSON.stringify(mockData));
}
