
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
    status: 'active' | 'on_leave' | 'suspended' | 'terminated' | 'pending';
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
        activityLog: boolean;
        assets: boolean;
        staff: boolean;
        manageStaff: boolean;
        lab: boolean;
        assistantManager: boolean;
    };
    viewPreferences?: {
        showFinancials?: boolean;
        showCases?: boolean;
        showWorkInfo?: boolean;
    };
    userId?: string;           // Linked Auth User ID (user_id column)
    isLinkedAccount?: boolean; // Is this staff linked to a platform account?
    invitationId?: string;     // UUID of the clinic_invitation (for cancel)
    hasPendingInvitation?: boolean; // Is there a pending clinic_invitation?
    linkedAccountType?: 'invited' | 'direct_link' | 'created'; // How was the account linked
    avatar?: string;
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

            const invitationsPromise = clinicId
                ? supabase.from('clinic_invitations').select('*').eq('clinic_id', clinicId).eq('status', 'pending')
                : Promise.resolve({ data: [], error: null });

            const [staffRes, invitationsRes] = await Promise.all([
                query,
                invitationsPromise
            ]);

            if (staffRes.error) throw staffRes.error;
            if (invitationsRes.error) throw invitationsRes.error;

            let allStaff: StaffMember[] = [];

            // --- FETCH AVATARS FOR STAFF ---
            let avatarsMap: Record<string, string> = {};
            const userIds = staffRes.data?.map((s: any) => s.user_id).filter(Boolean) || [];
            if (userIds.length > 0) {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, avatar_url')
                    .in('id', userIds);
                if (profiles) {
                    profiles.forEach((p: any) => {
                        if (p.avatar_url) avatarsMap[p.id] = p.avatar_url;
                    });
                }
            }

            // --- FETCH AVATARS FOR INVITATIONS ---
            let inviteAvatars: Record<string, string> = {};
            const inviteEmails = invitationsRes.data?.map((inv: any) => inv.email).filter(Boolean) || [];
            if (inviteEmails.length > 0) {
                const { data: inviteProfiles } = await supabase
                    .from('profiles')
                    .select('email, avatar_url')
                    .in('email', inviteEmails);
                if (inviteProfiles) {
                    inviteProfiles.forEach((p: any) => {
                        if (p.avatar_url) inviteAvatars[p.email] = p.avatar_url;
                    });
                }
            }

            if (staffRes.data) {
                const mappedStaff: StaffMember[] = staffRes.data.map((s: any) => ({
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
                    isLinkedAccount: s.is_linked_account,
                    avatar: s.user_id ? avatarsMap[s.user_id] : ''
                }));
                allStaff = [...allStaff, ...mappedStaff];
            }

            if (invitationsRes.data) {
                const mappedInvitations: StaffMember[] = invitationsRes.data.map((inv: any) => ({
                    // id = UUID of the invitation — used for cancelInvitation
                    id: inv.id.toString(),
                    invitationId: inv.id.toString(), // explicit UUID for cancel
                    hasPendingInvitation: true,
                    clinicId: inv.clinic_id.toString(),
                    name: inv.email.split('@')[0],
                    phone: '-',
                    email: inv.email,
                    department: '-',
                    position: inv.role as any,
                    salary: 0,
                    status: 'pending' as const,
                    hireDate: inv.created_at,
                    address: '',
                    qualifications: [],
                    certifications: [],
                    workSchedule: { days: [], startTime: '09:00', endTime: '17:00', breaks: [] },
                    attendance: { present: 0, absent: 0, late: 0, overtime: 0 },
                    performance: { rating: 0, lastReview: '', achievements: [], goals: [] },
                    skills: [],
                    languages: ['العربية'],
                    notes: '',
                    permissions: {
                        appointments: false, patients: false, financials: false, settings: false, reports: false, activityLog: false, assets: false, staff: false, manageStaff: false, lab: false, assistantManager: false
                    },
                    isLinkedAccount: false,
                    avatar: inv.email ? inviteAvatars[inv.email] : ''
                }));
                allStaff = [...allStaff, ...mappedInvitations];
            }

            setStaff(allStaff);
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

    const sendInvitation = async (email: string, role: string, staffId?: string) => {
        if (!clinicId || !user) {
            toast.error('بيانات مفقودة (العيادة أو المستخدم)');
            return;
        }

        try {
            const row: any = {
                clinic_id: parseInt(clinicId),
                email,
                role,
                status: 'pending',
                created_by: user.id
            };
            // If linking to an existing staff record, store its ID so accept can update instead of create
            if (staffId) {
                row.staff_id = parseInt(staffId, 10);
            }
            const { error } = await supabase.from('clinic_invitations').insert(row);

            if (error) throw error;

            toast.success('تم إرسال الدعوة بنجاح');
            await logActivity('send_invitation', 'invitation', { email, role, staffId });
            return true;
        } catch (err) {
            console.error('Error sending invitation:', err);
            toast.error('فشل إرسال الدعوة: هذا البريد قد يكون مدعواً بالفعل');
            throw err;
        }
    };

    const cancelInvitation = async (invitationId: string) => {
        try {
            // Detect whether this is a UUID (clinic_invitations) or an integer (staff record)
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(invitationId);

            if (isUuid) {
                // clinic_invitations: RLS only allows DELETE (not UPDATE) for owners
                const { error: inviteError } = await supabase
                    .from('clinic_invitations')
                    .delete()
                    .eq('id', invitationId);
                if (inviteError) throw inviteError;
            } else {
                // This is a staff record (integer id) — soft-cancel by setting status to terminated
                const { error: staffError } = await supabase
                    .from('staff')
                    .update({ status: 'terminated', is_active: false })
                    .eq('id', parseInt(invitationId, 10))
                    .eq('status', 'pending');
                if (staffError) throw staffError;
            }

            toast.success('تم إلغاء الدعوة بنجاح');
            await logActivity('cancel_invitation', 'invitation', { invitationId });
            fetchStaff();
        } catch (error) {
            console.error('Error cancelling invitation:', error);
            toast.error('فشل إلغاء الدعوة');
        }
    };

    // Unlink a staff member's auth account from their staff record (clinic owner action)
    const unlinkStaff = async (staffId: string) => {
        try {
            const { error } = await supabase
                .from('staff')
                .update({
                    auth_user_id: null,
                    user_id: null,
                    is_linked_account: false
                })
                .eq('id', parseInt(staffId, 10));
            if (error) throw error;
            toast.success('تم إلغاء ربط الحساب بنجاح');
            await logActivity('unlink_staff', staffId, {});
            fetchStaff();
        } catch (error) {
            console.error('Error unlinking staff:', error);
            toast.error('فشل إلغاء الربط');
        }
    };

    // Leave clinic (staff member action): terminates own staff record
    const leaveClinic = async (staffClinicId: string, userId: string) => {
        try {
            const { error } = await supabase
                .from('staff')
                .update({ status: 'terminated', is_active: false })
                .or(`user_id.eq.${userId},auth_user_id.eq.${userId}`)
                .eq('clinic_id', parseInt(staffClinicId, 10));
            if (error) throw error;
            toast.success('تم الخروج من العيادة بنجاح');
        } catch (error) {
            console.error('Error leaving clinic:', error);
            toast.error('فشل الخروج من العيادة');
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
        sendInvitation,
        cancelInvitation,
        unlinkStaff,
        leaveClinic
    };
};
