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
 * Sends a notification to a user, clinic, or lab.
 * Uses the 'notifications' table in Supabase.
 */
export const sendNotification = async (payload: NotificationPayload) => {
    try {
        // Current schema assumption based on usage:
        // id, user_id, title, message, type, read, created_at, link, priority

        // We map our payload to DB columns
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
