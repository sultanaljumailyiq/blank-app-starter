import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export interface Task {
    id: string;
    type: 'task' | 'reminder';
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'urgent';
    priority: 'urgent' | 'high' | 'medium' | 'low';
    category: any;
    date: string;
    time: string;
    duration: number;
    creatorId: string;
    creatorName: string;
    creatorRole: string;
    clinicScope: { type: 'all' | 'specific'; ids?: string[]; names?: string[] };
    assignedScope: { type: 'all' | 'specific'; ids?: string[]; names?: string[] };
    subtasks: string[];
    progress: number;
    tags: string[];
    notes?: string;
    comments?: any[];
    lastUpdated: string;
}

export const useTasks = (clinicId?: string) => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && clinicId) {
            fetchTasks();

            const subscription = supabase
                .channel('clinic_tasks_changes')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'clinic_tasks',
                        filter: clinicId !== 'all' ? `clinic_id=eq.${clinicId}` : undefined
                    },
                    (payload) => {
                        fetchTasks();
                    }
                )
                .subscribe();

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [user, clinicId]);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('clinic_tasks')
                .select(`
                    *,
                    assigned_staff:assigned_to ( id, full_name )
                `)
                .order('due_date', { ascending: true });

            if (clinicId && clinicId !== 'all') {
                query = query.eq('clinic_id', clinicId);
            }

            const { data, error } = await query;

            if (error) throw error;

            if (data) {
                const mapped: Task[] = data.map((t: any) => ({
                    id: t.id,
                    type: 'task', // Default as schema doesn't have type yet, or we can use description/title conventions
                    title: t.title,
                    description: t.description || '',
                    status: t.status as any,
                    priority: t.priority as any,
                    category: 'إدارية', // Default
                    date: t.due_date ? t.due_date.split('T')[0] : '',
                    time: t.due_date ? new Date(t.due_date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '00:00',
                    duration: 30,
                    creatorId: t.created_by,
                    creatorName: 'مستخدم',
                    creatorRole: 'admin',
                    clinicScope: { type: 'specific', ids: [t.clinic_id?.toString()], names: [] },
                    assignedScope: t.assigned_staff
                        ? { type: 'specific', ids: [t.assigned_staff.id.toString()], names: [t.assigned_staff.full_name] }
                        : { type: 'all' },
                    subtasks: [],
                    progress: t.status === 'completed' ? 100 : 0,
                    tags: [],
                    lastUpdated: t.updated_at
                }));
                setTasks(mapped);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            toast.error('فشل تحميل المهام');
        } finally {
            setLoading(false);
        }
    };

    const addTask = async (task: Partial<Task>) => {
        try {
            // Map frontend Task to DB
            const assignedToId = task.assignedScope?.type === 'specific' && task.assignedScope.ids?.[0]
                ? parseInt(task.assignedScope.ids[0])
                : null;

            // Determine Clinic ID: Context takes precedence unless 'all', then look at task scope
            let targetClinicId: number | null = null;
            if (clinicId && clinicId !== 'all') {
                targetClinicId = parseInt(clinicId);
            } else if (task.clinicScope?.type === 'specific' && task.clinicScope.ids?.[0]) {
                targetClinicId = parseInt(task.clinicScope.ids[0]);
            }

            const { error } = await supabase.from('clinic_tasks').insert({
                clinic_id: targetClinicId,
                title: task.title,
                description: task.description,
                assigned_to: assignedToId,
                status: task.status || 'pending',
                priority: task.priority || 'medium',
                due_date: task.date ? `${task.date}T${task.time || '00:00'}:00` : null,
                created_by: user?.id
            });

            if (error) throw error;
            toast.success('تم إضافة المهمة بنجاح');
            fetchTasks();
        } catch (err) {
            console.error('Error adding task:', err);
            toast.error('فشل إضافة المهمة');
        }
    };

    const updateTask = async (id: string, updates: Partial<Task>) => {
        try {
            const dbUpdates: any = {};
            if (updates.status) dbUpdates.status = updates.status;
            if (updates.title) dbUpdates.title = updates.title;
            if (updates.description) dbUpdates.description = updates.description;
            if (updates.priority) dbUpdates.priority = updates.priority;

            if (updates.date || updates.time) {
                // Would need to merge date/time if only one provided, for now assume simple update
                // This might need more robust handling if only updating time
            }

            const { error } = await supabase
                .from('clinic_tasks')
                .update({
                    ...dbUpdates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;
            fetchTasks();
        } catch (err) {
            console.error('Error updating task:', err);
            toast.error('فشل تحديث المهمة');
        }
    };

    const deleteTask = async (id: string) => {
        try {
            const { error } = await supabase.from('clinic_tasks').delete().eq('id', id);
            if (error) throw error;
            toast.success('تم حذف المهمة');
            fetchTasks();
        } catch (err) {
            console.error('Error deleting task:', err);
            toast.error('فشل حذف المهمة');
        }
    }

    return { tasks, loading, addTask, updateTask, deleteTask, refresh: fetchTasks };
};
