// SupplierDataNormalization.ts - ETL Simulation for Product Ingestion
// Pattern: Extract, Transform, Load

export interface RawSupplierProduct {
    sku: string;
    name: string;
    supplierPrice: number;
    stock: number;
    category: string;
    imageUrl?: string;
}

export interface NormalizedProduct {
    id: string;
    sku: string;
    name: string;
    supplierPrice: number;       // Hidden from dropshippers
    appBasePrice: number;        // Price shown to dropshippers
    recommendedSellingPrice: number;
    stockActual: number;
    stockBuffer: number;         // 10% safety stock
    stockAvailable: number;      // What dropshippers see
    category: string;
    imageUrl: string;
    isActive: boolean;
    createdAt: number;
}

// Config for margin rules
export interface MarginConfig {
    ownerMarginPercent: number;      // e.g., 10%
    dropshipperMarginPercent: number; // e.g., 20%
    marketplaceCap?: number;          // Maximum competitive price
}

const DEFAULT_CONFIG: MarginConfig = {
    ownerMarginPercent: 10,
    dropshipperMarginPercent: 20
};

// EXTRACTION - Parse CSV/JSON from supplier
export function extractSupplierData(rawData: string, format: 'CSV' | 'JSON'): RawSupplierProduct[] {
    if (format === 'JSON') {
        try {
            return JSON.parse(rawData);
        } catch {
            return [];
        }
    }

    // CSV parsing
    const lines = rawData.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    return lines.slice(1).map(line => {
        const values = line.split(',');
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => obj[h] = values[i]?.trim() || '');

        return {
            sku: obj['sku'] || '',
            name: obj['name'] || obj['product_name'] || '',
            supplierPrice: parseFloat(obj['price'] || obj['supplier_price'] || '0'),
            stock: parseInt(obj['stock'] || obj['qty'] || '0', 10),
            category: obj['category'] || 'Uncategorized',
            imageUrl: obj['image'] || obj['image_url']
        };
    }).filter(p => p.sku && p.name);
}

// TRANSFORMATION - Apply price padding and stock buffer
export function transformProduct(
    raw: RawSupplierProduct,
    config: MarginConfig = DEFAULT_CONFIG
): NormalizedProduct {
    // Price Padding: Add owner margin to supplier price
    const ownerMarkup = raw.supplierPrice * (config.ownerMarginPercent / 100);
    const appBasePrice = Math.ceil(raw.supplierPrice + ownerMarkup);

    // Recommended Selling Price: Add dropshipper margin
    const dropshipperMarkup = appBasePrice * (config.dropshipperMarginPercent / 100);
    const recommendedSellingPrice = Math.ceil(appBasePrice + dropshipperMarkup);

    // Stock Buffer: Reduce by 10% for safety
    const stockBuffer = Math.ceil(raw.stock * 0.10);
    const stockAvailable = Math.max(0, raw.stock - stockBuffer);

    return {
        id: `PROD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sku: raw.sku,
        name: raw.name,
        supplierPrice: raw.supplierPrice,
        appBasePrice,
        recommendedSellingPrice,
        stockActual: raw.stock,
        stockBuffer,
        stockAvailable,
        category: raw.category,
        imageUrl: raw.imageUrl || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=300&q=80',
        isActive: stockAvailable > 0,
        createdAt: Date.now()
    };
}

// Load - Connects Extraction and Transformation
export function normalizeSupplierFeed(
    rawData: string,
    format: 'CSV' | 'JSON',
    config: MarginConfig = DEFAULT_CONFIG
): NormalizedProduct[] {
    const rawProducts = extractSupplierData(rawData, format);
    return rawProducts.map(p => transformProduct(p, config));
}

export function calculateRecommendedPrice(cost: number, marginPercent: number): number {
    const markup = cost * (marginPercent / 100);
    return Math.ceil(cost + markup);
}

// Stock Status Helper
export function getStockStatus(stock: number): 'AMPLE' | 'LIMITED' | 'CRITICAL' {
    if (stock <= 10) return 'CRITICAL';
    if (stock <= 50) return 'LIMITED';
    return 'AMPLE';
}

// Price Competitiveness Check
export function checkPriceCompetitiveness(
    product: NormalizedProduct,
    marketplaceCap: number
): { isCompetitive: boolean; warning?: string; priceDiff: number } {
    const priceDiff = product.recommendedSellingPrice - marketplaceCap;

    if (product.recommendedSellingPrice > marketplaceCap) {
        return {
            isCompetitive: false,
            warning: `Overpriced! +Rp ${priceDiff.toLocaleString()} vs Market`,
            priceDiff
        };
    }

    return { isCompetitive: true, priceDiff };
}

// Bulk Update Prices
export function bulkUpdatePrices(
    products: NormalizedProduct[],
    newConfig: MarginConfig
): NormalizedProduct[] {
    return products.map(p => {
        const ownerMarkup = p.supplierPrice * (newConfig.ownerMarginPercent / 100);
        const appBasePrice = Math.ceil(p.supplierPrice + ownerMarkup);
        const dropshipperMarkup = appBasePrice * (newConfig.dropshipperMarginPercent / 100);
        const recommendedSellingPrice = Math.ceil(appBasePrice + dropshipperMarkup);

        return { ...p, appBasePrice, recommendedSellingPrice };
    });
}

// Mock Supplier Data Generator
export function generateMockSupplierData(): RawSupplierProduct[] {
    return [
        { sku: 'SUP-001', name: 'Brightening Serum 30ml', supplierPrice: 45000, stock: 150, category: 'Serum' },
        { sku: 'SUP-002', name: 'Hydrating Toner 100ml', supplierPrice: 38000, stock: 200, category: 'Toner' },
        { sku: 'SUP-003', name: 'Sunscreen SPF50 50ml', supplierPrice: 52000, stock: 80, category: 'Sunscreen' },
        { sku: 'SUP-004', name: 'Retinol Night Cream 30g', supplierPrice: 95000, stock: 45, category: 'Cream' },
        { sku: 'SUP-005', name: 'Niacinamide 10% 20ml', supplierPrice: 75000, stock: 120, category: 'Serum' },
        { sku: 'SUP-006', name: 'Gentle Cleanser 150ml', supplierPrice: 32000, stock: 0, category: 'Cleanser' },
    ];
}
