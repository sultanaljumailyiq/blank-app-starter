import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction } from '../types';
import { useAppointments } from './useAppointments';

export const useFinance = (clinicId?: string, patientId?: string, staffId?: string) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        income: 0,
        expenses: 0,
        net: 0,
        growth: 0
    });

    const { appointments } = useAppointments(clinicId || '0');

    useEffect(() => {
        if (clinicId) {
            fetchFinancials();
        }
    }, [clinicId, appointments, patientId, staffId]);

    const fetchFinancials = async () => {
        setLoading(true);
        try {
            // 1. Fetch Manual Transactions from Supabase
            console.log('Fetching financials for clinicId:', clinicId, 'patientId:', patientId, 'staffId:', staffId);
            let query = supabase
                .from('financial_transactions')
                // Unified Staff Identity: Select staff relations instead of specific profiles
                .select('*, patient:patients!fk_fin_patients(full_name), staff_record:staff!fk_fin_staff_record(full_name), recorder_staff:staff!fk_fin_recorded_by_staff(full_name)')
                .eq('clinic_id', clinicId || 0);

            if (patientId) {
                query = query.eq('patient_id', patientId);
            }
            if (staffId) {
                // Filter by staff_record_id (Unified)
                if (!isNaN(Number(staffId))) {
                    query = query.eq('staff_record_id', Number(staffId));
                }
            }

            const { data: dbTransactions, error } = await query
                .order('transaction_date', { ascending: false });

            if (error) console.error('Error fetching transactions:', error);

            let mappedTransactions: Transaction[] = [];

            if (dbTransactions) {
                mappedTransactions = dbTransactions.map(t => ({
                    id: t.id.toString(),
                    type: t.type as 'income' | 'expense',
                    amount: parseFloat(t.amount),
                    date: t.transaction_date || new Date().toISOString(),
                    description: t.description || '',
                    category: t.category,
                    paymentMethod: t.payment_method || 'cash',
                    recordedById: t.recorded_by_staff_id?.toString(),
                    doctorId: t.staff_record_id?.toString(), // Map staff_record_id to doctorId for frontend compatibility
                    staffId: t.staff_record_id?.toString(),
                    patientId: t.patient_id?.toString(),
                    assistantId: t.assistant_id?.toString(),
                    treatmentId: t.treatment_id?.toString(),
                    sessionId: t.session_id?.toString(),
                    inventoryItemId: t.inventory_item_id?.toString(),
                    labRequestId: t.lab_request_id,
                    extraCost: t.extra_cost,
                    // Use staff_record.full_name for doctor/staff name
                    doctorName: t.staff_record?.full_name || '',
                    recorderName: t.recorder_staff?.full_name || 'مسؤول النظام',
                    relatedPerson: t.patient?.full_name || (t.type === 'expense' && t.category === 'salary' ? t.staff_record?.full_name : '')
                }));
            }

            // 2. Automated Income from Completed Appointments
            // ... (Appointment logic needs check too)
            const appointmentTransactions: Transaction[] = appointments
                .filter(apt => apt.status === 'completed' && apt.cost > 0)
                .filter(apt => !patientId || apt.patientId === patientId)
                .filter(apt => !staffId || apt.doctorId === staffId)
                .map(apt => ({
                    id: `apt-${apt.id}`, // Virtual ID
                    type: 'income',
                    amount: apt.cost || 0,
                    staffRecordId: apt.doctorId, // apt.doctorId is now stringified staff_id
                    doctorId: apt.doctorId,
                    date: apt.date,
                    description: `جلسة علاج: ${apt.patientName || 'مريض'}`,
                    category: apt.type === 'consultation' ? 'consultation' : 'treatment',
                    paymentMethod: 'cash',
                    doctorName: apt.doctorName,
                    relatedPerson: apt.patientName
                }));

            // 3. Combine
            const allTransactions = [
                ...mappedTransactions,
                ...appointmentTransactions
            ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setTransactions(allTransactions);

            // 4. Calculate Stats
            const income = allTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const expenses = allTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

            // Calculate previous month for growth (simple approximation)
            const currentMonth = new Date().getMonth();
            const prevMonthIncome = allTransactions
                .filter(t => t.type === 'income' && new Date(t.date).getMonth() === currentMonth - 1)
                .reduce((sum, t) => sum + t.amount, 0);

            const growth = prevMonthIncome > 0 ? ((income - prevMonthIncome) / prevMonthIncome) * 100 : 0;

            setStats({
                income,
                expenses,
                net: income - expenses,
                growth
            });

        } catch (err) {
            console.error('Finance fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const logActivity = async (action: string, entityId: string, details: any) => {
        try {
            await supabase.from('activity_logs').insert({
                clinic_id: clinicId,
                action_type: action,
                entity_type: 'transaction',
                entity_id: entityId,
                details
            });
        } catch (e) {
            console.error('Failed to log activity', e);
        }
    };

    const addTransaction = async (t: Omit<Transaction, 'id'>) => {
        try {
            console.log('Adding transaction:', t);

            // Map frontend IDs to staff_record_id
            const staffRecordId = t.doctorId ? Number(t.doctorId) : (t.staffId ? Number(t.staffId) : null);
            const recorderStaffId = t.recordedById ? Number(t.recordedById) : null;

            const { data, error } = await supabase.from('financial_transactions').insert({
                clinic_id: clinicId || 0,
                amount: t.amount,
                type: t.type,
                category: t.category,
                description: t.description,
                transaction_date: t.date,
                payment_method: t.paymentMethod,
                status: 'completed',
                patient_id: t.patientId || null,

                // Unified Staff Identity
                staff_record_id: !isNaN(Number(staffRecordId)) ? staffRecordId : null,
                recorded_by_staff_id: !isNaN(Number(recorderStaffId)) ? recorderStaffId : null,
                // Removed doctor_id and recorded_by

                treatment_id: t.treatmentId || null,
                session_id: t.sessionId || null,
                inventory_item_id: t.inventoryItemId || null,
                lab_request_id: t.labRequestId || null,
                extra_cost: t.extraCost || 0
            }).select('*, patient:patients!fk_fin_patients(full_name), staff_record:staff!fk_fin_staff_record(full_name)').single();

            if (error) throw error;

            await logActivity('create_transaction', data.id, { amount: data.amount, type: data.type, category: data.category });

            // Manual State Update for Immediate Feedback
            const newTransaction: Transaction = {
                id: data.id.toString(),
                type: data.type as 'income' | 'expense',
                amount: parseFloat(data.amount),
                date: data.transaction_date || t.date,
                description: data.description || t.description,
                category: data.category,
                paymentMethod: data.payment_method || 'cash',
                recordedById: data.recorded_by?.toString(),
                recorderName: data.recorder_profile?.full_name || 'مسؤول النظام',
                relatedPerson: data.patient?.full_name || (data.type === 'expense' && data.category === 'salary' ? (data.staff_record?.full_name || data.doctor_profile?.full_name) : ''),
                doctorName: data.doctor_profile?.full_name || data.staff_record?.full_name || '',
                // Map other potential fields if needed for immediate display
                patientId: t.patientId,
                doctorId: t.doctorId
            };

            setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            return data;
        } catch (e) {
            console.error('Supabase insert failed:', e);
            throw e;
        }
    };

    const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
        try {
            const dbUpdates: any = {};
            if (updates.amount) dbUpdates.amount = updates.amount;
            if (updates.category) dbUpdates.category = updates.category;
            if (updates.description) dbUpdates.description = updates.description;
            if (updates.date) dbUpdates.transaction_date = updates.date;
            if (updates.paymentMethod) dbUpdates.payment_method = updates.paymentMethod;

            // Relational updates
            if (updates.patientId !== undefined) dbUpdates.patient_id = updates.patientId || null;
            if (updates.doctorId !== undefined) dbUpdates.doctor_id = updates.doctorId || null;
            if (updates.recordedById !== undefined) dbUpdates.recorded_by = updates.recordedById || null;
            if (updates.treatmentId !== undefined) dbUpdates.treatment_id = updates.treatmentId || null;

            const { error } = await supabase
                .from('financial_transactions')
                .update(dbUpdates)
                .eq('id', id);

            if (error) throw error;

            await logActivity('update_transaction', id, updates);

            // Local Update
            setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
        } catch (e) {
            console.error('Update failed:', e);
            throw e;
        }
    };

    const deleteTransaction = async (id: string) => {
        try {
            // Get transaction details before deleting for log
            const transactionToDelete = transactions.find(t => t.id === id);

            const { error } = await supabase
                .from('financial_transactions')
                .delete()
                .eq('id', id);

            if (error) throw error;

            await logActivity('delete_transaction', id, {
                amount: transactionToDelete?.amount,
                type: transactionToDelete?.type,
                reason: 'Manual deletion'
            });

            // Local Update
            setTransactions(prev => prev.filter(t => t.id !== id));
        } catch (e) {
            console.error('Delete failed:', e);
            throw e;
        }
    };


    return {
        transactions,
        stats,
        loading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        refresh: fetchFinancials
    };
};
