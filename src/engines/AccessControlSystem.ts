// AccessControlSystem.ts - Cryptographic Auth Engine
// Pattern: Shannon Entropy + Bitwise Permissions + Session Telematics

// --- 1. THE BITWISE PERMISSION KERNEL ---
export const PermissionMask = {
    GUEST: 0,
    VIEW_DASHBOARD: 1 << 1,  // 2
    WRITE_ORDERS: 1 << 2,    // 4
    ADMIN_OVERRIDE: 1 << 3   // 8
} as const;

export type PermissionLevel = number;

export interface SecureSession {
    sessionId: string;
    userAlias: string;
    roleMask: number;
    entropySignature: number;
    telematics: {
        velocityScore: number;
        loginTimestamp: number;
    };
}

// --- 2. THE IDENTITY ENTROPY SHIELD ---
// Calculates Shannon Entropy to validate password complexity mathematically
export const calculateShannonEntropy = (str: string): number => {
    if (!str) return 0;
    const len = str.length;
    const frequencies = Array.from(str).reduce((freq, char) => {
        freq[char] = (freq[char] || 0) + 1;
        return freq;
    }, {} as Record<string, number>);

    return Object.values(frequencies).reduce((sum, count) => {
        const p = count / len;
        return sum - p * Math.log2(p);
    }, 0);
};

// --- 3. THE SESSION TELEMATICS DAEMON ---
// Simulates environment analysis during handshake
export const generateTelemetryVector = (): number => {
    // Simulation: Haversine distance delta / Time delta
    // Returns a float representing "Login Velocity"
    const baseVelocity = Math.random() * 100;
    const jitter = Math.sin(Date.now()) * 10;
    return Math.abs(baseVelocity + jitter);
};

export const authenticateUser = (alias: string, secret: string, mode: 'LOGIN' | 'REGISTER'): SecureSession | null => {
    // In a real app, this hits an API. Here, we simulate High-Yield Logic.

    const entropy = calculateShannonEntropy(secret);

    // REJECTION LOGIC: Low Entropy
    if (mode === 'REGISTER' && entropy < 2.5) {
        throw new Error(`Entropy Too Low (${entropy.toFixed(2)}). Increase complexity.`);
    }

    // BITWISE ASSIGNMENT
    // If alias contains "admin", grant 0b1000, else grant 0b0110 (Reseller)
    let mask = PermissionMask.VIEW_DASHBOARD | PermissionMask.WRITE_ORDERS;
    if (alias.toLowerCase().includes('admin')) {
        mask |= PermissionMask.ADMIN_OVERRIDE;
    }

    return {
        sessionId: `SEC-${Date.now().toString(16).toUpperCase()}`,
        userAlias: alias,
        roleMask: mask,
        entropySignature: entropy,
        telematics: {
            velocityScore: generateTelemetryVector(),
            loginTimestamp: Date.now()
        }
    };
};

// Helper: Check permission
export const hasPermission = (session: SecureSession | null, permission: number): boolean => {
    if (!session) return false;
    return (session.roleMask & permission) !== 0;
};
