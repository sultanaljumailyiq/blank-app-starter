import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface LabRequest {
    id: string;
    clinicName: string;
    doctorName: string;
    type: string;
    description: string;
    status: 'pending' | 'accepted' | 'rejected';
    date: string;
    urgency: 'normal' | 'urgent';
    contactPhone: string;
}

export const useLabRequests = () => {
    const [requests, setRequests] = useState<LabRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('dental_lab_requests')
                .select(`
                    *,
                    clinic:clinics(name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mappedRequests: LabRequest[] = (data || []).map((req: any) => ({
                id: req.id,
                clinicName: req.clinic?.name || 'عيادة غير محددة',
                doctorName: req.doctor_name,
                type: req.type,
                description: req.description,
                status: req.status,
                date: req.created_at,
                urgency: req.urgency,
                contactPhone: req.contact_phone
            }));

            setRequests(mappedRequests);
        } catch (err) {
            console.error('Error fetching lab requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateRequestStatus = async (id: string, status: 'accepted' | 'rejected') => {
        try {
            const { error } = await supabase
                .from('dental_lab_requests')
                .update({ status })
                .eq('id', id);

            if (error) throw error;

            setRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
        } catch (err) {
            console.error('Error updating request status:', err);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    return {
        requests,
        loading,
        updateRequestStatus,
        refresh: fetchRequests
    };
};
