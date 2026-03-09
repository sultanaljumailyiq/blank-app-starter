import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Patient } from '../types';
import { toast } from 'sonner';

export const usePatient = (patientId: string | undefined) => {
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(!!patientId);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!patientId) return;
        fetchPatient();
    }, [patientId]);

    const fetchPatient = async () => {
        if (!patientId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .eq('id', patientId)
                .single();

            if (error) throw error;

            if (data) {
                // Map snake_case to camelCase
                const mappedPatient: Patient = {
                    id: data.id,
                    name: data.full_name || data.name || 'Unknown',
                    age: data.age,
                    phone: data.phone || '',
                    email: data.email || '',
                    lastVisit: data.last_visit_date,
                    totalVisits: data.total_visits || 0,
                    balance: data.balance || 0, // Assuming balance is in DB or 0
                    gender: data.gender,
                    address: data.address,
                    notes: data.notes,
                    status: data.status,
                    medicalHistory: data.medical_history,
                    clinicId: data.clinic_id,

                    // JSONB Fields
                    medicalHistoryData: data.medical_history_data || {
                        vitals: { weight: '', height: '', bp: '', sugar: '', pulse: '' },
                        conditions: [],
                        allergies: [],
                        habits: [],
                        notes: ''
                    }
                };
                setPatient(mappedPatient);
            }
        } catch (err: any) {
            console.error('Error fetching patient:', err);
            setError(err.message);
            toast.error('فشل تحميل بيانات المريض');
        } finally {
            setLoading(false);
        }
    };

    const updatePatientProfile = async (updates: Partial<Patient>) => {
        if (!patientId) return;

        // Prepare DB updates (map back to snake_case if needed, but for JSONB it's direct key)
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.full_name = updates.name;
        if (updates.medicalHistoryData) {
            dbUpdates.medical_history_data = updates.medicalHistoryData;

            // Sync with legacy columns
            if (updates.medicalHistoryData.allergies) {
                dbUpdates.allergies = updates.medicalHistoryData.allergies;

                // Construct text representation for medical_history column
                // Combine allergies and conditions or just allergies? 
                // Legacy system used medical_history primarily for alerts/history text.
                // We'll join allergies for now to maintain visibility in legacy views.
                // If conditions are also important, we might need a more complex join, 
                // but for now, syncing allergies to history text ensures "Medical Alerts" are visible.
                const alerts = [...(updates.medicalHistoryData.allergies || [])];
                if (updates.medicalHistoryData.conditions) {
                    // Optionally add conditions if they were part of the history text expectation
                    // alerts.push(...updates.medicalHistoryData.conditions);
                }
                dbUpdates.medical_history = alerts.join(',');
            }
        }
        if (updates.notes) dbUpdates.notes = updates.notes;

        // Optimistic
        setPatient(prev => prev ? { ...prev, ...updates } : null);

        try {
            const { error } = await supabase
                .from('patients')
                .update(dbUpdates)
                .eq('id', patientId);

            if (error) throw error;
            toast.success('تم تحديث البيانات بنجاح');
        } catch (err) {
            console.error('Error updating patient:', err);
            toast.error('فشل حفظ التغييرات');
        }
    };

    return {
        patient,
        loading,
        error,
        fetchPatient,
        updatePatientProfile
    };
};
