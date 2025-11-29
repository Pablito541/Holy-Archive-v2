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

            const profit = monthlyItems.reduce((sum, item) => sum + calculateProfit(item), 0);
            data.push({ label: monthLabel, value: profit });
        }
        return data;
    }, [items, months]);

    const maxVal = Math.max(...chartData.map(d => d.value), 1);

    return (
        <div className="w-full h-48 flex items-end justify-between gap-2 pt-6">
            {chartData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full relative flex items-end justify-center h-32 bg-stone-100/50 rounded-t-lg overflow-hidden">
                        <div
                            className="w-full bg-stone-800 opacity-80 group-hover:opacity-100 transition-all duration-500 ease-out rounded-t-md relative"
                            style={{ height: `${(d.value / maxVal) * 100}%` }}
                        >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {d.value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                            </div>
                        </div>
                    </div>
                    <span className="text-[10px] text-stone-400 font-medium uppercase">{d.label}</span>
                </div>
            ))}
        </div>
    );
};
