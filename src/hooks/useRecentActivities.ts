import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useClinics } from './useClinics';
import {
    Calendar,
    UserPlus,
    PackagePlus,
    AlertCircle,
    CheckCircle,
    Activity
} from 'lucide-react';

export interface ActivityItem {
    id: string;
    type: 'appointment' | 'patient' | 'inventory' | 'system';
    title: string;
    description: string;
    time: string;
    icon: any;
    color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
    clinicId?: string;
    clinicName?: string; // Optional if we can map it
    timestamp: number; // For sorting
}

export const useRecentActivities = (clinicId?: string, limit = 10) => {
    const { user } = useAuth();
    const { clinics } = useClinics();
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchActivities();
        }
    }, [user, clinicId, clinics]);

    const fetchActivities = async () => {
        setLoading(true);
        const allActivities: ActivityItem[] = [];

        try {
            const clinicIds = clinics.map(c => c.id);
            if (clinicIds.length === 0) {
                setActivities([]);
                setLoading(false);
                return;
            }

            // 1. New Appointments (Last 7 days)
            let aptQuery = supabase
                .from('appointments')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (clinicId && clinicId !== 'all') {
                aptQuery = aptQuery.eq('clinic_id', clinicId);
            } else {
                aptQuery = aptQuery.in('clinic_id', clinicIds);
            }

            const { data: newApts } = await aptQuery;

            if (newApts) {
                newApts.forEach(apt => {
                    allActivities.push({
                        id: `apt-${apt.id}`,
                        type: 'appointment',
                        title: apt.status === 'pending' ? 'طلب حجز جديد' : 'موعيد جديد',
                        description: `تم حجز موعد للمريض ${apt.patient_name} (${apt.type})`,
                        time: new Date(apt.created_at).toLocaleString('ar-EG'),
                        timestamp: new Date(apt.created_at).getTime(),
                        icon: Calendar,
                        color: apt.status === 'pending' ? 'yellow' : 'blue',
                        clinicId: apt.clinic_id?.toString()
                    });
                });
            }

            // 2. New Patients
            let patQuery = supabase
                .from('patients')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (clinicId && clinicId !== 'all') {
                patQuery = patQuery.eq('clinic_id', clinicId);
            } else {
                patQuery = patQuery.in('clinic_id', clinicIds);
            }

            const { data: newPatients } = await patQuery;

            if (newPatients) {
                newPatients.forEach(pat => {
                    allActivities.push({
                        id: `pat-${pat.id}`,
                        type: 'patient',
                        title: 'مريض جديد',
                        description: `تم تسجيل ملف جديد: ${(pat as any).name || (pat as any).full_name || 'مريض جديد'}`,
                        time: new Date(pat.created_at).toLocaleString('ar-EG'),
                        timestamp: new Date(pat.created_at).getTime(),
                        icon: UserPlus,
                        color: 'green',
                        clinicId: pat.clinic_id?.toString()
                    });
                });
            }

            // 3. Inventory Updates (New Items)
            let invQuery = supabase
                .from('inventory')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (clinicId && clinicId !== 'all') {
                invQuery = invQuery.eq('clinic_id', clinicId);
            } else {
                invQuery = invQuery.in('clinic_id', clinicIds);
            }

            const { data: newInventory } = await invQuery;

            if (newInventory) {
                newInventory.forEach(item => {
                    allActivities.push({
                        id: `inv-${item.id}`,
                        type: 'inventory',
                        title: 'إضافة مخزون',
                        description: `تم إضافة مادة جديدة: ${item.item_name} (${item.quantity} ${item.unit})`,
                        time: new Date(item.created_at).toLocaleString('ar-EG'),
                        timestamp: new Date(item.created_at).getTime(),
                        icon: PackagePlus,
                        color: 'purple',
                        clinicId: item.clinic_id?.toString()
                    });
                });
            }

            // Sort by timestamp desc and take top N
            const sorted = allActivities
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, limit);

            setActivities(sorted);

        } catch (error) {
            console.error('Error fetching activities:', error);
            setActivities([]);
        } finally {
            setLoading(false);
        }
    };

    return { activities, loading, refresh: fetchActivities };
};
