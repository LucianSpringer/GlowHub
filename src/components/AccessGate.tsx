// AccessGate.tsx - High-Yield Auth UI with Real-time Entropy Visualization
import { useState, useEffect } from 'react';
import { Shield, Lock, Activity, User, ArrowRight, X } from 'lucide-react';
import {
    calculateShannonEntropy,
    authenticateUser,
    type SecureSession
} from '../engines/AccessControlSystem';

interface AccessGateProps {
    isOpen: boolean;
    onClose: () => void;
    onAuthenticated: (session: SecureSession) => void;
    initialMode?: 'LOGIN' | 'REGISTER';
}

export const AccessGate = ({ isOpen, onClose, onAuthenticated, initialMode = 'LOGIN' }: AccessGateProps) => {
    const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(initialMode);
    const [alias, setAlias] = useState('');
    const [secret, setSecret] = useState('');
    const [entropy, setEntropy] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);

    // Real-time Entropy Analysis
    useEffect(() => {
        setEntropy(calculateShannonEntropy(secret));
    }, [secret]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setError(null);

        // Simulate Network Latency for "Handshake" effect
        setTimeout(() => {
            try {
                const session = authenticateUser(alias, secret, mode);
                if (session) {
                    onAuthenticated(session);
                    onClose();
                }
            } catch (err: any) {
                setError(err.message || "Handshake Failed");
            } finally {
                setIsProcessing(false);
            }
        }, 1200);
    };

    if (!isOpen) return null;

    const entropyColor = entropy > 3.5 ? 'text-emerald-400' : entropy > 2.5 ? 'text-yellow-400' : 'text-rose-400';
    const entropyWidth = Math.min(100, (entropy / 4.5) * 100);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            {/* Backdrop with Blur */}
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-400">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Secure Access</h2>
                            <p className="text-xs text-slate-400 font-mono">Protocol: {mode}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Identity Alias</label>
                        <div className="flex items-center bg-slate-800/50 border border-slate-700 rounded-xl px-4 focus-within:border-indigo-500 transition-all">
                            <User size={18} className="text-slate-400" />
                            <input
                                type="text"
                                value={alias}
                                onChange={(e) => setAlias(e.target.value)}
                                className="w-full bg-transparent py-3 px-3 text-white focus:outline-none font-mono"
                                placeholder="username_v1"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-slate-500 font-bold flex justify-between">
                            <span>Secret Key</span>
                            {secret.length > 0 && (
                                <span className={`font-mono ${entropyColor}`}>Entropy: {entropy.toFixed(2)} bits</span>
                            )}
                        </label>
                        <div className="flex items-center bg-slate-800/50 border border-slate-700 rounded-xl px-4 focus-within:border-indigo-500 transition-all">
                            <Lock size={18} className="text-slate-400" />
                            <input
                                type="password"
                                value={secret}
                                onChange={(e) => setSecret(e.target.value)}
                                className="w-full bg-transparent py-3 px-3 text-white focus:outline-none font-mono"
                                placeholder="••••••••"
                            />
                        </div>
                        {/* Entropy Visualization Bar */}
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
                            <div
                                className={`h-full transition-all duration-500 ${entropy > 3.5 ? 'bg-emerald-500' : entropy > 2.5 ? 'bg-yellow-500' : 'bg-rose-500'}`}
                                style={{ width: `${entropyWidth}%` }}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs font-mono flex items-center gap-2">
                            <Activity size={14} /> {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isProcessing || !alias || !secret}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-wait flex justify-center items-center gap-2"
                    >
                        {isProcessing ? (
                            <span className="font-mono animate-pulse">VERIFYING HASH...</span>
                        ) : (
                            <>
                                {mode === 'LOGIN' ? 'Establish Session' : 'Register Identity'} <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setMode(prev => prev === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                            className="text-xs text-slate-500 hover:text-indigo-400 transition-colors"
                        >
                            {mode === 'LOGIN' ? "No identity? Initialize Registration." : "Identity exists? Switch to Login."}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
