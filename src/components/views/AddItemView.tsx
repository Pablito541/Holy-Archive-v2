import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Save, Image as ImageIcon } from 'lucide-react';
import { Item } from '../../types';
import { FadeIn } from '../ui/FadeIn';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useImageUpload } from '../../hooks/useImageUpload';
import { BRANDS, CATEGORIES, CONDITIONS, SALES_CHANNELS } from '../../constants';

export const AddItemView = ({ onSave, onCancel, initialData }: { onSave: (item: Partial<Item>) => void, onCancel: () => void, initialData?: Item }) => {
    const [formData, setFormData] = useState<Partial<Item>>(initialData || {
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

    // Init hook with existing first image if available
    const {
        previewUrl,
        handleImageSelect,
        uploadImage,
        isUploading: isImageUploading
    } = useImageUpload(initialData?.imageUrls?.[0]);

    const cameraInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved data on mount
    useEffect(() => {
        if (!initialData) {
            const savedData = localStorage.getItem('add_item_draft');
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    // Merge with defaults to ensure all fields exist
                    setFormData(prev => ({ ...prev, ...parsed }));
                } catch (e) {
                    console.error('Failed to parse draft', e);
                }
            }
            setIsLoaded(true);
        }
    }, [initialData]);

    // Save data only when loaded and changed
    useEffect(() => {
        if (!initialData && isLoaded) {
            // We don't save the image file in local storage draft, just the text fields
            // For the image, we check if there are imageUrls already.
            localStorage.setItem('add_item_draft', JSON.stringify(formData));
        }
    }, [formData, isLoaded, initialData]);

    const handleChange = (field: keyof Item, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleImageSelect(e);
        // The hook (useImageUpload) manages the preview separately from formData,
        // ensuring binary data isn't unnecessarily synchronized with item state.
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting || isImageUploading) return;

        setIsSubmitting(true);
        try {
            // Upload image via hook
            let uploadedUrl = await uploadImage();

            // If upload returns a URL (new or existing), use it. 
            // If null/undefined (failure or no file), we fall back to existing.
            const finalImageUrls = uploadedUrl ? [uploadedUrl] : (formData.imageUrls || []);

            await onSave({ ...formData, imageUrls: finalImageUrls });
            if (!initialData) {
                localStorage.removeItem('add_item_draft');
            }
        } catch (error) {
            console.error('Error saving item:', error);
            alert('Fehler beim Speichern. Bitte erneut versuchen.');
            setIsSubmitting(false);
        }
    };

    return (
        <FadeIn className="bg-[#fafaf9] dark:bg-black min-h-screen">
            <header className="fixed top-0 left-0 right-0 px-6 py-4 pt-safe flex items-center justify-between bg-[#fafaf9] dark:bg-stone-950 z-50 border-b border-stone-100 dark:border-stone-900 shadow-sm">
                <button
                    onClick={onCancel} className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full bg-white dark:bg-stone-900 shadow-sm border border-stone-100 dark:border-stone-800 text-stone-600 dark:text-stone-300 active:scale-90 transition-transform">
                    <X className="w-5 h-5" />
                </button>
                <h2 className="font-serif font-bold text-xl dark:text-stone-100">{initialData ? 'Artikel bearbeiten' : 'Neuer Artikel'}</h2>
                <div className="w-8"></div>
            </header>

            {/* Spacer for fixed header - approx 80px + safe area */}
            <div className="h-24 pt-safe"></div>

            <form onSubmit={handleSubmit} className="px-6 pb-12 max-w-lg mx-auto">

                {/* PUBLIC SECTION */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                        Public Showroom
                    </div>

                    <div className="mb-8">
                        {/* Image Upload Block */}
                        <div className="block w-full aspect-[4/3] bg-stone-50 rounded-[2rem] border-2 border-dashed border-stone-200 overflow-hidden relative shadow-inner">
                            {previewUrl || (formData.imageUrls && formData.imageUrls.length > 0) ? (
                                <div className="relative w-full h-full group">
                                    <img src={previewUrl || formData.imageUrls![0]} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                                        <button
                                            type="button"
                                            onClick={() => cameraInputRef.current?.click()}
                                            className="flex flex-col items-center justify-center text-white hover:scale-110 transition-transform"
                                        >
                                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                                                <Camera className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs font-medium">Kamera</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => galleryInputRef.current?.click()}
                                            className="flex flex-col items-center justify-center text-white hover:scale-110 transition-transform"
                                        >
                                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                                                <ImageIcon className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs font-medium">Galerie</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-stone-400 gap-6">
                                    <div className="text-center">
                                        <span className="font-medium text-sm block mb-4">Cover-Foto (Öffentlich)</span>
                                        <div className="flex gap-6">
                                            <button type="button" onClick={() => cameraInputRef.current?.click()}>
                                                <Camera className="w-8 h-8 text-stone-300 hover:text-stone-500 transition-colors" />
                                            </button>
                                            <button type="button" onClick={() => galleryInputRef.current?.click()}>
                                                <ImageIcon className="w-8 h-8 text-stone-300 hover:text-stone-500 transition-colors" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleFileChange} />
                            <input type="file" accept="image/*" className="hidden" ref={galleryInputRef} onChange={handleFileChange} />
                        </div>
                    </div>

                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-6">Öffentliche Details (Showroom)</h3>

                    <div className="mb-6">
                        <Input
                            label="Angebotspreis (€)"
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.salePriceEur === 0 ? '' : formData.salePriceEur}
                            onChange={(e: any) => handleChange('salePriceEur', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                            required
                        />
                    </div>

                    <Select
                        label="Marke"
                        options={BRANDS}
                        value={formData.brand}
                        onChange={(e: any) => handleChange('brand', e.target.value)}
                        required
                    />

                    <Input
                        label="Modell / Bezeichnung"
                        placeholder="z.B. Speedy 30"
                        value={formData.model}
                        onChange={(e: any) => handleChange('model', e.target.value)}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Kategorie"
                            options={CATEGORIES}
                            value={formData.category}
                            onChange={(e: any) => handleChange('category', e.target.value)}
                        />
                        <Select
                            label="Zustand"
                            options={CONDITIONS}
                            value={formData.condition}
                            onChange={(e: any) => handleChange('condition', e.target.value)}
                        />
                    </div>
                </div>

                {/* PRIVATE SECTION */}
                <div className="bg-stone-50 dark:bg-stone-900 p-6 rounded-[2rem] border border-red-100 dark:border-red-900/20 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                        Internal / Private
                    </div>

                    <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        Vertrauliche Daten
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Einkaufspreis (€)"
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.purchasePriceEur === 0 ? '' : formData.purchasePriceEur}
                            onChange={(e: any) => handleChange('purchasePriceEur', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                            required
                        />
                        <Input
                            label="Einkaufsdatum"
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
                        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 ml-1">Interne Notizen</label>
                        <textarea
                            className="w-full px-4 py-3.5 rounded-2xl bg-white border-0 focus:ring-1 focus:ring-stone-800 outline-none transition-colors min-h-[100px] text-sm font-medium shadow-sm"
                            placeholder="Mängel, Besonderheiten, Realitäts-Check..."
                            value={formData.notes}
                            onChange={(e: any) => handleChange('notes', e.target.value)}
                        />
                    </div>
                </div>

                {/* SOLD SECTION (Only visible if item is sold) */}
                {initialData?.status === 'sold' && (
                    <div className="bg-stone-50 dark:bg-stone-900 p-6 rounded-[2rem] border border-stone-200 dark:border-stone-800 mb-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                            Verkaufsdaten
                        </div>

                        <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-widest mb-6 flex items-center gap-2">
                            Verkauf Details
                        </h3>

                        <Select
                            label="Verkaufskanal"
                            options={SALES_CHANNELS.map(c => ({ value: c, label: c }))}
                            value={formData.saleChannel || 'Sonstige'}
                            onChange={(e: any) => handleChange('saleChannel', e.target.value)}
                        />

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <Input
                                label="Verkaufspreis (€)"
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.salePriceEur || ''}
                                onChange={(e: any) => handleChange('salePriceEur', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                            />
                            <Input
                                label="Verkaufsdatum"
                                type="date"
                                value={formData.saleDate ? new Date(formData.saleDate).toISOString().split('T')[0] : ''}
                                onChange={(e: any) => handleChange('saleDate', e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <Button type="submit" className="w-full shadow-2xl shadow-stone-900/20" disabled={isSubmitting || isImageUploading} loading={isSubmitting || isImageUploading}>
                    <Save className="w-4 h-4 mr-2" />
                    {initialData ? 'Änderungen speichern' : 'Artikel anlegen'}
                </Button>
            </form>
        </FadeIn>
    );
};
