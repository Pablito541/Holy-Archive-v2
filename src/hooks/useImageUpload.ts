import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { supabase } from '../lib/supabase';

export const useImageUpload = (initialImageUrl?: string) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async (): Promise<string | null> => {
        if (!selectedFile) return previewUrl; // Return existing URL if no new file selected

        if (!supabase) {
            // Fallback for local dev without Supabase: 
            // We used to return base64 here, but that crashes the showroom.
            // Better to return the original if it's a URL, or null if it's base64.
            console.warn('Supabase not initialized, blocking base64 upload fallback.');
            return previewUrl?.startsWith('http') ? previewUrl : null;
        }

        setIsUploading(true);
        try {
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

            return publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    return {
        selectedFile,
        previewUrl,
        isUploading,
        handleImageSelect,
        uploadImage
    };
};
