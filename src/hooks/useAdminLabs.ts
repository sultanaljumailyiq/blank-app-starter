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

            let query = supabase
                .from('dental_laboratories')
                .select('*');

            if (statusFilter !== 'all') {
                // query = query.eq('account_status', statusFilter); // If column exists
            }

            const { data, error } = await query;

            if (error) throw error;

            if (data) {
                // Fetch owner profiles in parallel to avoid Join issues
                const userIds = data.map((l: any) => l.user_id).filter(id => id); // Filter nulls

                let profileMap: Record<string, { full_name: string; phone: string; email: string; avatar_url: string }> = {};
                if (userIds.length > 0) {
                    const { data: profilesData } = await supabase
                        .from('profiles')
                        .select('id, full_name, phone, email, avatar_url')
                        .in('id', userIds);

                    if (profilesData) {
                        profilesData.forEach((p: any) => {
                            profileMap[p.id] = {
                                full_name: p.full_name || 'مدير المختبر',
                                phone: p.phone || 'N/A',
                                email: p.email || 'N/A',
                                avatar_url: p.avatar_url
                            };
                        });
                    }
                }

                const mappedLabs: Laboratory[] = data.map((lab: any) => {
                    const owner = profileMap[lab.user_id];
                    return {
                        id: lab.id,
                        name: lab.name || 'مختبر',
                        ownerName: owner?.full_name || 'مدير المختبر',
                        address: lab.address || 'العنوان غير متوفر',
                        phone: owner?.phone || lab.phone || 'N/A',
                        email: owner?.email || lab.email || 'N/A',
                        governorate: lab.governorate || 'بغداد',
                        status: lab.account_status || 'pending',
                        commissionPercentage: lab.commission_percentage || 5, // Default 5%
                        totalRevenue: 0, // Need to join with orders or view
                        pendingCommission: lab.pending_commission || 0,
                        rating: lab.rating || 5,
                        reviewCount: 0,
                        joinDate: lab.created_at,
                        labType: 'cooperative',
                        isActive: lab.account_status === 'active',
                        totalRequests: 0,
                        isVerified: lab.is_verified || false,
                        isAccredited: lab.is_accredited || false,
                        logo: lab.logo_url || owner?.avatar_url || undefined
                    };
                });

                // Fetch stats from Admin View if possible or specific query
                const { data: statsData } = await supabase.from('admin_lab_performance_view').select('lab_id, total_revenue, pending_fees');

                const labsWithStats = mappedLabs.map(l => {
                    const stats = statsData?.find((s: any) => s.lab_id === l.id);
                    return {
                        ...l,
                        totalRevenue: stats ? stats.total_revenue : 0,
                        pendingCommission: stats ? stats.pending_fees : l.pendingCommission
                    };
                });

                const filtered = labsWithStats.filter(l =>
                    l.name.toLowerCase().includes(searchTerm.toLowerCase())
                );

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
            const { error } = await supabase
                .from('dental_laboratories')
                .update({
                    account_status: status,
                    suspension_reason: reason || null
                })
                .eq('id', labId);

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
            const { error } = await supabase
                .from('dental_laboratories')
                .update({ is_verified: isVerified })
                .eq('id', labId);

            if (error) throw error;

            setLabs(prev => prev.map(l => l.id === labId ? { ...l, isVerified: isVerified, isActive: isVerified } : l));
            return true;
        } catch (err) {
            console.error('Error verifying lab:', err);
            return false;
        }
    };

    const clearCommission = async (labId: string) => {
        try {
            const lab = labs.find(l => l.id === labId);
            if (!lab || lab.pendingCommission <= 0) return false;

            // 1. Record the Transaction
            const { error: txError } = await supabase.from('financial_transactions').insert({
                lab_id: labId,
                amount: lab.pendingCommission,
                type: 'settlement',
                category: 'commission_clearance',
                status: 'completed',
                transaction_date: new Date().toISOString(),
                description: `Commission Payout for ${lab.name}`
            });

            if (txError) throw txError;

            // 2. Clear Pending Commission
            const { error } = await supabase
                .from('dental_laboratories')
                .update({ pending_commission: 0 })
                .eq('id', labId);

            if (error) throw error;

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
