import { useState, useEffect } from 'react';

export interface Message {
    id: string;
    sender: string;
    content: string;
    time: string;
    isMe: boolean;
}

export interface Conversation {
    id: string;
    doctorName: string;
    clinicName: string;
    lastMessage: string;
    time: string;
    unread: number;
    avatar: string;
    online: boolean;
}

const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'CONV1',
        doctorName: 'د. سارة علي',
        clinicName: 'عيادة الابتسامة',
        lastMessage: 'شكراً، استلمت الطلب',
        time: '10:30 ص',
        unread: 2,
        avatar: '👩‍⚕️',
        online: true
    },
    {
        id: 'CONV2',
        doctorName: 'د. خالد عمر',
        clinicName: 'عيادة الشفاء',
        lastMessage: 'متى موعد التسليم القادم؟',
        time: 'أمس',
        unread: 0,
        avatar: '👨‍⚕️',
        online: false
    }
];

const MOCK_MESSAGES: Record<string, Message[]> = {
    'CONV1': [
        { id: '1', sender: 'doctor', content: 'مرحباً، هل الطلب جاهز؟', time: '10:00 ص', isMe: false },
        { id: '2', sender: 'me', content: 'نعم دكتورة، سيتم التسليم اليوم', time: '10:15 ص', isMe: true },
        { id: '3', sender: 'doctor', content: 'شكراً، استلمت الطلب', time: '10:30 ص', isMe: false }
    ]
};

export const useLabMessages = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchConversations = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setConversations(MOCK_CONVERSATIONS);
        setLoading(false);
    };

    const selectConversation = (id: string) => {
        setActiveConversationId(id);
        setMessages(MOCK_MESSAGES[id] || []);
    };

    const sendMessage = (text: string) => {
        if (!activeConversationId) return;
        const newMsg: Message = {
            id: Date.now().toString(),
            sender: 'me',
            content: text,
            time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        };
        setMessages(prev => [...prev, newMsg]);
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    return {
        conversations,
        activeConversationId,
        messages,
        loading,
        selectConversation,
        sendMessage,
        refresh: fetchConversations
    };
};
