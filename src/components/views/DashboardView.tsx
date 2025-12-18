import React, { useState, useMemo } from 'react';
import { TrendingUp, Package, CreditCard, Sparkles, Store, Euro, ArrowRight, LogOut, User, Moon, Sun, Monitor } from 'lucide-react';
import { SalesChart } from '../ui/SalesChart';
import { Item } from '../../types';
import { calculateProfit, formatCurrency } from '../../lib/utils';
import { FadeIn } from '../ui/FadeIn';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { Card } from '../ui/Card';
import { useTheme } from '../providers/ThemeProvider';

import { PullToRefresh } from '../ui/PullToRefresh';

export const DashboardView = ({ items, onViewInventory, onAddItem, userEmail, onLogout, onRefresh, serverStats }: {
    items: Item[],
    onViewInventory: () => void,
    onAddItem: () => void,
    userEmail?: string,
    onLogout: () => void,
    onRefresh: () => Promise<void>,
    serverStats?: any
}) => {
    const [chartMonths, setChartMonths] = useState<3 | 12>(3);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [activeChannel, setActiveChannel] = useState<string | null>(null);
    const { theme, setTheme } = useTheme();

    const displayStats = useMemo(() => {
        const soldItems = items.filter(i => i.status === 'sold');
        const inStockItems = items.filter(i => i.status === 'in_stock' || i.status === 'reserved');

        // Local Fallbacks
        const localProfit = soldItems.reduce((sum, item) => sum + (calculateProfit(item) || 0), 0);
        const localRevenue = soldItems.reduce((sum, item) => sum + (item.salePriceEur || 0), 0);
        const localValue = inStockItems.reduce((sum, item) => sum + item.purchasePriceEur, 0);

        return {
            totalProfit: serverStats?.total_profit ?? localProfit,
            totalRevenue: serverStats?.total_revenue ?? localRevenue,
            inventoryValue: serverStats?.inventory_value ?? localValue,
            stockCount: serverStats?.items_in_stock ?? inStockItems.length,
            soldCount: serverStats?.items_sold ?? soldItems.length,
            channels: serverStats?.sales_channels?.map((c: any) => [c.channel, c.count, c.profit]) || [],
            topBrands: serverStats?.top_brands || []
        };
    }, [items, serverStats]);

    // Simple Modal for Channel Details
    const ChannelModal = ({ channel, onClose }: { channel: string, onClose: () => void }) => {
        const channelItems = items.filter(i => i.saleChannel === channel && i.status === 'sold');
        return (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6">
                <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose}></div>
                <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl shadow-2xl relative z-10 max-h-[80vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
                    <div className="p-6 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-zinc-50 capitalize">{channel} Insights</h3>
                            <p className="text-sm text-stone-500 dark:text-zinc-400">{channelItems.length} Verkäufe im aktuellen Snapshot</p>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors">
                            <ArrowRight className="w-5 h-5 rotate-90" />
                        </button>
                    </div>
                    <div className="overflow-y-auto p-4 space-y-3">
                        {channelItems.length === 0 ? (
                            <div className="text-center py-10 text-stone-400 font-medium">Keine Details für diesen Kanal lokal geladen.</div>
                        ) : (
                            channelItems.map(item => (
                                <div key={item.id} className="flex items-center gap-4 p-3 rounded-2xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-100 dark:border-zinc-800">
                                    <div className="w-12 h-12 bg-stone-200 dark:bg-zinc-700 rounded-xl overflow-hidden flex-shrink-0">
                                        {item.imageUrls?.[0] ? <img src={item.imageUrls[0]} className="w-full h-full object-cover" alt="" /> : <Package className="w-full h-full p-3 text-stone-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-stone-900 dark:text-zinc-50 truncate">{item.brand} {item.model}</p>
                                        <p className="text-xs text-stone-500 dark:text-zinc-400">{item.saleDate ? new Date(item.saleDate).toLocaleDateString() : 'Kein Datum'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-stone-900 dark:text-zinc-50">{formatCurrency(item.salePriceEur || 0)}</p>
                                        <p className="text-[10px] text-green-600 font-bold">+{formatCurrency(calculateProfit(item) || 0)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const themeOptions = [
        { value: 'light' as const, label: 'Hell', icon: Sun },
        { value: 'dark' as const, label: 'Dunkel', icon: Moon },
        { value: 'system' as const, label: 'System', icon: Monitor },
    ];

    return (
        <FadeIn className="pb-safe">
            <PullToRefresh onRefresh={onRefresh}>
                <div className="px-6 pt-6 pb-6 max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6 relative z-50">
                        <div>
                            <h1 className="font-serif font-bold text-3xl text-stone-900 dark:text-zinc-50">Dashboard</h1>
                            <p className="text-stone-500 dark:text-zinc-400 text-sm">Willkommen zurück</p>
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="w-10 h-10 bg-stone-200 dark:bg-zinc-800 rounded-full overflow-hidden border-2 border-white dark:border-zinc-700 shadow-sm active:scale-95 transition-transform"
                            >
                                <div className="w-full h-full bg-gradient-to-br from-stone-400 to-stone-600 dark:from-zinc-600 dark:to-zinc-800"></div>
                            </button>

                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                                    <div className="absolute right-0 top-12 w-64 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-stone-100 dark:border-zinc-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex items-center mb-4 pb-4 border-b border-stone-100 dark:border-zinc-800">
                                            <div className="w-10 h-10 bg-stone-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-stone-500 dark:text-zinc-400 mr-3">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest">Angemeldet als</p>
                                                <p className="text-sm font-medium text-stone-900 dark:text-zinc-50 truncate">{userEmail || 'Benutzer'}</p>
                                            </div>
                                        </div>

                                        <div className="mb-4 pb-4 border-b border-stone-100 dark:border-zinc-800">
                                            <p className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest mb-3">Design</p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {themeOptions.map(({ value, label, icon: Icon }) => (
                                                    <button
                                                        key={value}
                                                        onClick={() => setTheme(value)}
                                                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${theme === value
                                                            ? 'bg-stone-100 dark:bg-zinc-800 text-stone-900 dark:text-zinc-50'
                                                            : 'text-stone-500 dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-zinc-800/50'
                                                            }`}
                                                    >
                                                        <Icon className="w-4 h-4" />
                                                        <span className="text-xs font-medium">{label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            onClick={onLogout}
                                            className="w-full flex items-center px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors text-sm font-medium"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Abmelden
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Desktop Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Hero Card: Financial Overview */}
                        <Card className="lg:col-span-2 p-8 bg-white dark:bg-zinc-900 shadow-lg shadow-stone-200/50 dark:shadow-zinc-950/50 relative overflow-hidden border border-stone-200 dark:border-zinc-800">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <p className="text-stone-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Gesamtgewinn</p>
                                    <h2 className="text-4xl font-serif font-bold text-stone-900 dark:text-zinc-50">
                                        <AnimatedNumber value={displayStats.totalProfit} format={(val) => formatCurrency(val)} />
                                    </h2>
                                </div>
                                <div className="bg-yellow-50 dark:bg-yellow-950/30 p-2 rounded-xl">
                                    <Sparkles className="w-5 h-5 text-yellow-500" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-stone-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Umsatz</p>
                                    <span className="font-medium text-xl text-stone-900 dark:text-zinc-50">
                                        <AnimatedNumber value={displayStats.totalRevenue} format={(val) => formatCurrency(val)} />
                                    </span>
                                </div>
                                <div>
                                    <p className="text-stone-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Verkäufe</p>
                                    <span className="font-medium text-xl text-stone-900 dark:text-zinc-50">
                                        {displayStats.soldCount}
                                    </span>
                                </div>
                            </div>
                        </Card>

                        {/* Stock Overview */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-bold text-stone-900 dark:text-zinc-50 text-lg">Inventar</h3>
                                <button onClick={onViewInventory} className="text-sm font-medium text-stone-500 dark:text-zinc-400 flex items-center hover:text-stone-900 dark:hover:text-zinc-200 transition-colors">
                                    Alle <ArrowRight className="w-4 h-4 ml-1" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Card className="p-4 flex flex-col justify-between bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-sm dark:shadow-zinc-950/50">
                                    <div className="w-8 h-8 bg-stone-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-3 text-stone-600 dark:text-zinc-400">
                                        <Package className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="block text-2xl font-bold text-stone-900 dark:text-zinc-50">{displayStats.stockCount}</span>
                                        <span className="text-xs text-stone-500 dark:text-zinc-400 font-medium">Artikel im Lager</span>
                                    </div>
                                </Card>
                                <Card className="p-4 flex flex-col justify-between bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-sm dark:shadow-zinc-950/50">
                                    <div className="w-8 h-8 bg-stone-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-3 text-stone-600 dark:text-zinc-400">
                                        <Euro className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="block text-2xl font-bold text-stone-900 dark:text-zinc-50">
                                            <AnimatedNumber value={displayStats.inventoryValue} format={(val) => formatCurrency(val)} />
                                        </span>
                                        <span className="text-xs text-stone-500 dark:text-zinc-400 font-medium">Warenwert</span>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* Charts in responsive grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Sales Chart */}
                        <Card className="p-6 bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-stone-800 dark:text-zinc-200">Umsatzentwicklung</h3>
                                <div className="flex bg-stone-100 dark:bg-zinc-800 p-1 rounded-lg">
                                    <button
                                        onClick={() => setChartMonths(3)}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${chartMonths === 3 ? 'bg-white dark:bg-zinc-700 shadow-sm text-stone-900 dark:text-zinc-50' : 'text-stone-500 dark:text-zinc-400'}`}
                                    >
                                        3M
                                    </button>
                                    <button
                                        onClick={() => setChartMonths(12)}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${chartMonths === 12 ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`}
                                    >
                                        1J
                                    </button>
                                </div>
                            </div>
                            <SalesChart items={items} months={chartMonths} />
                        </Card>

                        {/* Sales Channels */}
                        <Card className="p-6 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-sm dark:shadow-zinc-950/50 overflow-hidden">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-stone-800 dark:text-zinc-200">Top Verkaufskanäle</h3>
                                <ArrowRight className="w-4 h-4 text-stone-400" />
                            </div>
                            <div className="space-y-4">
                                {displayStats.channels.map(([channel, count]: any, i: number) => (
                                    <button
                                        key={channel}
                                        onClick={() => setActiveChannel(channel)}
                                        className="w-full text-left group relative"
                                    >
                                        <div className="flex justify-between text-sm mb-1.5 z-10 relative">
                                            <span className="font-bold capitalize text-stone-700 dark:text-zinc-300 group-hover:text-stone-900 dark:group-hover:text-zinc-100 transition-colors">{channel}</span>
                                            <span className="text-stone-400 dark:text-zinc-500 font-medium">{count} Verkäufe</span>
                                        </div>
                                        <div className="h-2 bg-stone-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000 ease-out bg-stone-800 dark:bg-zinc-400"
                                                style={{ width: `${(count / displayStats.soldCount) * 100}%`, transitionDelay: `${i * 100}ms` }}
                                            />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Top Brands Section */}
                    {displayStats.top_brands && displayStats.top_brands.length > 0 && (
                        <div className="mt-8">
                            <h3 className="font-bold text-stone-900 dark:text-zinc-50 text-lg mb-4">Top Marken</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                {displayStats.top_brands.map((b: any) => (
                                    <Card key={b.brand} className="p-4 bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 shadow-sm">
                                        <p className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest mb-1 truncate">{b.brand}</p>
                                        <p className="text-xl font-bold text-stone-900 dark:text-zinc-50 mb-1">{b.count}</p>
                                        <p className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full inline-block">
                                            +{formatCurrency(b.profit)}
                                        </p>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </PullToRefresh>

            {activeChannel && (
                <ChannelModal
                    channel={activeChannel}
                    onClose={() => setActiveChannel(null)}
                />
            )}
        </FadeIn >
    );
};

