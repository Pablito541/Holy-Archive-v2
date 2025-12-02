import React, { useState, useMemo } from 'react';
import { TrendingUp, Package, CreditCard, Sparkles, Store, Euro, ArrowRight } from 'lucide-react';
import { SalesChart } from '../ui/SalesChart';
import { Item } from '../../types';
import { calculateProfit, formatCurrency } from '../../lib/utils';
import { FadeIn } from '../ui/FadeIn';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { Card } from '../ui/Card';

export const DashboardView = ({ items, onViewInventory, onAddItem }: { items: Item[], onViewInventory: () => void, onAddItem: () => void }) => {
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
            channels: sortedChannels,
            inStockItems // Return inStockItems
        };
    }, [items]);

    const inStockItems = stats.inStockItems; // Access from stats

    return (
        <FadeIn className="pb-safe">
            <div className="px-6 pt-6 pb-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="font-serif font-bold text-2xl text-stone-900">Dashboard</h1>
                        <p className="text-stone-500 text-sm">Willkommen zurück</p>
                    </div>
                    <div className="w-10 h-10 bg-stone-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                        <div className="w-full h-full bg-gradient-to-br from-stone-400 to-stone-600"></div>
                    </div>
                </div>

                {/* Hero Card: Financial Overview */}
                <Card className="p-6 bg-stone-900 text-white mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1">Gewinn (Monat)</p>
                                <h2 className="text-4xl font-serif font-bold">
                                    <AnimatedNumber value={stats.monthlyProfit} format={(val) => formatCurrency(val)} />
                                </h2>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl">
                                <Sparkles className="w-5 h-5 text-yellow-200" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1">Umsatz</p>
                                <span className="font-medium text-lg text-stone-200">
                                    <AnimatedNumber value={stats.monthlyRevenue} format={(val) => formatCurrency(val)} />
                                </span>
                            </div>
                            <div>
                                <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1">Ausgaben</p>
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

                {/* Inventory Preview */}
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="font-bold text-stone-900 text-lg">Inventar</h3>
                    <button onClick={onViewInventory} className="text-sm font-medium text-stone-500 flex items-center hover:text-stone-900 transition-colors">
                        Alle anzeigen <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                </div>

                <div className="space-y-3 mb-24">
                    {inStockItems.slice(0, 3).map(item => (
                        <Card key={item.id} className="flex items-center p-3 active:scale-95 transition-transform">
                            <div className="w-12 h-12 bg-stone-100 rounded-xl flex-shrink-0 overflow-hidden">
                                {item.imageUrls?.[0] ? (
                                    <img src={item.imageUrls[0]} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                                        <Package className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-stone-900 truncate">{item.brand}</h4>
                                    <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                                        {formatCurrency(item.purchasePriceEur)}
                                    </span>
                                </div>
                                <p className="text-sm text-stone-500 truncate">{item.model}</p>
                            </div>
                        </Card>
                    ))}

                    <button onClick={onAddItem} className="w-full py-4 rounded-2xl border-2 border-dashed border-stone-200 text-stone-400 font-medium flex items-center justify-center hover:border-stone-400 hover:text-stone-600 transition-colors">
                        <span className="mr-2">+</span> Artikel hinzufügen
                    </button>
                </div>

                {/* Sales Chart */}
                <Card className="p-6 mb-6">
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

