// MoleculeDiscoveryComponents.tsx - Active Molecule Node component
import { useMemo } from 'react';
import { FlaskConical, ChevronRight } from 'lucide-react';
import { getProductsByIngredient } from '../ProductTelemetry';

interface ActiveMoleculeNodeProps {
    ingredientId: string;
    ingredientName: string;
    description: string;
    currentProductId: string;
    onClick: (ingredientId: string, ingredientName: string) => void;
}

export const ActiveMoleculeNode = ({
    ingredientId,
    ingredientName,
    description,
    currentProductId,
    onClick
}: ActiveMoleculeNodeProps) => {
    const productCount = useMemo(() =>
        getProductsByIngredient(ingredientId, currentProductId).length,
        [ingredientId, currentProductId]
    );

    return (
        <button
            onClick={() => onClick(ingredientId, ingredientName)}
            className="p-3 rounded-xl border border-slate-100 bg-white hover:shadow-lg hover:border-pink-200 hover:-translate-y-1 transition-all text-left group cursor-pointer relative"
        >
            {/* Badge - "Lihat X Produk Lain" */}
            {productCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                    +{productCount} Produk
                </div>
            )}

            <div className="flex items-start gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <FlaskConical size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-slate-800 mb-1 flex items-center gap-1">
                        {ingredientName}
                        {productCount > 0 && (
                            <ChevronRight size={12} className="text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">{description}</p>
                </div>
            </div>

            {/* Hover indicator */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
    );
};
