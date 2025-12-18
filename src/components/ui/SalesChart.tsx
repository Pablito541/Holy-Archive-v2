import React, { useMemo } from 'react';
import { Item } from '../../types';
import { calculateProfit } from '../../lib/utils';

export const SalesChart = ({ items, months = 12 }: { items: Item[], months: number }) => {
    const chartData = useMemo(() => {
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

            const profit = monthlyItems.reduce((sum, item) => sum + (calculateProfit(item) || 0), 0);
            data.push({ label: monthLabel, value: profit });
        }
        return data;
    }, [items, months]);

    const maxVal = Math.max(...chartData.map(d => d.value), 100); // Minimum scale to prevent empty look

    const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

    return (
        <div className="w-full h-48 flex items-end justify-between gap-2 pt-6 px-1">
            {chartData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer relative" onClick={() => setSelectedIndex(i === selectedIndex ? null : i)}>
                    <div className="w-full relative flex items-end justify-center h-32 bg-stone-100 dark:bg-zinc-800 rounded-t-lg">
                        <div
                            className={`w-full transition-all duration-500 ease-out rounded-t-md relative ${selectedIndex === i ? 'bg-stone-900 dark:bg-zinc-200' : 'bg-stone-800 dark:bg-zinc-400 opacity-80 group-hover:opacity-100'}`}
                            style={{ height: `${(d.value / maxVal) * 100}%` }}
                        >
                        </div>
                        {/* Tooltip - Moved outside the bar div to avoid clipping if we had overflow-hidden, but we removed overflow-hidden from parent and used rounded-t-lg. 
                             Actually, let's keep the bar implementation simple. The issue was overflow-hidden on the PARENT of the bar. 
                             I removed overflow-hidden from line 36. Now the absolute tooltip inside might show. 
                             But wait, the tooltip is positioned relative to the BAR INTSELF in the previous code.
                             Let's re-add the tooltip logic but ensure it's visible. 
                         */}
                        <div className={`absolute bottom-[${(d.value / maxVal) * 100}%] mb-2 left-1/2 -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black text-[10px] px-2 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-20 transition-all ${selectedIndex === i ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0'}`}
                            style={{ bottom: `${(d.value / maxVal) * 100}%` }}>
                            {d.value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black dark:border-t-white"></div>
                        </div>
                    </div>
                    <span className={`text-[10px] font-medium uppercase transition-colors ${selectedIndex === i ? 'text-stone-900 dark:text-zinc-200 font-bold' : 'text-stone-400 group-hover:text-stone-600 dark:group-hover:text-zinc-300'}`}>{d.label}</span>
                </div>
            ))}
        </div>
    );
};
