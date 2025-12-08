import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Save, Image as ImageIcon } from 'lucide-react';
import { Item } from '../../types';
import { FadeIn } from '../ui/FadeIn';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

import { supabase } from '../../lib/supabase';

import imageCompression from 'browser-image-compression';

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
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imageUrls?.[0] || null);

    const cameraInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    // Load saved data and setup persistence
    useEffect(() => {
        if (!initialData) {
            const savedData = localStorage.getItem('add_item_draft');
            if (savedData) {
                try {
                    setFormData(JSON.parse(savedData));
                } catch (e) {
                    console.error('Failed to parse draft', e);
                }
            }
        }
    }, []);

    useEffect(() => {
        if (!initialData) {
            localStorage.setItem('add_item_draft', JSON.stringify(formData));
        }
    }, [formData]);

    const handleChange = (field: keyof Item, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
                // Also update form data for immediate visual feedback if using simple base64 persistence
                if (!supabase && !initialData) {
                    setFormData(prev => ({ ...prev, imageUrls: [reader.result as string] }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            let finalImageUrls = formData.imageUrls || [];

            // Upload image if selected and Supabase is available
            if (selectedFile && supabase) {
                // Compress image
                const options = {
                    maxSizeMB: 0.3,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true
                };

                let fileToUpload = selectedFile;
                try {
                    console.log(`Original size: ${selectedFile.size / 1024 / 1024} MB`);
                    const compressedFile = await imageCompression(selectedFile, options);
                    console.log(`Compressed size: ${compressedFile.size / 1024 / 1024} MB`);
                    fileToUpload = compressedFile;
                } catch (error) {
                    console.error('Compression failed, falling back to original file:', error);
                }

                const fileExt = fileToUpload.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(filePath, fileToUpload);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('images')
                    .getPublicUrl(filePath);

                finalImageUrls = [publicUrl];
            } else if (selectedFile && !supabase) {
                // Fallback for local dev without Supabase: use Base64 preview
                if (previewUrl) finalImageUrls = [previewUrl];
            }

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
        <FadeIn className="bg-[#fafaf9] dark:bg-stone-950 min-h-screen">
            <header className="px-6 py-6 pt-safe flex items-center justify-between sticky top-0 bg-[#fafaf9] dark:bg-stone-950 z-20 border-b border-stone-100 dark:border-stone-900 shadow-sm">
                <button onClick={onCancel} className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full bg-white dark:bg-stone-900 shadow-sm border border-stone-100 dark:border-stone-800 text-stone-600 dark:text-stone-300 active:scale-90 transition-transform">
                    <X className="w-5 h-5" />
                </button>
                <h2 className="font-serif font-bold text-xl dark:text-stone-100">{initialData ? 'Artikel bearbeiten' : 'Neuer Artikel'}</h2>
                <div className="w-8"></div>
            </header>

            <form onSubmit={handleSubmit} className="px-6 pb-12 max-w-lg mx-auto">

                <div className="mb-8">
                    <div className="block w-full aspect-[4/3] bg-white rounded-[2rem] border-2 border-dashed border-stone-200 overflow-hidden relative shadow-sm">
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
                                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-md group-hover:opacity-0 transition-opacity pointer-events-none">
                                    Tippen zum Ändern
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-stone-400 gap-6">
                                <div className="text-center">
                                    <span className="font-medium text-sm block mb-4">Foto hinzufügen</span>
                                    <div className="flex gap-6">
                                        <button
                                            type="button"
                                            onClick={() => cameraInputRef.current?.click()}
                                            className="flex flex-col items-center gap-2 group"
                                        >
                                            <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center border border-stone-100 group-hover:border-stone-300 group-hover:bg-stone-100 transition-all">
                                                <Camera className="w-7 h-7 text-stone-700" />
                                            </div>
                                            <span className="text-xs font-medium text-stone-500">Kamera</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => galleryInputRef.current?.click()}
                                            className="flex flex-col items-center gap-2 group"
                                        >
                                            <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center border border-stone-100 group-hover:border-stone-300 group-hover:bg-stone-100 transition-all">
                                                <ImageIcon className="w-7 h-7 text-stone-700" />
                                            </div>
                                            <span className="text-xs font-medium text-stone-500">Galerie</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            ref={cameraInputRef}
                            onChange={handleImageUpload}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={galleryInputRef}
                            onChange={handleImageUpload}
                        />
                    </div>
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
                    {initialData ? 'Änderungen speichern' : 'Artikel anlegen'}
                </Button>
            </form>
        </FadeIn>
    );
};
