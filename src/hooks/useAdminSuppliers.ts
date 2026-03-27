import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Helper interface for Supplier
export interface Supplier {
    id: string;
    user_id?: string;
    profile_id?: string;
    companyName: string;
    ownerName: string;
    email: string;
    phoneNumber: string;
    category: string;
    location: string;
    status: 'pending' | 'approved' | 'active' | 'rejected' | 'suspended';
    commissionPercentage: number;
    totalSales: number;
    pendingCommission: number;
    rating: number;
    ordersCount: number;
    productsCount: number;
    joinDate: string;
    description?: string;
    documents?: string[];
    logo?: string;
}

export function useAdminSuppliers() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('suppliers')
                .select(`
                    *,
                    products:products(count),
                    profile:profiles(avatar_url, full_name, phone, banned)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                // Fetch all delivered orders for aggregates
                const { data: allOrders } = await supabase
                    .from('store_orders')
                    .select('supplier_id, total_amount, status, is_settled')
                    .eq('status', 'delivered');

                // Map data from snake_case DB to camelCase Interface
                const mapped: Supplier[] = data.map((s: any) => {
                    const profileData = Array.isArray(s.profile) ? s.profile[0] : s.profile;
                    const isBanned = profileData?.banned === true;
                    // Derive status: suspended if banned, approved if verified, pending otherwise
                    const status: Supplier['status'] = isBanned ? 'suspended' : (s.is_verified ? 'approved' : 'pending');

                    const supplierOrders = allOrders?.filter((o: any) => 
                        o.supplier_id === s.id || (s.user_id && o.supplier_id === s.user_id)
                    ) || [];
                    const computedTotalSales = supplierOrders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
                    const unsettledOrders = supplierOrders.filter((o: any) => !o.is_settled);
                    const unsettledSales = unsettledOrders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
                    const computedPendingCommission = (unsettledSales * (s.commission_percentage || 0)) / 100;

                    return {
                        id: s.id,
                        user_id: s.user_id,
                        profile_id: s.profile_id,
                        companyName: s.name || 'Unknown Company',
                        ownerName: s.contact_person || s.owner_name || profileData?.full_name || 'غير محدد',
                        email: s.email || '',
                        phoneNumber: s.phone || s.phone_number || profileData?.phone || 'N/A',
                        category: s.category || 'General',
                        location: s.address || s.location || 'Baghdad',
                        status,
                        commissionPercentage: s.commission_percentage || 0,
                        totalSales: computedTotalSales,
                        pendingCommission: computedPendingCommission,
                        rating: s.rating || 5,
                        ordersCount: supplierOrders.length,
                        productsCount: s.products ? s.products[0]?.count : (s.supplier_products ? s.supplier_products[0]?.count : 0),
                        joinDate: s.created_at || new Date().toISOString(),
                        description: s.description,
                        documents: s.documents || [],
                        logo: s.logo || profileData?.avatar_url || undefined
                    };
                });
                setSuppliers(mapped);
            } else {
                setSuppliers([]);
            }

        } catch (err: any) {
            console.error('Error fetching suppliers:', err);
            setError(err.message);
            // Don't fallback to mocks anymore, rely on DB (even if empty initially)
            // setSuppliers([]); 
        } finally {
            setLoading(false);
        }
    };

    const updateCommissionRate = async (supplierId: string, rate: number) => {
        try {
            // Optimistic update
            setSuppliers(prev => prev.map(s => s.id === supplierId ? { ...s, commissionPercentage: rate } : s));

            const { error } = await supabase
                .from('suppliers')
                .update({ commission_percentage: rate })
                .eq('id', supplierId);

            if (error) throw error;
            return true;
        } catch (err) {
            console.error('Error updating commission:', err);
            return false;
        }
    };

    const updateSupplierStatus = async (supplierId: string, status: 'approved' | 'rejected' | 'suspended') => {
        try {
            setSuppliers(prev => prev.map(s => s.id === supplierId ? { ...s, status } : s));

            const isSuspending = status === 'suspended';
            const isApproved = status === 'approved';

            // Update suppliers.is_verified
            const { error: supErr } = await supabase
                .from('suppliers')
                .update({ is_verified: isApproved })
                .eq('id', supplierId);

            // Update profiles.banned (suspend = ban, approve = unban)
            const { error: profErr } = await supabase
                .from('profiles')
                .update({ banned: isSuspending })
                .eq('id', supplierId);

            if (supErr || profErr) throw supErr || profErr;
            return true;
        } catch (err) {
            console.error('Error updating status:', err);
            return false;
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const clearCommission = async (supplierId: string, amount: number) => {
        try {
            if (amount <= 0) return false;

            const supplier = suppliers.find(s => s.id === supplierId);

            // 1. Record the Transaction
            const { data: newTx, error: txErr } = await supabase
                .from('financial_transactions')
                .insert({
                    supplier_id: supplierId,
                    amount: amount,
                    type: 'expense', // Expense for platform (payout)
                    category: 'commission_clearance',
                    status: 'completed',
                    transaction_date: new Date().toISOString(),
                    description: `Commission Payout for ${supplier?.companyName || 'Supplier'}`
                })
                .select('id')
                .single();

            if (txErr) throw txErr;

            // 1.5 Mark Orders as Settled
            await supabase
                .from('store_orders')
                .update({ is_settled: true, settlement_id: newTx.id })
                .or(`supplier_id.eq.${supplierId}${supplier?.user_id ? `,supplier_id.eq.${supplier.user_id}` : ''}`)
                .eq('status', 'delivered')
                .eq('is_settled', false);

            // 2. Clear Pending Commission
            const { error } = await supabase
                .from('suppliers')
                .update({ pending_commission: 0 })
                .eq('id', supplierId);

            if (error) throw error;

            // 3. Update Local State
            setSuppliers(prev => prev.map(s => s.id === supplierId ? { ...s, pendingCommission: 0 } : s));
            return true;
        } catch (err) {
            console.error('Error clearing commission:', err);
            return false;
        }
    };

    return {
        suppliers,
        loading,
        error,
        fetchSuppliers,
        updateCommissionRate,
        updateSupplierStatus,
        clearCommission
    };
}
