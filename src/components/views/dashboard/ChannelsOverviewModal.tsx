import React from 'react';
import { Store, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';

interface ChannelsOverviewModalProps {
    onClose: () => void;
    channelStats: any[];
    totalSoldCount: number;
}

export const ChannelsOverviewModal: React.FC<ChannelsOverviewModalProps> = ({ onClose, channelStats, totalSoldCount }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md" onClick={onClose}></div>
            <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center bg-stone-50/50 dark:bg-zinc-800/20">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Store className="w-5 h-5 text-stone-400" />
                            <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-zinc-50">Verkaufskanäle</h3>
                        </div>
                        <p className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest mt-1">
                            Performance Übersicht
                        </p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 hover:scale-105 transition-transform shadow-sm">
                        <ArrowRight className="w-5 h-5 rotate-90" />
                    </button>
                </div>
                <div className="overflow-y-auto p-6 space-y-3">
                    {channelStats.length === 0 ? (
                        <p className="text-center py-10 text-stone-400">Keine Daten verfügbar.</p>
                    ) : (
                        channelStats.map(c => {
                            const margin = (c.profit / c.revenue) * 100;
                            return (
                                <div key={c.channel} className="p-4 rounded-3xl bg-stone-50/50 dark:bg-zinc-800/30 border border-stone-100 dark:border-zinc-800/50">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-stone-900 dark:text-zinc-50 truncate capitalize">{c.channel}</p>
                                            <p className="text-[10px] text-stone-400 dark:text-zinc-500 uppercase font-bold tracking-widest">{c.count} Verkäufe</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-stone-900 dark:text-zinc-50">{formatCurrency(c.revenue)}</p>
                                            <p className="text-sm font-bold text-green-600 dark:text-green-400">{margin.toFixed(1)}% Marge</p>
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-stone-200/50 dark:bg-zinc-800/50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-stone-800 dark:bg-zinc-400 rounded-full transition-all duration-1000"
                                            style={{ width: `${(c.count / totalSoldCount) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
