import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export interface LabProfile {
    id?: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    governorate: string;
    managerName: string;
    licenseNumber: string;
    workingHours: string;
    description: string;
    services: string[];
    avatar: string;
    delegates: {
        id: string;
        name: string;
        status: 'available' | 'busy' | 'offline';
        isAvailable: boolean;
    }[];
    isAccredited?: boolean;
    isVerified?: boolean;
    accountStatus?: 'active' | 'pending' | 'suspended';
}

const DEFAULT_PROFILE: LabProfile = {
    name: '',
    email: '',
    phone: '',
    address: '',
    governorate: 'بغداد',
    managerName: '',
    licenseNumber: '',
    workingHours: '',
    description: '',
    services: [],
    avatar: '',
    delegates: []
};

export const useLabProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<LabProfile>(DEFAULT_PROFILE);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        if (!user) return;

        try {
            setLoading(true);

            // Fetch lab data from dental_laboratories
            const { data: labData, error: labError } = await supabase
                .from('dental_laboratories')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (labError && labError.code !== 'PGRST116') {
                throw labError;
            }

            // Also fetch profile data (for email, phone fallback, avatar)
            const { data: profileData } = await supabase
                .from('profiles')
                .select('full_name, email, phone, avatar_url, bio, city, governorate, address')
                .eq('id', user.id)
                .single();

            if (labData) {
                setProfile({
                    id: labData.id,
                    name: labData.name || profileData?.full_name || '',
                    email: labData.email || profileData?.email || user.email || '',
                    phone: labData.phone || profileData?.phone || '',
                    address: labData.address || profileData?.address || '',
                    governorate: labData.governorate || profileData?.governorate || profileData?.city || 'بغداد',
                    managerName: '',
                    licenseNumber: labData.license_expiry ? 'موجود' : '',
                    workingHours: '',
                    description: labData.description || profileData?.bio || '',
                    services: labData.services_list || [],
                    avatar: labData.logo_url || profileData?.avatar_url || '',
                    delegates: [],
                    isAccredited: labData.is_accredited || false,
                    isVerified: labData.is_verified || false,
                    accountStatus: labData.account_status || 'pending'
                });
            } else if (profileData) {
                // Fallback: only profile record found (no lab record yet)
                setProfile(prev => ({
                    ...prev,
                    name: profileData.full_name || '',
                    email: profileData.email || user.email || '',
                    phone: profileData.phone || '',
                    address: profileData.address || '',
                    governorate: profileData.governorate || profileData.city || 'بغداد',
                    description: profileData.bio || '',
                    avatar: profileData.avatar_url || '',
                }));
            }
        } catch (error) {
            console.error('[useLabProfile] Fetch error:', error);
            toast.error('فشل تحميل الملف الشخصي');
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (updates: Partial<LabProfile>) => {
        if (!user) {
            toast.error('يجب تسجيل الدخول أولاً');
            return;
        }

        try {
            // Resolve lab record ID — fall back to a fresh lookup if not cached
            let labId = profile.id;
            if (!labId) {
                const { data: labData, error: labError } = await supabase
                    .from('dental_laboratories')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();
                if (labError || !labData) {
                    toast.error('لا يوجد سجل مختبر لهذا الحساب');
                    console.error('[useLabProfile] Could not find lab for user:', user.id);
                    return;
                }
                labId = labData.id;
                setProfile(prev => ({ ...prev, id: labId }));
            }

            // 1. Update dental_laboratories
            const labUpdates: any = {};
            if (updates.name !== undefined) labUpdates.name = updates.name;
            if (updates.email !== undefined) labUpdates.email = updates.email;
            if (updates.phone !== undefined) labUpdates.phone = updates.phone;
            if (updates.address !== undefined) labUpdates.address = updates.address;
            if (updates.governorate !== undefined) labUpdates.governorate = updates.governorate;
            if (updates.description !== undefined) labUpdates.description = updates.description;
            if (updates.services !== undefined) labUpdates.services_list = updates.services;
            if (updates.avatar !== undefined) labUpdates.logo_url = updates.avatar;

            console.log('[useLabProfile] Saving to dental_laboratories:', { labId, labUpdates });

            const { error: labSaveError } = await supabase
                .from('dental_laboratories')
                .update(labUpdates)
                .eq('id', labId);

            if (labSaveError) throw labSaveError;

            // 2. Sync to profiles table
            const profileUpdates: any = {};
            if (updates.name !== undefined) profileUpdates.full_name = updates.name;
            if (updates.phone !== undefined) profileUpdates.phone = updates.phone;
            if (updates.description !== undefined) profileUpdates.bio = updates.description;
            if (updates.governorate !== undefined) profileUpdates.governorate = updates.governorate;
            if (updates.address !== undefined) profileUpdates.address = updates.address;
            if (updates.avatar !== undefined) profileUpdates.avatar_url = updates.avatar;

            const { error: profileSaveError } = await supabase
                .from('profiles')
                .update(profileUpdates)
                .eq('id', user.id);

            if (profileSaveError) {
                console.warn('[useLabProfile] profiles sync failed (non-critical):', profileSaveError.message);
            }

            setProfile(prev => ({ ...prev, ...updates }));
            toast.success('تم الحفظ بنجاح ✓');
        } catch (error: any) {
            console.error('[useLabProfile] Save failed:', error);
            toast.error('فشل الحفظ: ' + (error?.message || 'خطأ غير معروف'));
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [user]);

    return {
        profile,
        loading,
        updateProfile,
        refresh: fetchProfile
    };
};
