// FinancialHandshakeModal.tsx - Checkout Simulation Modal
import { useState, useEffect } from 'react';
import { Lock, Wifi, CheckCircle, AlertTriangle, X, CreditCard, Truck, Receipt } from 'lucide-react';

interface FinancialHandshakeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (orderId: string) => void;
    totalAmount: number;
}

type CheckoutStage = 'FORM' | 'ENCRYPTING' | 'CONTACTING' | 'VERIFIED' | 'SUCCESS' | 'FAILED';

const PAYMENT_METHODS = [
    { id: 'bca', name: 'BCA Virtual Account', icon: '🏦' },
    { id: 'gopay', name: 'GoPay', icon: '💚' },
    { id: 'ovo', name: 'OVO', icon: '💜' },
    { id: 'cod', name: 'Cash on Delivery', icon: '💵' },
];

const generateOrderId = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const rand = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `ORD-${rand(3)}-${rand(2)}`;
};

const generateTransactionHash = (): string => {
    return Array.from({ length: 32 }, () =>
        Math.floor(Math.random() * 16).toString(16)
    ).join('').toUpperCase();
};

export const FinancialHandshakeModal = ({
    isOpen,
    onClose,
    onSuccess,
    totalAmount
}: FinancialHandshakeModalProps) => {
    const [stage, setStage] = useState<CheckoutStage>('FORM');
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        paymentMethod: 'bca'
    });
    const [orderId, setOrderId] = useState('');
    const [txHash, setTxHash] = useState('');

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setStage('FORM');
            setFormData({ name: '', address: '', paymentMethod: 'bca' });
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!formData.name || !formData.address) return;

        // Stage 1: Encrypting
        setStage('ENCRYPTING');
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 500));

        // Stage 2: Contacting Bank
        setStage('CONTACTING');
        await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

        // Stage 3: Verification
        setStage('VERIFIED');
        await new Promise(r => setTimeout(r, 800));

        // 90% success, 10% failure
        if (Math.random() < 0.9) {
            const newOrderId = generateOrderId();
            const newTxHash = generateTransactionHash();
            setOrderId(newOrderId);
            setTxHash(newTxHash);
            setStage('SUCCESS');
        } else {
            setStage('FAILED');
        }
    };

    const handleSuccessClose = () => {
        onSuccess(orderId);
        onClose();
    };

    const handleRetry = () => {
        setStage('FORM');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={stage === 'FORM' ? onClose : undefined}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Lock size={20} /> Secure Checkout
                            </h2>
                            <p className="text-slate-400 text-sm mt-1">GlowHub Payment Gateway</p>
                        </div>
                        {stage === 'FORM' && (
                            <button onClick={onClose} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {stage === 'FORM' && (
                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    placeholder="John Doe"
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alamat Pengiriman</label>
                                <textarea
                                    value={formData.address}
                                    onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                                    rows={2}
                                    placeholder="Jl. Sudirman No. 123..."
                                />
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Metode Pembayaran</label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {PAYMENT_METHODS.map(method => (
                                        <button
                                            key={method.id}
                                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.id }))}
                                            className={`p-3 rounded-xl border-2 text-left text-sm font-medium transition-all ${formData.paymentMethod === method.id
                                                    ? 'border-pink-500 bg-pink-50'
                                                    : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <span className="mr-2">{method.icon}</span>
                                            {method.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="bg-slate-50 rounded-xl p-4 mt-4">
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Total Pembayaran</span>
                                    <span className="font-bold text-lg text-slate-900">
                                        Rp {totalAmount.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                disabled={!formData.name || !formData.address}
                                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-pink-500/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <CreditCard size={20} /> Bayar Sekarang
                            </button>
                        </div>
                    )}

                    {/* Processing Stages */}
                    {(stage === 'ENCRYPTING' || stage === 'CONTACTING' || stage === 'VERIFIED') && (
                        <div className="py-12 text-center">
                            <div className="relative w-20 h-20 mx-auto mb-6">
                                <div className="absolute inset-0 border-4 border-pink-200 rounded-full animate-ping" />
                                <div className="absolute inset-0 border-4 border-t-pink-500 rounded-full animate-spin" />
                                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                                    {stage === 'ENCRYPTING' && <Lock size={24} className="text-pink-500" />}
                                    {stage === 'CONTACTING' && <Wifi size={24} className="text-purple-500" />}
                                    {stage === 'VERIFIED' && <CheckCircle size={24} className="text-emerald-500" />}
                                </div>
                            </div>
                            <div className="text-lg font-bold text-slate-900">
                                {stage === 'ENCRYPTING' && 'Encrypting Transaction...'}
                                {stage === 'CONTACTING' && 'Contacting Bank Node...'}
                                {stage === 'VERIFIED' && 'Verified!'}
                            </div>
                            <div className="text-sm text-slate-500 mt-2">
                                {stage === 'ENCRYPTING' && 'Securing your payment data'}
                                {stage === 'CONTACTING' && 'Processing with payment gateway'}
                                {stage === 'VERIFIED' && 'Transaction approved'}
                            </div>
                        </div>
                    )}

                    {/* Success */}
                    {stage === 'SUCCESS' && (
                        <div className="py-8 text-center">
                            <div className="w-20 h-20 mx-auto mb-6 bg-emerald-100 rounded-full flex items-center justify-center">
                                <CheckCircle size={40} className="text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Pembayaran Berhasil!</h3>
                            <p className="text-slate-500 mb-6">Pesanan kamu sedang diproses</p>

                            <div className="bg-slate-50 rounded-xl p-4 text-left space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 flex items-center gap-1"><Receipt size={14} /> Order ID</span>
                                    <span className="font-mono font-bold text-pink-500">{orderId}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 flex items-center gap-1"><Lock size={14} /> Tx Hash</span>
                                    <span className="font-mono text-[10px] text-slate-400">{txHash.slice(0, 16)}...</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 flex items-center gap-1"><Truck size={14} /> Estimasi</span>
                                    <span className="font-medium">2-3 Hari Kerja</span>
                                </div>
                            </div>

                            <button
                                onClick={handleSuccessClose}
                                className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all"
                            >
                                Selesai
                            </button>
                        </div>
                    )}

                    {/* Failed */}
                    {stage === 'FAILED' && (
                        <div className="py-8 text-center">
                            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle size={40} className="text-red-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Network Timeout</h3>
                            <p className="text-slate-500 mb-6">Koneksi ke payment gateway terputus</p>

                            <button
                                onClick={handleRetry}
                                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
                            >
                                Coba Lagi
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
