// ViralVectorLinker.tsx - Share Link Generator UI
import { useState, useEffect } from 'react';
import { Link2, QrCode, Copy, Check, MousePointer2, ExternalLink } from 'lucide-react';
import {
    generateAffiliateLink,
    getAllTelemetry,
    generateMockTelemetry,
    type GeneratedLink,
    type ClickTelemetry
} from '../engines/AffiliateHashEncoder';
import { PRODUCT_CATALOG } from '../ProductTelemetry';

export const ViralVectorLinker = () => {
    const [selectedProductId, setSelectedProductId] = useState(PRODUCT_CATALOG[0].id);
    const [campaignId, setCampaignId] = useState('');
    const [generatedLink, setGeneratedLink] = useState<GeneratedLink | null>(null);
    const [telemetry, setTelemetry] = useState<ClickTelemetry[]>([]);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        generateMockTelemetry();
        setTelemetry(getAllTelemetry());
    }, []);

    const handleGenerate = () => {
        const userId = 'DS-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const link = generateAffiliateLink('https://glowhub.id', userId, selectedProductId, campaignId || undefined);
        setGeneratedLink(link);
        setCopied(false);
    };

    const handleCopy = async () => {
        if (!generatedLink) return;
        await navigator.clipboard.writeText(generatedLink.fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const totalClicks = telemetry.reduce((sum, t) => sum + t.clickCount, 0);

    return (
        <div className="bg-gradient-to-br from-cyan-950 to-slate-900 rounded-2xl p-6 text-white">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-cyan-500 p-2 rounded-xl">
                        <Link2 size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Viral Vector Linker</h3>
                        <p className="text-xs text-slate-400">Affiliate link generator</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-cyan-500/20 px-3 py-1.5 rounded-full">
                    <MousePointer2 size={14} className="text-cyan-400" />
                    <span className="text-sm font-mono font-bold text-cyan-400">{totalClicks}</span>
                    <span className="text-[10px] text-slate-400">today</span>
                </div>
            </div>

            <div className="space-y-3 mb-4">
                <div>
                    <label className="text-xs text-slate-400 uppercase mb-1 block">Product</label>
                    <select
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                    >
                        {PRODUCT_CATALOG.map(p => (
                            <option key={p.id} value={p.id}>{p.brand} - {p.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-xs text-slate-400 uppercase mb-1 block">Campaign ID (Optional)</label>
                    <input
                        type="text"
                        value={campaignId}
                        onChange={(e) => setCampaignId(e.target.value)}
                        placeholder="e.g. promo_dec2024"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
                    />
                </div>
            </div>

            <button
                onClick={handleGenerate}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all mb-4"
            >
                <Link2 size={16} /> Generate Link
            </button>

            {generatedLink && (
                <div className="space-y-4">
                    <div className="bg-slate-800 rounded-xl p-3">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-slate-400">Your Affiliate Link</span>
                            <button
                                onClick={handleCopy}
                                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold transition-colors ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-700 hover:bg-slate-600'
                                    }`}
                            >
                                {copied ? <Check size={12} /> : <Copy size={12} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-900 rounded-lg px-3 py-2">
                            <ExternalLink size={14} className="text-cyan-400 flex-shrink-0" />
                            <code className="text-xs text-cyan-300 truncate">{generatedLink.fullUrl}</code>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-2">
                            Hash: {generatedLink.shortHash.slice(0, 20)}...
                        </div>
                    </div>

                    <div className="bg-slate-800 rounded-xl p-4 flex flex-col items-center">
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                            <QrCode size={14} /> QR Code
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                            <img src={generatedLink.qrDataUrl} alt="QR Code" className="w-32 h-32" />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2">Scan to preview link</p>
                    </div>
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="text-xs text-slate-400 mb-2">Active Links</div>
                <div className="grid grid-cols-3 gap-2">
                    {telemetry.slice(0, 3).map(t => (
                        <div key={t.linkHash} className="bg-slate-800/50 rounded-lg p-2 text-center">
                            <div className="text-lg font-mono font-bold text-cyan-400">{t.clickCount}</div>
                            <div className="text-[9px] text-slate-500 truncate">{t.linkHash.slice(0, 6)}...</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
