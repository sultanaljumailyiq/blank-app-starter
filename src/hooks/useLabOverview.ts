import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface LabStats {
    totalOrders: number;
    completedToday: number;
    avgCompletionTime: number;
    avgRating: number;
    pendingOrders: number;
    inProgressOrders: number;
    totalRevenue: number;
    activeReps: number;
}

export interface LabNotification {
    id: string;
    type: 'order' | 'message' | 'warning' | 'info';
    title: string;
    content: string;
    timestamp: string;
    isNew: boolean;
}

export interface RecentOrder {
    id: string;
    patientName: string;
    clinicName: string;
    workType: string;
    status: 'pending' | 'in_progress' | 'completed' | 'delayed';
    date: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    expectedTime: string;
}

export interface RatingDistribution {
    stars: number;
    count: number;
    percentage: number;
}

const MOCK_STATS: LabStats = {
    totalOrders: 156,
    completedToday: 12,
    avgCompletionTime: 2.5,
    avgRating: 4.8,
    pendingOrders: 8,
    inProgressOrders: 15,
    totalRevenue: 15600000,
    activeReps: 2
};

const MOCK_NOTIFICATIONS: LabNotification[] = [
    {
        id: 'NOT001',
        type: 'order',
        title: 'طلب جديد من عيادة د. أحمد النجار',
        content: 'تاج خزفي عاجل - المريض: فاطمة محمد',
        timestamp: '2025-12-08T09:00:00',
        isNew: true
    },
    {
        id: 'NOT002',
        type: 'message',
        title: 'رسالة من عيادة د. سارة أحمد',
        content: 'شكراً لكم على الجودة العالية في العمل الأخير',
        timestamp: '2025-12-08T08:30:00',
        isNew: false
    },
    {
        id: 'NOT003',
        type: 'warning',
        title: 'تنبيه: انتهاء مواد أولية',
        content: 'مادة البورسلين المستخدمة في التيجان قاربت على النفاد',
        timestamp: '2025-12-07T14:45:00',
        isNew: false
    }
];

const MOCK_RECENT_ORDERS: RecentOrder[] = [
    {
        id: 'LAB-2024-156',
        patientName: 'أحمد محمد العلي',
        clinicName: 'عيادة د. سارة أحمد',
        workType: 'تاج خزفي كامل',
        status: 'completed',
        date: '2025-12-08',
        priority: 'normal',
        expectedTime: '2 ساعة'
    },
    {
        id: 'LAB-2024-157',
        patientName: 'فاطمة حسن إبراهيم',
        clinicName: 'عيادة د. محمد السبعاوي',
        workType: 'طقم أسنان جزئي',
        status: 'in_progress',
        date: '2025-12-08',
        priority: 'high',
        expectedTime: '4 ساعات'
    },
    {
        id: 'LAB-2024-158',
        patientName: 'خالد أحمد محمود',
        clinicName: 'عيادة د. علي النجار',
        workType: 'تلبيسة زيركون',
        status: 'pending',
        date: '2025-12-07',
        priority: 'urgent',
        expectedTime: '3 ساعات'
    }
];

const MOCK_RATING_DIST: RatingDistribution[] = [
    { stars: 5, count: 120, percentage: 76 },
    { stars: 4, count: 25, percentage: 16 },
    { stars: 3, count: 8, percentage: 5 },
    { stars: 2, count: 2, percentage: 1 },
    { stars: 1, count: 1, percentage: 0.6 }
];

export const useLabOverview = () => {
    const [stats, setStats] = useState<LabStats>(MOCK_STATS);
    const [notifications, setNotifications] = useState<LabNotification[]>([]);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [ratingDist, setRatingDist] = useState<RatingDistribution[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOverviewData = async () => {
        try {
            setLoading(true);

            // Real Data Fetch
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch Real Data in Parallel
            const [ordersResponse, repsResponse] = await Promise.all([
                supabase
                    .from('dental_lab_orders')
                    .select('id, status, created_at, price, patient_name, service_name, priority, clinic:clinics(name)')
                    .eq('laboratory_id', user.id)
                    .order('created_at', { ascending: false }),
                supabase
                    .from('dental_lab_representatives')
                    .select('id, status')
                    .eq('laboratory_id', user.id)
            ]);

            if (ordersResponse.error) throw ordersResponse.error;

            const orders = ordersResponse.data || [];
            const reps = repsResponse.data || [];

            // Calculate Stats
            const totalOrders = orders.length;
            const pendingOrders = orders.filter(o => o.status === 'pending').length;
            const inProgressOrders = orders.filter(o => o.status === 'in_progress').length;
            const activeReps = reps.filter(r => r.status === 'available' || r.status === 'on-the-way').length;

            // Completed Today
            const today = new Date().toISOString().split('T')[0];
            const completedToday = orders.filter(o =>
                o.status === 'completed' &&
                new Date(o.created_at).toISOString().split('T')[0] === today
            ).length;

            const totalRevenue = orders
                .filter(o => o.status === 'completed')
                .reduce((sum, o) => sum + (Number(o.price) || 0), 0);

            // Map Recent Orders
            const mappedRecentOrders: RecentOrder[] = orders.slice(0, 5).map(o => ({
                id: o.id.slice(0, 8),
                patientName: o.patient_name,
                clinicName: (o.clinic as any)?.name || 'عيادة غير محددة',
                workType: o.service_name,
                status: o.status as any,
                date: o.created_at,
                priority: o.priority as any,
                expectedTime: '---'
            }));

            setStats({
                totalOrders,
                completedToday,
                avgCompletionTime: 2.5,
                avgRating: 4.8,
                pendingOrders,
                inProgressOrders,
                totalRevenue,
                activeReps
            });

            setRecentOrders(mappedRecentOrders);
            setRatingDist(MOCK_RATING_DIST); // Keep existing mock for distribution

            // Notifications
            const generatedNotifications: LabNotification[] = orders
                .filter(o => o.status === 'pending')
                .slice(0, 3)
                .map(o => ({
                    id: `not-${o.id}`,
                    type: 'order',
                    title: 'طلب جديد',
                    content: `طلب جديد للمريض ${o.patient_name}`,
                    timestamp: o.created_at,
                    isNew: true
                }));

            setNotifications(generatedNotifications.length > 0 ? generatedNotifications : MOCK_NOTIFICATIONS);

        } catch (error) {
            console.error('Error fetching lab overview:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOverviewData();
    }, []);

    return {
        stats,
        notifications,
        recentOrders,
        ratingDist,
        loading,
        refresh: fetchOverviewData
    };
};
