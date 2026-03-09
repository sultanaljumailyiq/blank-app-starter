import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export interface Laboratory {
    id: string; // UUID from Supabase
    lab_name: string;
    owner_name?: string;
    address: string;
    phone: string;
    governorate?: string;
    email?: string;
    rating: number;
    description?: string;
    specialties: string[];
    is_verified?: boolean;
    is_accredited?: boolean;
    working_hours?: string;
    response_time?: string;
    is_custom?: boolean;
    services?: Array<{
        name: string;
        price: number;
        time_estimate: number;
    }>;
}

export const useLabs = (options?: { clinicId?: string }) => {
    const { user } = useAuth();
    const [labs, setLabs] = useState<Laboratory[]>([]);
    const [savedLabs, setSavedLabs] = useState<Laboratory[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLabs = async (searchQuery: string = '', specialty?: string) => {
        try {
            setLoading(true);

            // 1. Fetch Platform Labs
            let platformQuery = supabase
                .from('dental_laboratories')
                .select('*')
                .eq('account_status', 'active') // Only Active Labs
                .limit(50);

            if (searchQuery) platformQuery = platformQuery.ilike('lab_name', `%${searchQuery}%`);
            if (specialty) platformQuery = platformQuery.contains('specialties', [specialty]);

            const { data: platformData, error: platformError } = await platformQuery;
            if (platformError) throw platformError;

            // 2. Fetch Custom Labs
            let customLabsData: any[] = [];
            let targetClinicId = options?.clinicId;

            // If no clinicId provided, try to find it from user context
            if (!targetClinicId && user) {
                const { data: clinic } = await supabase
                    .from('clinics')
                    .select('id')
                    .eq('owner_id', user.id)
                    .single();
                if (clinic) targetClinicId = clinic.id;
            }

            if (targetClinicId) {
                const { data: customData, error: customError } = await supabase
                    .from('clinic_custom_labs')
                    .select('*')
                    .eq('clinic_id', targetClinicId);

                if (!customError && customData) {
                    customLabsData = customData.map(l => ({
                        id: l.id,
                        lab_name: l.name,
                        address: l.address,
                        phone: l.phone,
                        governorate: 'Local',
                        rating: 0,
                        is_custom: true, // Marker for UI
                        specialties: l.specialties || []
                    }));
                }
            }

            setLabs(platformData || []);
            setSavedLabs(customLabsData);

        } catch (error) {
            console.error('Error fetching labs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getLabById = async (id: string) => {
        try {
            // Check platform first
            const { data, error } = await supabase
                .from('dental_laboratories')
                .select('*')
                .eq('id', id)
                .single();

            if (data) return data as Laboratory;

            // Check custom
            const { data: customData } = await supabase
                .from('clinic_custom_labs')
                .select('*')
                .eq('id', id)
                .single();

            if (customData) {
                return {
                    id: customData.id,
                    lab_name: customData.name,
                    address: customData.address,
                    phone: customData.phone,
                    governorate: 'Local',
                    rating: 0,
                    is_custom: true, // Marker
                    specialties: customData.specialties || []
                } as Laboratory;
            }

            return null;
        } catch (error) {
            console.error('Error fetching lab details:', error);
            return null;
        }
    };

    useEffect(() => {
        fetchLabs();
    }, [options?.clinicId]);

    return {
        labs,        // Platform Labs
        savedLabs,   // Custom/Saved Labs
        loading,
        fetchLabs,
        getLabById
    };
};
