import React, { useState, useMemo } from 'react';
import { ArrowLeft, ShoppingBag, Package } from 'lucide-react';
import { Item } from '../../types';
import { SALES_CHANNELS } from '../../constants';
import { formatCurrency } from '../../lib/utils';
import { FadeIn } from '../ui/FadeIn';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface BulkSellViewProps {
    items: Item[];
    onConfirm: (data: {
        salePriceEur: number;
        saleDate: string;
        saleChannel: string;
        platformFeesEur: number;
        shippingCostEur: number;
        buyer: string;
    }) => void;
    onCancel: () => void;
}

export const BulkSellView = ({ items, onConfirm, onCancel }: BulkSellViewProps) => {
    const [formData, setFormData] = useState({
        totalPrice: 0,
        saleDate: new Date().toISOString().split('T')[0],
        saleChannel: 'whatnot',
        totalFees: 0,
        totalShipping: 0,
        buyer: ''
    });

    const count = items.length;

    const distribution = useMemo(() => {
        const pricePerItem = Math.floor((formData.totalPrice * 100) / count) / 100;
        const priceRemainder = Math.round((formData.totalPrice - pricePerItem * count) * 100) / 100;

        const feesPerItem = Math.floor((formData.totalFees * 100) / count) / 100;
        const feesRemainder = Math.round((formData.totalFees - feesPerItem * count) * 100) / 100;

        const shippingPerItem = Math.floor((formData.totalShipping * 100) / count) / 100;
        const shippingRemainder = Math.round((formData.totalShipping - shippingPerItem * count) * 100) / 100;

        return items.map((item, i) => ({
            item,
            price: i === 0 ? pricePerItem + priceRemainder : pricePerItem,
            fees: i === 0 ? feesPerItem + feesRemainder : feesPerItem,
            shipping: i === 0 ? shippingPerItem + shippingRemainder : shippingPerItem,
        }));
    }, [items, formData.totalPrice, formData.totalFees, formData.totalShipping, count]);

    const totalPurchasePrice = items.reduce((sum, item) => sum + item.purchasePriceEur, 0);
    const totalProfit = formData.totalPrice - totalPurchasePrice - formData.totalFees - formData.totalShipping;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm({
            salePriceEur: formData.totalPrice,
            saleDate: formData.saleDate,
            saleChannel: formData.saleChannel,
            platformFeesEur: formData.totalFees,
            shippingCostEur: formData.totalShipping,
            buyer: formData.buyer
        });
    };

    return (
        <FadeIn className="bg-[#fafaf9] dark:bg-zinc-950 min-h-screen pb-32">
            <header className="px-6 py-6 flex items-center justify-between sticky top-0 bg-[#fafaf9]/90 dark:bg-zinc-950/90 backdrop-blur-xl z-20">
                <button onClick={onCancel} className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-stone-100 dark:border-zinc-800 text-stone-600 dark:text-zinc-400">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="font-serif font-bold text-xl dark:text-zinc-50">Sammelverkauf</h2>
                <div className="w-8"></div>
            </header>

            <form onSubmit={handleSubmit} className="px-6 space-y-10 max-w-lg mx-auto">
                {/* Selected items preview */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-sm border border-stone-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-zinc-500">
                            Ausgewählte Artikel
                        </span>
                        <span className="text-xs font-bold bg-stone-900 dark:bg-zinc-800 text-white px-2.5 py-1 rounded-full">
                            {count} Stk.
                        </span>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {items.map(item => (
                            <div key={item.id} className="flex items-center gap-3 py-1.5">
                                <div className="w-10 h-10 bg-stone-100 dark:bg-zinc-800 rounded-xl flex-shrink-0 relative overflow-hidden">
                                    {item.imageUrls && item.imageUrls[0] ? (
                                        <img src={item.imageUrls[0]} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-stone-300 dark:text-zinc-600">
                                            <ShoppingBag className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-serif font-bold text-sm text-stone-900 dark:text-zinc-50 truncate">{item.brand}</p>
                                    <p className="text-xs text-stone-400 dark:text-zinc-500 truncate">{item.model || item.category}</p>
                                </div>
                                <span className="text-xs font-medium text-stone-500 dark:text-zinc-400">
                                    EK {formatCurrency(item.purchasePriceEur)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-stone-100 dark:border-zinc-800 flex justify-between items-center">
                        <span className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                            Gesamt-EK
                        </span>
                        <span className="font-serif font-bold text-stone-900 dark:text-zinc-50">
                            {formatCurrency(totalPurchasePrice)}
                        </span>
                    </div>
                </div>

                {/* Sale form */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] shadow-sm border border-stone-100 dark:border-zinc-800 space-y-4">
                    <Input
                        label="Gesamtpreis (€)"
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        value={formData.totalPrice === 0 ? '' : formData.totalPrice}
                        onChange={(e: any) => setFormData(p => ({ ...p, totalPrice: e.target.value === '' ? 0 : parseFloat(e.target.value) }))}
                        required
                        autoFocus
                    />

                    <Input
                        label="Käufer"
                        type="text"
                        value={formData.buyer}
                        onChange={(e: any) => setFormData(p => ({ ...p, buyer: e.target.value }))}
                        placeholder="Name des Käufers"
                    />

                    <Select
                        label="Verkaufskanal"
                        options={SALES_CHANNELS.map(channel => ({ value: channel, label: channel }))}
                        value={formData.saleChannel}
                        onChange={(e: any) => setFormData(p => ({ ...p, saleChannel: e.target.value }))}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Gebühren (€)"
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            value={formData.totalFees === 0 ? '' : formData.totalFees}
                            onChange={(e: any) => setFormData(p => ({ ...p, totalFees: e.target.value === '' ? 0 : parseFloat(e.target.value) }))}
                        />
                        <Input
                            label="Versand (€)"
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            value={formData.totalShipping === 0 ? '' : formData.totalShipping}
                            onChange={(e: any) => setFormData(p => ({ ...p, totalShipping: e.target.value === '' ? 0 : parseFloat(e.target.value) }))}
                        />
                    </div>

                    <Input
                        label="Verkaufsdatum"
                        type="date"
                        value={formData.saleDate}
                        onChange={(e: any) => setFormData(p => ({ ...p, saleDate: e.target.value }))}
                    />
                </div>

                {/* Price per item breakdown */}
                {formData.totalPrice > 0 && (
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-sm border border-stone-100 dark:border-zinc-800">
                        <span className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-zinc-500 block mb-3">
                            Preisverteilung
                        </span>
                        <div className="space-y-2">
                            {distribution.map(({ item, price }) => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                    <span className="text-stone-600 dark:text-zinc-400 truncate pr-2">
                                        {item.brand} {item.model ? `– ${item.model}` : ''}
                                    </span>
                                    <span className="font-bold text-stone-900 dark:text-zinc-50 whitespace-nowrap">
                                        {formatCurrency(price)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Profit summary */}
                <div className={`p-6 rounded-[2rem] border transition-colors ${totalProfit >= 0 ? 'bg-emerald-900 text-emerald-50 border-emerald-800' : 'bg-red-50 dark:bg-red-950 border-red-100 dark:border-red-900 text-red-900 dark:text-red-200'}`}>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-widest opacity-80">Geschätzter Gewinn</span>
                        <span className="text-3xl font-serif font-medium">
                            {formatCurrency(totalProfit)}
                        </span>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full mt-4"
                    variant="primary"
                >
                    {count} Artikel als verkauft bestätigen
                </Button>
            </form>
        </FadeIn>
    );
};
