// OrderRelayProtocol.ts - State Machine for Order Processing
// Pattern: Finite State Machine with Probability Decay

export const OrderStatus = {
    PENDING: 'PENDING',
    VALIDATING: 'VALIDATING',
    PROCESSING: 'PROCESSING',
    SHIPPED: 'SHIPPED',
    FAILED: 'FAILED',
    REVIEW: 'REVIEW'
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export interface DropshipOrder {
    id: string;
    customerId: string;
    productId: string;
    productName: string;
    quantity: number;
    buyerAddress: string;
    buyerPhone: string;
    totalPrice: number;
    margin: number;
    status: OrderStatus;
    createdAt: number;
    urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// Regex Validators
const PHONE_REGEX = /^(\+62|62|0)8[1-9][0-9]{7,10}$/;
const ADDRESS_REGEX = /^.{15,200}$/;

// Validation Engine
export function validateOrder(order: DropshipOrder): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!PHONE_REGEX.test(order.buyerPhone.replace(/\s/g, ''))) {
        errors.push('Invalid phone format');
    }
    if (!ADDRESS_REGEX.test(order.buyerAddress)) {
        errors.push('Address must be 15-200 characters');
    }
    if (order.quantity < 1 || order.quantity > 100) {
        errors.push('Quantity must be 1-100');
    }

    return { valid: errors.length === 0, errors };
}

// Urgency Calculator based on time remaining
export function calculateUrgency(createdAt: number): DropshipOrder['urgencyLevel'] {
    const hoursElapsed = (Date.now() - createdAt) / (1000 * 60 * 60);
    if (hoursElapsed > 20) return 'CRITICAL';
    if (hoursElapsed > 12) return 'HIGH';
    if (hoursElapsed > 6) return 'MEDIUM';
    return 'LOW';
}

// Simulated API Transmission with Probability Decay
export function transmitToSupplier(order: DropshipOrder): Promise<{ success: boolean; newStatus: OrderStatus }> {
    return new Promise((resolve) => {
        // Random latency simulation (500ms - 2000ms)
        const latency = 500 + Math.random() * 1500;

        setTimeout(() => {
            // 80% success, 20% needs review
            const roll = Math.random();
            if (roll < 0.80) {
                resolve({ success: true, newStatus: OrderStatus.PROCESSING });
            } else {
                resolve({ success: false, newStatus: OrderStatus.REVIEW });
            }
        }, latency);
    });
}

// Batch Process Multiple Orders
export async function batchProcessOrders(
    orders: DropshipOrder[],
    onProgress: (processed: number, total: number) => void
): Promise<{ successful: string[]; failed: string[] }> {
    const successful: string[] = [];
    const failed: string[] = [];

    for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        const validation = validateOrder(order);

        if (!validation.valid) {
            failed.push(order.id);
        } else {
            const result = await transmitToSupplier(order);
            if (result.success) {
                successful.push(order.id);
            } else {
                failed.push(order.id);
            }
        }

        onProgress(i + 1, orders.length);
    }

    return { successful, failed };
}

// Mock Order Generator
export function generateMockOrders(count: number): DropshipOrder[] {
    const products = [
        { id: 'P1', name: 'Scarlett Whitening Lotion', price: 75000, margin: 15000 },
        { id: 'P2', name: 'Somethinc Niacinamide', price: 115000, margin: 25000 },
        { id: 'P3', name: 'Avoskin Retinol', price: 149000, margin: 35000 },
        { id: 'P4', name: 'Azarine Sunscreen', price: 65000, margin: 12000 },
    ];

    const orders: DropshipOrder[] = [];
    for (let i = 0; i < count; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const qty = 1 + Math.floor(Math.random() * 3);
        const createdAt = Date.now() - Math.random() * 24 * 60 * 60 * 1000;

        orders.push({
            id: `ORD-${Date.now()}-${i}`,
            customerId: `CUST-${1000 + i}`,
            productId: product.id,
            productName: product.name,
            quantity: qty,
            buyerAddress: `Jl. Contoh No. ${10 + i}, Jakarta Selatan 12345`,
            buyerPhone: `08${Math.floor(100000000 + Math.random() * 900000000)}`,
            totalPrice: product.price * qty,
            margin: product.margin * qty,
            status: OrderStatus.PENDING,
            createdAt,
            urgencyLevel: calculateUrgency(createdAt)
        });
    }

    return orders;
}
