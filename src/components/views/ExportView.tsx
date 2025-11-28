import React from 'react';
import { Download } from 'lucide-react';
import { Item } from '../../types';
import { calculateProfit } from '../../lib/utils';
import { FadeIn } from '../ui/FadeIn';
import { Button } from '../ui/Button';

export const ExportView = ({ items }: { items: Item[] }) => {
    const downloadCSV = () => {
        const headers = ['ID', 'Marke', 'Kategorie', 'Modell', 'Status', 'EK (EUR)', 'EK Datum', 'Quelle', 'VK (EUR)', 'VK Datum', 'VK Kanal', 'Gebühren', 'Versand', 'Gewinn', 'Notizen'];
        const rows = items.map(item => [
            item.id, item.brand, item.category, item.model || '', item.status,
            item.purchasePriceEur.toFixed(2), item.purchaseDate, item.purchaseSource,
            item.salePriceEur?.toFixed(2) || '', item.saleDate || '', item.saleChannel || '',
            item.platformFeesEur?.toFixed(2) || '', item.shippingCostEur?.toFixed(2) || '',
            calculateProfit(item)?.toFixed(2) || '', item.notes.replace(/(\r\n|\n|\r)/gm, " ")
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `inventory_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <FadeIn className="p-6">
            <header className="mb-10 pt-2">
                <h1 className="text-3xl font-serif font-bold text-stone-900">Export</h1>
            </header>

            <div className="bg-stone-900 rounded-[2rem] p-8 shadow-xl shadow-stone-900/10 text-center relative overflow-hidden">
                <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                        <Download className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif font-bold text-2xl text-white mb-3">CSV Export</h3>
                    <p className="text-sm text-stone-300 mb-8 font-light leading-relaxed">
                        Erstelle einen vollständigen Auszug deiner Datenbank für die Buchhaltung oder den Steuerberater.
                    </p>
                    <Button onClick={downloadCSV} variant="secondary" className="w-full border-none">
                        Datei herunterladen
                    </Button>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            </div>
        </FadeIn>
    );
};
