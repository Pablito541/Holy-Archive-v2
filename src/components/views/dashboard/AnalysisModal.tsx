import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Sparkles, ArrowRight, Package } from 'lucide-react';
import { Item } from '../../../types';
import { formatCurrency } from '../../../lib/utils';
import { supabase } from '../../../lib/supabase';

interface AnalysisModalProps {
    type: 'margin' | 'profit';
    onClose: () => void;
    topBrands: any[];
    currentOrgId: string | undefined | null;
    timeframe: 'month' | '3months' | 'all';
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ type, onClose, topBrands, currentOrgId, timeframe }) => {
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
    const [brandItems, setBrandItems] = useState<(Item & { calculatedProfit: number; calculatedMargin: number })[]>([]);
    const [isLoadingBrandItems, setIsLoadingBrandItems] = useState(false);
    const [sortMetric, setSortMetric] = useState<'margin' | 'profit'>(type);
    const brands = [...topBrands];

    // Sort brands based on modal type
    const sortedBrands = brands.sort((a, b) => {
        if (type === 'margin') {
            return (b.profit / b.revenue) - (a.profit / a.revenue);
        }
        return b.profit - a.profit;
    });

    // Fetch ALL items for selected brand from Supabase
    useEffect(() => {
        if (!selectedBrand || !currentOrgId || !supabase) {
            setBrandItems([]);
            return;
        }

        const fetchBrandItems = async () => {
            if (!supabase) return;
            setIsLoadingBrandItems(true);
            try {
                let query = supabase
                    .from('items')
                    .select('*')
                    .eq('brand', selectedBrand)
                    .eq('status', 'sold')
                    .eq('organization_id', currentOrgId);

                // Apply timeframe filter
                if (timeframe === 'month') {
                    // Start of current month
                    const startOfMonth = new Date();
                    startOfMonth.setDate(1);
                    startOfMonth.setHours(0, 0, 0, 0);
                    query = query.gte('sale_date', startOfMonth.toISOString());
                } else if (timeframe === '3months') {
                    // Last 3 months listing
                    const threeMonthsAgo = new Date();
                    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                    query = query.gte('sale_date', threeMonthsAgo.toISOString());
                }

                const { data, error } = await query;

                if (error) throw error;

                if (data) {
                    const mappedItems = data.map((d: any) => {
                        const item: Item = {
                            id: d.id,
                            brand: d.brand,
                            model: d.model,
                            category: d.category,
                            condition: d.condition,
                            status: d.status,
                            purchasePriceEur: d.purchase_price_eur,
                            purchaseDate: d.purchase_date,
                            purchaseSource: d.purchase_source,
                            salePriceEur: d.sale_price_eur,
                            saleDate: d.sale_date,
                            saleChannel: d.sale_channel,
                            platformFeesEur: d.platform_fees_eur,
                            shippingCostEur: d.shipping_cost_eur,
                            reservedFor: d.reserved_for,
                            reservedUntil: d.reserved_until,
                            imageUrls: d.image_urls || [],
                            notes: d.notes,
                            createdAt: d.created_at
                        };
                        const profit = (item.salePriceEur || 0) - (item.purchasePriceEur || 0) - (item.platformFeesEur || 0) - (item.shippingCostEur || 0);
                        const margin = item.salePriceEur ? (profit / item.salePriceEur) * 100 : 0;
                        return { ...item, calculatedProfit: profit, calculatedMargin: margin };
                    });

                    setBrandItems(mappedItems);
                }
            } catch (err) {
                console.error('Failed to fetch brand items:', err);
                setBrandItems([]);
            } finally {
                setIsLoadingBrandItems(false);
            }
        };

        fetchBrandItems();
    }, [selectedBrand, currentOrgId]);

    // Sort items reactively based on sortMetric
    const sortedBrandItems = useMemo(() => {
        return [...brandItems].sort((a, b) => {
            if (sortMetric === 'margin') {
                return b.calculatedMargin - a.calculatedMargin;
            }
            return b.calculatedProfit - a.calculatedProfit;
        });
    }, [brandItems, sortMetric]);

    // Brand Detail View
    if (selectedBrand) {
        const brandStats = sortedBrands.find(b => b.brand === selectedBrand);
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md" onClick={onClose}></div>
                <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="p-8 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center bg-stone-50/50 dark:bg-zinc-800/20">
                        <div>
                            <button
                                onClick={() => setSelectedBrand(null)}
                                className="flex items-center gap-1 text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest mb-2 hover:text-stone-600 dark:hover:text-zinc-300 transition-colors"
                            >
                                <ArrowRight className="w-3 h-3 rotate-180" />
                                Zurück zur Übersicht
                            </button>
                            <div className="flex items-center gap-2 mb-1">
                                {sortMetric === 'margin' ? <TrendingUp className="w-5 h-5 text-green-500" /> : <Sparkles className="w-5 h-5 text-yellow-500" />}
                                <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-zinc-50">
                                    {selectedBrand}
                                </h3>
                            </div>
                            {brandStats && (
                                <div className="flex gap-4 mt-2">
                                    <div className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                                        Marge: <span className="text-green-600 dark:text-green-400">{((brandStats.profit / brandStats.revenue) * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                                        Gewinn: <span className="text-yellow-600 dark:text-yellow-500">{formatCurrency(brandStats.profit)}</span>
                                    </div>
                                </div>
                            )}
                            {/* Sort Toggle */}
                            <div className="inline-flex bg-stone-100 dark:bg-zinc-800 p-1 rounded-lg mt-3">
                                <button
                                    onClick={() => setSortMetric('margin')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${sortMetric === 'margin' ? 'bg-white dark:bg-zinc-700 shadow text-green-600 dark:text-green-400' : 'text-stone-400 dark:text-zinc-500'}`}
                                >
                                    Marge %
                                </button>
                                <button
                                    onClick={() => setSortMetric('profit')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${sortMetric === 'profit' ? 'bg-white dark:bg-zinc-700 shadow text-stone-900 dark:text-zinc-50' : 'text-stone-400 dark:text-zinc-500'}`}
                                >
                                    Gewinn €
                                </button>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 hover:scale-105 transition-transform shadow-sm">
                            <ArrowRight className="w-5 h-5 rotate-90" />
                        </button>
                    </div>
                    <div className="overflow-y-auto p-6 space-y-3">
                        <p className="text-sm font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest mb-2">
                            Sortiert nach {sortMetric === 'margin' ? 'Marge' : 'Gewinn'} {isLoadingBrandItems ? '' : `(${sortedBrandItems.length} Artikel)`}
                        </p>
                        {isLoadingBrandItems ? (
                            <div className="text-center py-16">
                                <div className="w-8 h-8 border-2 border-stone-200 dark:border-zinc-700 border-t-stone-500 dark:border-t-zinc-400 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-stone-400 font-medium">Lade Artikel...</p>
                            </div>
                        ) : sortedBrandItems.length === 0 ? (
                            <div className="text-center py-16">
                                <Package className="w-12 h-12 text-stone-200 dark:text-zinc-800 mx-auto mb-4" />
                                <p className="text-stone-400 font-medium">Keine Artikel gefunden.</p>
                            </div>
                        ) : (
                            sortedBrandItems.map(item => (
                                <div key={item.id} className="flex items-center gap-4 p-4 rounded-3xl bg-stone-50/50 dark:bg-zinc-800/30 border border-stone-100 dark:border-zinc-800/50 hover:border-stone-200 dark:hover:border-zinc-700 transition-colors group">
                                    <div className="w-16 h-16 bg-stone-200 dark:bg-zinc-700 rounded-2xl overflow-hidden flex-shrink-0 shadow-inner">
                                        {item.imageUrls?.[0] ? <img src={item.imageUrls[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" /> : <Package className="w-full h-full p-4 text-stone-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-lg text-stone-900 dark:text-zinc-50 truncate">{item.model || 'Unbenannt'}</p>
                                        <p className="text-sm text-stone-500 dark:text-zinc-400 truncate">VK: {formatCurrency(item.salePriceEur || 0)}</p>
                                        <p className="text-[10px] text-stone-400 mt-1 uppercase font-bold tracking-tighter">{item.saleDate ? new Date(item.saleDate).toLocaleDateString() : ''}</p>
                                    </div>
                                    <div className="text-right">
                                        {sortMetric === 'margin' ? (
                                            <>
                                                <p className="font-bold text-green-600 dark:text-green-400 text-lg">
                                                    {item.calculatedMargin.toFixed(1)}%
                                                </p>
                                                <p className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-tight">
                                                    +{formatCurrency(item.calculatedProfit)}
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="font-bold text-yellow-500 dark:text-yellow-400 text-lg">
                                                    +{formatCurrency(item.calculatedProfit)}
                                                </p>
                                                <p className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-tight">
                                                    {item.calculatedMargin.toFixed(1)}%
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Brand List View (default)
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md" onClick={onClose}></div>
            <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center bg-stone-50/50 dark:bg-zinc-800/20">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            {type === 'margin' ? <TrendingUp className="w-5 h-5 text-green-500" /> : <Sparkles className="w-5 h-5 text-yellow-500" />}
                            <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-zinc-50">
                                {type === 'margin' ? 'Beste Margen' : 'Meister Gewinne'}
                            </h3>
                        </div>
                        <p className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest mt-1">
                            Tippe auf eine Marke für Details
                        </p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 hover:scale-105 transition-transform shadow-sm">
                        <ArrowRight className="w-5 h-5 rotate-90" />
                    </button>
                </div>
                <div className="overflow-y-auto p-6 space-y-3">
                    {sortedBrands.length === 0 ? (
                        <p className="text-center py-10 text-stone-400">Keine Daten verfügbar.</p>
                    ) : (
                        sortedBrands.map(b => {
                            const margin = (b.profit / b.revenue) * 100;
                            return (
                                <button
                                    key={b.brand}
                                    onClick={() => setSelectedBrand(b.brand)}
                                    className="w-full flex items-center justify-between p-4 rounded-3xl bg-stone-50/50 dark:bg-zinc-800/30 border border-stone-100 dark:border-zinc-800/50 hover:border-stone-300 dark:hover:border-zinc-600 hover:bg-stone-100/50 dark:hover:bg-zinc-800/50 transition-all active:scale-[0.98]"
                                >
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="font-bold text-stone-900 dark:text-zinc-50 truncate">{b.brand}</p>
                                        <p className="text-[10px] text-stone-400 dark:text-zinc-500 uppercase font-bold tracking-widest">{b.count} Verkäufe</p>
                                    </div>
                                    <div className="text-right flex items-center gap-3">
                                        <div className="text-right">
                                            {type === 'margin' ? (
                                                <>
                                                    <p className="font-bold text-green-600 dark:text-green-400 text-lg">
                                                        {margin.toFixed(1)}%
                                                    </p>
                                                    <p className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-tight">
                                                        +{formatCurrency(b.profit)}
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="font-bold text-yellow-500 dark:text-yellow-400 text-lg">
                                                        +{formatCurrency(b.profit)}
                                                    </p>
                                                    <p className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-tight">
                                                        {margin.toFixed(1)}%
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-stone-300 dark:text-zinc-600" />
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
