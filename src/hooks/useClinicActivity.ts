import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export interface ActivityLog {
    id: string;
    action: string; // e.g., 'CREATE_PATIENT', 'DELETE_APPOINTMENT'
    entityType: 'patient' | 'appointment' | 'inventory' | 'financial' | 'settings';
    entityId?: string;
    description: string;
    performedBy: string; // Staff Name
    performedAt: string;
    metadata?: any; // To store restore data (e.g. deleted patient object)
    loading?: boolean;
}

export const useClinicActivity = (clinicId: string) => {
    const { user } = useAuth();
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        type: 'all',
        staffId: 'all',
        dateRange: '7d' // 7d, 30d, all
    });

    useEffect(() => {
        if (user) {
            fetchActivities();
        }
    }, [user, clinicId, filters]);

    const fetchActivities = async () => {
        setLoading(true);
        const allLogs: ActivityLog[] = [];

        try {
            // 1. Fetch from 'activity_logs' (System Logs)
            let logQuery = supabase.from('activity_logs').select('*');
            if (clinicId && clinicId !== 'all') logQuery = logQuery.eq('clinic_id', clinicId);
            const { data: logs } = await logQuery;

            if (logs) {
                logs.forEach((item: any) => {
                    allLogs.push({
                        id: item.id,
                        action: item.action_type || item.action,
                        entityType: item.entity_type,
                        description: item.details ? JSON.stringify(item.details) : item.description,
                        performedBy: 'النظام', // Placeholder or fetch user
                        performedAt: item.created_at,
                        metadata: item.details
                    });
                });
            }

            // 2. Fetch Patients (Mapped to 'patient' activity)
            if (user) {
                let patQuery = supabase
                    .from('patients')
                    .select('id, full_name, created_at, clinic_id')
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (clinicId && clinicId !== 'all') patQuery = patQuery.eq('clinic_id', clinicId);
                const { data: patients } = await patQuery;

                if (patients) {
                    patients.forEach((p: any) => {
                        allLogs.push({
                            id: `pat-${p.id}`,
                            action: 'تسجيل مريض',
                            entityType: 'patient',
                            entityId: p.id,
                            description: `تم تسجيل ملف مريض جديد: ${p.full_name}`,
                            performedBy: 'موظف الاستقبال',
                            performedAt: p.created_at
                        });
                    });
                }
            }

            // 3. Fetch Appointments (Mapped to 'appointment' activity)
            if (user) {
                let aptQuery = supabase
                    .from('appointments')
                    .select('id, patient_name, status, type, created_at, clinic_id')
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (clinicId && clinicId !== 'all') aptQuery = aptQuery.eq('clinic_id', clinicId);
                const { data: appointments } = await aptQuery;

                if (appointments) {
                    appointments.forEach((a: any) => {
                        allLogs.push({
                            id: `apt-${a.id}`,
                            action: a.status === 'pending' ? 'حجز جديد' : 'تحديث موعد',
                            entityType: 'appointment',
                            entityId: a.id,
                            description: `موعد جديد للمريض ${a.patient_name} (${a.type})`,
                            performedBy: 'النظام',
                            performedAt: a.created_at
                        });
                    });
                }
            }

            // 4. Fetch Inventory Items (Mapped to 'inventory' activity)
            if (user) {
                let invQuery = supabase
                    .from('inventory')
                    .select('id, item_name, quantity, unit, created_at, clinic_id')
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (clinicId && clinicId !== 'all') invQuery = invQuery.eq('clinic_id', clinicId);
                const { data: inventory } = await invQuery;

                if (inventory) {
                    inventory.forEach((i: any) => {
                        allLogs.push({
                            id: `inv-${i.id}`,
                            action: 'إضافة مادة',
                            entityType: 'inventory',
                            entityId: i.id,
                            description: `إضافة ${i.item_name} بـالكمية ${i.quantity} ${i.unit}`,
                            performedBy: 'المخزن',
                            performedAt: i.created_at
                        });
                    });
                }
            }

            // 5. Fetch Financial Transactions
            if (user) {
                let finQuery = supabase
                    .from('financial_transactions')
                    .select('id, type, amount, category, description, created_at, clinic_id')
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (clinicId && clinicId !== 'all') finQuery = finQuery.eq('clinic_id', clinicId);
                const { data: finance } = await finQuery;

                if (finance) {
                    finance.forEach((f: any) => {
                        allLogs.push({
                            id: `fin-${f.id}`,
                            action: f.type === 'income' ? 'قبض إيراد' : 'صرف مصروف',
                            entityType: 'financial',
                            entityId: f.id,
                            description: `${f.type === 'income' ? 'إيراد' : 'مصروف'}: ${f.amount} د.ع - ${f.category || 'عام'} (${f.description || ''})`,
                            performedBy: 'الحسابات',
                            performedAt: f.created_at
                        });
                    });
                }
            }

            // Filter by Local State Type Filter
            let filtered = allLogs;
            if (filters.type && filters.type !== 'all') {
                filtered = allLogs.filter(l => l.entityType === filters.type);
            }

            // Sort Combined Logs by Date Descending
            filtered.sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());

            setActivities(filtered);
        } catch (err) {
            console.error('Error fetching activities:', err);
        } finally {
            setLoading(false);
        }
    };

    const undoAction = async (activityId: string) => {
        // 1. Find activity
        const activity = activities.find(a => a.id === activityId);
        if (!activity || !activity.metadata?.restoreId) return false;

        // 2. Optimistic update
        setActivities(prev => prev.map(a => a.id === activityId ? { ...a, loading: true } : a));

        try {
            // Mock Undo: just remove the activity for now as "restored"
            // Start of Undo Logic
            const { error } = await supabase
                .from('activity_logs')
                .delete()
                .eq('id', activityId);

            if (error) throw error;
            // End of Undo Logic

            // 3. Remove from log or mark as 'undone'
            // For now, we'll just show success and refresh
            await fetchActivities();
            return true;
        } catch (err) {
            console.error('Undo failed:', err);
            return false;
        }
    };

    return {
        activities,
        loading,
        filters,
        setFilters,
        undoAction,
        refresh: fetchActivities
    };
};
