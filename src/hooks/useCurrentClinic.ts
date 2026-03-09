import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface CurrentClinic {
    id: string; // Returns stringified ID (e.g., "1")
    name: string;
    role: 'owner' | 'admin' | 'doctor' | 'staff';
}

export const useCurrentClinic = () => {
    const { user } = useAuth();
    const [clinic, setClinic] = useState<CurrentClinic | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        fetchClinic();
    }, [user]);

    const fetchClinic = async () => {
        try {
            setLoading(true);

            // 1. Check if Owner
            const { data: ownedClinic } = await supabase
                .from('clinics')
                .select('id, name')
                .eq('owner_id', user!.id)
                .single();

            if (ownedClinic) {
                setClinic({
                    id: ownedClinic.id.toString(),
                    name: ownedClinic.name,
                    role: 'owner'
                });
                return;
            }

            // 2. Check if Member
            const { data: memberParams } = await supabase
                .from('clinic_members')
                .select('clinic_id, role, clinic:clinics(name)')
                .eq('user_id', user!.id)
                .single();

            if (memberParams && (memberParams as any).clinic) {
                setClinic({
                    id: memberParams.clinic_id.toString(),
                    name: (memberParams as any).clinic.name,
                    role: memberParams.role as any
                });
                return;
            }

            // No clinic found
            setClinic(null);

        } catch (err) {
            console.error('Error fetching current clinic:', err);
        } finally {
            setLoading(false);
        }
    };

    return { clinic, loading, refresh: fetchClinic };
};
