import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export interface ChatMessage {
    id: string;
    clinicId: string;
    senderId: string;
    senderName: string;
    senderRole: string; // 'owner' or 'staff'
    content: string;
    createdAt: string;
    isMe: boolean;
}

export const useClinicChat = (clinicId?: string) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && clinicId && clinicId !== 'all') {
            fetchMessages();

            const subscription = supabase
                .channel(`clinic_chat:${clinicId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'clinic_messages',
                        filter: `clinic_id=eq.${clinicId}`
                    },
                    (payload) => {
                        // Optimistically fetch or push? Fetch ensures full join data
                        fetchMessages();
                    }
                )
                .subscribe();

            return () => {
                subscription.unsubscribe();
            };
        } else {
            setMessages([]);
            setLoading(false);
        }
    }, [user, clinicId]);

    const fetchMessages = async () => {
        if (!clinicId || clinicId === 'all') return;

        setLoading(true);
        try {
            // Join with profiles to get sender name
            const { data, error } = await supabase
                .from('clinic_messages')
                .select(`
                    *,
                    sender:sender_id ( full_name, role )
                `)
                .eq('clinic_id', clinicId)
                .order('created_at', { ascending: true }); // Chronological order

            if (error) throw error;

            if (data) {
                const formatted: ChatMessage[] = data.map((msg: any) => ({
                    id: msg.id,
                    clinicId: msg.clinic_id,
                    senderId: msg.sender_id,
                    senderName: msg.sender?.full_name || 'مستخدم',
                    senderRole: msg.sender_type || (msg.sender_id === user?.id ? (user?.role === 'doctor' ? 'owner' : 'staff') : 'staff'),
                    content: msg.content,
                    createdAt: msg.created_at,
                    isMe: msg.sender_id === user?.id
                }));
                setMessages(formatted);
            }
        } catch (error) {
            console.error('Error fetching clinic messages:', error);
            // toast.error('فشل تحميل المحادثة');
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (content: string) => {
        if (!clinicId || clinicId === 'all') return;

        try {
            const { error } = await supabase
                .from('clinic_messages')
                .insert({
                    clinic_id: parseInt(clinicId), // Assuming clinic_id is int/bigint
                    sender_id: user?.id,
                    sender_type: user?.role === 'doctor' ? 'owner' : 'staff',
                    content
                });

            if (error) throw error;
            fetchMessages(); // Refresh
            return true;
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('فشل إرسال الرسالة');
            return false;
        }
    };

    return { messages, loading, sendMessage, refresh: fetchMessages };
};
