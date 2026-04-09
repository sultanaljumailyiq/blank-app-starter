import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Laboratory {
    id: string;
    name: string;
    ownerName: string;
    address: string;
    phone: string;
    email: string;
    governorate?: string;
    status: 'active' | 'pending' | 'suspended';
    commissionPercentage: number;
    totalRevenue: number;
    pendingCommission: number;
    rating: number;
    reviewCount: number;
    joinDate: string;
    labType: 'manual' | 'cooperative';
    isActive: boolean;
    isVerified: boolean;
    isAccredited: boolean;
    totalRequests: number;
    logo?: string;
}

export function useAdminLabs() {
    const [labs, setLabs] = useState<Laboratory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch labs on mount
    useEffect(() => {
        fetchLabs();
    }, []);

    const fetchLabs = async (searchTerm = '', statusFilter = 'all', governorateFilter = 'all') => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all lab profiles
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name, phone, email, avatar_url, created_at')
                .in('role', ['lab', 'laboratory']);

            if (profilesError) throw profilesError;

            if (profilesData) {
                const userIds = profilesData.map((p: any) => p.id);

                // Fetch real dental_laboratories and orders
                const [labsRes, ordersRes] = await Promise.all([
                   supabase.from('dental_laboratories').select('*').in('user_id', userIds),
                   supabase.from('dental_lab_orders').select('id, laboratory_id, final_amount, price, status, is_settled').eq('status', 'completed')
                ]);

                const labsData = labsRes.data || [];
                const ordersData = ordersRes.data || [];

                const mappedLabs: Laboratory[] = profilesData.map((profile: any) => {
                    const labRecord = labsData.find((l: any) => l.user_id === profile.id || l.owner_id === profile.id);
                    const labId = labRecord ? labRecord.id : profile.id; // Use profile id as fallback id
                    
                    // Computing manual revenue statistics
                    const commissionPercentage = labRecord?.commission_percentage || 5;
                    const labOrders = ordersData.filter((o: any) => o.laboratory_id === labId);
                    
                    const settledSales = labOrders.filter(o => o.is_settled).reduce((sum, o) => sum + (o.final_amount || o.price || 0), 0);
                    const unsettledSales = labOrders.filter(o => !o.is_settled).reduce((sum, o) => sum + (o.final_amount || o.price || 0), 0);
                    
                    const computedTotalRevenue = (settledSales * commissionPercentage) / 100;
                    const computedPendingFees = (unsettledSales * commissionPercentage) / 100;

                    return {
                        id: labId,
                        name: labRecord?.name || labRecord?.lab_name || profile.full_name || 'مختبر جديد',
                        ownerName: profile.full_name || 'مدير المختبر',
                        address: labRecord?.address || 'العنوان غير متوفر',
                        phone: labRecord?.phone || profile.phone || 'N/A',
                        email: profile.email || 'N/A',
                        governorate: labRecord?.governorate || 'غير محدد',
                        status: labRecord?.account_status || 'pending', // Usually pending if not explicitly active
                        commissionPercentage,
                        totalRevenue: computedTotalRevenue,
                        pendingCommission: computedPendingFees,
                        rating: labRecord?.rating || 0,
                        reviewCount: labRecord?.review_count || 0,
                        joinDate: labRecord?.created_at || profile.created_at,
                        labType: 'cooperative',
                        isActive: labRecord?.account_status === 'active',
                        totalRequests: 0,
                        isVerified: labRecord?.is_verified || false,
                        isAccredited: labRecord?.is_accredited || false,
                        logo: labRecord?.logo_url || profile.avatar_url || undefined,
                        userId: profile.id
                    };
                });

                let filtered = mappedLabs.filter(l =>
                    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    l.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
                );
                
                if(statusFilter !== 'all') {
                  filtered = filtered.filter(l => l.status === statusFilter);
                }

                setLabs(filtered);
            }
        } catch (err: any) {
            console.error('Error fetching labs:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const [disputes, setDisputes] = useState<any[]>([]);

    // ... (fetchLabs implementation)

    const updateCommissionRate = async (labId: string, rate: number) => {
        try {
            const { error } = await supabase
                .from('dental_laboratories')
                .update({ commission_percentage: rate })
                .eq('id', labId);

            if (error) throw error;

            setLabs(prev => prev.map(l => l.id === labId ? { ...l, commissionPercentage: rate } : l));
            return true;
        } catch (err) {
            console.error('Error updating commission:', err);
            return false;
        }
    };

    const updateLabStatus = async (labId: string, status: 'active' | 'suspended', reason?: string) => {
        try {
            // First ensure it exists using the mapped lab's user_id or id
            let actualLabId = labId;
            const { data: existing } = await supabase.from('dental_laboratories').select('id').eq('id', labId).maybeSingle();
            
            if (!existing) {
                // Try from user_id if labId was passed as profile ID
                const { data: byUser } = await supabase.from('dental_laboratories').select('id').eq('user_id', labId).maybeSingle();
                if(byUser) actualLabId = byUser.id;
                else {
                    const lab = labs.find(l => l.id === labId);
                    const { data: newLab, error: insErr } = await supabase.from('dental_laboratories').insert({ user_id: labId, name: lab?.name || 'مختبر جديد' }).select('id').single();
                    if (insErr) throw insErr;
                    actualLabId = newLab.id;
                }
            }

            const { error } = await supabase
                .from('dental_laboratories')
                .update({
                    account_status: status,
                    suspension_reason: reason || null
                })
                .eq('id', actualLabId);

            if (error) throw error;

            setLabs(prev => prev.map(l => l.id === labId ? { ...l, status } : l));
            return true;
        } catch (err) {
            console.error('Error updating status:', err);
            return false;
        }
    };

    const verifyLab = async (labId: string, isVerified: boolean) => {
        try {
            // First ensure it exists 
            let actualLabId = labId;
            const { data: existing } = await supabase.from('dental_laboratories').select('id').eq('id', labId).maybeSingle();
            if (!existing) {
                const { data: byUser } = await supabase.from('dental_laboratories').select('id').eq('user_id', labId).maybeSingle();
                if(byUser) actualLabId = byUser.id;
                else {
                    const lab = labs.find(l => l.id === labId);
                    const { data: newLab, error: insErr } = await supabase.from('dental_laboratories').insert({ user_id: labId, name: lab?.name || 'مختبر جديد' }).select('id').single();
                    if (insErr) throw insErr;
                    actualLabId = newLab.id;
                }
            }

            const { error } = await supabase
                .from('dental_laboratories')
                .update({ is_verified: isVerified })
                .eq('id', actualLabId);

            if (error) throw error;

            setLabs(prev => prev.map(l => l.id === labId ? { ...l, isVerified: isVerified, isActive: isVerified } : l));
            return true;
        } catch (err) {
            console.error('Error verifying lab:', err);
            return false;
        }
    };

    const clearCommission = async (labId: string, amount: number) => {
        try {
            if (amount <= 0) return false;

            const lab = labs.find(l => l.id === labId);

            // 1. Record the Transaction
            const { data: newTx, error: txErr } = await supabase
                .from('financial_transactions')
                .insert({
                    amount: amount,
                    type: 'expense',
                    category: 'commission_clearance',
                    status: 'completed',
                    transaction_date: new Date().toISOString(),
                    description: `Commission Payout for ${lab?.name || 'Laboratory'}`
                })
                .select('id')
                .single();

            if (txErr) throw txErr;

            await supabase.from('dental_lab_orders')
                .update({ is_settled: true, settlement_id: newTx?.id })
                .eq('laboratory_id', labId)
                .eq('status', 'completed')
                .eq('is_settled', false);

            // 2. Clear Pending Commission
            const { error: labErr } = await supabase
                .from('dental_laboratories')
                .update({ pending_commission: 0 })
                .eq('id', labId);

            if (labErr) throw labErr;

            // 3. Update Local State
            setLabs(prev => prev.map(l => l.id === labId ? { ...l, pendingCommission: 0 } : l));
            return true;
        } catch (err) {
            console.error('Error clearing commission:', err);
            return false;
        }
    };

    // Updated Disputes Logic
    const fetchDisputes = async () => {
        try {
            setLoading(true);
            // Use new lab_disputes table
            const { data, error } = await supabase
                .from('lab_disputes')
                .select(`
                    *,
                    laboratory:dental_laboratories(name),
                    clinic:clinics(name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map to expected format if needed
            setDisputes(data || []);
        } catch (err) {
            console.error('Error fetching disputes:', err);
        } finally {
            setLoading(false);
        }
    };

    const resolveDispute = async (disputeId: string, resolution: string, status: 'resolved' | 'dismissed') => {
        try {
            const { error } = await supabase
                .from('lab_disputes')
                .update({
                    status: status,
                    resolution_notes: resolution,
                    updated_at: new Date().toISOString()
                })
                .eq('id', disputeId);

            if (error) throw error;
            await fetchDisputes();
            return true;
        } catch (err) {
            console.error('Error resolving dispute:', err);
            return false;
        }
    };

    // New: Fetch Orders
    const fetchLabOrders = async (labId?: string) => {
        // This can be used by the modal
        let query = supabase.from('dental_lab_orders').select('*');
        if (labId) query = query.eq('laboratory_id', labId);

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    };

    return {
        labs,
        disputes,
        loading,
        error,
        fetchLabs,
        fetchDisputes,
        resolveDispute,
        updateCommissionRate,
        updateLabStatus,
        verifyLab,
        clearCommission,
        fetchLabOrders // Exposed
    };
}

// Mock data removed in favor of real DB data
const mockLabs: Laboratory[] = [];
