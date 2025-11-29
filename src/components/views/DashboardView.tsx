import React, { useState, useMemo } from 'react';
import { TrendingUp, Package, CreditCard, Sparkles, Store, Euro, ArrowRight } from 'lucide-react';
import { SalesChart } from '../ui/SalesChart';
import { Item } from '../../types';
import { calculateProfit, formatCurrency } from '../../lib/utils';
import { FadeIn } from '../ui/FadeIn';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { Card } from '../ui/Card';

export const DashboardView = ({ items }: { items: Item[] }) => {
    const [chartMonths, setChartMonths] = useState<3 | 12>(3);

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
            channels: sortedChannels
        };
    }, [items]);

    return (
        <FadeIn className="pb-32">
            <header className="px-8 pt-12 pb-6">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <h2 className="text-stone-500 text-sm font-medium uppercase tracking-wider mb-1">Dashboard</h2>
                        <h1 className="font-serif font-bold text-3xl text-stone-900">Überblick</h1>
                    </div>
                    <div className="glass px-3 py-1 rounded-full text-xs font-medium text-stone-500">
                        {new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                    </div>
                </div>
            </header>

            <div className="px-6 space-y-6">
                {/* Hero Financial Card */}
                <Card variant="gradient" className="p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

                    <div className="relative z-10">
                        {/* Top: Profit */}
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                            <Sparkles className="w-4 h-4 text-amber-200" />
                            <span className="text-sm font-medium tracking-wide">Gewinn diesen Monat</span>
                        </div>
                        <div className="text-5xl font-serif font-bold mb-6 tracking-tight">
                            <AnimatedNumber value={stats.monthlyProfit} format={(val) => formatCurrency(val)} />
                        </div>

                        {/* Middle: Revenue & Expenses */}
                        <div className="flex gap-6 mb-6 border-t border-white/10 pt-4">
                            <div>
                                <span className="block text-xs text-stone-300 mb-1">Umsatz</span>
                                <span className="font-medium text-lg">
                                    <AnimatedNumber value={stats.monthlyRevenue} format={(val) => formatCurrency(val)} />
                                </span>
                            </div>
                            <div>
                                <span className="block text-xs text-stone-300 mb-1">Ausgaben</span>
                                <span className="font-medium text-lg text-stone-300">
                                    <AnimatedNumber value={stats.monthlyExpenses} format={(val) => formatCurrency(val)} />
                                </span>
                            </div>
                        </div>

                        {/* Bottom: KPIs */}
                        <div className="flex gap-3">
                            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex-1">
                                <span className="block text-xs opacity-60 mb-0.5">Verkäufe</span>
                                <span className="font-bold">{stats.monthlySoldCount}</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex-1">
                                <span className="block text-xs opacity-60 mb-0.5">Marge %</span>
                                <span className="font-bold">
                                    <AnimatedNumber value={stats.marginPercentage} format={(val) => `${val.toFixed(1)}%`} />
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Compact Inventory Section */}
                <Card className="p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                                <Package className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-0.5">Lagerbestand</p>
                                <p className="text-xl font-serif font-bold text-stone-900">
                                    <AnimatedNumber value={stats.stockCount} /> <span className="text-sm font-sans font-normal text-stone-500">Artikel</span>
                                </p>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-stone-100"></div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-0.5">Kapital</p>
                            <p className="text-xl font-serif font-bold text-stone-900">
                                <AnimatedNumber value={stats.inventoryValue} format={(val) => formatCurrency(val)} />
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Sales Chart */}
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-stone-800">Umsatzentwicklung</h3>
                        <div className="flex bg-stone-100 p-1 rounded-lg">
                            <button
                                onClick={() => setChartMonths(3)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${chartMonths === 3 ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'}`}
                            >
                                3M
                            </button>
                            <button
                                onClick={() => setChartMonths(12)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${chartMonths === 12 ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'}`}
                            >
                                1J
                            </button>
                        </div>
                    </div>
                    <SalesChart items={items} months={chartMonths} />
                </Card>

                {/* Sales Channels */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-stone-800">Top Verkaufskanäle</h3>
                        <ArrowRight className="w-4 h-4 text-stone-400" />
                    </div>
                    <div className="space-y-4">
                        {stats.channels.map(([channel, count]: any, i: number) => (
                            <div key={channel} className="relative">
                                <div className="flex justify-between text-sm mb-1.5 z-10 relative">
                                    <span className="font-medium capitalize text-stone-700">{channel}</span>
                                    <span className="text-stone-400">{count} Verkäufe</span>
                                </div>
                                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 ease-out bg-stone-800"
                                        style={{ width: `${(count / stats.soldCount) * 100}%`, transitionDelay: `${i * 100}ms` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </FadeIn>
    );
};
