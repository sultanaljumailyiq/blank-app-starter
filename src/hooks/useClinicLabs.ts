
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export interface ClinicLab {
    id: string;
    name: string;
    address: string;      // Street address only
    governorate?: string; // Parsed from stored 'Governorate - Street' format
    phone: string;
    specialties: string[];
    isCustom: boolean;
    isFavorite?: boolean;
    // Platform specific
    email?: string;
    logo?: string;
    rating?: number;
    isVerified?: boolean;
    // UI specific compatibility
    reviewCount?: number;
    price?: {
        panoramic: number;
        periapical: number;
        bitewing: number;
        occlusal: number;
        coneBeam: number;
        gumAnalysis: number;
    };
    isAccredited?: boolean;
    workingHours?: string;
    responseTime?: string;
    services?: string[];
    delegates?: any[];
    establishmentYear?: number;
    licenseNumber?: string;
    user_id?: string;
}

export const useClinicLabs = (clinicId: string) => {
    const [labs, setLabs] = useState<ClinicLab[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLabs = async () => {
        try {
            setLoading(true);

            // 1. Fetch Platform Labs from dental_laboratories (with profile avatar as logo fallback)
            const { data: platformLabs, error: platformError } = await supabase
                .from('dental_laboratories')
                .select('*, profiles:user_id(avatar_url)');

            if (platformError) {
                console.warn('Error fetching platform labs:', platformError);
            }

            // 2. Fetch Custom/Manual Labs for this clinic
            let customLabs: any[] = [];
            try {
                const { data, error } = await supabase
                    .from('clinic_custom_labs')
                    .select('*')
                    .eq('clinic_id', clinicId);

                if (error) {
                    console.warn('Could not fetch custom labs:', error);
                } else {
                    customLabs = data || [];
                }
            } catch (ignored) {
                console.warn('Error querying clinic_custom_labs');
            }

            // 3. Fetch Favorited Platform Labs from clinic_lab_favorites
            // Custom labs are always shown (auto-favorite)
            // Platform labs only show when explicitly favorited
            let favoriteIds = new Set<string>();
            try {
                const { data: clinicFavs } = await supabase
                    .from('clinic_lab_favorites')
                    .select('lab_id')
                    .eq('clinic_id', clinicId);

                if (clinicFavs) {
                    clinicFavs.forEach(f => { if (f.lab_id) favoriteIds.add(f.lab_id); });
                }
            } catch (e) {
                console.warn('Error fetching favorites:', e);
            }

            const formattedPlatformLabs: ClinicLab[] = (platformLabs || []).map((lab: any) => {
                return {
                    id: lab.id,
                    name: lab.name || lab.lab_name,
                    address: lab.address?.trim() || '',
                    governorate: lab.governorate?.trim() || '',
                    phone: lab.phone?.trim() || '',
                    specialties: [],
                    isCustom: false,
                    isFavorite: favoriteIds.has(lab.id),
                    rating: lab.rating,
                    isVerified: lab.is_active || false,
                    logo: lab.logo_url || lab.profiles?.avatar_url || undefined,
                    reviewCount: 0,
                    price: { panoramic: 0, periapical: 0, bitewing: 0, occlusal: 0, coneBeam: 0, gumAnalysis: 0 },
                    isAccredited: lab.is_accredited || false,
                    workingHours: lab.working_hours || '09:00 - 17:00',
                    responseTime: lab.response_time || '24h',
                    services: [],
                    delegates: [],
                    establishmentYear: lab.establishment_year ? parseInt(lab.establishment_year) : undefined,
                    licenseNumber: lab.license_number || undefined,
                    user_id: lab.user_id
                };
            });

            // Custom labs are always favorited (auto-shown in saved section)
            const formattedCustomLabs: ClinicLab[] = (customLabs || []).map((lab: any) => ({
                id: lab.id,
                name: lab.name,
                address: lab.address,
                phone: lab.phone,
                specialties: lab.specialties || [],
                isCustom: true,
                isFavorite: true, // Always shown in saved section
                reviewCount: 0,
                price: { panoramic: 0, periapical: 0, bitewing: 0, occlusal: 0, coneBeam: 0, gumAnalysis: 0 },
                isAccredited: false,
                workingHours: '',
                responseTime: '',
                services: [],
                delegates: []
            }));

            setLabs([...formattedCustomLabs, ...formattedPlatformLabs]);
        } catch (err) {
            console.error('Error fetching clinic labs:', err);
            toast.error('حدث خطأ في تحميل بيانات المختبرات');
        } finally {
            setLoading(false);
        }
    };

    const addCustomLab = async (labData: Omit<ClinicLab, 'id' | 'isCustom'>) => {
        try {
            const { data, error } = await supabase
                .from('clinic_custom_labs')
                .insert({
                    clinic_id: clinicId,
                    name: labData.name,
                    address: labData.address,
                    phone: labData.phone,
                    specialties: labData.specialties
                })
                .select()
                .single();

            if (error) throw error;

            await fetchLabs();
            return data;
        } catch (err) {
            console.error('Error adding custom lab:', err);
            throw err;
        }
    };

    const toggleFavorite = async (labId: string) => {
        try {
            const lab = labs.find(l => l.id === labId);
            if (!lab) return;

            // Custom labs cannot be unfavorited (they are always shown)
            if (lab.isCustom) {
                toast.error('المعامل اليدوية تظهر دائماً في المحفوظة');
                return;
            }

            const isFav = lab.isFavorite;

            if (isFav) {
                // Remove from clinic_lab_favorites
                const { error } = await supabase
                    .from('clinic_lab_favorites')
                    .delete()
                    .match({ clinic_id: clinicId, lab_id: labId });

                if (error) throw error;
                toast.success('تمت الإزالة من المحفوظة');
            } else {
                // Add to clinic_lab_favorites
                const { error } = await supabase
                    .from('clinic_lab_favorites')
                    .insert({ clinic_id: clinicId, lab_id: labId });

                if (error && error.code !== '23505') throw error; // ignore duplicate
                toast.success('تمت الإضافة للمحفوظة');
            }

            await fetchLabs();
        } catch (err) {
            console.error('Error toggling favorite:', err);
            toast.error('حدث خطأ في تغيير الحالة');
        }
    }

    useEffect(() => {
        if (clinicId) {
            fetchLabs();
        }
    }, [clinicId]);

    return {
        labs,
        loading,
        refresh: fetchLabs,
        addCustomLab,
        toggleFavorite
    };
};
