import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { startOfMonth, endOfMonth, subMonths, format, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

export interface AnalyticsData {
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    monthlyRevenue: { month: string; amount: number }[];
    topClinics: { name: string; orders: number; revenue: number }[];
    topServices: { name: string; count: number }[];
}

export const useLabAnalytics = () => {
    const { user } = useAuth();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) fetchAnalytics();
    }, [user]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);

            // 1. Get Lab ID
            const { data: labData } = await supabase
                .from('dental_laboratories')
                .select('id')
                .or(`id.eq.${user?.id},user_id.eq.${user?.id}`)
                .maybeSingle();

            if (!labData) return;

            // 2. Fetch All Orders for this Lab
            const { data: orders, error: ordersError } = await supabase
                .from('dental_lab_orders')
                .select(`
                    id, 
                    status, 
                    total_cost, 
                    created_at,
                    clinic:clinics(name),
                    items:dental_lab_order_items(service_name)
                `)
                .eq('lab_id', labData.id);

            if (ordersError) throw ordersError;

            // 3. Process Data
            const totalOrders = orders.length;
            const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed').length;
            const pendingOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'completed' && o.status !== 'cancelled').length;

            // Revenue (only from completed/delivered? or all? usually delivered)
            // Let's assume delivered/completed count towards revenue
            const validOrders = orders; // or filter by status if needed
            const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total_cost || 0), 0);

            // Monthly Revenue (Last 6 Months)
            const last6Months = Array.from({ length: 6 }, (_, i) => {
                const date = subMonths(new Date(), i);
                return {
                    month: format(date, 'MMM', { locale: ar }),
                    key: format(date, 'yyyy-MM'),
                    amount: 0
                };
            }).reverse();

            orders.forEach(o => {
                const monthKey = format(parseISO(o.created_at), 'yyyy-MM');
                const monthEntry = last6Months.find(m => m.key === monthKey);
                if (monthEntry) {
                    monthEntry.amount += (o.total_cost || 0);
                }
            });

            // Top Clinics
            const clinicStats: Record<string, { name: string, orders: number, revenue: number }> = {};
            orders.forEach(o => {
                const name = (o.clinic as any)?.name || 'Unknown';
                if (!clinicStats[name]) clinicStats[name] = { name, orders: 0, revenue: 0 };
                clinicStats[name].orders += 1;
                clinicStats[name].revenue += (o.total_cost || 0);
            });
            const topClinics = Object.values(clinicStats)
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5);

            // Top Services
            const serviceStats: Record<string, number> = {};
            orders.forEach(o => {
                o.items?.forEach((item: any) => {
                    const name = item.service_name;
                    serviceStats[name] = (serviceStats[name] || 0) + 1;
                });
            });
            const topServices = Object.entries(serviceStats)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            setData({
                totalRevenue,
                totalOrders,
                completedOrders,
                pendingOrders,
                monthlyRevenue: last6Months,
                topClinics,
                topServices
            });

        } catch (err: any) {
            console.error('Analytics Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error, refetch: fetchAnalytics };
};
