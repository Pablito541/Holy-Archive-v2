import React from 'react';
import { Store, ArrowRight, Package } from 'lucide-react';
import { Item } from '../../../types';
import { formatCurrency } from '../../../lib/utils';

interface ChannelModalProps {
    channel: string;
    onClose: () => void;
    items: Item[];
    channelStats: any[]; // Using any[] to match existing structure, could be typed better
}

export const ChannelModal: React.FC<ChannelModalProps> = ({ channel, onClose, items, channelStats }) => {
    const channelItems = items.filter(i => i.saleChannel === channel && i.status === 'sold');
    const channelStat = channelStats.find((c: any) => c.channel === channel);
    const margin = channelStat ? (channelStat.profit / channelStat.revenue) * 100 : 0;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-20 max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center bg-stone-50/50 dark:bg-zinc-800/20">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Store className="w-5 h-5 text-stone-400" />
                            <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-zinc-50 capitalize">{channel}</h3>
                        </div>
                        <div className="flex gap-4 mt-2">
                            <div className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                                Marge: <span className="text-green-600 dark:text-green-400">{margin.toFixed(1)}%</span>
                            </div>
                            <div className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                                Umsatz: <span className="text-stone-900 dark:text-zinc-50">{formatCurrency(channelStat?.revenue || 0)}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 hover:scale-105 transition-transform shadow-sm">
                        <ArrowRight className="w-5 h-5 rotate-90" />
                    </button>
                </div>
                <div className="overflow-y-auto p-6 space-y-4">
                    <p className="text-sm font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Verkaufte Artikel ({channelItems.length})</p>
                    {channelItems.length === 0 ? (
                        <div className="text-center py-16">
                            <Package className="w-12 h-12 text-stone-200 dark:text-zinc-800 mx-auto mb-4" />
                            <p className="text-stone-400 font-medium">Keine detaillierten Verkaufsdaten lokal vorhanden.</p>
                        </div>
                    ) : (
                        channelItems.map(item => (
                            <div key={item.id} className="flex items-center gap-4 p-4 rounded-3xl bg-stone-50/50 dark:bg-zinc-800/30 border border-stone-100 dark:border-zinc-800/50 hover:border-stone-200 dark:hover:border-zinc-700 transition-colors group">
                                <div className="w-16 h-16 bg-stone-200 dark:bg-zinc-700 rounded-2xl overflow-hidden flex-shrink-0 shadow-inner">
                                    {item.imageUrls?.[0] ? <img src={item.imageUrls[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" /> : <Package className="w-full h-full p-4 text-stone-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-lg text-stone-900 dark:text-zinc-50 truncate">{item.brand}</p>
                                    <p className="text-sm text-stone-500 dark:text-zinc-400 truncate">{item.model}</p>
                                    <p className="text-[10px] text-stone-400 mt-1 uppercase font-bold tracking-tighter">{item.saleDate ? new Date(item.saleDate).toLocaleDateString() : 'Verkauft'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-stone-900 dark:text-zinc-50">{formatCurrency(item.salePriceEur || 0)}</p>
                                    <p className="text-xs text-green-600 font-bold">+{formatCurrency((item.salePriceEur || 0) - (item.purchasePriceEur || 0) - (item.platformFeesEur || 0) - (item.shippingCostEur || 0))}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
