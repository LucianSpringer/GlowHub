// InventoryReconciliationProtocol.ts - Conflict Resolution for Stock Sync
// Pattern: Polling, Conflict Detection, Auto-Correction

export interface StockSource {
    source: 'SUPPLIER' | 'APP' | 'SHOPEE' | 'TOKOPEDIA';
    productId: string;
    sku: string;
    stock: number;
    lastUpdated: number;
}

export interface ConflictReport {
    productId: string;
    sku: string;
    appStock: number;
    supplierStock: number;
    marketplaceStock: Record<string, number>;
    conflicts: ConflictType[];
    recommendation: string;
    autoAction?: 'SYNC_DOWN' | 'DEACTIVATE' | 'ALERT';
}

export type ConflictType =
    | 'APP_EXCEEDS_SUPPLIER'
    | 'MARKETPLACE_EXCEEDS_APP'
    | 'SUPPLIER_OUT_OF_STOCK'
    | 'SYNC_OK';

export interface SyncLog {
    id: string;
    timestamp: number;
    source: string;
    action: string;
    status: 'SUCCESS' | 'FAILED' | 'WARNING';
    message: string;
}

// Detect conflicts between sources
export function detectConflicts(
    appStock: number,
    supplierStock: number,
    marketplaceStocks: Record<string, number>
): ConflictType[] {
    const conflicts: ConflictType[] = [];

    // Rule 1: App stock should never exceed supplier
    if (appStock > supplierStock) {
        conflicts.push('APP_EXCEEDS_SUPPLIER');
    }

    // Rule 2: Marketplace stock should not exceed app
    for (const mp of Object.values(marketplaceStocks)) {
        if (mp > appStock) {
            conflicts.push('MARKETPLACE_EXCEEDS_APP');
            break;
        }
    }

    // Rule 3: Supplier out of stock
    if (supplierStock === 0) {
        conflicts.push('SUPPLIER_OUT_OF_STOCK');
    }

    if (conflicts.length === 0) {
        conflicts.push('SYNC_OK');
    }

    return conflicts;
}

// Generate conflict report
export function generateConflictReport(
    productId: string,
    sku: string,
    appStock: number,
    supplierStock: number,
    marketplaceStock: Record<string, number>
): ConflictReport {
    const conflicts = detectConflicts(appStock, supplierStock, marketplaceStock);

    let recommendation = 'Stok tersinkronisasi dengan baik.';
    let autoAction: ConflictReport['autoAction'];

    if (conflicts.includes('SUPPLIER_OUT_OF_STOCK')) {
        recommendation = 'Produk habis di supplier. Otomatis nonaktifkan produk.';
        autoAction = 'DEACTIVATE';
    } else if (conflicts.includes('APP_EXCEEDS_SUPPLIER')) {
        recommendation = 'Stok app melebihi supplier. Sinkronkan ke stok supplier.';
        autoAction = 'SYNC_DOWN';
    } else if (conflicts.includes('MARKETPLACE_EXCEEDS_APP')) {
        recommendation = 'Potensi overselling! Periksa listing marketplace.';
        autoAction = 'ALERT';
    }

    return {
        productId,
        sku,
        appStock,
        supplierStock,
        marketplaceStock,
        conflicts,
        recommendation,
        autoAction
    };
}

// Auto-correction logic
export function applyAutoCorrection(
    report: ConflictReport
): { newAppStock: number; isActive: boolean; log: SyncLog } {
    let newAppStock = report.appStock;
    let isActive = true;
    let action = '';
    let status: SyncLog['status'] = 'SUCCESS';

    switch (report.autoAction) {
        case 'DEACTIVATE':
            newAppStock = 0;
            isActive = false;
            action = `Produk ${report.sku} dinonaktifkan (stok supplier = 0)`;
            status = 'WARNING';
            break;
        case 'SYNC_DOWN':
            newAppStock = report.supplierStock;
            action = `Stok ${report.sku} disesuaikan: ${report.appStock} → ${report.supplierStock}`;
            break;
        case 'ALERT':
            action = `Alert: Potensi overselling pada ${report.sku}`;
            status = 'WARNING';
            break;
        default:
            action = `Stok ${report.sku} OK`;
    }

    return {
        newAppStock,
        isActive,
        log: createSyncLog('AUTO_RECONCILIATION', action, status)
    };
}

// Create sync log entry
export function createSyncLog(
    source: string,
    message: string,
    status: SyncLog['status'] = 'SUCCESS'
): SyncLog {
    return {
        id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        source,
        action: status === 'SUCCESS' ? 'SYNC' : 'ALERT',
        status,
        message
    };
}

// Health check for API connections
export interface ConnectionHealth {
    name: string;
    status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
    latency: number; // ms
    lastCheck: number;
    errorRate: number; // 0-100%
}

export function checkConnectionHealth(): ConnectionHealth[] {
    // Simulated health checks
    return [
        {
            name: 'Google Sheets API',
            status: Math.random() > 0.1 ? 'ONLINE' : 'DEGRADED',
            latency: Math.floor(50 + Math.random() * 150),
            lastCheck: Date.now(),
            errorRate: Math.random() * 5
        },
        {
            name: 'Shopee Open Platform',
            status: Math.random() > 0.05 ? 'ONLINE' : 'OFFLINE',
            latency: Math.floor(100 + Math.random() * 200),
            lastCheck: Date.now(),
            errorRate: Math.random() * 3
        },
        {
            name: 'Tokopedia API',
            status: Math.random() > 0.08 ? 'ONLINE' : 'DEGRADED',
            latency: Math.floor(80 + Math.random() * 180),
            lastCheck: Date.now(),
            errorRate: Math.random() * 4
        }
    ];
}

// Mock stock data generator
export function generateMockStockData(): Array<{
    productId: string;
    sku: string;
    appStock: number;
    supplierStock: number;
    shopeeStock: number;
    tokopediaStock: number;
}> {
    const products = ['Brightening Serum', 'Hydrating Toner', 'Sunscreen SPF50', 'Retinol Cream', 'Niacinamide 10%'];

    return products.map((_name, i) => {
        const supplierStock = Math.floor(Math.random() * 100);
        const appStock = supplierStock + Math.floor(Math.random() * 20) - 5; // Sometimes exceeds

        return {
            productId: `PROD-${1000 + i}`,
            sku: `SKU-${1000 + i}`,
            appStock: Math.max(0, appStock),
            supplierStock,
            shopeeStock: Math.floor(Math.random() * appStock),
            tokopediaStock: Math.floor(Math.random() * appStock)
        };
    });
}
