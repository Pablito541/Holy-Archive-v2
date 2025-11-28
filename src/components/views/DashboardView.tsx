import React, { useMemo } from 'react';
import { TrendingUp, Package, CreditCard, Sparkles, Store } from 'lucide-react';
import { Item } from '../../types';
import { calculateProfit, formatCurrency } from '../../lib/utils';
import { FadeIn } from '../ui/FadeIn';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { Card } from '../ui/Card';

export const DashboardView = ({ items }: { items: Item[] }) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const stats = useMemo(() => {
        const soldItems = items.filter(i => i.status === 'sold');
        const inStockItems = items.filter(i => i.status === 'in_stock');

        // Monthly calculations
        const monthlySalesItems = soldItems.filter(i => {
            if (!i.saleDate) return false;
            const d = new Date(i.saleDate);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const monthlyProfit = monthlySalesItems.reduce((sum, item) => sum + (calculateProfit(item) || 0), 0);
        const monthlyRevenue = monthlySalesItems.reduce((sum, item) => sum + (item.salePriceEur || 0), 0);
        const totalInventoryValue = inStockItems.reduce((sum, item) => sum + item.purchasePriceEur, 0);

        const avgMargin = monthlyRevenue > 0 ? (monthlyProfit / monthlyRevenue) * 100 : 0;

        const brandCounts = soldItems.reduce((acc, item) => {
            acc[item.brand] = (acc[item.brand] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const topBrand = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0];

        const channelCounts = soldItems.reduce((acc, item) => {
            const ch = item.saleChannel || 'Unknown';
            acc[ch] = (acc[ch] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const sortedChannels = Object.entries(channelCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => ({
                name: name === 'whatsapp' ? 'WhatsApp' : name.charAt(0).toUpperCase() + name.slice(1),
                count,
                percentage: (count / soldItems.length) * 100
            }));

        return {
            stockCount: inStockItems.length,
            monthlyProfit,
            monthlySalesCount: monthlySalesItems.length,
            inventoryValue: totalInventoryValue,
            avgMargin,
            topBrand: topBrand ? topBrand[0] : '-',
            channels: sortedChannels
        };
    }, [items, currentMonth, currentYear]);

    return (
        <FadeIn className="p-6 pb-32">
            <header className="flex justify-between items-end mb-8 pt-2">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-stone-900 mb-1">Dashboard</h1>
                    <p className="text-sm text-stone-500">Übersicht deiner Performance</p>
                </div>
                <div className="text-xs font-medium px-3 py-1.5 glass rounded-full text-stone-600 shadow-sm backdrop-blur-lg">
                    {new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                </div>
            </header>

            <div className="grid grid-cols-2 gap-4">
                {/* Hero Profit Card */}
                <div className="col-span-2 bg-gradient-brand text-white p-6 rounded-3xl shadow-luxury relative overflow-hidden animate-scale-in">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-10 -mb-10 blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <p className="text-stone-300 text-xs font-bold uppercase tracking-widest">Gewinn (lfd. Monat)</p>
                        </div>
                        <div className="text-5xl font-serif font-medium mb-1">
                            <AnimatedNumber
                                value={stats.monthlyProfit}
                                format={(val) => formatCurrency(val)}
                            />
                        </div>
                        <div className="mt-5 flex items-center gap-3 text-sm">
                            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
                                <TrendingUp className="w-4 h-4" />
                                <AnimatedNumber value={stats.monthlySalesCount} /> Verkäufe
                            </span>
                            {stats.avgMargin > 0 && (
                                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
                                    <AnimatedNumber value={stats.avgMargin} format={(val) => `${val.toFixed(1)}%`} /> Marge
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stock Card */}
                <Card className="p-5 flex flex-col justify-between h-36 hover:scale-[1.02] transition-transform">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-2">
                        <Package className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-stone-900 mb-1">
                            <AnimatedNumber value={stats.stockCount} />
                        </div>
                        <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Artikel im Lager</p>
                    </div>
                </Card>

                {/* Inventory Value Card */}
                <Card className="p-5 flex flex-col justify-between h-36 hover:scale-[1.02] transition-transform">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center text-green-600 mb-2">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-stone-900 mb-1">
                            <AnimatedNumber
                                value={stats.inventoryValue}
                                format={(val) => formatCurrency(val)}
                            />
                        </div>
                        <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Warenwert</p>
                    </div>
                </Card>

                {/* Top Brand Card */}
                <Card className="p-5 flex flex-col justify-between h-32 hover:scale-[1.02] transition-transform">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg flex items-center justify-center">
                            <Store className="w-4 h-4 text-purple-600" />
                        </div>
                        <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Top Brand</p>
                    </div>
                    <div className="text-xl font-bold text-stone-900 truncate">{stats.topBrand}</div>
                </Card>

                {/* Average Margin Card */}
                <Card className="p-5 flex flex-col justify-between h-32 hover:scale-[1.02] transition-transform">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-amber-600" />
                        </div>
                        <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Ø Marge</p>
                    </div>
                    <div className="text-xl font-bold text-stone-900">
                        <AnimatedNumber value={stats.avgMargin} format={(val) => `${val.toFixed(1)}%`} />
                    </div>
                </Card>
            </div>

            {/* Sales Channels */}
            <div className="mt-8">
                <h3 className="font-serif font-bold text-xl mb-4 text-stone-900">Verkaufskanäle</h3>
                <Card className="p-6">
                    {stats.channels.length > 0 ? (
                        <div className="space-y-5">
                            {stats.channels.map((ch) => (
                                <div key={ch.name}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-semibold text-stone-900">{ch.name}</span>
                                        <span className="text-stone-600">
                                            {ch.count} ({ch.percentage.toFixed(0)}%)
                                        </span>
                                    </div>
                                    <div className="h-2.5 w-full bg-stone-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-stone-800 to-stone-600 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${ch.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-stone-400 text-sm text-center py-4">Keine Daten verfügbar</p>
                    )}
                </Card>
            </div>
        </FadeIn>
    );
};
