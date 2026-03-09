import { useState, useEffect } from 'react';
import { ToothCondition, TreatmentPlan, TreatmentSession } from '../types/treatment';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

// Mock data for fallback or initial state
const INITIAL_TEETH: ToothCondition[] = Array.from({ length: 32 }, (_, i) => {
    let num = 0;
    // FDI Numbering Logic (Same as in Component)
    if (i < 8) num = 18 - i;
    else if (i < 16) num = 21 + (i - 8);
    else if (i < 24) num = 38 - (i - 16);
    else num = 41 + (i - 24);

    return {
        number: num,
        condition: 'healthy',
        notes: '',
        existingTreatments: []
    };
});

export const usePatientTreatments = (patientId: string | undefined) => {
    const { user } = useAuth();
    const [teeth, setTeeth] = useState<ToothCondition[]>(INITIAL_TEETH);
    const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial Fetch
    useEffect(() => {
        if (!patientId) return;
        fetchData();
    }, [patientId]);

    const fetchData = async () => {
        if (!patientId) return;
        setLoading(true);
        try {
            // 1. Fetch Teeth Conditions
            const { data: dbTeeth, error: teethError } = await supabase
                .from('patient_teeth')
                .select('*')
                .eq('patient_id', patientId);

            if (teethError) throw teethError;

            // Merge with initial
            if (dbTeeth) {
                const mergedTeeth = INITIAL_TEETH.map(initial => {
                    const found = dbTeeth.find(t => t.tooth_number === initial.number);
                    if (found) {
                        return {
                            ...initial,
                            condition: found.condition,
                            notes: found.notes || '',
                            // Diagnosis can be mapped here if needed
                        };
                    }
                    return initial;
                });
                setTeeth(mergedTeeth);
            } else {
                setTeeth(INITIAL_TEETH);
            }

            // 2. Fetch Treatment Plans joined with Sessions
            const { data: dbPlans, error: plansError } = await supabase
                .from('tooth_treatment_plans')
                .select(`
                    *,
                    sessions:treatment_sessions(*)
                `)
                .eq('patient_id', patientId)
                .order('created_at', { ascending: false });

            if (plansError) throw plansError;

            const mappedPlans: TreatmentPlan[] = (dbPlans || []).map(p => ({
                id: p.id,
                patientId: p.patient_id,
                toothNumber: p.tooth_number || 0,
                toothNumbers: p.tooth_numbers || undefined,
                type: (p.treatment_type as any) || 'general',
                status: p.status,
                totalSessions: p.session_count,
                completedSessions: p.completed_sessions,
                progress: p.session_count > 0 ? Math.round((p.completed_sessions / p.session_count) * 100) : 0,
                cost: p.estimated_cost,
                paid: p.paid || 0,
                startDate: p.estimated_start_date || p.created_at.split('T')[0],
                notes: p.treatment_description || '',
                doctor: p.assigned_doctor, // Map from DB
                sessions: (p.sessions || [])
                    .sort((a: any, b: any) => a.session_number - b.session_number)
                    .map((s: any) => ({
                        id: s.id,
                        number: s.session_number,
                        title: s.procedure_name,
                        status: s.session_status === 'scheduled' ? 'pending' : s.session_status,
                        duration: s.duration_minutes || 0,
                        schemaId: s.phase_name || 'general', // Using phase_name to store schemaId
                        data: s.notes ? JSON.parse(s.notes) : {} // Storing session data in notes as JSON for flexibility
                    }))
            }));

            setTreatmentPlans(mappedPlans);
        } catch (err: any) {
            console.error('Error fetching treatments:', err);
            setError(err.message);
            toast.error('فشل تحميل بيانات العلاج');
        } finally {
            setLoading(false);
        }
    };

    const updateTooth = async (toothNumber: number, condition: string, notes: string) => {
        if (!patientId) return;
        if (toothNumber === 0) return; // Skip update for general treatments

        // Optimistic Update Local
        setTeeth(prev => prev.map(t => t.number === toothNumber ? { ...t, condition: condition as any, notes } : t));

        try {
            const { error } = await supabase
                .from('patient_teeth')
                .upsert({
                    patient_id: patientId,
                    tooth_number: toothNumber,
                    condition: condition,
                    notes: notes,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'patient_id,tooth_number' });

            if (error) throw error;

        } catch (err) {
            console.error('Error updating tooth:', err);
            toast.error('فشل حفظ حالة السن');
            // Rollback could go here
        }
    };

    const addPlan = async (plan: TreatmentPlan) => {
        if (!patientId || !user) return;

        // Optimistic
        setTreatmentPlans(prev => [plan, ...prev]);

        try {
            // 1. Insert Plan
            const { data: planData, error: planError } = await supabase
                .from('tooth_treatment_plans')
                .insert({
                    patient_id: patientId,
                    tooth_number: plan.toothNumber,
                    tooth_numbers: plan.toothNumbers || null,
                    treatment_type: plan.type,
                    status: 'planned',
                    overall_status: 'needs_treatment',
                    session_count: plan.totalSessions,
                    completed_sessions: 0,
                    estimated_cost: plan.cost,
                    diagnosis: plan.notes, // Mapping notes to diagnosis/description
                    treatment_description: plan.notes,
                    assigned_doctor: (user as any).user_metadata?.full_name || user.email || 'Unknown',
                    created_by: user.id
                })
                .select()
                .single();

            if (planError) throw planError;

            // 2. Insert Sessions
            const sessionsToInsert = plan.sessions.map((s, idx) => ({
                plan_id: planData.id,
                session_number: s.number,
                session_date: new Date().toISOString().split('T')[0], // Default to today
                start_time: '09:00', // Default
                procedure_name: s.title,
                session_status: 'scheduled',
                duration_minutes: s.duration,
                phase_name: s.schemaId, // Storing schemaId
                notes: JSON.stringify(s.data || {})
            }));

            const { error: sessionsError } = await supabase
                .from('treatment_sessions')
                .insert(sessionsToInsert);

            if (sessionsError) throw sessionsError;

            toast.success('تم إنشاء خطة العلاج بنجاح');
            // Refresh to get real IDs
            fetchData();

        } catch (err) {
            console.error('Error adding plan:', err);
            toast.error('فشل حفظ خطة العلاج');
        }
    };

    const updateSession = async (planId: string, sessionId: string, data: any) => {
        if (!patientId) return;

        // Optimistic
        setTreatmentPlans(prev => prev.map(p => {
            if (p.id !== planId) return p;
            return {
                ...p,
                sessions: p.sessions.map(s => s.id === sessionId ? { ...s, data } : s)
            };
        }));

        try {
            // If it's a temp ID (optimistic creation not yet synced), we can't update properly.
            // But usually we refresh after add.
            if (sessionId.startsWith('sess-')) return;

            const { error } = await supabase
                .from('treatment_sessions')
                .update({
                    notes: JSON.stringify(data) // Storing structured data in notes for now
                })
                .eq('id', sessionId);

            if (error) throw error;
        } catch (err) {
            console.error('Error updating session:', err);
            // toast.error('فشل حفظ بيانات الجلسة'); // Silent save preferred usually
        }
    };

    const updatePlan = async (planId: string, updates: Partial<TreatmentPlan>) => {
        if (!patientId) return;

        // Optimistic Update
        setTreatmentPlans(prev => prev.map(p => p.id === planId ? { ...p, ...updates } : p));

        try {
            // We only support updating specific fields for now in DB mapping
            // For 'paid' field specifically:
            if (updates.paid !== undefined) {
                const { error } = await supabase
                    .from('tooth_treatment_plans')
                    .update({ paid: updates.paid })
                    .eq('id', planId);
                if (error) throw error;
            }

            // For other fields, add logic as needed

        } catch (err) {
            console.error('Error updating plan:', err);
            // Revert logic would go here
            toast.error('فشل تحديث الخطة');
        }
    };

    const completeSession = async (planId: string, sessionId: string, cost: number) => {
        if (!patientId) return;

        // Optimistic
        setTreatmentPlans(prev => prev.map(p => {
            if (p.id !== planId) return p;
            const updatedSessions = p.sessions.map(s => s.id === sessionId ? { ...s, status: 'completed' as const } : s);
            const completedCount = updatedSessions.filter(s => s.status === 'completed').length;
            return {
                ...p,
                sessions: updatedSessions,
                completedSessions: completedCount,
                progress: Math.round((completedCount / p.totalSessions) * 100)
            };
        }));

        try {
            // 1. Update Session
            const { error: sessionError } = await supabase
                .from('treatment_sessions')
                .update({
                    session_status: 'completed',
                    amount_charged: cost,
                    updated_at: new Date().toISOString()
                })
                .eq('id', sessionId);

            if (sessionError) throw sessionError;

            // 2. Update Plan Counters (Can be done via trigger, but doing manually for safety)
            // Retrieve current count first
            const { data: planData } = await supabase.from('tooth_treatment_plans').select('completed_sessions, session_count').eq('id', planId).single();
            if (planData) {
                const newCount = planData.completed_sessions + 1;
                const status = newCount >= planData.session_count ? 'completed' : 'in_progress';

                await supabase.from('tooth_treatment_plans').update({
                    completed_sessions: newCount,
                    status: status,
                    overall_status: status === 'completed' ? 'post_treatment' : 'in_progress'
                }).eq('id', planId);
            }

            toast.success('تم إكمال الجلسة');
        } catch (err) {
            console.error('Error completing session:', err);
            toast.error('فشل تحديث الحالة');
        }
    };

    const deletePlan = async (planId: string) => {
        if (!patientId) return;

        // Optimistic
        setTreatmentPlans(prev => prev.filter(p => p.id !== planId));

        try {
            const { error } = await supabase
                .from('tooth_treatment_plans')
                .delete()
                .eq('id', planId);

            if (error) throw error;
            toast.success('تم حذف الخطة');
        } catch (err) {
            console.error('Error deleting plan:', err);
            toast.error('فشل حذف الخطة');
            // Rollback could be added here
        }
    };

    return {
        teeth,
        treatmentPlans,
        updateTooth,
        addPlan,
        updateSession,
        updatePlan,
        completeSession,
        deletePlan,
        loading,
        error
    };
};
