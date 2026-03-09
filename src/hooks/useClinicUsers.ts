import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ClinicUser {
    id: string; // User UUID
    name: string;
    email?: string;
    role: string;
    avatar?: string;
}

export const useClinicUsers = (clinicId?: string) => {
    const [users, setUsers] = useState<ClinicUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (clinicId) {
            fetchUsers();
        }
    }, [clinicId]);

    const fetchUsers = async () => {
        try {
            setLoading(true);

            // 1. Get members from clinic_members
            const { data: members, error: membersError } = await supabase
                .from('clinic_members')
                .select('user_id, role')
                .eq('clinic_id', clinicId);

            if (membersError) throw membersError;

            if (members && members.length > 0) {
                const userIds = members.map(m => m.user_id);

                // 2. Get profile details
                const { data: profiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, full_name, email, role, avatar_url')
                    .in('id', userIds);

                if (profilesError) throw profilesError;

                if (profiles) {
                    const mappedUsers = profiles.map(p => ({
                        id: p.id,
                        name: p.full_name || 'مستخدم غير معروف',
                        email: p.email,
                        role: p.role,
                        avatar: p.avatar_url
                    }));
                    setUsers(mappedUsers);
                }
            } else {
                setUsers([]);
            }

        } catch (err) {
            console.error('Error fetching clinic users:', err);
        } finally {
            setLoading(false);
        }
    };

    return { users, loading, refresh: fetchUsers };
};
