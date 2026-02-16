import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface UseImageUploadProps {
    initialImageUrls?: string[];
    isBulkMode?: boolean;
    bulkQuantity?: number;
}

export const useImageUpload = ({
    initialImageUrls = [],
    isBulkMode = false,
    bulkQuantity = 1
}: UseImageUploadProps = {}) => {
    const [imageUrls, setImageUrls] = useState<string[]>(initialImageUrls);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

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

        setUploading(true);
        const uploadedUrls: string[] = [];

        try {
            for (const file of pendingFiles) {
                // Compress image & convert to WebP
                const options = {
                    maxSizeMB: 0.2, // Aggressive compression target (was 0.3)
                    maxWidthOrHeight: 1280, // HD Ready is enough for mobile (was 1920)
                    useWebWorker: true,
                    fileType: 'image/webp' // Modern efficient format
                };

                let fileToUpload = file;
                try {
                    const imageCompression = (await import('browser-image-compression')).default;
                    const compressedFile = await imageCompression(file, options);
                    fileToUpload = compressedFile;
                } catch (error) {
                    console.error('Compression failed:', error);
                }

                // Force .webp extension since we converted it
                const fileExt = 'webp';
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

            // Return combined list of existing and new URLs
            return [...imageUrls, ...uploadedUrls];
        } catch (error) {
            console.error('Error uploading images:', error);
            throw error;
        } finally {
            setUploading(false);
        }
    };

    const reset = () => {
        setPendingFiles([]);
        setImagePreviews([]);
        setImageUrls(initialImageUrls);
        setUploading(false);
    }

    return {
        imageUrls,
        setImageUrls,
        pendingFiles,
        imagePreviews,
        uploading,
        handleFileChange,
        handleRemoveExistingImage,
        handleRemovePendingImage,
        uploadAllImages,
        reset
    };
};
