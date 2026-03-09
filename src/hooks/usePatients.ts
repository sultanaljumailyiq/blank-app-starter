import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export interface PatientData {
    id: string;
    clinicId: string;
    name: string;
    age: number;
    gender: 'male' | 'female';
    phone: string;
    email?: string;
    address?: string;
    status: 'active' | 'inactive' | 'emergency';
    paymentStatus: 'paid' | 'pending' | 'overdue';
    lastVisit: string;
    totalVisits: number;
    balance: number;
    medicalHistory?: string;
    notes?: string;
}

export const usePatients = (clinicId?: string) => {
    const { user } = useAuth();
    const [patients, setPatients] = useState<PatientData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        fetchPatients();
        return () => { mountedRef.current = false; };
    }, [clinicId, user]);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            let query = supabase.from('patients').select('*').is('deleted_at', null);

            if (clinicId) {
                query = query.eq('clinic_id', clinicId);
            } else if (user?.id) {
                // If no specific clinic, filter by user access (implied RLS or verify here)
            }

            query = query.order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) throw error;

            const mappedPatients: PatientData[] = (data || []).map((p: any) => ({
                id: p.id,
                clinicId: p.clinic_id?.toString(),
                name: p.full_name || p.name,
                age: p.age || 0,
                gender: p.gender || 'male',
                phone: p.phone,
                email: p.email,
                address: p.address,
                status: p.status || 'active',
                paymentStatus: 'paid', // Default
                lastVisit: p.created_at,
                totalVisits: 1, // Mock
                balance: 0,
                medicalHistory: p.medical_history ? JSON.stringify(p.medical_history) : '',
                notes: ''
            }));

            setPatients(mappedPatients);
            setError(null);
        } catch (err: any) {
            if (err?.name === 'AbortError' || err?.message?.includes('AbortError')) return;
            if (mountedRef.current) {
                console.error('Error fetching patients:', err);
                setError('Failed to load patients');
            }
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    };

    const logActivity = async (action: string, entityId: string, details: any) => {
        try {
            await supabase.from('activity_logs').insert({
                clinic_id: clinicId,
                action_type: action,
                entity_type: 'patient',
                entity_id: entityId,
                details
            });
        } catch (e) {
            console.error('Failed to log activity', e);
        }
    };

    const createPatient = async (newPatient: any) => {
        try {
            const patientData = {
                clinic_id: clinicId || newPatient.clinicId || '101',
                full_name: newPatient.name,
                phone: newPatient.phone,
                age: newPatient.age,
                gender: newPatient.gender,
                email: newPatient.email,
                address: newPatient.address,
                notes: newPatient.notes,
                medical_history: newPatient.medicalHistory ? JSON.parse(JSON.stringify(newPatient.medicalHistory)) : [],
                status: 'active'
            };

            const { data, error } = await supabase.from('patients').insert(patientData).select().single();
            if (error) throw error;

            await logActivity('create_patient', data.id, { name: data.full_name });
            fetchPatients();
            return data;
        } catch (err) {
            console.error('Error creating patient:', err);
            throw err;
        }
    };

    const updatePatient = async (id: string, updates: any) => {
        try {
            const dbUpdates: any = {};
            if (updates.name) dbUpdates.full_name = updates.name;
            if (updates.phone) dbUpdates.phone = updates.phone;
            if (updates.status) dbUpdates.status = updates.status;
            // Add other fields mapping as needed

            const { error } = await supabase.from('patients').update(dbUpdates).eq('id', id);
            if (error) throw error;

            await logActivity('update_patient', id, updates);
            fetchPatients();
        } catch (err) {
            console.error('Error updating patient:', err);
        }
    };

    const deletePatient = async (id: string) => {
        try {
            // Soft delete
            const { error } = await supabase
                .from('patients')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            await logActivity('delete_patient', id, { reason: 'Soft delete from UI' });
            fetchPatients();
        } catch (err) {
            console.error('Error deleting patient:', err);
        }
    };

    // Check if we need to expose restorePatient?
    // Usually restore is done from Activity Log or Trash, which might use a generic restore function.
    // unlikely to be called from this hook unless we have a trash view.
    // check tasks: "Undo" from Activity Log.

    return {
        patients,
        loading,
        error,
        createPatient,
        deletePatient,
        updatePatient,
        refresh: fetchPatients
    };
};
