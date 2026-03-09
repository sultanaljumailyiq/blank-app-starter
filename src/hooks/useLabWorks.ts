import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface LabWork {
    id: number;
    orderNumber: string; // We might need to generate this or use ID
    clinicId: number;
    clinicName?: string; // Fetched via join
    patientName: string;
    testType: string;
    status: 'pending' | 'in_progress' | 'completed' | 'delivered' | 'cancelled';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    cost: number;
    requestDate: string;
    expectedDate?: string;
    notes?: string;
    labTechnician?: string;
    description?: string;
}

export const useLabWorks = () => {
    const { user } = useAuth();
    const [works, setWorks] = useState<LabWork[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchLabWorks();
        }
    }, [user]);

    const fetchLabWorks = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('lab_works')
                .select(`
          *,
          clinics (
            name
          )
        `)
                .eq('lab_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedWorks: LabWork[] = data.map((item: any) => ({
                id: item.id,
                orderNumber: `LAB-${item.id}`,
                clinicId: item.clinic_id,
                clinicName: item.clinics?.name || 'Unknown Clinic',
                patientName: item.patient_name,
                testType: item.test_type,
                status: item.status,
                priority: item.priority || 'normal',
                cost: item.cost,
                requestDate: item.request_date,
                expectedDate: item.expected_completion_date,
                notes: item.notes,
                labTechnician: item.lab_technician,
                description: item.description
            }));
            setWorks(formattedWorks);
        } catch (err: any) {
            console.error('Error fetching lab works:', err);
            // Fallback for demo if no real data
            if (err.message) setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, status: string) => {
        try {
            const { error } = await supabase
                .from('lab_works')
                .update({ status })
                .eq('id', id)
                .eq('lab_id', user?.id);

            if (error) throw error;
            setWorks(prev => prev.map(w => w.id === id ? { ...w, status: status as any } : w));
        } catch (err) {
            console.error('Error updating status:', err);
            throw err;
        }
    };

    return {
        works,
        loading,
        error,
        refresh: fetchLabWorks,
        updateStatus
    };
};
