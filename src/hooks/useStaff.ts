
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export interface StaffMember {
    id: string; // Cast to string for frontend compatibility
    clinicId: string;
    name: string;
    phone: string;
    email: string;
    department: string;
    role_title?: string;
    position: 'doctor' | 'assistant' | 'nurse' | 'receptionist' | 'admin' | 'technician';
    salary: number;
    status: 'active' | 'on_leave' | 'suspended' | 'terminated';
    hireDate: string;
    address: string;
    qualifications: string[];
    certifications: string[];
    workSchedule: {
        days: string[];
        startTime: string;
        endTime: string;
        breaks: { start: string; end: string; duration: number }[];
    };
    attendance: { present: number; absent: number; late: number; overtime: number };
    performance: {
        rating: number;
        lastReview: string;
        achievements: string[];
        goals: string[];
    };
    skills: string[];
    languages: string[];
    notes: string;
    username?: string;
    password?: string;
    authUserId?: string;
    permissions: {
        appointments: boolean;
        patients: boolean;
        financials: boolean;
        settings: boolean;
        reports: boolean;
        // New permissions
        activityLog: boolean;
        assets: boolean;
        staff: boolean; // View only
        manageStaff: boolean; // Create/Edit/Delete
        lab: boolean;
        // Role-based shortcuts
        assistantManager: boolean; // Full access within clinic
    };
    viewPreferences?: {
        showFinancials?: boolean;
        showCases?: boolean;
        showWorkInfo?: boolean;
    };
    userId?: string; // Linked Auth User ID
    isLinkedAccount?: boolean;
}

export const useStaff = (clinicId?: string) => {
    const { user } = useAuth();
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStaff();
    }, [clinicId]);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('staff')
                .select('*')
                .is('deleted_at', null);

            if (clinicId) {
                query = query.eq('clinic_id', clinicId);
            }
            // ...
            // ... skipped lines ...
            const deleteStaff = async (id: string) => {
                try {
                    // Soft delete
                    const { error } = await supabase
                        .from('staff')
                        .update({ deleted_at: new Date().toISOString() })
                        .eq('id', id);

                    if (error) throw error;

                    await logActivity('delete_staff', id, { reason: 'Soft delete from UI' });
                    toast.success('تم حذف الموظف بنجاح (يمكنك الاستعادة من سجل النشاطات)');
                    fetchStaff();
                } catch (error) {
                    console.error('Error deleting staff:', error);
                    toast.error('فشل حذف الموظف');
                }
            };
            // else: RLS should handle filtering by owner/doctor

            const { data, error } = await query;

            if (error) throw error;

            if (data) {
                const mappedStaff: StaffMember[] = data.map((s: any) => ({
                    id: s.id.toString(),
                    clinicId: s.clinic_id?.toString() || clinicId,
                    authUserId: s.auth_user_id,
                    name: s.full_name,
                    phone: s.phone,
                    email: s.email,
                    department: s.department,
                    role_title: s.role_title,
                    position: (s.role_title as any) || s.position || 'doctor',
                    salary: s.salary,
                    status: s.status || (s.is_active ? 'active' : 'suspended'),
                    hireDate: s.join_date,
                    username: s.username,
                    password: s.password, // Only if allowed to read
                    address: s.address || '',
                    qualifications: s.qualifications || [],
                    certifications: s.certifications || [],
                    workSchedule: s.work_schedule || { days: [], startTime: '09:00', endTime: '17:00', breaks: [] },
                    attendance: s.attendance_stats || { present: 0, absent: 0, late: 0, overtime: 0 },
                    performance: s.performance_stats || { rating: 5, lastReview: '', achievements: [], goals: [] },
                    skills: s.skills || [],
                    languages: s.languages || ['العربية'],
                    notes: s.notes || '',
                    permissions: {
                        appointments: false,
                        patients: false,
                        financials: false,
                        settings: false,
                        reports: false,
                        activityLog: false,
                        assets: false,
                        staff: false,
                        manageStaff: false,
                        lab: false,
                        assistantManager: false,
                        ...s.permissions
                    },
                    viewPreferences: s.view_preferences || { showFinancials: true, showCases: true, showWorkInfo: true },
                    userId: s.user_id,
                    isLinkedAccount: s.is_linked_account
                }));
                setStaff(mappedStaff);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
            toast.error('فشل تحميل بيانات الموظفين');
        } finally {
            setLoading(false);
        }
    };

    const addStaff = async (member: Omit<StaffMember, 'id'>) => {
        try {
            const { data, error } = await supabase
                .from('staff')
                .insert({
                    clinic_id: clinicId || undefined,
                    auth_user_id: member.authUserId,
                    full_name: member.name,
                    role_title: member.role_title || member.position, // Enhanced mapping
                    department: member.department,
                    salary: member.salary,
                    phone: member.phone,
                    email: member.email,
                    join_date: member.hireDate,
                    is_active: member.status === 'active',
                    status: member.status,
                    username: member.username,
                    password: member.password,
                    address: member.address,
                    notes: member.notes,
                    work_schedule: member.workSchedule,
                    attendance_stats: member.attendance,
                    performance_stats: member.performance,
                    skills: member.skills,
                    languages: member.languages,
                    qualifications: member.qualifications,
                    certifications: member.certifications,
                    permissions: member.permissions,
                    user_id: member.userId
                })
                .select()
                .single();

            if (error) throw error;

            toast.success('تمت إضافة الموظف بنجاح');
            fetchStaff(); // Refresh list
            return data;
        } catch (error) {
            console.error('Error adding staff:', error);
            toast.error('فشل إضافة الموظف');
        }
    };

    const updateStaff = async (id: string, updates: Partial<StaffMember>) => {
        try {
            const dbUpdates: any = {};
            if (updates.name) dbUpdates.full_name = updates.name;
            if (updates.role_title) dbUpdates.role_title = updates.role_title;
            if (updates.position) dbUpdates.role_title = updates.position; // Fallback or override? Adjusting to favor explicit role_title if present
            // Better logic:
            // if (updates.role_title) dbUpdates.role_title = updates.role_title;
            // else if (updates.position) dbUpdates.role_title = updates.position;
            if (updates.department) dbUpdates.department = updates.department;
            if (updates.salary) dbUpdates.salary = updates.salary;
            if (updates.phone) dbUpdates.phone = updates.phone;
            if (updates.email) dbUpdates.email = updates.email;
            if (updates.status) {
                dbUpdates.status = updates.status;
                dbUpdates.is_active = updates.status === 'active';
            }
            if (updates.permissions) dbUpdates.permissions = updates.permissions;
            if (updates.username) dbUpdates.username = updates.username;
            if (updates.password) dbUpdates.password = updates.password;
            if (updates.authUserId) dbUpdates.auth_user_id = updates.authUserId;
            if (updates.workSchedule) dbUpdates.work_schedule = updates.workSchedule;
            if (updates.viewPreferences) dbUpdates.view_preferences = updates.viewPreferences;
            if (updates.userId !== undefined) dbUpdates.user_id = updates.userId;

            const { error } = await supabase
                .from('staff')
                .update(dbUpdates)
                .eq('id', id);

            if (error) throw error;

            toast.success('تم التحديث بنجاح');
            fetchStaff();
        } catch (error) {
            console.error('Error updating staff:', error);
            toast.error('فشل التحديث');
        }
    };

    const deleteStaff = async (id: string) => {
        try {
            // Soft delete
            const { error } = await supabase
                .from('staff')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            await logActivity('delete_staff', id, { reason: 'Soft delete from UI' });
            toast.success('تم حذف الموظف بنجاح (يمكنك الاستعادة من سجل النشاطات)');
            fetchStaff();
        } catch (error) {
            console.error('Error deleting staff:', error);
            toast.error('فشل حذف الموظف');
        }
    };

    const sendInvitation = async (email: string, role: string) => {
        if (!clinicId || !user) {
            toast.error('بيانات مفقودة (العيادة أو المستخدم)');
            return;
        }

        try {
            const { error } = await supabase.from('clinic_invitations').insert({
                clinic_id: parseInt(clinicId),
                email,
                role,
                status: 'pending',
                created_by: user.id
            });

            if (error) throw error;

            toast.success('تم إرسال الدعوة بنجاح');
            await logActivity('send_invitation', 'invitation', { email, role });
            return true;
        } catch (err) {
            console.error('Error sending invitation:', err);
            toast.error('فشل إرسال الدعوة: هذا البريد قد يكون مدعواً بالفعل');
            throw err;
        }
    };

    const logActivity = async (action: string, entityId: string, details: any) => {
        try {
            await supabase.from('activity_logs').insert({
                clinic_id: clinicId,
                action_type: action,
                entity_type: 'staff',
                entity_id: entityId,
                details
            });
        } catch (e) {
            console.error('Failed to log activity', e);
        }
    };

    return {
        staff,
        loading,
        addStaff: async (member: Omit<StaffMember, 'id'>) => {
            const result = await addStaff(member);
            if (result) {
                await logActivity('create_staff', result.id, { name: member.name, position: member.position });
            }
            return result;
        },
        updateStaff: async (id: string, updates: Partial<StaffMember>) => {
            await updateStaff(id, updates);
            await logActivity('update_staff', id, updates);
        },
        deleteStaff,
        refresh: fetchStaff,
        sendInvitation
    };
};
