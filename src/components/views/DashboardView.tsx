import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, Package, CreditCard, Sparkles, Store, Euro, ArrowRight, LogOut, User, Moon, Sun, Monitor, Settings } from 'lucide-react';
import { SalesChart } from '../ui/SalesChart';
import { ChannelModal } from './dashboard/ChannelModal';
import { ChannelsOverviewModal } from './dashboard/ChannelsOverviewModal';
import { AnalysisModal } from './dashboard/AnalysisModal';
import { Item } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { FadeIn } from '../ui/FadeIn';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { Card } from '../ui/Card';
import { useTheme } from '../providers/ThemeProvider';
import { supabase } from '../../lib/supabase';

import { PullToRefresh } from '../ui/PullToRefresh';

export const DashboardView = ({ items, onViewInventory, onAddItem, userEmail, onLogout, onRefresh, serverStats, currentUser, currentOrgId, onOpenSettings }: {
    items: Item[],
    onViewInventory: () => void,
    onAddItem: () => void,
    userEmail?: string,
    onLogout: () => void,
    onRefresh: () => Promise<void>,
    serverStats?: any,
    currentUser?: any,
    currentOrgId?: string | null,
    onOpenSettings: () => void
}) => {
    const [chartMonths, setChartMonths] = useState<3 | 12>(3);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [activeChannel, setActiveChannel] = useState<string | null>(null);

    const [activeAnalysis, setActiveAnalysis] = useState<'margin' | 'profit' | null>(null);
    const [timeframe, setTimeframe] = useState<'month' | 'last_month' | '3months' | 'year' | 'all'>('month');
    const [chartGrouping, setChartGrouping] = useState<'day' | 'week' | 'month'>('day');
    const { theme, setTheme } = useTheme();

    // Server-side stats state
    const [stats, setStats] = useState({
        totalProfit: 0,
        totalRevenue: 0,
        totalSales: 0,
        totalExpenses: 0,
        averageMargin: 0,
        inventoryValue: 0, // Added
        stockCount: 0, // Added
        totalBrands: 0,
        totalChannels: 0,
        // Detailed structures
        channels: [] as any[],
        topBrands: [] as any[],
        bestMarginBrand: null as any,
        highestProfitBrand: null as any,
        monthlyData: [] as any[]
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
                        filter_timeframe: timeframe,
                        chart_grouping: chartGrouping
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
                        totalExpenses: Number(s.totalExpenses) || 0,
                        averageMargin: Number(s.averageMargin) || 0,

                        inventoryValue: Number(s.inventoryValue) || 0,
                        stockCount: Number(s.stockCount) || 0,

                        totalBrands: s.topBrands ? s.topBrands.length : 0,
                        totalChannels: s.channels ? s.channels.length : 0,

                        channels: s.channels || [],
                        topBrands: s.topBrands || [],
                        bestMarginBrand: s.bestMarginBrand || null,
                        highestProfitBrand: s.highestProfitBrand || null,
                        monthlyData: s.monthlyData || []
                    });
                }
            } catch (err) {
                console.error('Failed to fetch detailed stats:', err);
            } finally {
                setIsLoadingStats(false);
            }
        };

        fetchStats();
    }, [timeframe, chartGrouping, currentOrgId, supabase]);

    // Derived display stats (Now just a passthrough from server stats)
    // We keep this variable name to minimize refactoring impact on the render section
    const displayStats = useMemo(() => {
        return {
            totalProfit: stats.totalProfit,
            totalRevenue: stats.totalRevenue,
            totalSales: stats.totalSales,
            totalExpenses: stats.totalExpenses,
            averageMargin: stats.averageMargin,

            // Inventory (Use server values)
            inventoryValue: stats.inventoryValue,
            stockCount: stats.stockCount,

            // Collections
            channels: stats.channels,
            topBrands: stats.topBrands,
            bestMarginBrand: stats.bestMarginBrand,
            highestProfitBrand: stats.highestProfitBrand,
            monthlyData: stats.monthlyData,

            soldCount: stats.totalSales
        };
    }, [stats]);



    const themeOptions = [
        { value: 'light' as const, label: 'Hell', icon: Sun },
        { value: 'dark' as const, label: 'Dunkel', icon: Moon },
        { value: 'system' as const, label: 'System', icon: Monitor },
    ];

    return (
        <>
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
                                                onClick={() => {
                                                    setIsProfileOpen(false);
                                                    onOpenSettings();
                                                }}
                                                className="w-full flex items-center px-3 py-2 text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors text-sm font-medium mb-1"
                                            >
                                                <Settings className="w-4 h-4 mr-2" />
                                                Einstellungen
                                            </button>

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
                        <div className="mb-6 flex flex-wrap gap-3 items-center">
                            <span className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest">Zeitraum:</span>
                            <div className="relative">
                                <select
                                    value={timeframe}
                                    onChange={(e) => setTimeframe(e.target.value as any)}
                                    className="appearance-none bg-stone-100 dark:bg-zinc-800 border border-transparent hover:border-stone-200 dark:hover:border-zinc-700 text-stone-700 dark:text-zinc-300 text-sm font-bold py-2 pl-4 pr-10 rounded-xl outline-none transition-colors cursor-pointer shadow-sm"
                                >
                                    <option value="month">Dieser Monat</option>
                                    <option value="last_month">Letzter Monat</option>
                                    <option value="3months">Letzte 3 Monate</option>
                                    <option value="year">Dieses Jahr</option>
                                    <option value="all">Alle</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-500">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                    </svg>
                                </div>
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
                                            <p className="text-stone-400 text-xs uppercase tracking-widest mb-2">Ausgaben</p>
                                            <p className="text-xl sm:text-2xl font-bold text-white/90">
                                                {isLoadingStats ? '...' : <AnimatedNumber value={stats.totalExpenses} format={formatCurrency} />}
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
                                            onClick={() => setActiveAnalysis('margin')}
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
                                            onClick={() => setActiveAnalysis('profit')}
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

                        {/* Unified Chart */}
                        <div className="mb-6">
                            <Card className="p-6 bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-stone-800 dark:text-zinc-200">Umsatz & Gewinn</h3>
                                    <div className="relative">
                                        <select
                                            value={chartGrouping}
                                            onChange={(e) => setChartGrouping(e.target.value as any)}
                                            className="appearance-none bg-stone-100 dark:bg-zinc-800 border border-transparent hover:border-stone-200 dark:hover:border-zinc-700 text-stone-600 dark:text-zinc-400 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg outline-none transition-colors cursor-pointer"
                                        >
                                            <option value="day">Tage</option>
                                            <option value="week">Wochen</option>
                                            <option value="month">Monate</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-500">
                                            <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <SalesChart serverData={displayStats.monthlyData} months={100} />
                            </Card>
                        </div>

                        {/* Analysis Section Grid (Charts removed from here as they are now in Hero Card) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Sales Channels */}
                            <Card className="p-6 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-sm dark:shadow-zinc-950/50 overflow-hidden lg:col-span-2">
                                <button
                                    onClick={() => setActiveChannel('overview')}
                                    className="flex items-center justify-between mb-6 w-full group"
                                >
                                    <h3 className="font-bold text-stone-800 dark:text-zinc-200">Top Verkaufskanäle</h3>
                                    <div className="w-8 h-8 rounded-full bg-stone-50 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <ArrowRight className="w-4 h-4 text-stone-400" />
                                    </div>
                                </button>
                                <div className="space-y-4">
                                    {displayStats.channels.map((c: any, i: number) => (
                                        <div
                                            key={c.channel}
                                            className="w-full text-left relative"
                                        >
                                            <div className="flex justify-between text-sm mb-1.5 z-10 relative">
                                                <span className="font-bold capitalize text-stone-700 dark:text-zinc-300 transition-colors">{c.channel}</span>
                                                <span className="text-stone-400 dark:text-zinc-500 font-medium">{c.count} Verkäufe</span>
                                            </div>
                                            <div className="h-2 bg-stone-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-1000 ease-out bg-stone-800 dark:bg-zinc-400"
                                                    style={{ width: `${(c.count / displayStats.soldCount) * 100}%`, transitionDelay: `${i * 100}ms` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>


                    </div>
                </PullToRefresh>

            </FadeIn >

            {
                activeChannel && (
                    activeChannel === 'overview' ? (
                        <ChannelsOverviewModal
                            onClose={() => setActiveChannel(null)}
                            channelStats={displayStats.channels}
                            totalSoldCount={displayStats.soldCount}
                        />
                    ) : (
                        <ChannelModal
                            channel={activeChannel}
                            onClose={() => setActiveChannel(null)}
                            items={items}
                            channelStats={displayStats.channels}
                        />
                    )
                )
            }

            {
                activeAnalysis && (
                    <AnalysisModal
                        type={activeAnalysis}
                        onClose={() => setActiveAnalysis(null)}
                        topBrands={displayStats.topBrands}
                        currentOrgId={currentOrgId}
                        timeframe={timeframe}
                    />
                )
            }
        </>
    );
};
