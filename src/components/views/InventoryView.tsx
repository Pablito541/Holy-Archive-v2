import React, { useState, useMemo, useEffect } from 'react';
import { Search, ShoppingBag, Tag, ArrowRight, ArrowLeft } from 'lucide-react';
import { Item, ItemStatus } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { FadeIn } from '../ui/FadeIn';

export const InventoryView = ({ items, onSelectItem, selectionMode }: { items: Item[], onSelectItem: (id: string) => void, selectionMode?: 'sell' | 'view' }) => {
    const [filter, setFilter] = useState<ItemStatus>('in_stock');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredItems = useMemo(() => {
        return items.filter(i => {
            const statusMatches = i.status === filter;
            const query = searchQuery.toLowerCase();
            const searchMatches = !query ||
                i.brand.toLowerCase().includes(query) ||
                (i.model && i.model.toLowerCase().includes(query)) ||
                (i.purchaseSource && i.purchaseSource.toLowerCase().includes(query)) ||
                i.id.toLowerCase().includes(query);

            return statusMatches && searchMatches;
        });
    }, [items, filter, searchQuery]);

    useEffect(() => {
        if (selectionMode === 'sell') {
            setFilter('in_stock');
        }
    }, [selectionMode]);

    return (
        <FadeIn className="p-6 pb-32 h-full flex flex-col">
            <header className="mb-4 pt-2">
                {selectionMode === 'sell' ? (
                    <div className="bg-stone-900 text-white p-4 rounded-2xl mb-4 shadow-xl shadow-stone-900/10">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">Verkauf erfassen</h2>
                        <p className="font-serif font-bold text-xl">Wähle einen Artikel</p>
                    </div>
                ) : (
                    <h1 className="text-3xl font-serif font-bold text-stone-900 mb-6">Inventar</h1>
                )}

                <div className="relative mb-4">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                        <Search className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        placeholder="Suche Marke, Modell, ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-stone-200 focus:border-stone-800 outline-none transition-all placeholder:text-stone-300 font-medium text-sm"
                    />
                </div>

                {selectionMode !== 'sell' && (
                    <div className="flex p-1 bg-white border border-stone-200 rounded-2xl shadow-sm">
                        {(['in_stock', 'sold', 'reserved'] as const).map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${filter === status
                                        ? 'bg-stone-900 text-white shadow-md'
                                        : 'text-stone-400 hover:text-stone-600'
                                    }`}
                            >
                                {status === 'in_stock' ? 'Lager' : status === 'sold' ? 'Verkauft' : 'Reserviert'}
                            </button>
                        ))}
                    </div>
                )}
            </header>

            <div className="flex-1 space-y-4">
                {filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-stone-300">
                        <ShoppingBag className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-sm font-medium">Keine Ergebnisse.</p>
                    </div>
                ) : (
                    filteredItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => onSelectItem(item.id)}
                            className="group bg-white rounded-3xl p-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-100 flex items-start active:scale-[0.98] transition-all cursor-pointer hover:shadow-lg"
                        >
                            <div className="w-24 h-24 bg-stone-100 rounded-2xl mr-4 flex-shrink-0 relative overflow-hidden">
                                {item.imageUrls && item.imageUrls.length > 0 ? (
                                    <img src={item.imageUrls[0]} alt={item.model} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-stone-300">
                                        <ShoppingBag className="w-8 h-8 opacity-50" />
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm px-2 py-1 text-center border-t border-white/50">
                                    <span className="text-[10px] font-bold text-stone-900">
                                        {formatCurrency(item.status === 'sold' ? (item.salePriceEur || 0) : item.purchasePriceEur)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-between h-24 py-1">
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-serif font-bold text-lg text-stone-900 truncate pr-2">{item.brand}</span>
                                    </div>
                                    <p className="text-xs font-medium text-stone-500 truncate uppercase tracking-wide">{item.model || item.category}</p>
                                </div>

                                <div className="flex justify-between items-end mt-auto">
                                    <div className="flex items-center text-[10px] font-medium text-stone-400 bg-stone-50 px-2 py-1 rounded-lg">
                                        <Tag className="w-3 h-3 mr-1.5" />
                                        {item.purchaseSource}
                                    </div>

                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${selectionMode === 'sell' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-400 group-hover:bg-stone-900 group-hover:text-white'}`}>
                                        {selectionMode === 'sell' ? <ArrowRight className="w-3 h-3" /> : <ArrowLeft className="w-3 h-3 rotate-180" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </FadeIn>
    );
};
