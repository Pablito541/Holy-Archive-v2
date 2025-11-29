import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Item } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { FadeIn } from '../ui/FadeIn';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

export const SellItemView = ({ item, onSave, onCancel }: { item: Item, onSave: (data: Partial<Item>) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState({
        salePriceEur: '',
        saleDate: new Date().toISOString().split('T')[0],
        saleChannel: 'whatsapp',
        platformFeesEur: '',
        shippingCostEur: ''
    });

    const salePrice = parseFloat(formData.salePriceEur) || 0;
    const fees = parseFloat(formData.platformFeesEur) || 0;
    const shipping = parseFloat(formData.shippingCostEur) || 0;

    const profit = salePrice - item.purchasePriceEur - fees - shipping;

    const handleSave = () => {
        onSave({
            salePriceEur: salePrice,
            saleDate: formData.saleDate,
            saleChannel: formData.saleChannel,
            platformFeesEur: fees,
            shippingCostEur: shipping
        });
    };

    return (
        <FadeIn className="bg-[#fafaf9] min-h-screen pb-safe">
            <header className="px-6 py-6 flex items-center justify-between sticky top-0 bg-[#fafaf9]/90 backdrop-blur-xl z-20">
                <button onClick={onCancel} className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full bg-white shadow-sm border border-stone-100 text-stone-600">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="font-serif font-bold text-xl">Verkauf erfassen</h2>
                <div className="w-8"></div>
            </header>

            <div className="px-6 space-y-6 max-w-lg mx-auto">
                <div className="bg-white p-4 rounded-3xl flex items-center shadow-sm border border-stone-100">
                    <div className="w-16 h-16 bg-stone-100 rounded-2xl mr-4 flex items-center justify-center relative overflow-hidden">
                        {item.imageUrls && item.imageUrls[0] ? <img src={item.imageUrls[0]} className="w-full h-full object-cover" /> : <ShoppingBag className="w-6 h-6 text-stone-300" />}
                    </div>
                    <div>
                        <div className="font-serif font-bold text-lg">{item.brand}</div>
                        <div className="text-sm text-stone-500">{item.model}</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100">
                    <Input
                        label="Verkaufspreis (€)"
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.salePriceEur}
                        onChange={(e: any) => setFormData(p => ({ ...p, salePriceEur: e.target.value }))}
                        required
                        autoFocus
                    />

                    <Select
                        label="Verkaufskanal"
                        options={[
                            { value: 'whatsapp', label: 'WhatsApp Gruppe' },
                            { value: 'vinted', label: 'Vinted' },
                            { value: 'whatnot', label: 'Whatnot (Live)' },
                            { value: 'ebay', label: 'eBay' },
                            { value: 'other', label: 'Andere' }
                        ]}
                        value={formData.saleChannel}
                        onChange={(e: any) => setFormData(p => ({ ...p, saleChannel: e.target.value }))}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Gebühren (€)"
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.platformFeesEur}
                            onChange={(e: any) => setFormData(p => ({ ...p, platformFeesEur: e.target.value }))}
                        />
                        <Input
                            label="Versand (€)"
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.shippingCostEur}
                            onChange={(e: any) => setFormData(p => ({ ...p, shippingCostEur: e.target.value }))}
                        />
                    </div>

                    <Input
                        label="Verkaufsdatum"
                        type="date"
                        value={formData.saleDate}
                        onChange={(e: any) => setFormData(p => ({ ...p, saleDate: e.target.value }))}
                    />
                </div>

                <div className={`p-6 rounded-[2rem] border transition-colors ${profit >= 0 ? 'bg-emerald-900 text-emerald-50 border-emerald-800' : 'bg-red-50 border-red-100 text-red-900'}`}>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-widest opacity-80">Geschätzter Gewinn</span>
                        <span className="text-3xl font-serif font-medium">
                            {formatCurrency(profit)}
                        </span>
                    </div>
                </div>

                <Button
                    onClick={handleSave}
                    className="w-full mt-4"
                    variant="primary"
                >
                    Als Verkauft bestätigen
                </Button>
            </div>
        </FadeIn>
    );
};
