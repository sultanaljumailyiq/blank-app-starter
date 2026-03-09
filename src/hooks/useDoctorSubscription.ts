import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface PlanLimits {
    max_clinics: number;
    max_patients: number;
    max_services: number;
    max_ai: number; // -1 for unlimited
}

export interface PlanGatedFeatures {
    map: boolean;
    booking: boolean;
    featured: boolean;
    articles: boolean;
}

export interface DoctorSubscription {
    id: string;
    plan: {
        id: string;
        name: string;
        features: string[]; // This is the text array for display
        limits: PlanLimits;
        gatedFeatures: PlanGatedFeatures;
    };
    status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';
    startDate: string;
    endDate: string;
    daysRemaining: number;
}

export const useDoctorSubscription = () => {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<DoctorSubscription | null>(null);
    const [loading, setLoading] = useState(true);
    const mountedRef = useRef(true);

    const fetchSubscription = async () => {
        if (!user) return;

        try {
            setLoading(true);

            // Fetch the latest approved subscription
            const { data, error } = await supabase
                .from('subscription_requests')
                .select('*, plan:subscription_plans(*)')
                .or(`doctor_id.eq.${user.id},user_id.eq.${user.id}`)
                .in('status', ['approved', 'pending'])
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
                console.error('Error fetching subscription:', error);
                return;
            }

            if (data) {
                // Calculate expiry logic (assuming 1 year or 1 month duration based on plan)
                // For now, we'll assume monthly if not specified or default to 30 days from approval

                const approvalDate = new Date(data.updated_at || data.created_at); // Use updated_at as approval time roughly
                const duration = data.plan?.duration === 'yearly' ? 365 : 30;
                const endDate = new Date(approvalDate);
                endDate.setDate(endDate.getDate() + duration);

                const now = new Date();
                const diffTime = Math.abs(endDate.getTime() - now.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const isExpired = now > endDate;

                setSubscription({
                    id: data.id,
                    plan: {
                        id: data.plan?.id,
                        name: data.plan?.name || 'Unknown Plan',
                        features: Array.isArray(data.plan?.features)
                            ? data.plan.features
                            : (typeof data.plan?.features === 'string'
                                ? tryParseJSON(data.plan.features)
                                : []),
                        limits: data.plan?.limits || { max_clinics: 1, max_patients: 100, max_services: 10, max_ai: 0 },
                        gatedFeatures: data.plan?.gated_features || { map: false, booking: false, featured: false, articles: false }
                        // Note: Database column is 'features' (JSONB) but we also have 'features' text array? 
                        // Wait, previous migration said: features TEXT[] DEFAULT '{}'. 
                        // My new migration added 'features JSONB'. 
                        // Supabase/PostgREST might alias one? 
                        // Actually, duplicate column names are not allowed in SQL.
                        // "features TEXT[]" was existing.
                        // My migration: "ADD COLUMN IF NOT EXISTS features JSONB".
                        // Use a different name in migration?
                        // "features JSONB" vs "features TEXT[]". Postgres allows overloading? No.
                        // I might have caused a conflict if "features" column already existed as TEXT[].
                        // Let me check if the migration succeeded perfectly or if it likely failed on name collision.
                        // The tool output said "Result Row Count: undefined".
                    },
                    status: isExpired ? 'expired' : data.status,
                    startDate: approvalDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    daysRemaining: isExpired ? 0 : diffDays
                });
            } else {
                setSubscription(null);
            }

        } catch (error: any) {
            if (error?.name === 'AbortError' || error?.message?.includes('AbortError')) return;
            if (mountedRef.current) console.error(error);
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    };

    useEffect(() => {
        mountedRef.current = true;
        fetchSubscription();
        return () => { mountedRef.current = false; };
    }, [user]);

    return { subscription, loading, refresh: fetchSubscription };
};

const tryParseJSON = (jsonString: string): string[] => {
    try {
        const parsed = JSON.parse(jsonString);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
};
