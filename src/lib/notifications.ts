import { supabase } from './supabase';

export type NotificationType = 'appointment' | 'order_update' | 'payment' | 'message' | 'system' | 'alert' | 'reminder';

export interface NotificationPayload {
    target_user_id?: string; // If targeting specific user
    clinic_id?: string;      // If targeting a clinic
    laboratory_id?: string;  // If targeting a lab
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    priority?: 'low' | 'normal' | 'high';
    metadata?: any;
}

/**
 * Sends a notification to a user, clinic, lab, or specific role.
 */
export const sendNotification = async (payload: NotificationPayload) => {
    try {
        const dbPayload: any = {
            type: payload.type,
            title: payload.title,
            message: payload.message,
            read: false,
            created_at: new Date().toISOString()
        };

        if (payload.target_user_id) dbPayload.user_id = payload.target_user_id;
        if (payload.clinic_id) dbPayload.clinic_id = payload.clinic_id;
        if (payload.laboratory_id) dbPayload.laboratory_id = payload.laboratory_id;
        if (payload.link) dbPayload.link = payload.link;
        if (payload.priority) dbPayload.priority = payload.priority;
        if (payload.metadata) dbPayload.metadata = payload.metadata;

        const { error } = await supabase
            .from('notifications')
            .insert(dbPayload);

        if (error) {
            console.error('Supabase error sending notification:', error);
            throw error;
        }
        return true;
    } catch (error) {
        console.error('Failed to send notification:', error);
        return false;
    }
};

/**
 * Sends a notification to all users of a specific role (e.g., 'admin', 'doctor').
 * Uses the send_campaign_notifications RPC.
 */
export const sendRoleNotification = async (role: 'all' | 'doctor' | 'supplier' | 'laboratory' | 'admin', title: string, message: string, link?: string) => {
    try {
        const { data, error } = await supabase.rpc('send_campaign_notifications', {
            p_title: title,
            p_message: message,
            p_target_role: role,
            p_type: 'system',
            p_link: link || null,
            p_sender_id: (await supabase.auth.getUser()).data.user?.id
        });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Failed to send role notification:', error);
        return false;
    }
};
