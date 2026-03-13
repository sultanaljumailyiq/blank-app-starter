import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export interface Notification {
    id: string;
    userId?: string;
    clinicId?: string;
    laboratoryId?: string;
    type: 'appointment' | 'order_update' | 'payment' | 'message' | 'system' | 'alert' | 'reminder';
    title: string;
    description: string; // Mapped from 'message' in DB
    link?: string;
    time: string;
    priority: 'low' | 'normal' | 'high';
    isRead: boolean;
    createdAt: string;
    clinicName?: string;
}

export const useNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [updates, setUpdates] = useState<any[]>([]);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        if (!user) return;

        fetchNotifications();
        fetchUpdates();

        // Real-time subscription
        const channel = supabase
            .channel('notifications_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    if (!mountedRef.current) return;
                    if (payload.eventType === 'INSERT') {
                        const newNotif = mapDbNotification(payload.new);
                        setNotifications(prev => [newNotif, ...prev]);
                        if (payload.new.clinic_id) fetchNotifications();

                        toast(newNotif.title, {
                            description: newNotif.description,
                        });
                    } else if (payload.eventType === 'UPDATE') {
                        setNotifications(prev => prev.map(n =>
                            n.id === payload.new.id ? mapDbNotification(payload.new) : n
                        ));
                    } else if (payload.eventType === 'DELETE') {
                        setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            mountedRef.current = false;
            if (channel && typeof channel.unsubscribe === 'function') {
                channel.unsubscribe().catch(console.error);
            } else {
                supabase.removeChannel(channel);
            }
        };
    }, [user]);

    const fetchUpdates = async () => {
        try {
            const { data, error } = await supabase
                .from('system_updates')
                .select('*')
                .eq('is_published', true)
                .order('release_date', { ascending: false });

            if (!mountedRef.current) return;
            if (error) {
                console.warn('Could not fetch system updates');
                return;
            }
            setUpdates(data || []);
        } catch (err: any) {
            if (err?.name === 'AbortError' || err?.message?.includes('AbortError')) return;
            console.warn('Error fetching updates:', err);
        }
    };

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('notifications')
                .select(`
                    *,
                    clinic:clinics(name)
                `)
                .order('created_at', { ascending: false })
                .limit(50);

            if (!mountedRef.current) return;
            if (error) throw error;

            const mapped = (data || []).map((record: any) => ({
                ...mapDbNotification(record),
                clinicName: record.clinic?.name
            }));

            setNotifications(mapped);
        } catch (error: any) {
            if (error?.name === 'AbortError' || error?.message?.includes('AbortError')) return;
            if (mountedRef.current) console.error('Error fetching notifications:', error);
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));

        try {
            await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', id);
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const deleteNotification = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.filter(n => n.id !== id));

        try {
            await supabase
                .from('notifications')
                .delete()
                .eq('id', id);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const mapDbNotification = (dbRecord: any): Notification => ({
        id: dbRecord.id,
        userId: dbRecord.user_id,
        clinicId: dbRecord.clinic_id,
        laboratoryId: dbRecord.laboratory_id,
        type: dbRecord.type,
        title: dbRecord.title,
        description: dbRecord.message,
        link: dbRecord.link,
        time: new Date(dbRecord.created_at).toLocaleDateString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        priority: dbRecord.priority || 'normal',
        isRead: dbRecord.read,
        createdAt: dbRecord.created_at,
        // clinicName will be added in fetch
    });

    return {
        notifications,
        updates,
        loading,
        markAsRead,
        deleteNotification,
        refresh: () => { fetchNotifications(); fetchUpdates(); },
        unreadCount: notifications.filter(n => !n.isRead).length
    };
};

