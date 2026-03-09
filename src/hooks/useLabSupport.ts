import { useState, useEffect } from 'react';

export interface SupportTicket {
    id: string;
    subject: string;
    category: string;
    status: 'open' | 'closed' | 'pending';
    priority: 'low' | 'normal' | 'high';
    lastUpdate: string;
    messages: number;
}

const MOCK_TICKETS: SupportTicket[] = [
    {
        id: 'TKT-1025',
        subject: 'مشكلة في تحديث حالة الطلب',
        category: 'مشكلة تقنية',
        status: 'open',
        priority: 'high',
        lastUpdate: '2025-12-08',
        messages: 3
    },
    {
        id: 'TKT-1020',
        subject: 'استفسار عن الفواتير الشهرية',
        category: 'المالية',
        status: 'closed',
        priority: 'normal',
        lastUpdate: '2025-12-05',
        messages: 5
    }
];

export const useLabSupport = () => {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setTickets(MOCK_TICKETS);
        setLoading(false);
    };

    const createTicket = (ticket: Omit<SupportTicket, 'id' | 'status' | 'lastUpdate' | 'messages'>) => {
        const newTicket: SupportTicket = {
            ...ticket,
            id: `TKT-${Math.floor(Math.random() * 10000)}`,
            status: 'open',
            lastUpdate: new Date().toISOString().split('T')[0],
            messages: 1
        };
        setTickets(prev => [newTicket, ...prev]);
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    return {
        tickets,
        loading,
        createTicket,
        refresh: fetchTickets
    };
};
