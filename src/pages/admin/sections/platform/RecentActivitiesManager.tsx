import React, { useState, useEffect } from 'react';
import { Card } from '../../../../components/common/Card';
import { supabase } from '../../../../lib/supabase';
import {
    Activity,
    UserPlus,
    ShoppingCart,
    CheckCircle,
    AlertTriangle,
    FileText,
    Clock
} from 'lucide-react';

export const RecentActivitiesManager = () => {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('activity_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            if (data) setActivities(data);
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();

        // Realtime subscription
        const channel = supabase
            .channel('activity_logs_channel')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'activity_logs' },
                (payload) => {
                    setActivities((prev) => [payload.new, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'user_register': return UserPlus;
            case 'order_complete': return CheckCircle;
            case 'payment_received': return ShoppingCart;
            case 'system_alert': return AlertTriangle;
            default: return Activity;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'user_register': return 'blue';
            case 'order_complete': return 'green';
            case 'payment_received': return 'purple';
            case 'system_alert': return 'red';
            default: return 'gray';
        }
    };

    if (loading && activities.length === 0) return <div className="text-center py-8">جاري تحميل النشاطات...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div>
                    <h3 className="font-bold text-lg text-gray-900">سجل النشاطات</h3>
                    <p className="text-gray-500 text-sm">تتبع آخر العمليات والأحداث في المنصة</p>
                </div>
            </div>

            <Card className="p-0 border border-gray-200 shadow-sm bg-white overflow-hidden rounded-xl">
                <div className="divide-y divide-gray-100">
                    {activities.length > 0 ? activities.map((activity) => {
                        const Icon = getIcon(activity.type);
                        const color = getColor(activity.type);
                        const timeAgo = new Date(activity.created_at).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });
                        const date = new Date(activity.created_at).toLocaleDateString('ar-IQ');

                        return (
                            <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-4">
                                <div className={`p-2 rounded-lg bg-${color}-100 text-${color}-600 mt-1`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-gray-900">{activity.user_name || 'System'}</h4>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {date} {timeAgo}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{activity.details || activity.type}</p>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="p-8 text-center text-gray-500">لا توجد نشاطات مسجلة بعد.</div>
                    )}
                </div>
                <div className="p-4 bg-gray-50 text-center">
                    <button className="text-sm text-blue-600 font-medium hover:underline">
                        عرض سجـل كامل
                    </button>
                </div>
            </Card>
        </div>
    );
};
