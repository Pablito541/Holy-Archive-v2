import React, { useState } from 'react';
import { X, Camera, Save } from 'lucide-react';
import { Item } from '../../types';
import { FadeIn } from '../ui/FadeIn';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

export const AddItemView = ({ onSave, onCancel }: { onSave: (item: Partial<Item>) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState<Partial<Item>>({
        brand: '',
        category: 'bag',
        condition: 'good',
        purchasePriceEur: 0,
        purchaseDate: new Date().toISOString().split('T')[0],
        purchaseSource: '',
        model: '',
        notes: '',
        status: 'in_stock',
        imageUrls: []
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (field: keyof Item, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                handleChange('imageUrls', [reader.result as string]);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSave(formData);
        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
        }
    };

    return (
        <FadeIn className="bg-[#fafaf9] min-h-screen pb-safe">
            <header className="px-6 py-6 flex items-center justify-between sticky top-0 bg-[#fafaf9]/90 backdrop-blur-xl z-20">
                <button onClick={onCancel} className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full bg-white shadow-sm border border-stone-100 text-stone-600 active:scale-90 transition-transform">
                    <X className="w-5 h-5" />
                </button>
                <h2 className="font-serif font-bold text-xl">Neuer Artikel</h2>
                <div className="w-8"></div>
            </header>

            <form onSubmit={handleSubmit} className="px-6 pb-12 max-w-lg mx-auto">

                <div className="mb-8">
                    <label className="block w-full aspect-[4/3] bg-white rounded-[2rem] border-2 border-dashed border-stone-200 hover:border-stone-400 transition-colors cursor-pointer overflow-hidden relative shadow-sm">
                        {formData.imageUrls && formData.imageUrls.length > 0 ? (
                            <>
                                <img src={formData.imageUrls[0]} className="w-full h-full object-cover" />
                                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-md">Ändern</div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-stone-400">
                                <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-3">
                                    <Camera className="w-8 h-8 text-stone-900" />
                                </div>
                                <span className="font-medium text-sm">Foto hinzufügen</span>
                                <span className="text-xs opacity-60 mt-1">Tippen für Kamera</span>
                            </div>
                        )}
                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                    </label>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 mb-6">
                    <h3 className="text-xs font-bold text-stone-300 uppercase tracking-widest mb-6">Details</h3>

                    <Select
                        label="Marke"
                        options={[
                            { value: '', label: 'Bitte wählen...' },
                            { value: 'Louis Vuitton', label: 'Louis Vuitton' },
                            { value: 'Gucci', label: 'Gucci' },
                            { value: 'Prada', label: 'Prada' },
                            { value: 'Hermès', label: 'Hermès' },
                            { value: 'Chanel', label: 'Chanel' },
                            { value: 'Dior', label: 'Dior' },
                            { value: 'Fendi', label: 'Fendi' },
                            { value: 'Celine', label: 'Celine' },
                            { value: 'Other', label: 'Sonstige' }
                        ]}
                        value={formData.brand}
                        onChange={(e: any) => handleChange('brand', e.target.value)}
                        required
                    />

                    <Select
                        label="Kategorie"
                        options={[
                            { value: 'bag', label: 'Tasche' },
                            { value: 'wallet', label: 'Geldbeutel' },
                            { value: 'accessory', label: 'Accessoire' },
                            { value: 'lock', label: 'Schloss / Key' },
                            { value: 'other', label: 'Sonstiges' }
                        ]}
                        value={formData.category}
                        onChange={(e: any) => handleChange('category', e.target.value)}
                    />

                    <Input
                        label="Modell / Bezeichnung"
                        placeholder="z.B. Speedy 30"
                        value={formData.model}
                        onChange={(e: any) => handleChange('model', e.target.value)}
                    />

                    <Select
                        label="Zustand"
                        options={[
                            { value: 'mint', label: 'Neuwertig' },
                            { value: 'very_good', label: 'Sehr gut' },
                            { value: 'good', label: 'Gut' },
                            { value: 'fair', label: 'Akzeptabel' },
                            { value: 'poor', label: 'Schlecht' }
                        ]}
                        value={formData.condition}
                        onChange={(e: any) => handleChange('condition', e.target.value)}
                    />
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 mb-6">
                    <h3 className="text-xs font-bold text-stone-300 uppercase tracking-widest mb-6">Einkauf</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Preis (€)"
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.purchasePriceEur === 0 ? '' : formData.purchasePriceEur}
                            onChange={(e: any) => handleChange('purchasePriceEur', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                            required
                        />
                        <Input
                            label="Datum"
                            type="date"
                            value={formData.purchaseDate}
                            onChange={(e: any) => handleChange('purchaseDate', e.target.value)}
                            required
                        />
                    </div>

                    <Input
                        label="Einkaufsquelle"
                        placeholder="z.B. Vinted, Japan Auction..."
                        value={formData.purchaseSource}
                        onChange={(e: any) => handleChange('purchaseSource', e.target.value)}
                    />

                    <div className="pt-2">
                        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 ml-1">Notizen</label>
                        <textarea
                            className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 border-0 focus:ring-1 focus:ring-stone-800 outline-none transition-colors min-h-[100px] text-sm font-medium"
                            placeholder="Mängel, Besonderheiten, etc."
                            value={formData.notes}
                            onChange={(e: any) => handleChange('notes', e.target.value)}
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full shadow-2xl shadow-stone-900/20" disabled={isSubmitting} loading={isSubmitting}>
                    <Save className="w-4 h-4 mr-2" />
                    Artikel anlegen
                </Button>
            </form>
        </FadeIn>
    );
};
