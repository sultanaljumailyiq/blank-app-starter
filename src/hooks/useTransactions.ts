import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export interface Transaction {
    id: string;
    clinicId: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description: string;
    date: string;
    status: 'pending' | 'completed' | 'cancelled';
    patientId?: string;
}

export const useTransactions = (clinicId?: string) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        fetchTransactions();
        return () => { mountedRef.current = false; };
    }, [clinicId]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('financial_transactions')
                .select('*')
                .order('transaction_date', { ascending: false });

            if (clinicId) {
                query = query.eq('clinic_id', parseInt(clinicId));
            }

            const { data, error } = await query;

            if (error) throw error;

            const mapped: Transaction[] = (data || []).map(t => ({
                id: t.id,
                clinicId: t.clinic_id?.toString(),
                amount: parseFloat(t.amount),
                type: t.type,
                category: t.category,
                description: t.description,
                date: t.transaction_date,
                status: t.status,
                patientId: t.patient_id?.toString()
            }));

            setTransactions(mapped);
        } catch (error: any) {
            if (error?.name === 'AbortError' || error?.message?.includes('AbortError')) return;
            if (mountedRef.current) console.error('Error fetching transactions:', error);
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    };

    return { transactions, loading, refresh: fetchTransactions };
};
