import { useState, useEffect, useRef } from 'react';
import { Appointment } from '../types/appointments';
import { supabase } from '../lib/supabase';

export const useAppointments = (clinicId?: string) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        // Only fetch when a clinic context is provided
        if (clinicId !== undefined) {
            fetchAppointments();
        } else {
            // No clinic context → clear data, don't fetch
            setAppointments([]);
            setLoading(false);
        }
        return () => { mountedRef.current = false; };
    }, [clinicId]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            // First try with 'appointment_date' column (actual DB schema)
            let query = supabase
                .from('appointments')
                .select('*, staff:staff_id(full_name)') // Join with staff to get name
                .order('appointment_date', { ascending: false })
                .order('appointment_time', { ascending: false });

            // Fetch user session first to apply fallback logic
            const { data: { user } } = await supabase.auth.getUser();

            if (clinicId && clinicId !== 'all') {
                query = query.eq('clinic_id', clinicId);
            } else if (user && user.user_metadata?.role !== 'admin') {
                // If 'all' is selected, strictly bind to user's clinics to prevent leaking
                const { data: ownedClinics } = await supabase.from('clinics').select('id').eq('owner_id', user.id);
                const { data: staffClinics } = await supabase.from('staff').select('clinic_id').or(`user_id.eq.${user.id},auth_user_id.eq.${user.id}`).in('status', ['active', 'on_leave']);
                
                const accessibleIds = [
                    ...(ownedClinics?.map(c => c.id) || []),
                    ...(staffClinics?.map(c => c.clinic_id) || [])
                ];
                
                if (accessibleIds.length > 0) {
                    query = query.in('clinic_id', accessibleIds);
                } else {
                    // Prevent returning anything if they have no clinics
                    query = query.in('clinic_id', [-1]); 
                }
            }

            let { data, error } = await query;

            // If appointment_date doesn't exist, try 'date'
            if (error && error.code === '42703') {
                query = supabase
                    .from('appointments')
                    .select('*, staff:staff_id(full_name)')
                    .order('created_at', { ascending: false }); // Fallback to created_at

                if (clinicId && clinicId !== 'all') {
                    query = query.eq('clinic_id', clinicId);
                } else if (user && user.user_metadata?.role !== 'admin') {
                    const { data: ownedClinics } = await supabase.from('clinics').select('id').eq('owner_id', user.id);
                    const { data: staffClinics } = await supabase.from('staff').select('clinic_id').or(`user_id.eq.${user.id},auth_user_id.eq.${user.id}`).in('status', ['active', 'on_leave']);
                    
                    const accessibleIds = [
                        ...(ownedClinics?.map(c => c.id) || []),
                        ...(staffClinics?.map(c => c.clinic_id) || [])
                    ];
                    
                    if (accessibleIds.length > 0) {
                        query = query.in('clinic_id', accessibleIds);
                    } else {
                        query = query.in('clinic_id', [-1]); 
                    }
                }

                const result = await query;
                data = result.data;
                error = result.error;
            }

            if (error) throw error;

            const mappedAppointments: Appointment[] = (data || []).map((a: any) => ({
                id: a.id,
                clinicId: a.clinic_id?.toString(),
                patientId: a.patient_id?.toString(),
                patientName: a.patient_name,
                doctorId: a.staff_id?.toString(),
                doctorName: a.doctor_name || a.staff?.full_name,
                date: a.appointment_date || a.date,
                time: a.appointment_time || a.time || a.start_time, // Support multiple formats
                startTime: a.start_time || a.appointment_time,
                endTime: a.end_time,
                duration: a.duration || 30,
                type: a.type || a.appointment_type,
                status: a.status,
                title: a.title,
                priority: a.priority || 'normal',
                notes: a.notes,
                cost: a.cost,
                patientPhone: a.patient_phone || '',
                createdAt: a.created_at || '',
                createdBy: a.created_by || ''
            }));

            setAppointments(mappedAppointments);
        } catch (err: any) {
            if (err?.name === 'AbortError' || err?.message?.includes('AbortError')) return;
            if (mountedRef.current) console.error('Error fetching appointments:', err);
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    };

    const createAppointment = async (appointment: Appointment) => {
        try {
            const newApt = {
                clinic_id: clinicId || appointment.clinicId || '101',
                patient_id: appointment.patientId,
                staff_id: appointment.doctorId ? Number(appointment.doctorId) : null,
                patient_name: appointment.patientName,
                doctor_name: appointment.doctorName,
                appointment_date: appointment.date,
                appointment_time: appointment.startTime || appointment.time,
                start_time: appointment.startTime || appointment.time,
                end_time: appointment.endTime,
                duration: appointment.duration,
                type: appointment.type,
                status: appointment.status || 'scheduled',
                title: appointment.title,
                priority: appointment.priority,
                notes: appointment.notes,
                cost: appointment.cost || 0
            };

            const { error } = await supabase.from('appointments').insert(newApt);
            if (error) throw error;
            fetchAppointments();
        } catch (err) {
            console.error('Error creating appointment:', err);
        }
    };

    const updateAppointment = async (updatedAppointment: Appointment) => {
        try {
            const updates: any = {
                appointment_date: updatedAppointment.date,
                appointment_time: updatedAppointment.startTime || updatedAppointment.time,
                start_time: updatedAppointment.startTime || updatedAppointment.time,
                end_time: updatedAppointment.endTime,
                duration: updatedAppointment.duration,
                status: updatedAppointment.status,
                type: updatedAppointment.type,
                title: updatedAppointment.title,
                priority: updatedAppointment.priority,
                notes: updatedAppointment.notes
            };

            const { error } = await supabase.from('appointments').update(updates).eq('id', updatedAppointment.id);
            if (error) throw error;
            fetchAppointments();
        } catch (err) {
            console.error('Error updating appointment:', err);
        }
    };

    const deleteAppointment = async (id: string) => {
        try {
            const { error } = await supabase.from('appointments').delete().eq('id', id);
            if (error) throw error;
            fetchAppointments();
        } catch (err) {
            console.error('Error deleting appointment:', err);
        }
    };

    return {
        appointments,
        loading,
        createAppointment,
        updateAppointment,
        deleteAppointment,
        refresh: fetchAppointments
    };
};
