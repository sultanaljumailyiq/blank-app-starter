import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Interfaces
export interface NotificationCampaign {
    id: string;
    title: string;
    type: 'promotional' | 'system' | 'announcement' | 'reminder';
    targetAudience: 'all_users' | 'all_doctors' | 'suppliers' | 'premium_users';
    scheduledDate: string;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
    content: string;
    channels: ('app' | 'email' | 'sms')[];
    priority: 'low' | 'normal' | 'high' | 'urgent';
    sentCount: number;
    openRate: number;
    clickRate: number;
    clickCount: number;
    createdAt: string;
}

export interface NotificationTemplate {
    id: string;
    name: string;
    type: 'welcome' | 'promotional' | 'system' | 'reminder';
    category: string;
    subject?: string;
    content: string;
    language: 'ar' | 'en';
    isActive: boolean;
    usageCount: number;
    createdAt: string;
}

export interface SystemUpdate {
    id: string;
    title: string;
    version: string;
    type: 'major' | 'minor' | 'patch' | 'security';
    content: string;
    isPublished: boolean;
    createdAt: string;
}

export function useAdminNotifications() {
    const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([]);
    const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
    const [updates, setUpdates] = useState<SystemUpdate[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotificationData = async () => {
        try {
            setLoading(true);

            // Fetch Campaigns
            const { data: campData, error: campError } = await supabase
                .from('notification_campaigns')
                .select('*')
                .order('created_at', { ascending: false });

            if (!campError && campData) {
                setCampaigns(campData.map(c => ({
                    id: c.id,
                    title: c.title,
                    type: c.type,
                    targetAudience: c.target_audience,
                    scheduledDate: c.scheduled_date,
                    status: c.status,
                    content: c.content,
                    channels: c.channels || [],
                    priority: c.priority,
                    sentCount: c.sent_count,
                    openRate: c.open_rate,
                    clickRate: c.click_rate,
                    clickCount: 0,
                    createdAt: c.created_at
                })));
            }

            // Fetch Templates
            const { data: tempData, error: tempError } = await supabase
                .from('notification_templates')
                .select('*')
                .order('created_at', { ascending: false });

            if (!tempError && tempData) {
                setTemplates(tempData.map(t => ({
                    id: t.id,
                    name: t.name,
                    type: t.type,
                    category: t.category,
                    subject: t.subject,
                    content: t.content,
                    language: t.language,
                    isActive: t.is_active,
                    usageCount: t.usage_count,
                    createdAt: t.created_at
                })));
            }

            // Fetch System Updates
            const { data: updatesData, error: updatesError } = await supabase
                .from('system_updates')
                .select('*')
                .order('created_at', { ascending: false });

            if (!updatesError && updatesData) {
                setUpdates(updatesData.map(u => ({
                    id: u.id,
                    title: u.title,
                    version: u.version,
                    type: u.type,
                    content: u.content,
                    isPublished: u.is_published,
                    createdAt: u.created_at
                })));
            }

        } catch (err) {
            console.error('Error fetching notification data:', err);
        } finally {
            setLoading(false);
        }
    };

    const addCampaign = async (data: any) => {
        try {
            // Use RPC to send notifications to target users
            const { data: result, error } = await supabase.rpc('send_campaign_notifications', {
                p_title: data.title,
                p_message: data.content,
                p_target_role: data.targetAudience, // 'doctor', 'supplier', etc.
                p_type: data.type || 'system',
                p_link: null,
                p_sender_id: (await supabase.auth.getUser()).data.user?.id
            });

            if (error) throw error;

            if (result && !result.success) {
                console.error('RPC Error:', result.error);
                throw new Error(result.error);
            }

            fetchNotificationData();
            return true;
        } catch (err) {
            console.error('Error adding campaign:', err);
            return false;
        }
    };

    const deleteCampaign = async (id: string) => {
        try {
            const { error } = await supabase.from('notification_campaigns').delete().eq('id', id);
            if (error) throw error;
            setCampaigns(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error('Error deleting campaign:', err);
        }
    };

    const addTemplate = async (data: any) => {
        try {
            const dbTemp = {
                name: data.name,
                type: data.type,
                category: data.category,
                subject: data.subject,
                content: data.content,
                language: data.language,
                is_active: true
            };

            const { error } = await supabase.from('notification_templates').insert([dbTemp]);
            if (error) throw error;
            fetchNotificationData();
        } catch (err) {
            console.error('Error adding template:', err);
        }
    };

    const deleteTemplate = async (id: string) => {
        try {
            const { error } = await supabase.from('notification_templates').delete().eq('id', id);
            if (error) throw error;
            setTemplates(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error('Error deleting template:', err);
        }
    };

    const addSystemUpdate = async (data: any) => {
        try {
            const dbUpdate = {
                title: data.title,
                version: data.version,
                type: data.type,
                content: data.content,
                is_published: true
            };
            const { error } = await supabase.from('system_updates').insert([dbUpdate]);
            if (error) throw error;
            fetchNotificationData();
            return true;
        } catch (err) {
            console.error('Error adding system update:', err);
            return false;
        }
    };

    useEffect(() => {
        fetchNotificationData();
    }, []);

    return {
        campaigns,
        templates,
        updates,
        loading,
        addCampaign,
        deleteCampaign,
        addTemplate,
        deleteTemplate,
        addSystemUpdate,
        refresh: fetchNotificationData
    };
}
