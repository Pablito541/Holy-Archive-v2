import React, { useMemo, useRef, useEffect } from 'react';
import { Item } from '../../types';
import { calculateProfit } from '../../lib/utils';

export const SalesChart = ({ items, months = 12, type = 'profit', serverData }: { items: Item[], months: number, type?: 'revenue' | 'profit', serverData?: any[] }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

    const chartData = useMemo(() => {
        // If we have server-calculated data, use it
        if (serverData && serverData.length > 0) {
            // Server returns 12 months, we slice it based on requested months
            const slicedData = serverData.slice(-months);
            return slicedData.map(d => ({
                label: d.label,
                value: type === 'profit' ? d.profit : d.revenue
            }));
        }

        // Fallback to local calculation if server data is missing
        const now = new Date();
        const data = [];

        for (let i = months - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthLabel = d.toLocaleString('de-DE', { month: 'short' });
            const year = d.getFullYear();
            const month = d.getMonth();

            const monthlyItems = items.filter(item => {
                if (item.status !== 'sold' || !item.saleDate) return false;
                const saleDate = new Date(item.saleDate);
                return saleDate.getMonth() === month && saleDate.getFullYear() === year;
            });

            const value = type === 'profit'
                ? monthlyItems.reduce((sum, item) => sum + (calculateProfit(item) || 0), 0)
                : monthlyItems.reduce((sum, item) => sum + (item.salePriceEur || 0), 0);

            data.push({ label: monthLabel, value });
        }
        return data;
    }, [items, months, type, serverData]);

    const maxVal = Math.max(...chartData.map(d => d.value), 100);

    const barColor = type === 'profit' ? 'bg-emerald-500/80 dark:bg-emerald-400/80' : 'bg-blue-500/80 dark:bg-blue-400/80';
    const barColorSelected = type === 'profit' ? 'bg-emerald-600 dark:bg-emerald-300' : 'bg-blue-600 dark:bg-blue-300';

    // Auto-scroll to current month (right end) on mount or data change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
    }, [chartData, months]);

    return (
        <div className="w-full relative">
            <div
                ref={scrollRef}
                className="w-full flex items-end gap-3 pt-10 pb-2 overflow-x-auto scroll-smooth no-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {chartData.map((d, i) => {
                    const barHeight = (d.value / maxVal) * 100;
                    return (
                        <div
                            key={i}
                            className={`flex-shrink-0 flex flex-col items-center gap-4 group cursor-pointer relative transition-all duration-300 ${months === 12 ? 'w-14' : 'flex-1 min-w-[64px]'}`}
                            onClick={() => setSelectedIndex(i === selectedIndex ? null : i)}
                        >
                            <div className="w-full relative flex items-end justify-center h-40">
                                {/* Background "Track" - Made thinner and very subtle */}
                                <div className="absolute inset-0 mx-auto w-5 bg-stone-100/50 dark:bg-zinc-800/30 rounded-full"></div>

                                {/* Actual Value Bar */}
                                <div
                                    className={`w-5 transition-all duration-700 ease-out rounded-full relative z-10 ${selectedIndex === i ? barColorSelected : `${barColor} opacity-90 group-hover:opacity-100`}`}
                                    style={{ height: `${Math.max(barHeight, 4)}%` }} // Minimum height so it's always visible if there's data
                                >
                                    {/* Tooltip */}
                                    <div className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-stone-900 dark:bg-zinc-50 text-white dark:text-zinc-900 text-[10px] px-2.5 py-1.5 rounded-2xl shadow-2xl whitespace-nowrap z-30 transition-all ${selectedIndex === i ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-90 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100'}`}>
                                        <div className="font-bold">{d.value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</div>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-stone-900 dark:border-t-zinc-50"></div>
                                    </div>
                                </div>
                            </div>
                            <span className={`text-[10px] items-center text-center font-bold uppercase tracking-tight transition-all duration-300 ${selectedIndex === i ? 'text-stone-900 dark:text-zinc-50 scale-110' : 'text-stone-400 group-hover:text-stone-600 dark:group-hover:text-zinc-300'}`}>
                                {d.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Visual indicators for scrolling in 12M view */}
            {months === 12 && (
                <>
                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white dark:from-zinc-900 to-transparent pointer-events-none z-10 opacity-40"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-zinc-900 to-transparent pointer-events-none z-10 opacity-40"></div>
                </>
            )}
        </div>
    );
};

