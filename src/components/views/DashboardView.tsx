import React, { useState, useMemo } from 'react';
import { TrendingUp, Package, CreditCard, Sparkles, Store, Euro, ArrowRight, LogOut, User, Moon, Sun, Monitor } from 'lucide-react';
import { SalesChart } from '../ui/SalesChart';
import { Item } from '../../types';
import { calculateProfit, formatCurrency } from '../../lib/utils';
import { FadeIn } from '../ui/FadeIn';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { Card } from '../ui/Card';
import { useTheme } from '../providers/ThemeProvider';

export const DashboardView = ({ items, onViewInventory, onAddItem, userEmail, onLogout }: {
    items: Item[],
    onViewInventory: () => void,
    onAddItem: () => void,
    userEmail?: string,
    onLogout: () => void
}) => {
    const [chartMonths, setChartMonths] = useState<3 | 12>(3);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { theme, setTheme } = useTheme();

    const stats = useMemo(() => {
        const soldItems = items.filter(i => i.status === 'sold');
        const inStockItems = items.filter(i => i.status === 'in_stock' || i.status === 'reserved');

        // Monthly Calculations
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthlySoldItems = soldItems.filter(item => {
            if (!item.saleDate) return false;
            const d = new Date(item.saleDate);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const monthlyProfit = monthlySoldItems.reduce((sum, item) => sum + calculateProfit(item), 0);
        const monthlyRevenue = monthlySoldItems.reduce((sum, item) => sum + (item.salePriceEur || 0), 0);
        const monthlyExpenses = monthlySoldItems.reduce((sum, item) => sum + item.purchasePriceEur + (item.shippingCostEur || 0) + (item.platformFeesEur || 0), 0);

        const marginPercentage = monthlyRevenue > 0 ? (monthlyProfit / monthlyRevenue) * 100 : 0;

        // Inventory
        const inventoryValue = inStockItems.reduce((sum, item) => sum + item.purchasePriceEur, 0);

        // Sales Channels
        const channels = soldItems.reduce((acc: any, item) => {
            const channel = item.saleChannel || 'Other';
            acc[channel] = (acc[channel] || 0) + 1;
            return acc;
        }, {});

        const sortedChannels = Object.entries(channels)
            .sort(([, a]: any, [, b]: any) => b - a)
            .slice(0, 3);

        return {
            monthlyProfit,
            monthlyRevenue,
            monthlyExpenses,
            marginPercentage,
            soldCount: soldItems.length,
            monthlySoldCount: monthlySoldItems.length,
            stockCount: inStockItems.length,
            inventoryValue,
            channels: sortedChannels,
            inStockItems // Return inStockItems
        };
    }, [items]);

    const themeOptions = [
        { value: 'light' as const, label: 'Hell', icon: Sun },
        { value: 'dark' as const, label: 'Dunkel', icon: Moon },
        { value: 'system' as const, label: 'System', icon: Monitor },
    ];

    return (
        <FadeIn className="pb-safe bg-transparent">
            <div className="px-6 pt-6 pb-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6 relative z-50">
                    <div>
                        <h1 className="font-serif font-bold text-3xl text-stone-900 dark:text-stone-100">Dashboard</h1>
                        <p className="text-stone-500 dark:text-stone-400 text-sm">Willkommen zurück</p>
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="w-10 h-10 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden border-2 border-white dark:border-stone-600 shadow-sm active:scale-95 transition-transform"
                        >
                            <div className="w-full h-full bg-gradient-to-br from-stone-400 to-stone-600 dark:from-stone-500 dark:to-stone-800"></div>
                        </button>

                        {isProfileOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                                <div className="absolute right-0 top-12 w-64 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-100 dark:border-stone-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex items-center mb-4 pb-4 border-b border-stone-100 dark:border-stone-800">
                                        <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center text-stone-500 dark:text-stone-400 mr-3">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Angemeldet als</p>
                                            <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">{userEmail || 'Benutzer'}</p>
                                        </div>
                                    </div>

                                    <div className="mb-4 pb-4 border-b border-stone-100 dark:border-stone-800">
                                        <p className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-3">Design</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {themeOptions.map(({ value, label, icon: Icon }) => (
                                                <button
                                                    key={value}
                                                    onClick={() => setTheme(value)}
                                                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${theme === value
                                                        ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
                                                        : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/50'
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
                    <Card className="lg:col-span-2 p-8 bg-white dark:bg-stone-900/50 dark:backdrop-blur-sm shadow-lg shadow-stone-200/50 dark:shadow-black/20 relative overflow-hidden border border-stone-100 dark:border-stone-800/50">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <p className="text-stone-400 dark:text-stone-500 text-xs font-bold uppercase tracking-widest mb-2">Gewinn (Monat)</p>
                                <h2 className="text-4xl font-serif font-bold text-stone-900 dark:text-stone-100">
                                    <AnimatedNumber value={stats.monthlyProfit} format={(val) => formatCurrency(val)} />
                                </h2>
                            </div>
                            <div className="bg-yellow-50 dark:bg-yellow-950/30 p-2 rounded-xl">
                                <Sparkles className="w-5 h-5 text-yellow-500" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-stone-400 dark:text-stone-500 text-xs font-bold uppercase tracking-widest mb-1">Umsatz</p>
                                <span className="font-medium text-xl text-stone-900 dark:text-stone-100">
                                    <AnimatedNumber value={stats.monthlyRevenue} format={(val) => formatCurrency(val)} />
                                </span>
                            </div>
                            <div>
                                <p className="text-stone-400 dark:text-stone-500 text-xs font-bold uppercase tracking-widest mb-1">Ausgaben</p>
                                <span className="font-medium text-xl text-stone-900 dark:text-stone-100">
                                    <AnimatedNumber value={stats.monthlyExpenses} format={(val) => formatCurrency(val)} />
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Stock Overview */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-lg">Inventar</h3>
                            <button onClick={onViewInventory} className="text-sm font-medium text-stone-500 dark:text-stone-400 flex items-center hover:text-stone-900 dark:hover:text-stone-200 transition-colors">
                                Alle <ArrowRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Card className="p-4 flex flex-col justify-between bg-white dark:bg-stone-900/50 dark:backdrop-blur-sm border border-stone-100 dark:border-stone-800/50 shadow-sm dark:shadow-black/10">
                                <div className="w-8 h-8 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mb-3 text-stone-600 dark:text-stone-400">
                                    <Package className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="block text-2xl font-bold text-stone-900 dark:text-stone-100">{stats.stockCount}</span>
                                    <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Artikel im Lager</span>
                                </div>
                            </Card>
                            <Card className="p-4 flex flex-col justify-between bg-white dark:bg-stone-900/50 dark:backdrop-blur-sm border border-stone-100 dark:border-stone-800/50 shadow-sm dark:shadow-black/10">
                                <div className="w-8 h-8 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mb-3 text-stone-600 dark:text-stone-400">
                                    <Euro className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="block text-2xl font-bold text-stone-900 dark:text-stone-100">
                                        <AnimatedNumber value={stats.inventoryValue} format={(val) => formatCurrency(val)} />
                                    </span>
                                    <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Warenwert</span>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Charts in responsive grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sales Chart */}
                    <Card className="p-6 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-stone-800 dark:text-stone-200">Umsatzentwicklung</h3>
                            <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-lg">
                                <button
                                    onClick={() => setChartMonths(3)}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${chartMonths === 3 ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`}
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
                    <Card className="p-6 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-stone-800 dark:text-stone-200">Top Verkaufskanäle</h3>
                            <ArrowRight className="w-4 h-4 text-stone-400" />
                        </div>
                        <div className="space-y-4">
                            {stats.channels.map(([channel, count]: any, i: number) => (
                                <div key={channel} className="relative">
                                    <div className="flex justify-between text-sm mb-1.5 z-10 relative">
                                        <span className="font-medium capitalize text-stone-700 dark:text-stone-300">{channel}</span>
                                        <span className="text-stone-400">{count} Verkäufe</span>
                                    </div>
                                    <div className="h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000 ease-out bg-stone-800 dark:bg-stone-300"
                                            style={{ width: `${(count / stats.soldCount) * 100}%`, transitionDelay: `${i * 100}ms` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </FadeIn>
    );
};

