import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export interface OnlineRequest {
    id: string;
    patientName: string;
    source: string;
    date: string;
    time: string;
    phone: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    hasFile?: boolean;
    notes?: string;
    patientId?: string;
    type?: string;
}

export const useOnlineRequests = (clinicId?: string) => {
    const [requests, setRequests] = useState<OnlineRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (clinicId) {
            fetchRequests();
        }
    }, [clinicId]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('appointments')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            // Handle clinicId filter
            if (clinicId && clinicId !== 'all') {
                query = query.eq('clinic_id', clinicId);
            }

            const { data, error } = await query;

            if (error) throw error;

            if (data) {
                const mapped: OnlineRequest[] = data.map((apt: any) => ({
                    id: apt.id,
                    patientName: apt.patient_name || 'مريض غير مسجل',
                    source: apt.created_via || 'online',
                    date: apt.appointment_date || apt.date, // Handle both
                    time: apt.appointment_time || apt.time,
                    phone: apt.phone_number || apt.phone || '',
                    status: apt.status,
                    hasFile: !!apt.patient_id,
                    notes: apt.notes,
                    patientId: apt.patient_id,
                    type: apt.type
                }));
                setRequests(mapped);
            }
        } catch (err) {
            console.error('Error fetching online requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateRequestStatus = async (id: string, newStatus: 'confirmed' | 'cancelled') => {
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            toast.success(newStatus === 'confirmed' ? 'تم تأكيد الموعد بنجاح' : 'تم إلغاء الطلب');
            fetchRequests();
            return true;
        } catch (err) {
            console.error('Error updating status:', err);
            toast.error('حدث خطأ أثناء تحديث الحالة');
            return false;
        }
    };

    const linkPatientToRequest = async (requestId: string, patientId: string) => {
        try {
            // First get patient name for consistency (optional but good for denormalization if needed)
            const { data: patient } = await supabase.from('patients').select('full_name').eq('id', patientId).single();

            const { error } = await supabase
                .from('appointments')
                .update({
                    patient_id: patientId,
                    patient_name: patient?.full_name // Update name to match file
                })
                .eq('id', requestId);

            if (error) throw error;

            toast.success('تم ربط المريض بالموعد بنجاح');
            fetchRequests();
            return true;
        } catch (err) {
            console.error('Error linking patient:', err);
            toast.error('فشل ربط المريض');
            return false;
        }
    };

    return {
        requests,
        loading,
        refresh: fetchRequests,
        confirmRequest: (id: string) => updateRequestStatus(id, 'confirmed'),
        cancelRequest: (id: string) => updateRequestStatus(id, 'cancelled'),
        linkPatientToRequest
    };
};
