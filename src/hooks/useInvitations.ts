import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ClinicInvitation } from '../types';

export const useInvitations = () => {
    const { user } = useAuth();
    const [invitations, setInvitations] = useState<ClinicInvitation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.email) fetchInvitations();
    }, [user?.email]);

    const fetchInvitations = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('clinic_invitations')
                .select('*, clinic:clinics(id, name, cover_url, image_url, phone, latitude, longitude, governorate, address)')
                .eq('email', user?.email)
                .eq('status', 'pending');

            if (error) throw error;

            // Fetch pending staff records for this user (Linked Accounts awaiting acceptance)
            let staffData: any[] = [];
            if (user?.id) {
                const { data: sData, error: sError } = await supabase
                    .from('staff')
                    .select('*, clinic:clinics(id, name, cover_url, image_url, phone, latitude, longitude, governorate, address)')
                    .eq('user_id', user.id)
                    .eq('status', 'pending');

                if (sError) console.error('Error fetching staff invitations:', sError);
                if (sData) staffData = sData;
            }

            // Map data to match interface
            let mapped: ClinicInvitation[] = data.map((inv: any) => ({
                id: inv.id,
                clinicId: inv.clinic_id,
                staffId: inv.staff_id ? inv.staff_id.toString() : undefined, // link to existing staff record
                clinic: inv.clinic ? {
                    id: inv.clinic.id,
                    name: inv.clinic.name,
                    coverImage: inv.clinic.cover_url,
                    image: inv.clinic.image_url,
                    phone: inv.clinic.phone,
                    governorate: inv.clinic.governorate,
                    address: inv.clinic.address,
                } as any : undefined,
                email: inv.email,
                role: inv.role,
                status: inv.status,
                createdBy: inv.created_by,
                createdAt: inv.created_at
            }));

            // Map staff invitations
            if (staffData && staffData.length > 0) {
                const staffInvites: ClinicInvitation[] = staffData.map((staff: any) => ({
                    id: staff.id,
                    clinicId: staff.clinic_id,
                    clinic: staff.clinic ? {
                        id: staff.clinic.id,
                        name: staff.clinic.name,
                        coverImage: staff.clinic.cover_url,
                        image: staff.clinic.image_url,
                        phone: staff.clinic.phone,
                        governorate: staff.clinic.governorate,
                        address: staff.clinic.address,
                    } as any : undefined,
                    email: staff.email || user?.email || '',
                    role: staff.role || staff.role_title || 'staff',
                    status: staff.status,
                    createdBy: '',
                    createdAt: staff.created_at,
                    isStaffRecord: true
                }));
                mapped = [...mapped, ...staffInvites];
            }

            setInvitations(mapped);
        } catch (err) {
            console.error('Error fetching invitations:', err);
        } finally {
            setLoading(false);
        }
    };

    const respondToInvitation = async (id: string, accept: boolean) => {
        try {
            const status = accept ? 'accepted' : 'rejected';

            const inv = invitations.find(i => i.id === id);
            if (!inv) throw new Error('Invitation not found');

            if (inv.isStaffRecord) {
                // Respond to staff record
                if (accept) {
                    const { error } = await supabase
                        .from('staff')
                        .update({ status: 'active', is_active: true })
                        .eq('id', id);
                    if (error) throw error;
                } else {
                    const { error } = await supabase
                        .from('staff')
                        .update({ status: 'terminated', is_active: false })
                        .eq('id', id);
                    if (error) throw error;
                }
            } else {
                // 1. Update Invitation Status
                const { error } = await supabase
                    .from('clinic_invitations')
                    .update({ status })
                    .eq('id', id);

                if (error) throw error;

                // 2. If Accepted, create Staff record
                if (accept) {
                    if (inv) {
                        if (inv.staffId) {
                            // ── CASE A: Invitation was sent to LINK an existing staff record ──
                            // Fetch the user's profile to get current contact info
                            const { data: profile } = await supabase
                                .from('profiles')
                                .select('full_name, email, phone, avatar_url')
                                .eq('id', user?.id)
                                .single();

                            // Update the existing staff record: link auth + update contact info only
                            const { error: updateError } = await supabase
                                .from('staff')
                                .update({
                                    auth_user_id: user?.id,
                                    user_id: user?.id,
                                    is_linked_account: true,
                                    status: 'active',
                                    is_active: true,
                                    // Update contact info from platform profile
                                    ...(profile?.full_name && { full_name: profile.full_name }),
                                    ...(profile?.email && { email: profile.email }),
                                    ...(profile?.phone && { phone: profile.phone }),
                                })
                                .eq('id', parseInt(inv.staffId, 10));
                            if (updateError) throw updateError;

                        } else {
                            // ── CASE B: New invitation (no existing staff) — create staff record ──
                            const { data: existing } = await supabase
                                .from('staff')
                                .select('id')
                                .eq('clinic_id', inv.clinicId)
                                .eq('auth_user_id', user?.id)
                                .single();

                            if (!existing) {
                                const { error: insertError } = await supabase.from('staff').insert({
                                    clinic_id: inv.clinicId,
                                    auth_user_id: user?.id,
                                    user_id: user?.id,
                                    email: user?.email,
                                    full_name: (user as any)?.user_metadata?.name || inv.email?.split('@')[0] || 'الموظف',
                                    role_title: getRoleTitleAr(inv.role),
                                    department: '-',
                                    phone: '-',
                                    salary: 0,
                                    join_date: new Date().toISOString().split('T')[0],
                                    status: 'active',
                                    is_active: true,
                                    is_linked_account: true,
                                    permissions: getPermissionsForRole(inv.role)
                                });
                                if (insertError) throw insertError;
                            }
                        }
                    }
                }
            }

            // Refresh invitations
            await fetchInvitations();
            return true;
        } catch (err) {
            console.error('Error responding:', err);
            throw err;
        }
    };

    return { invitations, loading, respondToInvitation, refresh: fetchInvitations };
};

// Helpers
const getRoleTitleAr = (role: string) => {
    const map: any = {
        doctor: 'طبيب',
        nurse: 'ممرض',
        assistant: 'مساعد',
        receptionist: 'موظف استقبال',
        admin: 'مدير',
        technician: 'فني'
    };
    return map[role] || role;
};

const getPermissionsForRole = (role: string) => {
    const base = {
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
        assistantManager: false
    };

    switch (role) {
        case 'doctor':
            return { ...base, appointments: true, patients: true, lab: true };
        case 'admin':
            return {
                ...base, appointments: true, patients: true, financials: true, settings: true,
                reports: true, activityLog: true, assets: true, staff: true, manageStaff: true, lab: true
            };
        case 'receptionist':
            return { ...base, appointments: true, patients: true };
        case 'assistant':
            return { ...base, appointments: true, patients: true, assets: true };
        default:
            return base;
    }
};
