import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface LabService {
    id: string;
    name: string;
    category: string;
    basePrice: number;
    description?: string;
    estimatedTime?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const useLabServices = () => {
    const { user } = useAuth();
    const [services, setServices] = useState<LabService[]>([]);
    const [loading, setLoading] = useState(true);

    const [labId, setLabId] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            getLabId();
        }
    }, [user]);

    useEffect(() => {
        if (labId) {
            fetchServices();
        }
    }, [labId]);

    const getLabId = async () => {
        try {
            const { data, error } = await supabase
                .from('dental_laboratories')
                .select('id')
                .eq('user_id', user?.id)
                .single();

            if (data) setLabId(data.id);
        } catch (e) {
            console.error('Error fetching lab id', e);
        }
    };

    const fetchServices = async () => {
        try {
            setLoading(true);
            // Query using lab_id which stores the auth user ID as string
            const { data, error } = await supabase
                .from('lab_services')
                .select('*')
                .eq('lab_id', labId)
                .order('name');

            if (error) throw error;

            setServices(data.map(item => ({
                id: item.id,
                name: item.name,
                category: item.category,
                basePrice: item.base_price,
                description: item.description,
                estimatedTime: item.estimated_time,
                isActive: item.is_active,
                createdAt: item.created_at,
                updatedAt: item.updated_at
            })));
        } catch (err) {
            console.error('Error fetching lab services:', err);
        } finally {
            setLoading(false);
        }
    };

    const addService = async (service: Omit<LabService, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const { data, error } = await supabase
                .from('lab_services')
                .insert([{
                    lab_id: labId,
                    name: service.name,
                    category: service.category,
                    base_price: service.basePrice,
                    description: service.description,
                    estimated_time: service.estimatedTime,
                    is_active: service.isActive
                }])
                .select()
                .single();

            if (error) throw error;
            await fetchServices(); // Refresh list
            return data;
        } catch (err) {
            console.error('Error adding service:', err);
            throw err;
        }
    };

    const updateService = async (id: string, updates: Partial<LabService>) => {
        try {
            const updateData: any = {};
            if (updates.name) updateData.name = updates.name;
            if (updates.category) updateData.category = updates.category;
            if (updates.basePrice) updateData.base_price = updates.basePrice;
            if (updates.description) updateData.description = updates.description;
            if (updates.estimatedTime) updateData.estimated_time = updates.estimatedTime;
            if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
            updateData.updated_at = new Date().toISOString();

            const { error } = await supabase
                .from('lab_services')
                .update(updateData)
                .eq('id', id)
                .eq('lab_id', labId);

            if (error) throw error;
            await fetchServices();
        } catch (err) {
            console.error('Error updating service:', err);
            throw err;
        }
    };

    const deleteService = async (id: string) => {
        try {
            const { error } = await supabase
                .from('lab_services')
                .delete()
                .eq('id', id)
                .eq('lab_id', labId);

            if (error) throw error;
            setServices(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error('Error deleting service:', err);
            throw err;
        }
    };

    return {
        services,
        loading,
        refresh: fetchServices,
        addService,
        updateService,
        deleteService
    };
};
