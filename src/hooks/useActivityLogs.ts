import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export interface ActivityLog {
    id: string;
    clinic_id: string;
    user_id: string;
    action_type: string;
    entity_type: string;
    entity_id: string;
    details: any;
    created_at: string;
    user?: { email: string }; // Joined
}

export const useActivityLogs = (clinicId?: string) => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchLogs = async () => {
        if (!clinicId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('activity_logs')
                .select('*')
                .eq('clinic_id', clinicId)
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;
            setLogs(data || []);
        } catch (err) {
            console.error('Error fetching logs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [clinicId]);

    const restoreEntity = async (log: ActivityLog) => {
        try {
            let tableName = '';
            if (log.entity_type === 'staff') tableName = 'staff';
            else if (log.entity_type === 'patient') tableName = 'patients';
            else {
                toast.error('لا يمكن استعادة هذا العنصر تلقائياً');
                return;
            }

            // check if already active?
            // Just update deleted_at to NULL
            const { error } = await supabase
                .from(tableName)
                .update({ deleted_at: null })
                .eq('id', log.entity_id);

            if (error) throw error;

            // Log the restore action
            await supabase.from('activity_logs').insert({
                clinic_id: log.clinic_id,
                action_type: `restore_${log.entity_type}`,
                entity_type: log.entity_type,
                entity_id: log.entity_id,
                details: { restored_from_log_id: log.id }
            });

            toast.success('تم استعادة العنصر بنجاح');
            fetchLogs(); // Refresh logs to show the restore action
        } catch (err) {
            console.error('Error restoring entity:', err);
            toast.error('فشل استعادة العنصر');
        }
    };

    return {
        logs,
        loading,
        fetchLogs,
        restoreEntity
    };
};
