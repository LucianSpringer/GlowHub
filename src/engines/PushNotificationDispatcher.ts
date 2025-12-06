// PushNotificationDispatcher.ts - Queue & Batching Pattern for Mass Notifications
// Pattern: Queue, Segment, Batch, Feedback Loop

export interface NotificationMessage {
    id: string;
    title: string;
    body: string;
    urgency: 'NORMAL' | 'HIGH' | 'FLASH';
    countdown?: number; // seconds for flash sale
    createdAt: number;
}

export interface DropshipperSegment {
    id: string;
    name: string;
    tier: 'SILVER' | 'GOLD' | 'PLATINUM';
    lastSaleDate: number;
    isActive: boolean;
}

export interface DispatchStatus {
    messageId: string;
    totalRecipients: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    status: 'QUEUED' | 'SENDING' | 'COMPLETED' | 'FAILED';
    startedAt?: number;
    completedAt?: number;
}

// Template variable replacement
export function parseMessageVariables(template: string, user: DropshipperSegment): string {
    return template
        .replace(/\{\{user_name\}\}/g, user.name)
        .replace(/\{\{user_tier\}\}/g, user.tier)
        .replace(/\{\{user_id\}\}/g, user.id);
}

// Audience filtering
export interface AudienceFilter {
    tiers?: Array<'SILVER' | 'GOLD' | 'PLATINUM'>;
    inactiveDays?: number; // Users who haven't sold in X days
    activeOnly?: boolean;
}

export function filterAudience(
    users: DropshipperSegment[],
    filter: AudienceFilter
): DropshipperSegment[] {
    let result = [...users];

    if (filter.tiers && filter.tiers.length > 0) {
        result = result.filter(u => filter.tiers!.includes(u.tier));
    }

    if (filter.inactiveDays) {
        const cutoff = Date.now() - (filter.inactiveDays * 24 * 60 * 60 * 1000);
        result = result.filter(u => u.lastSaleDate < cutoff);
    }

    if (filter.activeOnly) {
        result = result.filter(u => u.isActive);
    }

    return result;
}

// Batch dispatcher simulation
export async function dispatchNotifications(
    message: NotificationMessage,
    recipients: DropshipperSegment[],
    batchSize: number = 50,
    onProgress: (status: DispatchStatus) => void
): Promise<DispatchStatus> {
    const status: DispatchStatus = {
        messageId: message.id,
        totalRecipients: recipients.length,
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        status: 'SENDING',
        startedAt: Date.now()
    };

    onProgress(status);

    // Process in batches
    for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);

        // Simulate network delay (50-200ms per batch)
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 150));

        for (const user of batch) {
            // Simulate success/fail rate (95% success)
            if (Math.random() > 0.05) {
                status.sent++;
                // Simulate delivery (90% of sent)
                if (Math.random() > 0.1) {
                    status.delivered++;
                    // Simulate read (30% of delivered)
                    if (Math.random() > 0.7) {
                        status.read++;
                    }
                }
            } else {
                status.failed++;
            }
        }

        onProgress({ ...status });
    }

    status.status = status.failed === recipients.length ? 'FAILED' : 'COMPLETED';
    status.completedAt = Date.now();

    onProgress(status);
    return status;
}

// Generate mock dropshippers
export function generateMockDropshippers(count: number = 100): DropshipperSegment[] {
    const tiers: Array<'SILVER' | 'GOLD' | 'PLATINUM'> = ['SILVER', 'GOLD', 'PLATINUM'];
    const names = ['Andi', 'Budi', 'Citra', 'Dewi', 'Eka', 'Fitri', 'Gita', 'Hana', 'Indah', 'Joko'];

    return Array.from({ length: count }, (_, i) => ({
        id: `DS-${1000 + i}`,
        name: names[i % names.length] + ` ${i + 1}`,
        tier: tiers[Math.floor(Math.random() * 3)],
        lastSaleDate: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        isActive: Math.random() > 0.1
    }));
}

// Create notification
export function createNotification(
    title: string,
    body: string,
    urgency: NotificationMessage['urgency'] = 'NORMAL',
    countdown?: number
): NotificationMessage {
    return {
        id: `NOTIF-${Date.now()}`,
        title,
        body,
        urgency,
        countdown,
        createdAt: Date.now()
    };
}
