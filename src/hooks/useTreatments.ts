
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface TreatmentService {
    id: string;
    name: string;
    category: string;
    basePrice: number;
    costEstimate: number;
    profitMargin: number;
    popularity: number;
    totalRevenue: number;
    expectedSessions: number;
    isActive: boolean;
    isComplex: boolean;
    defaultPhases?: any[];
    clinicId?: string;
    scope?: 'tooth' | 'general' | 'both';
}

export const useTreatments = (clinicId?: string) => {
    const [treatments, setTreatments] = useState<TreatmentService[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTreatments();
    }, [clinicId]);

    const fetchTreatments = async () => {
        setLoading(true);
        try {
            let query = supabase.from('treatments').select('*');

            if (clinicId) {
                query = query.eq('clinic_id', clinicId);
            }

            const { data, error } = await query;

            if (error) throw error;

            const mappedItems: TreatmentService[] = (data || []).map((t: any) => ({
                id: t.id.toString(),
                name: t.name,
                category: t.category,
                basePrice: Number(t.base_price),
                costEstimate: Number(t.cost_estimate),
                profitMargin: Number(t.profit_margin),
                popularity: t.popularity || 50,
                totalRevenue: Number(t.total_revenue || 0),
                expectedSessions: t.expected_sessions,
                isActive: t.is_active,
                isComplex: t.is_complex,
                defaultPhases: t.default_phases,
                clinicId: t.clinic_id.toString(),
                scope: t.scope || 'tooth'
            }));

            // Sort by popularity or name
            setTreatments(mappedItems);
        } catch (err) {
            console.error('Error fetching treatments:', err);
        } finally {
            setLoading(false);
        }
    };

    const addTreatment = async (newItem: Omit<TreatmentService, 'id' | 'popularity' | 'totalRevenue' | 'clinicId'>) => {
        try {
            const dbItem = {
                clinic_id: clinicId || '101',
                name: newItem.name,
                category: newItem.category,
                base_price: newItem.basePrice,
                cost_estimate: newItem.costEstimate,
                profit_margin: newItem.profitMargin,
                expected_sessions: newItem.expectedSessions,
                is_active: newItem.isActive,
                is_complex: newItem.isComplex,
                default_phases: newItem.defaultPhases || [],
                scope: newItem.scope || 'tooth'
            };

            const { error } = await supabase.from('treatments').insert([dbItem]);
            if (error) throw error;
            fetchTreatments();
        } catch (err) {
            console.error('Error adding treatment:', err);
        }
    };

    const updateTreatment = async (id: string, updates: Partial<TreatmentService>) => {
        try {
            const dbUpdates: any = {};
            if (updates.name) dbUpdates.name = updates.name;
            if (updates.basePrice !== undefined) dbUpdates.base_price = updates.basePrice;
            if (updates.costEstimate !== undefined) dbUpdates.cost_estimate = updates.costEstimate;
            if (updates.profitMargin !== undefined) dbUpdates.profit_margin = updates.profitMargin;
            if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
            if (updates.isComplex !== undefined) dbUpdates.is_complex = updates.isComplex;
            if (updates.expectedSessions !== undefined) dbUpdates.expected_sessions = updates.expectedSessions;
            if (updates.scope !== undefined) dbUpdates.scope = updates.scope;

            const { error } = await supabase.from('treatments').update(dbUpdates).eq('id', id);
            if (error) throw error;
            fetchTreatments();
        } catch (err) {
            console.error('Error updating treatment:', err);
        }
    };

    const deleteTreatment = async (id: string) => {
        try {
            const { error } = await supabase.from('treatments').delete().eq('id', id);
            if (error) throw error;
            fetchTreatments();
        } catch (err) {
            console.error('Error deleting treatment:', err);
        }
    };

    return {
        treatments,
        loading,
        addTreatment,
        updateTreatment,
        deleteTreatment,
        refresh: fetchTreatments
    };
};
