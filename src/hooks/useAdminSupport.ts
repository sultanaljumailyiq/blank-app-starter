import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export interface SupportTicket {
    id: string;
    ticket_number?: number;
    user_id: string;
    title: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    category: string;
    created_at: string;
    user?: {
        full_name: string;
        email: string;
        role: string;
    };
    messages?: TicketMessage[];
}

export interface TicketMessage {
    id: string;
    ticket_id: string;
    sender_id: string;
    message: string;
    is_support_reply: boolean;
    created_at: string;
    sender_name?: string;
}

export function useAdminSupport() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('support_tickets')
                .select(`
                    *,
                    user:profiles(full_name, email, role)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map profile data if needed, or just use as is
            const formattedTickets: SupportTicket[] = data?.map(t => ({
                ...t,
                user: t.user // Supabase returns object if single relation, or array? usually object for foreign key
            })) || [];

            setTickets(formattedTickets);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            toast.error('فشل تحميل التذاكر');
        } finally {
            setLoading(false);
        }
    };

    const fetchTicketDetails = async (ticketId: string) => {
        try {
            // Fetch messages
            const { data: messages, error } = await supabase
                .from('ticket_messages')
                .select('*')
                .eq('ticket_id', ticketId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Update local state with messages for this ticket
            setTickets(prev => prev.map(t =>
                t.id === ticketId ? { ...t, messages: messages || [] } : t
            ));

            return messages;
        } catch (error) {
            console.error('Error fetching ticket details:', error);
            return [];
        }
    };

    const createTicket = async (ticketData: any) => {
        try {
            // For admin creating ticket, we might need a user_id. 
            // If admin creates for themselves, use their ID.
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('support_tickets')
                .insert([{
                    ...ticketData,
                    user_id: user.id
                }])
                .select()
                .single();

            if (error) throw error;

            setTickets(prev => [data, ...prev]);
            toast.success('تم إنشاء التذكرة بنجاح');
            return true;
        } catch (error) {
            toast.error('فشل إنشاء التذكرة');
            return false;
        }
    };

    const updateTicketStatus = async (ticketId: string, status: string) => {
        try {
            const { error } = await supabase
                .from('support_tickets')
                .update({ status })
                .eq('id', ticketId);

            if (error) throw error;

            setTickets(prev => prev.map(t =>
                t.id === ticketId ? { ...t, status: status as any } : t
            ));
            toast.success('تم تحديث حالة التذكرة');
        } catch (error) {
            toast.error('فشل تحديث الحالة');
        }
    };

    const replyToTicket = async (ticketId: string, message: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('ticket_messages')
                .insert([{
                    ticket_id: ticketId,
                    sender_id: user.id,
                    message,
                    is_support_reply: true
                }])
                .select()
                .single();

            if (error) throw error;

            // Also update ticket status to in_progress or customer_action needed?
            // Let's set to resolved? Or just keep current. Usually replying means working on it.
            // keeping it simple.

            // Update local messages
            setTickets(prev => prev.map(t => {
                if (t.id === ticketId) {
                    return {
                        ...t,
                        messages: [...(t.messages || []), { ...data, sender_name: 'الدعم الفني' }]
                    };
                }
                return t;
            }));

            toast.success('تم إرسال الرد');
            return true;
        } catch (error) {
            toast.error('فشل إرسال الرد');
            return false;
        }
    };

    const deleteTicket = async (id: string) => {
        try {
            const { error } = await supabase
                .from('support_tickets')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setTickets(prev => prev.filter(t => t.id !== id));
            toast.success('تم حذف التذكرة');
        } catch (error) {
            toast.error('فشل حذف التذكرة');
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    return {
        tickets,
        loading,
        createTicket,
        updateTicketStatus,
        replyToTicket,
        deleteTicket,
        fetchTicketDetails,
        refresh: fetchTickets
    };
}
