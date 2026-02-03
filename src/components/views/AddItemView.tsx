import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Save, Image as ImageIcon } from 'lucide-react';
import { Item } from '../../types';
import { FadeIn } from '../ui/FadeIn';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
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
    const [uploadingImages, setUploadingImages] = useState(false);

    // Bulk upload mode
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [bulkQuantity, setBulkQuantity] = useState(1);

    // Multiple image URLs state (existing + new)
    const [imageUrls, setImageUrls] = useState<string[]>(initialData?.imageUrls || []);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const maxImages = isBulkMode ? bulkQuantity : 5;
        const totalImages = imageUrls.length + imagePreviews.length + files.length;
        if (totalImages > maxImages) {
            alert(`Maximal ${maxImages} Bilder erlaubt`);
            return;
        }

        const newFiles: File[] = [];
        const newPreviews: string[] = [];

        for (let i = 0; i < files.length && i < (maxImages - imageUrls.length - imagePreviews.length); i++) {
            const file = files[i];
            newFiles.push(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result as string);
                if (newPreviews.length === newFiles.length) {
                    setImagePreviews(prev => [...prev, ...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        }

        setPendingFiles(prev => [...prev, ...newFiles]);
        e.target.value = ''; // Reset input
    };

    const handleRemoveExistingImage = (index: number) => {
        setImageUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemovePendingImage = (index: number) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        setPendingFiles(prev => prev.filter((_, i) => i !== index));
    };

    const uploadAllImages = async (): Promise<string[]> => {
        if (pendingFiles.length === 0) return imageUrls;

        if (!supabase) {
            console.warn('Supabase not initialized');
            return imageUrls;
        }

        setUploadingImages(true);
        const uploadedUrls: string[] = [];

        try {
            for (const file of pendingFiles) {
                // Compress image
                const options = {
                    maxSizeMB: 0.3,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true
                };

                let fileToUpload = file;
                try {
                    const imageCompression = (await import('browser-image-compression')).default;
                    const compressedFile = await imageCompression(file, options);
                    fileToUpload = compressedFile;
                } catch (error) {
                    console.error('Compression failed:', error);
                }

                const fileExt = fileToUpload.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(fileName, fileToUpload);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('images')
                    .getPublicUrl(fileName);

                uploadedUrls.push(publicUrl);
            }

            return [...imageUrls, ...uploadedUrls];
        } catch (error) {
            console.error('Error uploading images:', error);
            throw error;
        } finally {
            setUploadingImages(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting || uploadingImages) return;

        setIsSubmitting(true);
        try {
            // Upload all pending images
            const finalImageUrls = await uploadAllImages();

            // Check if bulk mode is active
            if (isBulkMode && bulkQuantity > 1 && !initialData) {
                // Strict validation: image count must match bulk quantity
                if (finalImageUrls.length !== bulkQuantity) {
                    alert(`Fehler: Für ${bulkQuantity} Artikel müssen genau ${bulkQuantity} Fotos hochgeladen werden.`);
                    setIsSubmitting(false);
                    return;
                }

                // Calculate price per item
                const pricePerItem = (formData.purchasePriceEur || 0) / bulkQuantity;

                // Create items array
                const itemsToCreate: Partial<Item>[] = [];

                for (let i = 0; i < bulkQuantity; i++) {
                    // Strict mapping: 1 image per item
                    const itemData: Partial<Item> = {
                        ...formData,
                        purchasePriceEur: pricePerItem,
                        salePriceEur: 0, // No target price in bulk mode
                        imageUrls: [finalImageUrls[i]],
                        notes: formData.notes || ''
                    };

                    itemsToCreate.push(itemData);
                }

                // Save all items (sequentially to avoid race conditions)
                for (const item of itemsToCreate) {
                    await onSave(item);
                }

                localStorage.removeItem('add_item_draft');
            } else {
                // Normal single item save
                await onSave({ ...formData, imageUrls: finalImageUrls });
                if (!initialData) {
                    localStorage.removeItem('add_item_draft');
                }
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

                {/* Bulk Mode Toggle - only for new items */}
                {!initialData && (
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-stone-200 dark:border-zinc-800 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="font-medium text-sm text-stone-900 dark:text-zinc-100">Bulk Upload</span>
                                <p className="text-xs text-stone-500 dark:text-zinc-400">Mehrere gleiche Artikel anlegen</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsBulkMode(!isBulkMode)}
                                className={`relative w-12 h-7 rounded-full transition-colors ${isBulkMode ? 'bg-stone-900 dark:bg-zinc-100' : 'bg-stone-200 dark:bg-zinc-700'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white dark:bg-zinc-900 shadow-sm transition-transform ${isBulkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {isBulkMode && (
                            <div className="mt-4 pt-4 border-t border-stone-100 dark:border-zinc-800">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Anzahl</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="50"
                                            value={bulkQuantity}
                                            onChange={(e) => setBulkQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 focus:border-stone-400 dark:focus:border-zinc-500 outline-none font-bold text-lg text-center"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Preis pro Stück</label>
                                        <div className="px-4 py-3 rounded-xl bg-stone-100 dark:bg-zinc-800/50 text-center">
                                            <span className="font-bold text-lg text-stone-900 dark:text-zinc-100">
                                                {((formData.purchasePriceEur || 0) / bulkQuantity).toFixed(2)} €
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-stone-400 dark:text-zinc-500 mt-3 text-center">
                                    Der Einkaufspreis wird durch {bulkQuantity} geteilt
                                </p>
                                <p className="text-xs text-stone-400 dark:text-zinc-500 mt-1 text-center">
                                    Bild-Logik: 1 Bild pro Artikel (Reihenfolge wird eingehalten)
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* IMAGES SECTION */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] shadow-sm border border-stone-200 dark:border-zinc-800 mb-6">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-sm text-stone-600 dark:text-stone-300">
                                Fotos ({imageUrls.length + imagePreviews.length}/{isBulkMode ? bulkQuantity : 5})
                            </span>
                            {uploadingImages && (
                                <span className="text-xs text-stone-500">Uploading...</span>
                            )}
                        </div>

                        {/* Quick Action Buttons */}
                        {(imageUrls.length + imagePreviews.length) < (isBulkMode ? bulkQuantity : 5) && (
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => cameraInputRef.current?.click()}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-stone-900 dark:bg-white text-white dark:text-black rounded-2xl font-medium text-sm hover:scale-[1.02] transition-transform"
                                >
                                    <Camera className="w-4 h-4" />
                                    Kamera
                                </button>
                                <button
                                    type="button"
                                    onClick={() => galleryInputRef.current?.click()}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-900 dark:text-white border border-stone-200 dark:border-zinc-700 rounded-2xl font-medium text-sm hover:scale-[1.02] transition-transform"
                                >
                                    <ImageIcon className="w-4 h-4" />
                                    Galerie
                                </button>
                            </div>
                        )}

                        {/* Images Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            {imageUrls.map((url, idx) => (
                                <div key={`existing-${idx}`} className="relative aspect-square bg-stone-100 dark:bg-zinc-800 rounded-2xl overflow-hidden group">
                                    <img src={url} className="w-full h-full object-cover" alt={`Image ${idx + 1}`} />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveExistingImage(idx)}
                                        className="absolute top-2 right-2 w-7 h-7 bg-stone-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {imagePreviews.map((preview, idx) => (
                                <div key={`preview-${idx}`} className="relative aspect-square bg-stone-100 dark:bg-zinc-800 rounded-2xl overflow-hidden group border-2 border-dashed border-stone-400 dark:border-zinc-600">
                                    <img src={preview} className="w-full h-full object-cover" alt={`Preview ${idx + 1}`} />
                                    <button
                                        type="button"
                                        onClick={() => handleRemovePendingImage(idx)}
                                        className="absolute top-2 right-2 w-7 h-7 bg-stone-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <div className="absolute bottom-2 left-2 text-[10px] bg-stone-900 dark:bg-white text-white dark:text-black px-2 py-0.5 rounded-full font-bold">
                                        NEU
                                    </div>
                                </div>
                            ))}

                            {(imageUrls.length + imagePreviews.length) < (isBulkMode ? bulkQuantity : 5) && (
                                <label className="aspect-square bg-stone-50 dark:bg-zinc-800 rounded-2xl border-2 border-dashed border-stone-300 dark:border-zinc-700 hover:border-stone-400 dark:hover:border-zinc-600 cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors">
                                    <ImageIcon className="w-6 h-6 text-stone-400 dark:text-zinc-500" />
                                    <span className="text-[10px] text-stone-500 dark:text-zinc-400 font-medium">Hinzufügen</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            )}
                        </div>

                        <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleFileChange} />
                        <input type="file" accept="image/*" className="hidden" ref={galleryInputRef} onChange={handleFileChange} />
                    </div>
                </div>

                {/* CORE DATA SECTION */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] shadow-sm border border-stone-200 dark:border-zinc-800 mb-6">
                    <h3 className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest mb-6">Artikel Details</h3>

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

                {/* FINANCIALS SECTION */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] shadow-sm border border-stone-200 dark:border-zinc-800 mb-6">
                    <h3 className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest mb-6">Finanzen & Einkauf</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className={isBulkMode ? "col-span-2" : ""}>
                            <Input
                                label={isBulkMode ? "Gesamteinkaufspreis (€)" : "Einkaufspreis (€)"}
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.purchasePriceEur === 0 ? '' : formData.purchasePriceEur}
                                onChange={(e: any) => handleChange('purchasePriceEur', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                                required
                            />
                        </div>
                        {!isBulkMode && (
                            <Input
                                label="Zielpreis / VK (€)"
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.salePriceEur === 0 ? '' : formData.salePriceEur}
                                onChange={(e: any) => handleChange('salePriceEur', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Einkaufsdatum"
                            type="date"
                            value={formData.purchaseDate}
                            onChange={(e: any) => handleChange('purchaseDate', e.target.value)}
                            required
                        />
                        <Input
                            label="Einkaufsquelle"
                            placeholder="z.B. Vinted"
                            value={formData.purchaseSource}
                            onChange={(e: any) => handleChange('purchaseSource', e.target.value)}
                        />
                    </div>
                </div>

                {/* NOTES SECTION */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] shadow-sm border border-stone-200 dark:border-zinc-800 mb-6">
                    <h3 className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest mb-4">Notizen</h3>
                    <textarea
                        className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 focus:border-stone-400 dark:focus:border-zinc-500 outline-none transition-colors min-h-[100px] text-sm font-medium"
                        placeholder="Mängel, Besonderheiten, etc..."
                        value={formData.notes}
                        onChange={(e: any) => handleChange('notes', e.target.value)}
                    />
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

                <Button type="submit" className="w-full shadow-2xl shadow-stone-900/20" disabled={isSubmitting || uploadingImages} loading={isSubmitting || uploadingImages}>
                    <Save className="w-4 h-4 mr-2" />
                    {initialData
                        ? 'Änderungen speichern'
                        : isBulkMode && bulkQuantity > 1
                            ? `${bulkQuantity} Artikel anlegen`
                            : 'Artikel anlegen'}
                </Button>
            </form>
        </FadeIn>
    );
};
