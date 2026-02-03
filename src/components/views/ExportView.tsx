import React, { useState, useMemo } from 'react';
import { Download, Filter, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { Item } from '../../types';
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

    // Helper function to check if a date is in the selected period (used for counting and export)
    const checkInPeriod = (dateStr: string | undefined): boolean => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const quarter = Math.ceil(month / 3);

        const yearMatch = selectedYear === 'all' || year === selectedYear;
        const monthMatch = selectedMonth === 'all' || month === selectedMonth;
        const quarterMatch = selectedQuarter === 'all' || quarter === selectedQuarter;

        return yearMatch && monthMatch && quarterMatch;
    };

    // Count transactions for display
    const transactionCount = useMemo(() => {
        let count = 0;
        items.forEach(item => {
            // Count purchase if in period
            if (checkInPeriod(item.purchaseDate)) {
                count++;
            }
            // Count sale if sold and in period
            if (item.status === 'sold' && checkInPeriod(item.saleDate)) {
                count++;
                // Count fees as separate transaction if they exist
                const totalFees = (item.platformFeesEur || 0) + (item.shippingCostEur || 0);
                if (totalFees > 0) {
                    count++;
                }
            }
        });
        return count;
    }, [items, selectedYear, selectedMonth, selectedQuarter]);

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
        // Create Transaction Ledger with unified Betrag column (+/- signs)
        const transactions: {
            Datum: string;
            Typ: string;
            Beschreibung: string;
            Betrag: number | '';
            ID: string;
            Notizen: string;
        }[] = [];

        // Iterate through all items to create transaction entries
        items.forEach(item => {
            // Expense Entry: Purchase in selected period (negative amount)
            if (checkInPeriod(item.purchaseDate)) {
                transactions.push({
                    'Datum': item.purchaseDate || '',
                    'Typ': 'AUSGABE',
                    'Beschreibung': `Einkauf: ${item.brand} ${item.model || ''}`.trim(),
                    'Betrag': -1 * (item.purchasePriceEur || 0),
                    'ID': item.id,
                    'Notizen': item.notes || ''
                });
            }

            // Income Entry: Sale in selected period (positive amount)
            if (item.status === 'sold' && checkInPeriod(item.saleDate)) {
                transactions.push({
                    'Datum': item.saleDate || '',
                    'Typ': 'EINNAHME',
                    'Beschreibung': `Verkauf: ${item.brand} ${item.model || ''}`.trim(),
                    'Betrag': item.salePriceEur || 0,
                    'ID': item.id,
                    'Notizen': item.saleChannel || ''
                });

                // Also add fees as expenses if they exist (negative amount)
                const totalFees = (item.platformFeesEur || 0) + (item.shippingCostEur || 0);
                if (totalFees > 0) {
                    transactions.push({
                        'Datum': item.saleDate || '',
                        'Typ': 'AUSGABE',
                        'Beschreibung': `Gebühren/Versand: ${item.brand} ${item.model || ''}`.trim(),
                        'Betrag': -1 * totalFees,
                        'ID': item.id,
                        'Notizen': `Plattform: ${item.platformFeesEur || 0}€, Versand: ${item.shippingCostEur || 0}€`
                    });
                }
            }
        });

        // Sort transactions by date
        transactions.sort((a, b) => {
            const dateA = a.Datum ? new Date(a.Datum).getTime() : 0;
            const dateB = b.Datum ? new Date(b.Datum).getTime() : 0;
            return dateA - dateB;
        });

        // Calculate summary (positive = income, negative = expense)
        const totalIncome = transactions
            .filter(t => typeof t.Betrag === 'number' && t.Betrag > 0)
            .reduce((sum, t) => sum + (t.Betrag as number), 0);
        const totalExpenses = transactions
            .filter(t => typeof t.Betrag === 'number' && t.Betrag < 0)
            .reduce((sum, t) => sum + Math.abs(t.Betrag as number), 0);
        const profit = totalIncome - totalExpenses;

        // Add empty rows before summary
        transactions.push({ Datum: '', Typ: '', Beschreibung: '', Betrag: '', ID: '', Notizen: '' });
        transactions.push({ Datum: '', Typ: '', Beschreibung: '', Betrag: '', ID: '', Notizen: '' });

        // Add summary rows
        transactions.push({
            'Datum': '',
            'Typ': 'ZUSAMMENFASSUNG',
            'Beschreibung': 'Gesamteinnahmen',
            'Betrag': totalIncome,
            'ID': '',
            'Notizen': ''
        });
        transactions.push({
            'Datum': '',
            'Typ': '',
            'Beschreibung': 'Gesamtausgaben',
            'Betrag': -1 * totalExpenses,
            'ID': '',
            'Notizen': ''
        });
        transactions.push({
            'Datum': '',
            'Typ': '',
            'Beschreibung': 'GEWINN/VERLUST',
            'Betrag': profit,
            'ID': '',
            'Notizen': ''
        });

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(transactions);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Transaktionen");

        // Auto-size columns
        const colWidths = [
            { wch: 12 },  // Datum
            { wch: 12 },  // Typ
            { wch: 40 },  // Beschreibung
            { wch: 14 },  // Betrag
            { wch: 36 },  // ID
            { wch: 30 },  // Notizen
        ];
        worksheet["!cols"] = colWidths;

        const periodLabel = selectedMonth !== 'all' ? `M${selectedMonth}` : selectedQuarter !== 'all' ? `Q${selectedQuarter}` : 'Gesamt';
        const fileName = `Transaktionen_${selectedYear}_${periodLabel}.xlsx`;
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
                            {transactionCount} Buchungen (Einnahmen & Ausgaben) für den gewählten Zeitraum gefunden.
                        </p>
                        <Button
                            onClick={downloadExcel}
                            disabled={transactionCount === 0}
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
