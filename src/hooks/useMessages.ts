import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export interface Message {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    recipientId: string;
    content: string;
    timestamp: string;
    read: boolean;
    isMe: boolean;
}

export const useMessages = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchMessages();
            subscribeToMessages();
        }
    }, [user]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('direct_messages')
                .select('*')
                .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                // Fetch Names Helper (Simple Cache or Separate Fetch)
                // For now, we will just use placeholders or fetch unique IDs
                const uniqueUserIds = Array.from(new Set(data.flatMap((m: any) => [m.sender_id, m.recipient_id])));

                // Ideally fetch profiles here. For now, rely on ID or maybe fetch suppliers if role is supplier
                // We'll simplistic mapping

                const formattedMessages: Message[] = data.map((msg: any) => ({
                    id: msg.id,
                    senderId: msg.sender_id,
                    senderName: 'U-' + msg.sender_id.slice(0, 4), // Placeholder until profile fetch
                    senderRole: msg.sender_role || 'user',
                    recipientId: msg.recipient_id,
                    content: msg.content,
                    timestamp: msg.created_at,
                    read: msg.read,
                    isMe: msg.sender_id === user?.id
                }));
                setMessages(formattedMessages);
                groupConversations(formattedMessages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const groupConversations = (msgs: Message[]) => {
        const groups: Record<string, Message[]> = {};
        const myId = user?.id;

        msgs.forEach(msg => {
            const otherId = msg.senderId === myId ? msg.recipientId : msg.senderId;
            if (!groups[otherId]) groups[otherId] = [];
            groups[otherId].push(msg);
        });

        const convs = Object.entries(groups).map(([partnerId, groupMsgs]) => {
            const lastMsg = groupMsgs[0];
            // Infer partner info from messages if available, or fetch
            // This is temporary logic
            return {
                id: partnerId,
                partnerId,
                partnerName: lastMsg.senderId === partnerId ? lastMsg.senderName : 'Partner',
                partnerRole: lastMsg.senderId === partnerId ? lastMsg.senderRole : 'user',
                lastMessage: lastMsg.content,
                timestamp: lastMsg.timestamp,
                unreadCount: groupMsgs.filter(m => !m.read && !m.isMe).length,
                messages: groupMsgs.reverse()
            };
        });

        setConversations(convs);
    };

    const sendMessage = async (recipientId: string, content: string) => {
        try {
            const { error } = await supabase
                .from('direct_messages')
                .insert({
                    sender_id: user?.id,
                    sender_role: 'user', // Default role
                    recipient_id: recipientId,
                    recipient_role: 'supplier', // Try to infer or pass as arg?
                    content
                });

            if (error) throw error;
            fetchMessages();
            return true;
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('فشل إرسال الرسالة');
            return false;
        }
    };

    const subscribeToMessages = () => {
        const subscription = supabase
            .channel('public:direct_messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'direct_messages',
                filter: `recipient_id=eq.${user?.id}`
            }, (payload) => {
                fetchMessages();
                toast('رسالة جديدة!');
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    };

    return {
        messages,
        conversations,
        loading,
        sendMessage,
        refresh: fetchMessages
    };
};
