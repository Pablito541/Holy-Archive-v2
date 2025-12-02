import React from 'react';
import { Package, TrendingUp } from 'lucide-react';

export const ActionMenu = ({ onClose, onAddItem, onSellItem }: { onClose: () => void, onAddItem: () => void, onSellItem: () => void }) => {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative z-10 w-full max-w-sm grid grid-cols-2 gap-6">
                <button
                    onClick={onAddItem}
                    className="aspect-square bg-white rounded-[2rem] shadow-2xl flex flex-col items-center justify-center space-y-4 hover:scale-105 transition-transform active:scale-95"
                >
                    <div className="w-16 h-16 bg-stone-900 text-white rounded-full flex items-center justify-center shadow-lg">
                        <Package className="w-8 h-8" />
                    </div>
                    <span className="font-serif font-bold text-lg text-stone-900">Einkauf<br />erfassen</span>
                </button>

                <button
                    onClick={onSellItem}
                    className="aspect-square bg-white rounded-[2rem] shadow-2xl flex flex-col items-center justify-center space-y-4 hover:scale-105 transition-transform active:scale-95"
                >
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-900 rounded-full flex items-center justify-center shadow-lg">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <span className="font-serif font-bold text-lg text-stone-900">Verkauf<br />erfassen</span>
                </button>

                <button onClick={onClose} className="col-span-2 bg-white/10 text-white backdrop-blur-md py-4 rounded-2xl font-medium mt-4">
                    Abbrechen
                </button>
            </div>
        </div>
    );
};
