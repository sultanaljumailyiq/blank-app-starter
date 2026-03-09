import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface AdminStoreStats {
    totalProducts: number;
    totalSuppliers: number;
    activeOrders: number;
    totalRevenue: number;
    activePromotions: number;
    activeCoupons: number;
    pendingDealRequests: number;
    activeCards: number;
    products: { total: number; active: number; outOfStock: number };
}

export const useAdminStore = () => {
    const [stats, setStats] = useState<AdminStoreStats>({
        totalProducts: 0,
        totalSuppliers: 0,
        activeOrders: 0,
        totalRevenue: 0,
        activePromotions: 0,
        activeCoupons: 0,
        pendingDealRequests: 0,
        activeCards: 0,
        products: { total: 0, active: 0, outOfStock: 0 }
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);

            // 1. Products
            const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
            const { count: activeProductCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active');

            // 2. Suppliers
            const { count: supplierCount } = await supabase.from('suppliers').select('*', { count: 'exact', head: true });

            // 3. Orders (Active)
            const { count: orderCount } = await supabase.from('store_orders').select('*', { count: 'exact', head: true });

            // 4. Revenue (Sum of delivered orders or financial records)
            // Using financial_records if populated, else mock sum of orders for demo
            const { data: revenueData } = await supabase.from('store_orders').select('total_amount').eq('status', 'delivered');
            const revenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

            // 5. Promotions & Coupons
            const { count: promoCount } = await supabase.from('promotions').select('*', { count: 'exact', head: true }).eq('is_active', true);
            const { count: couponCount } = await supabase.from('coupons').select('*', { count: 'exact', head: true }).eq('is_active', true);

            // 6. Deal Requests
            const { count: dealReqCount } = await supabase.from('offer_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');

            // 7. Cards
            const { count: cardCount } = await supabase.from('promotional_cards').select('*', { count: 'exact', head: true }).eq('is_active', true);

            setStats({
                totalProducts: productCount || 0,
                totalSuppliers: supplierCount || 0,
                activeOrders: orderCount || 0,
                totalRevenue: revenue,
                activePromotions: promoCount || 0,
                activeCoupons: couponCount || 0,
                pendingDealRequests: dealReqCount || 0,
                activeCards: cardCount || 0,
                products: {
                    total: productCount || 0,
                    active: activeProductCount || 0,
                    outOfStock: (productCount || 0) - (activeProductCount || 0)
                }
            });

        } catch (error) {
            console.error('Error fetching admin store stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return { stats, loading, refresh: fetchStats };
};
