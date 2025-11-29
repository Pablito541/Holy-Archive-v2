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

    return (
        <FadeIn className="bg-[#fafaf9] min-h-screen pb-safe">
            <header className="px-6 py-6 flex items-center justify-between sticky top-0 bg-[#fafaf9]/90 backdrop-blur-xl z-20">
                <button onClick={onCancel} className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full bg-white shadow-sm border border-stone-100 text-stone-600 active:scale-90 transition-transform">
                    <X className="w-5 h-5" />
                </button>
                <h2 className="font-serif font-bold text-xl">Neuer Artikel</h2>
                <div className="w-8"></div>
            </header>

            const [isSubmitting, setIsSubmitting] = useState(false);

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

            // ... (rest of the component)

            <Button type="submit" className="w-full shadow-2xl shadow-stone-900/20" disabled={isSubmitting} loading={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                Artikel anlegen
            </Button>
        </form>
        </FadeIn >
    );
};
