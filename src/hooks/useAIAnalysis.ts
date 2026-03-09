import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { aiService } from '../services/ai/AIService';
import { AIAnalysisResult } from '../types/ai';
import { toast } from 'sonner';

export interface AIAnalysis {
    id: string;
    image_url: string;
    status: 'processing' | 'completed' | 'failed';
    analysis_result: AIAnalysisResult | null;
    created_at: string;
    patient_id?: number;
}

export const useAIAnalysis = (patientId?: string, clinicId?: number) => {
    const { user } = useAuth();
    const [history, setHistory] = useState<AIAnalysis[]>([]);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    const [credits, setCredits] = useState<string>('...');

    useEffect(() => {
        if (user) {
            fetchHistory();
            fetchCredits();
        }
    }, [user, patientId, clinicId]);

    const fetchCredits = async () => {
        if (!user) return;
        try {
            // Validate if user is owner or staff to find clinic_id
            let targetClinicId = clinicId;

            if (!targetClinicId) {
                // Check Owner
                const { data: ownedClinic } = await supabase.from('clinics').select('id').eq('owner_id', user.id).single();
                if (ownedClinic) {
                    targetClinicId = ownedClinic.id;
                } else {
                    // Check Staff
                    const { data: staffMember } = await supabase.from('staff').select('clinic_id').eq('auth_user_id', user.id).single();
                    if (staffMember) targetClinicId = staffMember.clinic_id;
                }
            }

            if (!targetClinicId) {
                setCredits('غير معرف');
                return;
            }

            // Get Subscription limits
            const { data: clinic } = await supabase.from('clinics').select('owner_id').eq('id', targetClinicId).single();
            if (!clinic) return;

            const { data: sub } = await supabase
                .from('user_subscriptions')
                .select('subscription_plans(limits)')
                .eq('user_id', clinic.owner_id)
                .in('status', ['active', 'trialing'])
                .single();

            let maxAi = 0;
            const plan = Array.isArray(sub?.subscription_plans) ? sub.subscription_plans[0] : sub?.subscription_plans;

            if (plan?.limits) {
                const limits = typeof plan.limits === 'string' ? JSON.parse(plan.limits) : plan.limits;
                maxAi = (limits as any).max_ai ?? 0;
            }

            if (maxAi === -1) {
                setCredits('غير محدود');
                return;
            }

            // Count usage (Daily)
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const { count } = await supabase
                .from('ai_usage_logs')
                .select('*', { count: 'exact', head: true })
                .eq('clinic_id', targetClinicId)
                .gte('created_at', startOfDay.toISOString());

            const used = count || 0;
            setCredits(`${maxAi - used} / ${maxAi}`);

        } catch (e) {
            console.error('Failed to fetch credits', e);
            setCredits('غير متاح');
        }
    };

    const fetchHistory = async () => {
        if (!user) return;

        let query = supabase
            .from('ai_analyses')
            .select('*')
            .order('created_at', { ascending: false });

        if (patientId) {
            query = query.eq('patient_id', patientId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching AI history:', error);
        } else {
            setHistory(data || []);
        }
    };

    const resolveClinicId = async (): Promise<number | undefined> => {
        if (clinicId) return clinicId;

        // Check Owner
        const { data: ownedClinic } = await supabase.from('clinics').select('id').eq('owner_id', user?.id).single();
        if (ownedClinic) return ownedClinic.id;

        // Check Staff
        const { data: staffMember } = await supabase.from('staff').select('clinic_id').eq('auth_user_id', user?.id).single();
        if (staffMember) return staffMember.clinic_id;

        return undefined;
    };

    const saveAnalysisToHistory = async (imageUrl: string, status: 'processing' | 'completed', result?: AIAnalysisResult, overridePatientId?: number) => {
        if (!user) return null;

        const targetPatientId = overridePatientId || (patientId ? parseInt(patientId) : undefined);
        const resolvedClinicId = await resolveClinicId();

        const { data, error } = await supabase
            .from('ai_analyses')
            .insert({
                clinic_id: resolvedClinicId,
                image_url: imageUrl,
                status: status,
                patient_id: targetPatientId,
                analysis_result: result || null
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    };

    const analyzeImage = async (file: File, overridePatientId?: number) => {
        if (!user) return;
        setUploading(true);
        try {
            // 1. Upload Image to Storage
            const filename = `ai/${user.id}/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from('patient-docs')
                .upload(filename, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('patient-docs').getPublicUrl(filename);
            setUploading(false);
            setAnalyzing(true);

            // 2. Create DB Entry (Processing)
            const analysisEntry = await saveAnalysisToHistory(publicUrl, 'processing', undefined, overridePatientId);

            // Update UI immediately
            if (analysisEntry) {
                setHistory(prev => [analysisEntry, ...prev]);
            }

            // 3. Trigger AI Service Analysis
            const resolvedClinicId = await resolveClinicId();
            const result = await aiService.analyzeImage(publicUrl, undefined, undefined, resolvedClinicId);

            // 4. Update DB Entry (Completed)
            if (analysisEntry) {
                const { error: updateError } = await supabase
                    .from('ai_analyses')
                    .update({
                        status: 'completed',
                        result_json: result
                    })
                    .eq('id', analysisEntry.id);

                if (updateError) throw updateError;

                // Update UI with result
                setHistory(prev => prev.map(item =>
                    item.id === analysisEntry.id
                        ? { ...item, status: 'completed', result_json: result }
                        : item
                ));

                // Refresh credits after usage
                fetchCredits();
            }

            toast.success('تم اكتمال التحليل بنجاح');
            return result;

        } catch (error: any) {
            console.error('Analysis failed:', error);
            toast.error(error.message || 'فشل في عملية التحليل');
            setUploading(false); // Ensure uploading state is reset on error
            throw error;
        } finally {
            setAnalyzing(false);
        }
    };

    const analyzeExistingImage = async (url: string) => {
        if (!user) return;
        setAnalyzing(true);
        try {
            const targetPatientId = patientId ? parseInt(patientId) : undefined;
            const resolvedClinicId = await resolveClinicId();

            // 1. Create DB Entry (Processing)
            // saveAnalysisToHistory resolves clinicId internally, so we don't need to pass it unless we want to override?
            // Actually my previous edit made saveAnalysisToHistory call resolveClinicId.
            const analysisEntry = await saveAnalysisToHistory(url, 'processing', undefined, targetPatientId);

            if (analysisEntry) {
                setHistory(prev => [analysisEntry, ...prev]);
            }

            // 2. Trigger AI Service Analysis
            const result = await aiService.analyzeImage(url, undefined, undefined, resolvedClinicId);

            // 3. Update DB
            if (analysisEntry) {
                const { error: updateError } = await supabase
                    .from('ai_analyses')
                    .update({
                        status: 'completed',
                        analysis_result: result
                    })
                    .eq('id', analysisEntry.id);

                if (updateError) throw updateError;

                setHistory(prev => prev.map(item =>
                    item.id === analysisEntry.id
                        ? { ...item, status: 'completed', analysis_result: result }
                        : item
                ));

                fetchCredits();
            }

            toast.success('تم تحليل الصورة من الأرشيف');
            return result;

        } catch (error: any) {
            console.error('Archive analysis failed:', error);
            toast.error('فشل تحليل الصورة');
            throw error;
        } finally {
            setAnalyzing(false);
        }
    };

    const deleteAnalysis = async (id: string, imageUrl?: string) => {
        if (!user) return;
        try {
            // 1. Delete from DB
            const { error } = await supabase
                .from('ai_analyses')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // 2. Remove from Local State
            setHistory(prev => prev.filter(item => item.id !== id));

            toast.success('تم حذف السجل بنجاح');

            // 3. Optional: Delete from Storage if needed (TODO)
            if (imageUrl) {
                try {
                    // Extract path from public URL if possible, or just ignore for now as RLS might block
                    // Storage deletion is often tricky with RLS.
                } catch (e) {
                    console.warn('Failed to delete image from storage', e);
                }
            }

        } catch (error: any) {
            console.error('Delete failed:', error);
            toast.error('فشل حذف السجل');
        }
    };

    return {
        history,
        uploading,
        analyzing,
        analyzeImage,
        analyzeExistingImage,
        deleteAnalysis,
        refresh: () => { fetchHistory(); fetchCredits(); },
        credits
    };
};
