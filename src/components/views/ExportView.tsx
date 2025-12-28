import React, { useState, useMemo } from 'react';
import { Download, Calendar, Filter, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { Item } from '../../types';
import { calculateProfit } from '../../lib/utils';
import { FadeIn } from '../ui/FadeIn';
import { Button } from '../ui/Button';
import * as XLSX from 'xlsx';

export const ExportView = ({ items }: { items: Item[] }) => {
    const [selectedYear, setSelectedYear] = useState<number | 'all'>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
    const [selectedQuarter, setSelectedQuarter] = useState<number | 'all'>('all');

    const years = useMemo(() => {
        const itemYears = items.map(i => {
            const date = i.saleDate || i.purchaseDate;
            return date ? new Date(date).getFullYear() : null;
        }).filter(Boolean) as number[];
        const uniqueYears = Array.from(new Set([...itemYears, new Date().getFullYear()])).sort((a, b) => b - a);
        return uniqueYears;
    }, [items]);

    const months = [
        { value: 1, label: 'Januar' }, { value: 2, label: 'Februar' }, { value: 3, label: 'März' },
        { value: 4, label: 'April' }, { value: 5, label: 'Mai' }, { value: 6, label: 'Juni' },
        { value: 7, label: 'Juli' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
        { value: 10, label: 'Oktober' }, { value: 11, label: 'November' }, { value: 12, label: 'Dezember' }
    ];

    const quarters = [
        { value: 1, label: 'Q1 (Jan-Mär)' },
        { value: 2, label: 'Q2 (Apr-Jun)' },
        { value: 3, label: 'Q3 (Jul-Sep)' },
        { value: 4, label: 'Q4 (Okt-Dez)' }
    ];

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const dateStr = item.saleDate || item.purchaseDate;
            if (!dateStr) return selectedYear === 'all' && selectedMonth === 'all' && selectedQuarter === 'all';

            const date = new Date(dateStr);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const quarter = Math.ceil(month / 3);

            const yearMatch = selectedYear === 'all' || year === selectedYear;
            const monthMatch = selectedMonth === 'all' || month === selectedMonth;
            const quarterMatch = selectedQuarter === 'all' || quarter === selectedQuarter;

            return yearMatch && monthMatch && quarterMatch;
        });
    }, [items, selectedYear, selectedMonth, selectedQuarter]);

    const downloadExcel = () => {
        const headers = [
            'ID', 'Marke', 'Kategorie', 'Modell', 'Status',
            'EK (EUR)', 'EK Datum', 'Quelle',
            'VK (EUR)', 'VK Datum', 'VK Kanal',
            'Gebüren', 'Versand', 'Gewinn', 'Notizen'
        ];

        const data = filteredItems.map(item => ({
            'ID': item.id,
            'Marke': item.brand,
            'Kategorie': item.category,
            'Modell': item.model || '',
            'Status': item.status === 'sold' ? 'Verkauft' : 'Im Lager',
            'EK (EUR)': item.purchasePriceEur,
            'EK Datum': item.purchaseDate,
            'Quelle': item.purchaseSource,
            'VK (EUR)': item.salePriceEur || '',
            'VK Datum': item.saleDate || '',
            'VK Kanal': item.saleChannel || '',
            'Gebüren': item.platformFeesEur || 0,
            'Versand': item.shippingCostEur || 0,
            'Gewinn': calculateProfit(item) || 0,
            'Notizen': item.notes
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

        // Auto-size columns (basic implementation)
        const max_width = data.reduce((w, r) => Math.max(w, ...Object.values(r).map(v => v ? v.toString().length : 0)), 10);
        worksheet["!cols"] = Array(headers.length).fill({ wch: Math.min(max_width, 30) });

        const fileName = `Export_${selectedYear}_${selectedMonth !== 'all' ? `M${selectedMonth}` : selectedQuarter !== 'all' ? `Q${selectedQuarter}` : 'Full'}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    return (
        <FadeIn className="p-6 pb-24">
            <header className="mb-8 pt-2">
                <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-zinc-50">Transaktions-Export</h1>
                <p className="text-stone-500 dark:text-zinc-400 mt-1">Exportiere deine Daten für die Buchhaltung</p>
            </header>

            <div className="space-y-6">
                {/* Filter Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 shadow-sm border border-stone-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2 mb-6">
                        <Filter className="w-4 h-4 text-stone-400" />
                        <h3 className="font-bold text-stone-800 dark:text-zinc-200">Export Zeitraum</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Year Select */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest px-1">Jahr</label>
                            <div className="relative">
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                    className="w-full bg-stone-50 dark:bg-zinc-800/50 border border-stone-100 dark:border-zinc-800 rounded-2xl p-4 pr-10 appearance-none font-medium text-stone-900 dark:text-zinc-50 focus:ring-2 focus:ring-stone-200 outline-none transition-all"
                                >
                                    <option value="all">Alle Jahre</option>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                                <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Quarter Select */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest px-1">Quartal</label>
                            <div className="relative">
                                <select
                                    value={selectedQuarter}
                                    onChange={(e) => {
                                        setSelectedQuarter(e.target.value === 'all' ? 'all' : Number(e.target.value));
                                        setSelectedMonth('all');
                                    }}
                                    className="w-full bg-stone-50 dark:bg-zinc-800/50 border border-stone-100 dark:border-zinc-800 rounded-2xl p-4 pr-10 appearance-none font-medium text-stone-900 dark:text-zinc-50 focus:ring-2 focus:ring-stone-200 outline-none transition-all"
                                >
                                    <option value="all">Gesamtes Jahr</option>
                                    {quarters.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
                                </select>
                                <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Month Select */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest px-1">Monat</label>
                            <div className="relative">
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => {
                                        setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value));
                                        setSelectedQuarter('all');
                                    }}
                                    className="w-full bg-stone-50 dark:bg-zinc-800/50 border border-stone-100 dark:border-zinc-800 rounded-2xl p-4 pr-10 appearance-none font-medium text-stone-900 dark:text-zinc-50 focus:ring-2 focus:ring-stone-200 outline-none transition-all"
                                >
                                    <option value="all">Alle Monate</option>
                                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </select>
                                <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Download Card */}
                <div className="bg-stone-900 dark:bg-zinc-900 rounded-[2rem] p-8 shadow-xl shadow-stone-900/10 dark:shadow-zinc-950/50 text-center relative overflow-hidden border border-transparent dark:border-zinc-800">
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                            <FileSpreadsheet className="w-7 h-7" />
                        </div>
                        <h3 className="font-serif font-bold text-2xl text-white mb-2">Excel Datei erstellen</h3>
                        <p className="text-sm text-stone-400 mb-8 font-light max-w-sm mx-auto">
                            {filteredItems.length} Transaktionen für den gewählten Zeitraum gefunden.
                        </p>
                        <Button
                            onClick={downloadExcel}
                            disabled={filteredItems.length === 0}
                            variant="secondary"
                            className="w-full h-14 rounded-2xl border-none font-bold bg-white text-stone-900 hover:bg-stone-100 disabled:opacity-50 disabled:bg-stone-700"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Als .xlsx herunterladen
                        </Button>
                    </div>
                    {/* Background Detail */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                </div>
            </div>
        </FadeIn>
    );
};
