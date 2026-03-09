import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Brand } from '../types';
import { toast } from 'sonner';

export const useBrands = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('brands')
                .select('*')
                .order('name');

            if (error) throw error;

            setBrands(data || []);
        } catch (error) {
            console.error('Error fetching brands:', error);
        } finally {
            setLoading(false);
        }
    };

    const createBrand = async (name: string, logo?: File, description?: string, isVerified: boolean = false) => {
        try {
            // Check if exists
            const { data: existing } = await supabase.from('brands').select('id').ilike('name', name).single();
            if (existing) {
                toast.error('هذه العلامة التجارية موجودة بالفعل');
                return null;
            }

            let logoUrl = null;
            if (logo) {
                const fileName = `brand-logos/${Date.now()}_${logo.name}`;
                const { error: uploadError } = await supabase.storage.from('products').upload(fileName, logo);
                if (uploadError) throw uploadError;
                const { data } = supabase.storage.from('products').getPublicUrl(fileName);
                logoUrl = data.publicUrl;
            }

            const { data, error } = await supabase.from('brands').insert({
                name,
                logo: logoUrl,
                description,
                is_verified: isVerified
            }).select().single();

            if (error) throw error;

            toast.success(isVerified ? 'تم إضافة العلامة التجارية وتوثيقها بنجاح' : 'تم إضافة العلامة التجارية (بانتظار التوثيق)');
            fetchBrands();
            return data;
        } catch (error) {
            console.error('Error creating brand:', error);
            toast.error('حدث خطأ أثناء إضافة العلامة التجارية');
            return null;
        }
    };

    const verifyBrand = async (id: string) => {
        try {
            const { error } = await supabase.from('brands').update({ is_verified: true }).eq('id', id);
            if (error) throw error;
            toast.success('تم توثيق العلامة التجارية');
            fetchBrands();
        } catch (error) {
            toast.error('حدث خطأ');
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    return {
        brands,
        loading,
        createBrand,
        verifyBrand,
        refresh: fetchBrands
    };
};
