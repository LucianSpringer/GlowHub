// StorefrontPage.tsx - Commerce Modules Orchestrator
import { useState } from 'react';
import { Store, Filter, Flame, Package, BookOpen, Users, ArrowLeft } from 'lucide-react';
import { VectorFilterInterface } from './VectorFilterInterface';
import { VelocityTrendDashboard } from './VelocityTrendDashboard';
import { DynamicBundleBuilder } from './DynamicBundleBuilder';
import { ContextualBlogReader } from './ContextualBlogReader';
import { SkinTwinEvidenceGallery } from './SkinTwinEvidenceGallery';

interface StorefrontPageProps {
    onBack: () => void;
    onProductSelect?: (productId: string) => void;
}

type StorefrontTab = 'products' | 'bestseller' | 'bundles' | 'blog' | 'testimonials';

const TABS: { id: StorefrontTab; label: string; icon: typeof Store }[] = [
    { id: 'products', label: 'Products', icon: Filter },
    { id: 'bestseller', label: 'Best Seller', icon: Flame },
    { id: 'bundles', label: 'Bundles', icon: Package },
    { id: 'blog', label: 'Blog', icon: BookOpen },
    { id: 'testimonials', label: 'Testimonials', icon: Users },
];

export const StorefrontPage = ({ onBack, onProductSelect }: StorefrontPageProps) => {
    const [activeTab, setActiveTab] = useState<StorefrontTab>('products');

    return (
        <div className="min-h-screen bg-slate-100 pt-20 pb-12">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 bg-white hover:bg-slate-50 text-slate-600 shadow-sm rounded-xl transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-pink-500 to-purple-500 p-3 rounded-2xl shadow-lg shadow-pink-500/20">
                                <Store size={28} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900">Commerce Hub</h1>
                                <p className="text-sm text-slate-500">High-Yield Shopping Experience</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6 bg-white p-2 rounded-2xl shadow-sm overflow-x-auto">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                    {activeTab === 'products' && <VectorFilterInterface onProductSelect={onProductSelect} />}
                    {activeTab === 'bestseller' && <VelocityTrendDashboard />}
                    {activeTab === 'bundles' && <DynamicBundleBuilder />}
                    {activeTab === 'blog' && <ContextualBlogReader onProductSelect={onProductSelect} />}
                    {activeTab === 'testimonials' && <SkinTwinEvidenceGallery />}
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>GlowHub Commerce Engine v1.0</span>
                        <span>5 Engines • 5 UI Modules</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
