import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface UseStorageReturn {
    uploadFile: (file: File, bucket: string, path?: string) => Promise<{ path: string; url: string } | null>;
    deleteFile: (bucket: string, path: string) => Promise<boolean>;
    getPublicUrl: (bucket: string, path: string) => string;
    loading: boolean;
    error: string | null;
}

export const useStorage = (): UseStorageReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadFile = async (file: File, bucket: string, path?: string) => {
        setLoading(true);
        setError(null);
        try {
            // Validate file size (e.g., max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('حجم الملف كبير جداً. الحد الأقصى هو 5 ميجابايت.');
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = path ? `${path}/${fileName}` : fileName;

            const { data, error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            return { path: filePath, url: publicUrl };
        } catch (err: any) {
            console.error('Upload Error:', err);
            setError(err.message || 'فشل في رفع الملف');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const deleteFile = async (bucket: string, path: string) => {
        setLoading(true);
        setError(null);
        try {
            const { error: deleteError } = await supabase.storage
                .from(bucket)
                .remove([path]);

            if (deleteError) throw deleteError;
            return true;
        } catch (err: any) {
            console.error('Delete Error:', err);
            setError(err.message || 'فشل حذف الملف');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const getPublicUrl = (bucket: string, path: string) => {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
    };

    return { uploadFile, deleteFile, getPublicUrl, loading, error };
};
