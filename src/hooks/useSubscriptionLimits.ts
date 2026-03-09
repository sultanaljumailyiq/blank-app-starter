import { useDoctorSubscription } from './useDoctorSubscription';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useSubscriptionLimits = (currentClinicId?: string) => {
    const { subscription, loading: subLoading } = useDoctorSubscription();
    const { user } = useAuth();
    const [counts, setCounts] = useState({
        clinics: 0,
        patients: 0,
        services: 0,
        aiUsedToday: 0
    });
    const [loadingCounts, setLoadingCounts] = useState(true);

    const limits = subscription?.plan?.limits || { max_clinics: 1, max_patients: 10, max_services: 5, max_ai: 0 };
    const features = subscription?.plan?.gatedFeatures || { map: false, booking: false, featured: false, articles: false };

    useEffect(() => {
        if (user) {
            fetchCounts();
        }
    }, [user, currentClinicId]);

    const fetchCounts = async () => {
        if (!user) return;
        setLoadingCounts(true);
        try {
            // 1. Global Clinics Count (Always per owner)
            const { count: clinicsCount } = await supabase
                .from('clinics')
                .select('*', { count: 'exact', head: true })
                .eq('owner_id', user.id);

            // 2. Patients Count (Per Clinic or Global if no clinicId specified)
            let patientsCount = 0;

            if (currentClinicId) {
                // Per-clinic count
                const { count } = await supabase
                    .from('patients')
                    .select('*', { count: 'exact', head: true })
                    .eq('clinic_id', currentClinicId);
                patientsCount = count || 0;
            } else {
                // Logic: If no clinic ID, maybe we shouldn't sum them? 
                // User said "limits calculated for account owner... e.g. 10 per clinic".
                // So if checking global, we might not have a specific number vs limit.
                // But typically this hook is used inside a clinic context.
                // If used globally (dashboard), showing "total" might be confusing vs "limit per clinic".
                // For now, if no ID, we effectively track 0 or maybe specific global logic?
                // Let's default to 0 if no clinic context for patient/ai checks, 
                // as those checks should happen IN a clinic.
                patientsCount = 0;
            }

            // 3. AI Usage (Per Clinic)
            // Mocking for now, but would follow same pattern:
            const aiUsage = 0;

            setCounts({
                clinics: clinicsCount || 0,
                patients: patientsCount,
                services: 0,
                aiUsedToday: aiUsage
            });

        } catch (err) {
            console.error("Error fetching usage counts", err);
        } finally {
            setLoadingCounts(false);
        }
    };

    const checkLimit = (type: 'clinics' | 'patients' | 'services' | 'ai'): { allowed: boolean, message?: string } => {
        if (!subscription) return { allowed: true };

        const labels = {
            clinics: 'العيادات',
            patients: 'المرضى',
            services: 'الخدمات',
            ai: 'طلبات الذكاء الاصطناعي'
        };

        const contextLabels = {
            clinics: 'حسابك',
            patients: 'هذه العيادة',
            services: 'هذه العيادة',
            ai: 'هذه العيادة'
        };

        let limit = 0;
        let current = 0;

        switch (type) {
            case 'clinics':
                limit = limits.max_clinics;
                current = counts.clinics;
                break;
            case 'patients':
                limit = limits.max_patients;
                current = counts.patients;
                break;
            case 'services':
                limit = limits.max_services;
                current = counts.services; // Pending real count
                break;
            case 'ai':
                limit = limits.max_ai;
                current = counts.aiUsedToday;
                break;
        }

        if (limit === -1) return { allowed: true };

        if (current >= limit) {
            return {
                allowed: false,
                message: `لقد وصلت إلى الحد الأقصى المسموح به (${limit}) من ${labels[type]} في ${contextLabels[type]}. يرجى ترقية باقتك لإضافة المزيد.`
            };
        }

        return { allowed: true };
    };

    const hasFeature = (feature: keyof typeof features): boolean => {
        return !!features[feature];
    };

    return {
        limits,
        features,
        counts,
        loading: subLoading || loadingCounts,
        checkLimit,
        hasFeature,
        planName: subscription?.plan?.name,
        refreshCounts: fetchCounts
    };
};
