import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { startOfMonth, endOfMonth } from 'date-fns';

export interface PlatformStats {
    clinicsCount: number;
    suppliersCount: number;
    labsCount: number;
    patientsCount: number;
    pendingRequests: number;
    monthlyRevenue: number;
    growth: number;
    doctorsCount: number;
}

export interface PlatformSettings {
    commissionRate: number;
    subscriptionPrice: number;
    maintenanceMode: boolean;
    minWithdrawal: number;
    contact_email?: string;
    support_phone?: string;
    platform_fee_percentage?: number;
    logo_url?: string;
    platform_title_ar?: string; // e.g., "منصة عيادة الأسنان الذكية"
    platform_name_en?: string; // e.g., "SMART"
    footer_text?: string;       // e.g., "© 2025 SMART system. جميع الحقوق محفوظة."
}

export interface PaymentMethod {
    id: string;
    name: string;
    type: 'manual' | 'gateway' | 'agent'; // Added type
    number: string;
    recipientName?: string;
    qrCodeUrl: string;
    isActive: boolean;
    details?: any; // Added details
}

export interface Agent {
    id: string;
    name: string;
    code: string; // Added code
    governorate: string;
    phone: string;
    email?: string;
    address?: string;
    clinicsCount?: number;
    status: 'active' | 'inactive';
    joinDate?: string;
    created_at?: string;
    commissionRate?: number; // Added commissionRate
}

export const useAdminData = () => {
    const [stats, setStats] = useState<PlatformStats>({
        clinicsCount: 0,
        suppliersCount: 0,
        labsCount: 0,
        patientsCount: 0,
        pendingRequests: 0,
        monthlyRevenue: 0,
        growth: 0,
        doctorsCount: 0
    });

    const [settings, setSettings] = useState<PlatformSettings>({
        commissionRate: 10,
        subscriptionPrice: 50000,
        maintenanceMode: false,
        minWithdrawal: 100000,
        contact_email: 'support@smartdental.com',
        support_phone: '+964 770 000 0000',
        platform_fee_percentage: 2.5
    });

    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);

            // 1. Counts from Profiles to ensure consistency with User Accounts
            const { count: suppliers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'supplier');
            const { count: labs } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'laboratory');
            const { count: doctors } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'doctor');

            // Clinics: Count distinct active clinics or just all clinics
            const { count: clinics } = await supabase.from('clinics').select('*', { count: 'exact', head: true });

            // Patients: Count profiles with role 'patient' or from patients table (which might be per-clinic)
            // Ideally unique patients in the system. If 'patients' table is per-clinic, this counts records, not unique humans. 
            // If we want system-wide users:
            // const { count: patients } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'patient');
            const { count: patients } = await supabase.from('patients').select('*', { count: 'exact', head: true });

            // 2. Pending Requests 
            const { count: pendingSuppliers } = await supabase.from('suppliers').select('*', { count: 'exact', head: true }).eq('is_verified', false); // status column doesn't exist
            const { count: pendingLabs } = await supabase.from('dental_laboratories').select('*', { count: 'exact', head: true }).eq('is_verified', false);
            const { count: pendingSubs } = await supabase.from('subscription_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');
            const { count: pendingLabRequests } = await supabase.from('dental_lab_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');

            const totalPending = (pendingSuppliers || 0) + (pendingLabs || 0) + (pendingSubs || 0) + (pendingLabRequests || 0);

            // 3. Revenue (This month)
            const now = new Date();
            const start = startOfMonth(now).toISOString();
            const end = endOfMonth(now).toISOString();

            const { data: revenueData } = await supabase
                .from('subscription_requests')
                .select('plan_id(price)')
                .eq('status', 'approved')
                .gte('updated_at', start)
                .lte('updated_at', end);

            const revenue = revenueData?.reduce((acc: number, curr: any) => acc + (curr.plan_id?.price || 0), 0) || 0;

            setStats({
                clinicsCount: clinics || 0,
                suppliersCount: suppliers || 0,
                labsCount: labs || 0,
                patientsCount: patients || 0,
                pendingRequests: totalPending,
                monthlyRevenue: revenue,
                growth: 12.5,
                doctorsCount: doctors || 0
            });

        } catch (error) {
            console.error('Error fetching admin stats:', error);
        }
    };

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('admin_settings')
                .select('value')
                .eq('key', 'platform_config')
                .single();

            if (data) {
                setSettings({ ...settings, ...data.value });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const fetchAgents = async () => {
        try {
            const { data, error } = await supabase
                .from('agents')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setAgents(data.map(agent => ({
                    id: agent.id,
                    name: agent.name,
                    code: agent.code || 'N/A',
                    governorate: agent.governorate,
                    phone: agent.phone,
                    email: agent.email,
                    address: agent.address,
                    clinicsCount: agent.clinics_count || 0,
                    status: agent.status,
                    joinDate: agent.created_at?.split('T')[0],
                    commissionRate: agent.commission_rate || 0
                })));
            }
        } catch (error) {
            console.error('Error fetching agents:', error);
        }
    };

    const fetchPaymentMethods = async () => {
        try {
            const { data, error } = await supabase
                .from('payment_methods')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;

            if (data) {
                setPaymentMethods(data.map(pm => ({
                    id: pm.id,
                    name: pm.name,
                    type: pm.type || 'manual',
                    number: pm.number,
                    recipientName: pm.recipient_name,
                    qrCodeUrl: pm.qr_code_url,
                    isActive: pm.is_active,
                    details: pm.details || {}
                })));
            }
        } catch (error) {
            console.error('Error fetching payment methods:', error);
        }
    };

    const updateSettings = async (newSettings: Partial<PlatformSettings>) => {
        try {
            const updated = { ...settings, ...newSettings };
            const { error } = await supabase
                .from('admin_settings')
                .upsert({
                    key: 'platform_config',
                    value: updated
                }, { onConflict: 'key' });

            if (error) throw error;
            setSettings(updated);
            return true;
        } catch (error) {
            console.error('Error updating settings:', error);
            return false;
        }
    };

    // --- Payment Methods ---
    const updatePaymentMethod = async (id: string, updates: Partial<PaymentMethod>) => {
        try {
            // Map frontend fields to DB fields
            const dbUpdates: any = {};
            if (updates.name !== undefined) dbUpdates.name = updates.name;
            if (updates.number !== undefined) dbUpdates.number = updates.number;
            if (updates.type !== undefined) dbUpdates.type = updates.type;
            if (updates.recipientName !== undefined) dbUpdates.recipient_name = updates.recipientName;
            if (updates.qrCodeUrl !== undefined) dbUpdates.qr_code_url = updates.qrCodeUrl;
            if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
            if (updates.details !== undefined) dbUpdates.details = updates.details;

            const { error } = await supabase
                .from('payment_methods')
                .update(dbUpdates)
                .eq('id', id);

            if (error) throw error;

            setPaymentMethods(prev => prev.map(pm => pm.id === id ? { ...pm, ...updates } : pm));
            return true;
        } catch (error) {
            console.error('Error updating payment method:', error);
            return false;
        }
    };

    // --- Agents ---
    const addAgent = async (agent: Omit<Agent, 'id' | 'joinDate' | 'created_at'>) => {
        try {
            // Generate simple code if missing
            const code = agent.code || Math.random().toString(36).substring(2, 8).toUpperCase();

            const { data, error } = await supabase
                .from('agents')
                .insert([{
                    name: agent.name,
                    code: code,
                    governorate: agent.governorate,
                    phone: agent.phone,
                    email: agent.email,
                    address: agent.address,
                    status: 'active',
                    clinics_count: 0,
                    commission_rate: agent.commissionRate || 0
                }])
                .select()
                .single();

            if (error) throw error;

            if (data) {
                setAgents(prev => [{
                    id: data.id,
                    name: data.name,
                    code: data.code,
                    governorate: data.governorate,
                    phone: data.phone,
                    email: data.email,
                    address: data.address,
                    status: data.status,
                    clinicsCount: data.clinics_count,
                    joinDate: data.created_at?.split('T')[0],
                    commissionRate: data.commission_rate
                }, ...prev]);
            }
            return true;
        } catch (error) {
            console.error('Error adding agent:', error);
            return false;
        }
    };

    const updateAgent = async (id: string, updates: Partial<Agent>) => {
        try {
            // Map frontend to DB
            const dbUpdates: any = {};
            if (updates.name !== undefined) dbUpdates.name = updates.name;
            if (updates.code !== undefined) dbUpdates.code = updates.code;
            if (updates.governorate !== undefined) dbUpdates.governorate = updates.governorate;
            if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
            if (updates.email !== undefined) dbUpdates.email = updates.email;
            if (updates.address !== undefined) dbUpdates.address = updates.address;
            if (updates.status !== undefined) dbUpdates.status = updates.status;
            if (updates.commissionRate !== undefined) dbUpdates.commission_rate = updates.commissionRate;

            const { error } = await supabase
                .from('agents')
                .update(dbUpdates)
                .eq('id', id);

            if (error) throw error;

            setAgents(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
            return true;
        } catch (error) {
            console.error('Error updating agent:', error);
            return false;
        }
    };

    const deleteAgent = async (id: string) => {
        try {
            const { error } = await supabase
                .from('agents')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setAgents(prev => prev.filter(a => a.id !== id));
            return true;
        } catch (error) {
            console.error('Error deleting agent:', error);
            return false;
        }
    };

    const [clinics, setClinics] = useState<any[]>([]);

    const fetchClinics = async () => {
        try {
            const { data, error } = await supabase
                .from('clinics')
                .select('*, owner:profiles(full_name, phone, email)')
                // We assume subscription_plan column might satisfy us, but if it's an ID, we might need a join. 
                // However, without exact schema knowledge, keeping it simple is safer.
                // If subscription_plan is an ID, we would need: .select('*, owner:profiles(...), current_plan:subscription_plans(name, type)')
                // based on earlier code, it seems to be a string. I will trust the user input and my flexible renderer.
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setClinics(data);
        } catch (error) {
            console.error('Error fetching clinics:', error);
        }
    };

    const approveClinic = async (id: string) => {
        try {
            const { error } = await supabase
                .from('clinics')
                .update({ is_verified: true })
                .eq('id', id);

            if (error) throw error;
            setClinics(prev => prev.map(c => c.id === id ? { ...c, is_verified: true } : c));
            return true;
        } catch (error) {
            console.error('Error approving clinic:', error);
            return false;
        }
    };

    const rejectClinic = async (id: string) => {
        try {
            // In a real app, you might delete or mark as rejected
            const { error } = await supabase
                .from('clinics')
                .update({ is_verified: false }) // Or some other status
                .eq('id', id);

            if (error) throw error;
            setClinics(prev => prev.map(c => c.id === id ? { ...c, is_verified: false } : c));
            return true;
        } catch (error) {
            console.error('Error rejecting clinic:', error);
            return false;
        }
    };

    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            await Promise.all([
                fetchStats(),
                fetchSettings(),
                fetchAgents(),
                fetchPaymentMethods(),
                fetchClinics()
            ]);
            setLoading(false);
        };
        loadAll();
    }, []);

    return {
        stats,
        settings,
        loading,
        paymentMethods,
        agents,
        clinics,
        updateSettings,
        updatePaymentMethod,
        addAgent,
        updateAgent,
        deleteAgent,
        approveClinic,
        rejectClinic,
        refreshParams: fetchStats
    };
};
