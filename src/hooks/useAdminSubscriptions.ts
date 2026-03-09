import { useState, useEffect } from 'react';
import { SubscriptionPlan, DoctorSubscriptionRequest } from '../types/admin';
import { supabase } from '../lib/supabase';

// Helper alias to match what might be used in components if they use 'SubscriptionRequest'
export type SubscriptionRequest = DoctorSubscriptionRequest;

export const useAdminSubscriptions = () => {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [requests, setRequests] = useState<DoctorSubscriptionRequest[]>([]);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);

            const { data: plansData, error: plansError } = await supabase
                .from('subscription_plans')
                .select('*')
                .order('created_at', { ascending: true }); // Simplied sort

            console.log('Plans Fetch Result:', { plansData, plansError });

            if (plansError) throw plansError;

            // Map DB snake_case to Frontend camelCase
            const mappedPlans: SubscriptionPlan[] = (plansData || []).map(p => {
                const priceData = p.price || {};
                const limits = p.limits || {};
                const featuresConfig = p.gated_features || {};

                return {
                    id: p.id,
                    name: p.name,
                    nameEn: p.name_en || p.name, // Fallback
                    price: priceData, // Pass the whole JSONB object
                    features: Array.isArray(p.features) ? p.features : (typeof p.features === 'string' ? JSON.parse(p.features) : []), // Handle JSONB or Text[]
                    isPopular: p.is_popular,
                    duration: p.duration, // Mapped from DB duration column

                    // Maps for UI (Keep these flat for easier usage in UI, or group them?)
                    // Let's keep them flat but populated from new columns
                    maxClinics: limits.max_clinics ?? 1,
                    maxPatients: limits.max_patients ?? 500,
                    maxServices: limits.max_services ?? 10,
                    aiRequestLimit: limits.max_ai ?? 0,

                    mapVisibility: featuresConfig.map ?? false,
                    isFeatured: featuresConfig.featured ?? false,
                    articleSuggestion: featuresConfig.articles ?? false,
                    digitalBooking: featuresConfig.booking ?? false,

                    hasAISupport: (limits.max_ai ?? 0) !== 0
                };
            });

            const { data: requestsData, error: requestsError } = await supabase
                .from('subscription_requests')
                .select('*, doctor:profiles!doctor_id(full_name, phone, email, avatar_url)') // Join with profiles
                .order('created_at', { ascending: false });

            if (requestsError) throw requestsError;

            // Map Requests
            const mappedRequests: any[] = (requestsData || []).map(r => ({
                id: r.id,
                doctorName: r.doctor?.full_name || r.doctor_name || 'Unknown',
                clinicName: r.clinic_name || 'Unknown',
                phone: r.doctor?.phone || r.phone || '',
                email: r.doctor?.email || r.email || '',
                avatar_url: r.doctor?.avatar_url || undefined,
                status: r.status,
                requestedPlan: mappedPlans.find(p => p.id === r.plan_id)?.name || 'Unknown Plan',
                paymentMethod: r.payment_method,
                submittedDate: r.created_at,
                user_id: r.user_id || r.doctor_id,
                receiptImageUrl: r.receipt_image_url || r.payment_details?.receiptUrl,
                paymentDetails: r.payment_details || {}
            }));

            const { data: couponsData, error: couponsError } = await supabase
                .from('coupons')
                .select('*')
                .order('created_at', { ascending: false });

            if (couponsError) throw couponsError;

            const mappedCoupons = (couponsData || []).map(c => ({
                id: c.id,
                code: c.code,
                name: c.name || '', // Ensure name is mapped
                type: c.discount_type,
                value: c.discount_value,
                usageLimit: c.usage_limit,
                usedCount: c.used_count || 0,
                startDate: c.start_date,
                endDate: c.end_date,
                isActive: c.is_active
            }));

            setPlans(mappedPlans);
            setRequests(mappedRequests);
            setCoupons(mappedCoupons);

        } catch (error) {
            console.error('Error fetching subscription data:', error);
        } finally {
            setLoading(false);
        }
    };

    const addPlan = async (plan: Omit<SubscriptionPlan, 'id'>) => {
        try {
            // Embed settings into price object
            const dbPlan = {
                name: plan.name,
                name_en: plan.nameEn,
                price: plan.price, // No longer embedding settings here
                features: plan.features,
                is_popular: plan.isPopular,
                limits: {
                    max_clinics: plan.maxClinics,
                    max_patients: plan.maxPatients,
                    max_services: plan.maxServices,
                    max_ai: plan.aiRequestLimit
                },
                gated_features: {
                    map: plan.mapVisibility,
                    booking: plan.digitalBooking,
                    featured: plan.isFeatured,
                    articles: plan.articleSuggestion
                }
            };

            const { data, error } = await supabase
                .from('subscription_plans')
                .insert([dbPlan])
                .select()
                .single();

            if (error) throw error;

            fetchData(); // Refresh to ensure sync
        } catch (error) {
            console.error('Error adding plan:', error);
        }
    };

    const updatePlan = async (id: string, updates: Partial<SubscriptionPlan>) => {
        try {
            // We need to merge settings if we are partial updating
            // But usually the form sends the whole object. 
            // Let's assume we need to fetch current first if we want deep merge, 
            // but for now let's construct what we can. 
            // Simplest is to assume 'updates' has new values for specific fields, 
            // and we need to wrap them into price.

            // Since 'price' in DB holds settings, we need to be careful not to overwrite 'currency/monthly' 
            // if we are just updating 'maxClinics'.
            // However, typically we update the whole plan from the modal.

            // Let's grab the current plan from state to merge safely
            const currentPlan = plans.find(p => p.id === id);
            if (!currentPlan) return;

            const newLimits = {
                max_clinics: updates.maxClinics ?? currentPlan.maxClinics,
                max_patients: updates.maxPatients ?? currentPlan.maxPatients,
                max_services: updates.maxServices ?? currentPlan.maxServices,
                max_ai: updates.aiRequestLimit ?? currentPlan.aiRequestLimit
            };

            const newFeaturesConfig = {
                map: updates.mapVisibility ?? currentPlan.mapVisibility,
                booking: updates.digitalBooking ?? currentPlan.digitalBooking,
                featured: updates.isFeatured ?? currentPlan.isFeatured,
                articles: updates.articleSuggestion ?? currentPlan.articleSuggestion
            };

            const dbUpdates: any = {};
            if (updates.name !== undefined) dbUpdates.name = updates.name;
            if (updates.nameEn !== undefined) dbUpdates.name_en = updates.nameEn;
            if (updates.price !== undefined) dbUpdates.price = updates.price;
            if (updates.features !== undefined) dbUpdates.features = updates.features;
            if (updates.isPopular !== undefined) dbUpdates.is_popular = updates.isPopular;

            // Always update these structurally
            dbUpdates.limits = newLimits;
            dbUpdates.gated_features = newFeaturesConfig;

            const { data, error } = await supabase
                .from('subscription_plans')
                .update(dbUpdates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            fetchData();
        } catch (error) {
            console.error('Error updating plan:', error);
        }
    };

    const deletePlan = async (id: string) => {
        try {
            const { error } = await supabase
                .from('subscription_plans')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setPlans(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting plan:', error);
        }
    };

    const approveRequest = async (id: string) => {
        try {
            // First get the request details to notify the user
            const { data: request, error: fetchError } = await supabase
                .from('subscription_requests')
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;

            // Approve
            const { error } = await supabase
                .from('subscription_requests')
                .update({ status: 'approved' })
                .eq('id', id);

            if (error) throw error;

            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));

            // Send Notification
            if (request && (request.user_id || request.doctor_id)) {
                const targetUserId = request.user_id || request.doctor_id;
                await supabase.from('notifications').insert([{
                    user_id: targetUserId,
                    type: 'system',
                    title: 'تم تفعيل الاشتراك بنجاح',
                    message: `تمت الموافقة على اشتراكك في الباقة. استمتع بجميع المميزات الآن!`,
                    read: false,
                    priority: 'high'
                }]);
            }

        } catch (error) {
            console.error('Error approving request:', error);
        }
    };

    const rejectRequest = async (id: string) => {
        try {
            const { error } = await supabase
                .from('subscription_requests')
                .update({ status: 'rejected' })
                .eq('id', id);

            if (error) throw error;
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
        } catch (error) {
            console.error('Error rejecting request:', error);
        }
    };

    const addCoupon = async (coupon: any) => {
        try {
            const { error } = await supabase
                .from('coupons')
                .insert([{
                    code: coupon.code,
                    name: coupon.name,
                    discount_type: coupon.type,
                    discount_value: coupon.value,
                    usage_limit: coupon.usageLimit,
                    start_date: coupon.startDate,
                    end_date: coupon.endDate,
                    is_active: true
                }]);

            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error('Error adding coupon:', error);
        }
    };

    const deleteCoupon = async (id: string) => {
        try {
            const { error } = await supabase
                .from('coupons')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setCoupons(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error('Error deleting coupon:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return {
        plans,
        requests,
        coupons,
        loading,
        addPlan,
        updatePlan,
        deletePlan,
        approveRequest,
        rejectRequest,
        addCoupon,
        deleteCoupon,
        refresh: fetchData
    };
};
