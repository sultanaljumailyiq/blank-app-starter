import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface SupplierProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar: string;
    companyName: string;
    companyDescription: string;
    businessLicense: string;
    taxNumber: string;
    website: string;
    establishedYear: string;
    address: string;
    governorate: string;
    postalCode: string;
    rating: number;
    totalReviews: number;
    totalOrders: number;
    joinDate: string;
    verified: boolean;
    trusted: boolean;
    settings?: {
        showPhone: boolean;
        showEmail: boolean;
        showAddress: boolean;
    };
}

export const useSupplierProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<SupplierProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            // 1. Get Supplier ID (Same logic as useSupplier)
            // Support both user_id and profile_id for compatibility
            const { data: supplier, error: suppError } = await supabase
                .from('suppliers')
                .select('*')
                .or(`user_id.eq.${user?.id},profile_id.eq.${user?.id}`)
                .maybeSingle();

            if (suppError) throw suppError;

            if (supplier) {
                // Map DB to Profile — using actual column names
                const mappedProfile: SupplierProfile = {
                    id: supplier.id,
                    firstName: supplier.first_name || '',
                    lastName: supplier.last_name || '',
                    email: supplier.email || '',
                    phone: supplier.phone || '',
                    avatar: supplier.logo || supplier.logo_url || '',
                    companyName: supplier.name || '',
                    companyDescription: supplier.description || '',
                    businessLicense: supplier.business_license || '',
                    taxNumber: supplier.tax_number || '',
                    website: supplier.website || '',
                    establishedYear: supplier.established_year?.toString() || '',
                    address: supplier.address || supplier.location || '',
                    governorate: supplier.governorate || '',
                    postalCode: '',
                    rating: supplier.rating || 5,
                    totalReviews: 0,
                    totalOrders: 0,
                    joinDate: supplier.created_at || new Date().toISOString(),
                    verified: supplier.is_verified || false,
                    trusted: true,
                    settings: supplier.settings || { showPhone: true, showEmail: true, showAddress: true }
                };
                setProfile(mappedProfile);
            } else {
                console.warn('No supplier found');
            }

        } catch (err: any) {
            console.error('Error fetching profile:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (updates: Partial<SupplierProfile>) => {
        if (!profile?.id) return;
        try {
            setLoading(true);

            // Map UI fields back to actual DB column names
            const dbUpdates: any = {};

            if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
            if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
            if (updates.companyName) dbUpdates.name = updates.companyName;
            if (updates.companyDescription !== undefined) dbUpdates.description = updates.companyDescription;
            if (updates.phone) dbUpdates.phone = updates.phone;
            if (updates.email) dbUpdates.email = updates.email;
            if (updates.address !== undefined) dbUpdates.address = updates.address;
            if (updates.avatar) { dbUpdates.logo = updates.avatar; } // only `logo` column exists in suppliers table
            if (updates.website !== undefined) dbUpdates.website = updates.website;
            if (updates.taxNumber !== undefined) dbUpdates.tax_number = updates.taxNumber;
            if (updates.businessLicense !== undefined) dbUpdates.business_license = updates.businessLicense;
            if (updates.establishedYear !== undefined) dbUpdates.established_year = updates.establishedYear ? parseInt(updates.establishedYear) : null;
            if (updates.governorate !== undefined) dbUpdates.governorate = updates.governorate;
            if (updates.settings) dbUpdates.settings = updates.settings;

            // Only update if we have fields to update
            if (Object.keys(dbUpdates).length > 0) {
                const { error } = await supabase
                    .from('suppliers')
                    .update(dbUpdates)
                    .eq('id', profile.id);

                if (error) throw error;

                // Sync to profiles table
                if (user?.id) {
                    const profileSync: any = {};
                    if (dbUpdates.logo) profileSync.avatar_url = dbUpdates.logo;
                    if (dbUpdates.governorate) profileSync.governorate = dbUpdates.governorate;
                    if (dbUpdates.address) profileSync.address = dbUpdates.address;
                    if (dbUpdates.phone) profileSync.phone = dbUpdates.phone;
                    if (Object.keys(profileSync).length > 0) {
                        await supabase.from('profiles').update(profileSync).eq('id', user.id);
                    }
                }
            }

            // Update local state
            setProfile(prev => prev ? ({ ...prev, ...updates }) : null);

        } catch (err: any) {
            console.error('Error updating profile:', err);
            // Revert or show error
            fetchProfile();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    return {
        profile: profile || {} as SupplierProfile,
        loading,
        updateProfile,
        refresh: fetchProfile
    };
};
