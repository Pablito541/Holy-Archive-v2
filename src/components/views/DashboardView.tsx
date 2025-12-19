import React, { useState, useMemo } from 'react';
import { TrendingUp, Package, CreditCard, Sparkles, Store, Euro, ArrowRight, LogOut, User, Moon, Sun, Monitor } from 'lucide-react';
import { SalesChart } from '../ui/SalesChart';
import { Item } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { FadeIn } from '../ui/FadeIn';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { Card } from '../ui/Card';
import { useTheme } from '../providers/ThemeProvider';
import { supabase } from '../../lib/supabase';

import { PullToRefresh } from '../ui/PullToRefresh';

export const DashboardView = ({ items, onViewInventory, onAddItem, userEmail, onLogout, onRefresh, serverStats, currentUser, currentOrgId }: {
    items: Item[],
    onViewInventory: () => void,
    onAddItem: () => void,
    userEmail?: string,
    onLogout: () => void,
    onRefresh: () => Promise<void>,
    serverStats?: any,
    currentUser?: any,
    currentOrgId?: string | null
}) => {
    const [chartMonths, setChartMonths] = useState<3 | 12>(3);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [activeChannel, setActiveChannel] = useState<string | null>(null);
    const [activeBrand, setActiveBrand] = useState<string | null>(null);
    const [timeframe, setTimeframe] = useState<'month' | '3months' | 'all'>('month');
    const { theme, setTheme } = useTheme();

    // Server-side stats state
    const [stats, setStats] = useState({
        totalProfit: 0,
        totalRevenue: 0,
        totalSales: 0,
        averageMargin: 0,
        inventoryValue: 0, // Added
        stockCount: 0, // Added
        totalBrands: 0,
        totalChannels: 0,
        // Detailed structures
        channels: [] as any[],
        topBrands: [] as any[],
        bestMarginBrand: null as any,
        highestProfitBrand: null as any
    });
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    // Fetch dashboard stats from DB
    React.useEffect(() => {
        const fetchStats = async () => {
            if (!currentOrgId || !supabase) return;

            setIsLoadingStats(true);
            try {
                // Call the new detailed RPC
                const { data, error } = await supabase
                    .rpc('get_detailed_dashboard_stats', {
                        org_id: currentOrgId,
                        filter_timeframe: timeframe
                    });

                if (error) throw error;

                if (data) {
                    // Start of Data Handling
                    // Note: RPC returns JSON. Supabase might return it as data directly.
                    // If it was RETURNS TABLE, it would be data[0]. 
                    // Let's assume strict JSON object return.
                    const s = data as any;

                    setStats({
                        totalProfit: Number(s.totalProfit) || 0,
                        totalRevenue: Number(s.totalRevenue) || 0,
                        totalSales: Number(s.totalSales) || 0,
                        averageMargin: Number(s.averageMargin) || 0,

                        inventoryValue: Number(s.inventoryValue) || 0,
                        stockCount: Number(s.stockCount) || 0,

                        totalBrands: s.topBrands ? s.topBrands.length : 0,
                        totalChannels: s.channels ? s.channels.length : 0,

                        channels: s.channels || [],
                        topBrands: s.topBrands || [],
                        bestMarginBrand: s.bestMarginBrand || null,
                        highestProfitBrand: s.highestProfitBrand || null
                    });
                }
            } catch (err) {
                console.error('Failed to fetch detailed stats:', err);
            } finally {
                setIsLoadingStats(false);
            }
        };

        fetchStats();
    }, [timeframe, currentOrgId, supabase]);

    // Derived display stats (Now just a passthrough from server stats)
    // We keep this variable name to minimize refactoring impact on the render section
    const displayStats = useMemo(() => {
        return {
            totalProfit: stats.totalProfit,
            totalRevenue: stats.totalRevenue,
            totalSales: stats.totalSales,
            averageMargin: stats.averageMargin,

            // Inventory (Use server values)
            inventoryValue: stats.inventoryValue,
            stockCount: stats.stockCount,

            // Collections
            channels: stats.channels,
            topBrands: stats.topBrands,
            bestMarginBrand: stats.bestMarginBrand,
            highestProfitBrand: stats.highestProfitBrand,

            soldCount: stats.totalSales
        };
    }, [stats]);

    // Enhanced Channel Modal
    const ChannelModal = ({ channel, onClose }: { channel: string, onClose: () => void }) => {
        const channelItems = items.filter(i => i.saleChannel === channel && i.status === 'sold');
        const channelStat = displayStats.channels.find((c: any) => c.channel === channel);
        const margin = channelStat ? (channelStat.profit / channelStat.revenue) * 100 : 0;

        return (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
                <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md" onClick={onClose}></div>
                <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500">
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

    // Generic Brand Modal
    const BrandModal = ({ brand, onClose }: { brand: string, onClose: () => void }) => {
        const brandItems = items.filter(i => i.brand === brand);
        const soldItems = brandItems.filter(i => i.status === 'sold');
        const stockItems = brandItems.filter(i => i.status === 'in_stock');
        const brandStat = displayStats.topBrands.find((b: any) => b.brand === brand);
        const margin = brandStat ? (brandStat.profit / brandStat.revenue) * 100 : 0;

        return (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
                <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md" onClick={onClose}></div>
                <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500">
                    <div className="p-8 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center bg-stone-50/50 dark:bg-zinc-800/20">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-5 h-5 text-yellow-500" />
                                <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-zinc-50">{brand}</h3>
                            </div>
                            <div className="flex gap-4 mt-2">
                                <div className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                                    Marge: <span className="text-green-600 dark:text-green-400">{margin.toFixed(1)}%</span>
                                </div>
                                <div className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                                    Lager: <span className="text-stone-900 dark:text-zinc-50">{stockItems.length} Stk.</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 hover:scale-105 transition-transform shadow-sm">
                            <ArrowRight className="w-5 h-5 rotate-90" />
                        </button>
                    </div>
                    <div className="overflow-y-auto p-6 space-y-6">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-3xl bg-green-50/50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
                                <p className="text-[10px] uppercase font-bold text-green-600/70 mb-1">Gewinn (Total)</p>
                                <p className="text-lg font-bold text-green-700 dark:text-green-400">{formatCurrency(brandStat?.profit || 0)}</p>
                            </div>
                            <div className="p-4 rounded-3xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                                <p className="text-[10px] uppercase font-bold text-blue-600/70 mb-1">Umsatz</p>
                                <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{formatCurrency(brandStat?.revenue || 0)}</p>
                            </div>
                        </div>

                        {/* Recent Items */}
                        <div className="space-y-4">
                            <p className="text-sm font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest">Alle Artikel ({brandItems.length})</p>
                            {brandItems.length === 0 ? (
                                <p className="text-center py-10 text-stone-400">Keine Artikel geladen.</p>
                            ) : (
                                brandItems.map(item => (
                                    <div key={item.id} className="flex items-center gap-4 p-4 rounded-3xl bg-stone-50/50 dark:bg-zinc-800/30 border border-stone-100 dark:border-zinc-800/50">
                                        <div className="w-14 h-14 bg-stone-200 dark:bg-zinc-700 rounded-2xl overflow-hidden flex-shrink-0">
                                            {item.imageUrls?.[0] ? <img src={item.imageUrls[0]} className="w-full h-full object-cover" alt="" /> : <Package className="w-full h-full p-4 text-stone-400" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-stone-900 dark:text-zinc-50 truncate">{item.model}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${item.status === 'sold' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-stone-100 text-stone-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                                                    {item.status === 'sold' ? 'Verkauft' : 'Lager'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-stone-900 dark:text-zinc-50">{formatCurrency(item.status === 'sold' ? item.salePriceEur || 0 : item.purchasePriceEur)}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
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

                    {/* Timeframe Filter */}
                    <div className="mb-6 flex flex-wrap gap-2 items-center">
                        <span className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest">Zeitraum:</span>
                        <div className="flex bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl gap-1">
                            <button
                                onClick={() => setTimeframe('month')}
                                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${timeframe === 'month' ? 'bg-white dark:bg-zinc-700 shadow-sm text-stone-900 dark:text-zinc-50' : 'text-stone-500 dark:text-zinc-400'}`}
                            >
                                Dieser Monat
                            </button>
                            <button
                                onClick={() => setTimeframe('3months')}
                                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${timeframe === '3months' ? 'bg-white dark:bg-zinc-700 shadow-sm text-stone-900 dark:text-zinc-50' : 'text-stone-500 dark:text-zinc-400'}`}
                            >
                                Letzte 3 Monate
                            </button>
                            <button
                                onClick={() => setTimeframe('all')}
                                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${timeframe === 'all' ? 'bg-white dark:bg-zinc-700 shadow-sm text-stone-900 dark:text-zinc-50' : 'text-stone-500 dark:text-zinc-400'}`}
                            >
                                Gesamte Zeit
                            </button>
                        </div>
                    </div>

                    {/* Desktop Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Hero Card: Financial Overview */}
                        <Card className="lg:col-span-2 p-6 sm:p-8 bg-gradient-to-br from-stone-900 to-stone-800 text-white rounded-[2rem] shadow-2xl shadow-stone-900/20 relative overflow-hidden border-0 dark:from-zinc-900 dark:to-black">
                            {/* Background Decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

                            <div className="relative z-10">
                                {/* Header with Average Margin */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                    <div>
                                        <p className="text-stone-400 font-medium text-sm uppercase tracking-wider mb-1">Reingewinn ({timeframe === 'all' ? 'Gesamt' : timeframe === 'month' ? 'Dieser Monat' : 'Letzte 3 Monate'})</p>
                                        <div className="flex items-baseline gap-2">
                                            <h2 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight">
                                                {isLoadingStats ? (
                                                    <span className="animate-pulse">...</span>
                                                ) : (
                                                    <AnimatedNumber value={stats.totalProfit} format={formatCurrency} />
                                                )}
                                            </h2>
                                        </div>
                                    </div>

                                    <div className="inline-flex items-center self-start sm:self-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:bg-white/15 transition-colors">
                                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                                        <span className="text-sm font-bold text-emerald-50">
                                            Ø {isLoadingStats ? '...' : stats.averageMargin.toFixed(1)}% Marge
                                        </span>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 pt-6 border-t border-white/10">
                                    <div>
                                        <p className="text-stone-400 text-xs uppercase tracking-widest mb-2">Umsatz</p>
                                        <p className="text-xl sm:text-2xl font-bold text-white/90">
                                            {isLoadingStats ? '...' : <AnimatedNumber value={stats.totalRevenue} format={formatCurrency} />}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-stone-400 text-xs uppercase tracking-widest mb-2">Verkäufe</p>
                                        <p className="text-xl sm:text-2xl font-bold text-white/90">
                                            {isLoadingStats ? '...' : stats.totalSales} <span className="text-xs sm:text-sm font-normal text-stone-500">Stk.</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-stone-400 text-xs uppercase tracking-widest mb-2">Marken</p>
                                        <p className="text-xl sm:text-2xl font-bold text-white/90">
                                            {isLoadingStats ? '...' : stats.totalBrands}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-stone-400 text-xs uppercase tracking-widest mb-2">Kanäle</p>
                                        <p className="text-xl sm:text-2xl font-bold text-white/90">
                                            {isLoadingStats ? '...' : stats.totalChannels}
                                        </p>
                                    </div>
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

                    {/* Analysis Section */}
                    {displayStats.topBrands.length > 0 && (
                        <div className="mb-6 sm:mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-5 h-5 text-stone-400" />
                                <h3 className="font-bold text-stone-900 dark:text-zinc-50 text-lg sm:text-xl">Analyse</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {/* Best Margin Brand */}
                                {displayStats.bestMarginBrand && (
                                    <button
                                        onClick={() => setActiveBrand(displayStats.bestMarginBrand.brand)}
                                        className="text-left group w-full"
                                    >
                                        <Card className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-zinc-900 border border-green-100 dark:border-green-900/50 hover:scale-[1.02] active:scale-95 transition-transform duration-300 shadow-sm dark:shadow-green-900/10">
                                            <div className="flex justify-between items-start mb-3 sm:mb-4">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] uppercase font-bold text-green-600/70 dark:text-green-400/70 mb-1 tracking-widest">Beste Marge</p>
                                                    <h4 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-zinc-50 truncate">{displayStats.bestMarginBrand.brand}</h4>
                                                </div>
                                                <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-xl text-green-600 dark:text-green-400 flex-shrink-0 ml-2">
                                                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </div>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                                                    {((displayStats.bestMarginBrand.profit / displayStats.bestMarginBrand.revenue) * 100).toFixed(1)}%
                                                </span>
                                                <span className="text-xs text-stone-400 dark:text-zinc-500 font-medium tracking-tight">Marge</span>
                                            </div>
                                        </Card>
                                    </button>
                                )}

                                {/* Highest Profit Brand */}
                                {displayStats.highestProfitBrand && (
                                    <button
                                        onClick={() => setActiveBrand(displayStats.highestProfitBrand.brand)}
                                        className="text-left group w-full"
                                    >
                                        <Card className="p-4 sm:p-6 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950 dark:to-zinc-900 border border-yellow-100 dark:border-yellow-900/50 hover:scale-[1.02] active:scale-95 transition-transform duration-300 shadow-sm dark:shadow-yellow-900/10">
                                            <div className="flex justify-between items-start mb-3 sm:mb-4">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] uppercase font-bold text-yellow-600/70 dark:text-yellow-400/70 mb-1 tracking-widest">Meister Gewinn</p>
                                                    <h4 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-zinc-50 truncate">{displayStats.highestProfitBrand.brand}</h4>
                                                </div>
                                                <div className="bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded-xl text-yellow-600 dark:text-yellow-400 flex-shrink-0 ml-2">
                                                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </div>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-zinc-50 truncate">
                                                    {formatCurrency(displayStats.highestProfitBrand.profit)}
                                                </span>
                                                <span className="text-xs text-stone-400 dark:text-zinc-500 font-medium tracking-tight whitespace-nowrap">Gewinn</span>
                                            </div>
                                        </Card>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

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
                                {displayStats.channels.map((c: any, i: number) => (
                                    <button
                                        key={c.channel}
                                        onClick={() => setActiveChannel(c.channel)}
                                        className="w-full text-left group relative"
                                    >
                                        <div className="flex justify-between text-sm mb-1.5 z-10 relative">
                                            <span className="font-bold capitalize text-stone-700 dark:text-zinc-300 group-hover:text-stone-900 dark:group-hover:text-zinc-100 transition-colors">{c.channel}</span>
                                            <span className="text-stone-400 dark:text-zinc-500 font-medium">{c.count} Verkäufe</span>
                                        </div>
                                        <div className="h-2 bg-stone-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000 ease-out bg-stone-800 dark:bg-zinc-400"
                                                style={{ width: `${(c.count / displayStats.soldCount) * 100}%`, transitionDelay: `${i * 100}ms` }}
                                            />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Top Brands Section */}
                    {displayStats.topBrands && displayStats.topBrands.length > 0 && (
                        <div className="mt-8">
                            <h3 className="font-bold text-stone-900 dark:text-zinc-50 text-lg mb-4">Top Marken</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                {displayStats.topBrands.map((b: any) => (
                                    <button
                                        key={b.brand}
                                        onClick={() => setActiveBrand(b.brand)}
                                        className="text-left transition-transform active:scale-95"
                                    >
                                        <Card className="p-4 bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 shadow-sm hover:border-stone-300 dark:hover:border-zinc-600 transition-colors h-full">
                                            <p className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest mb-1 truncate">{b.brand}</p>
                                            <p className="text-xl font-bold text-stone-900 dark:text-zinc-50 mb-1">{b.count}</p>
                                            <p className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full inline-block">
                                                +{formatCurrency(b.profit)}
                                            </p>
                                        </Card>
                                    </button>
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

            {activeBrand && (
                <BrandModal
                    brand={activeBrand}
                    onClose={() => setActiveBrand(null)}
                />
            )}
        </FadeIn >
    );
};

