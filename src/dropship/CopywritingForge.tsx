// CopywritingForge.tsx - AI Caption Generator UI
import { useState } from 'react';
import { Wand2, Copy, RefreshCw, Check, AlertCircle, Instagram } from 'lucide-react';
import {
    generateCaption,
    canGenerateCaption,
    type CaptionVibe,
    type CaptionPlatform,
    type CaptionResult,
    type ProductInfo
} from '../engines/MarketingSyntaxSynthesizer';

const SAMPLE_PRODUCTS: ProductInfo[] = [
    { name: 'Scarlett Brightening Serum', brand: 'SCARLETT', benefit: 'mencerahkan wajah', activeIngredient: 'Niacinamide 5%', price: 89000 },
    { name: 'Niacinamide 10%', brand: 'SOMETHINC', benefit: 'mengontrol minyak', activeIngredient: 'Niacinamide', price: 125000 },
    { name: 'Miraculous Retinol', brand: 'AVOSKIN', benefit: 'anti-aging', activeIngredient: 'Retinol 0.5%', price: 159000 },
    { name: 'Hydrasoothe Sunscreen', brand: 'AZARINE', benefit: 'proteksi UV', activeIngredient: 'SPF50 PA++++', price: 72000 },
];

const VIBES: { value: CaptionVibe; label: string; emoji: string }[] = [
    { value: 'GENZ', label: 'Gen-Z Viral', emoji: '🔥' },
    { value: 'PERSUASIF', label: 'Persuasif', emoji: '💫' },
    { value: 'EDUKATIF', label: 'Edukatif', emoji: '📚' },
    { value: 'HARDSELL', label: 'Hard Sell', emoji: '🏷️' },
];

export const CopywritingForge = () => {
    const [selectedProduct, setSelectedProduct] = useState<ProductInfo>(SAMPLE_PRODUCTS[0]);
    const [vibe, setVibe] = useState<CaptionVibe>('GENZ');
    const [platform, setPlatform] = useState<CaptionPlatform>('INSTAGRAM');
    const [result, setResult] = useState<CaptionResult | null>(null);
    const [copied, setCopied] = useState(false);
    const [stockWarning, setStockWarning] = useState<string | null>(null);

    const handleGenerate = () => {
        // Check stock (simulated - assume 15 for demo)
        const stockCheck = canGenerateCaption(15);
        if (!stockCheck.allowed) {
            setStockWarning(stockCheck.warning || 'Cannot generate');
            return;
        }
        setStockWarning(stockCheck.warning || null);

        const caption = generateCaption(selectedProduct, vibe, platform);
        setResult(caption);
        setCopied(false);
    };

    const handleCopy = async () => {
        if (!result) return;
        const fullText = `${result.caption}\n\n${result.hashtags.join(' ')}`;
        await navigator.clipboard.writeText(fullText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gradient-to-br from-purple-950 to-slate-900 rounded-2xl p-6 text-white">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-500 p-2 rounded-xl">
                    <Wand2 size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-lg">Copywriting Forge</h3>
                    <p className="text-xs text-slate-400">AI-powered caption generator</p>
                </div>
            </div>

            {/* Product Selector */}
            <div className="mb-4">
                <label className="text-xs text-slate-400 uppercase mb-1 block">Select Product</label>
                <select
                    value={selectedProduct.name}
                    onChange={(e) => setSelectedProduct(SAMPLE_PRODUCTS.find(p => p.name === e.target.value) || SAMPLE_PRODUCTS[0])}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                >
                    {SAMPLE_PRODUCTS.map(p => (
                        <option key={p.name} value={p.name}>{p.brand} - {p.name}</option>
                    ))}
                </select>
            </div>

            {/* Vibe Selector */}
            <div className="mb-4">
                <label className="text-xs text-slate-400 uppercase mb-2 block">Vibe</label>
                <div className="grid grid-cols-2 gap-2">
                    {VIBES.map(v => (
                        <button
                            key={v.value}
                            onClick={() => setVibe(v.value)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${vibe === v.value
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            {v.emoji} {v.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Platform Toggle */}
            <div className="mb-4">
                <label className="text-xs text-slate-400 uppercase mb-2 block">Platform</label>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPlatform('INSTAGRAM')}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${platform === 'INSTAGRAM'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                    >
                        <Instagram size={14} /> Instagram
                    </button>
                    <button
                        onClick={() => setPlatform('TIKTOK')}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${platform === 'TIKTOK'
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                    >
                        🎵 TikTok
                    </button>
                </div>
            </div>

            {/* Stock Warning */}
            {stockWarning && (
                <div className="mb-4 flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-3 py-2 rounded-xl text-xs">
                    <AlertCircle size={14} />
                    {stockWarning}
                </div>
            )}

            {/* Generate Button */}
            <button
                onClick={handleGenerate}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all mb-4"
            >
                <Wand2 size={16} /> Generate Caption
            </button>

            {/* Output */}
            {result && (
                <div className="bg-slate-800 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-400">{result.charCount} chars</span>
                        <div className="flex gap-2">
                            <button
                                onClick={handleGenerate}
                                className="p-1.5 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                            >
                                <RefreshCw size={14} />
                            </button>
                            <button
                                onClick={handleCopy}
                                className={`p-1.5 rounded-lg transition-colors ${copied ? 'bg-emerald-500' : 'bg-slate-700 hover:bg-slate-600'
                                    }`}
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                        </div>
                    </div>
                    <p className="text-sm leading-relaxed mb-3">{result.caption}</p>
                    <div className="flex flex-wrap gap-1">
                        {result.hashtags.map((tag, i) => (
                            <span key={i} className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
