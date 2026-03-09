import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export interface Experience {
    id: string;
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
}

export interface Education {
    id: string;
    degree: string;
    institution: string;
    year: string;
}

export interface JobSeekerProfile {
    id: string;
    title: string;
    bio: string;
    skills: string[];
    experience: Experience[];
    education: Education[];
    phone: string;
    location: string;
    is_looking_for_work: boolean;
    resume_url?: string;
    role?: string;
}

const INITIAL_PROFILE: JobSeekerProfile = {
    id: '',
    title: '',
    bio: '',
    skills: [],
    experience: [],
    education: [],
    phone: '',
    location: '',
    is_looking_for_work: false
    // role: 'doctor' removed
};

export const useJobProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<JobSeekerProfile>(INITIAL_PROFILE);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastError, setLastError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        setLastError(null);
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('job_seeker_profiles')
                .select('*')
                .eq('id', user?.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
                console.error('Error fetching job profile:', error);
            }

            if (data) {
                setProfile({
                    ...data,
                    // Ensure arrays are initialized if null in DB
                    skills: data.skills || [],
                    experience: data.experience || [],
                    education: data.education || []
                });
            } else {
                // If not found in DB, check LocalStorage for migration
                const localSaved = localStorage.getItem(`professional_profile_${user?.id}`);
                if (localSaved) {
                    const parsed = JSON.parse(localSaved);
                    setProfile({
                        ...INITIAL_PROFILE,
                        id: user!.id,
                        ...parsed
                    });
                    // Optional: Auto-save to DB to complete migration? For now, we wait for user to hit Save.
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (updates: Partial<JobSeekerProfile>) => {
        if (!user) return;
        setSaving(true);
        try {
            // Try updating with all fields including potentially new 'role'
            const { error } = await supabase
                .from('job_seeker_profiles')
                .upsert({
                    ...profile,
                    ...updates,
                    id: user.id,
                    updated_at: new Date().toISOString()
                });

            if (error) {
                // Retry blindly without role to handle any schema mismatch or constraint issue
                console.warn('Profile update failed, retrying without role...', error.message);
                const { role, ...profileWithoutRole } = { ...profile, ...updates };
                const { error: retryError } = await supabase
                    .from('job_seeker_profiles')
                    .upsert({
                        ...profileWithoutRole,
                        id: user.id,
                        updated_at: new Date().toISOString()
                    });
                if (retryError) throw retryError;
            }

            setProfile(prev => ({ ...prev, ...updates }));
            toast.success('تم حفظ الملف المهني بنجاح');

            // Clear legacy local storage after successful DB save
            localStorage.removeItem(`professional_profile_${user.id}`);
        } catch (error: any) {
            console.error('Error updating profile:', error);
            const msg = error.message || 'Unknown error during update';
            setLastError(msg);
            toast.error('حدث خطأ أثناء الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const toggleLookingForWork = async (status: boolean) => {
        if (!user) {
            console.error('toggleLookingForWork: No user logged in');
            toast.error('يرجى تسجيل الدخول أولاً');
            return;
        }
        setLastError(null);

        try {
            // Optimization: Try to just UPDATE the specific column first. 
            // This avoids schema errors with 'role' if the row exists.
            const { data, error } = await supabase
                .from('job_seeker_profiles')
                .update({ is_looking_for_work: status, updated_at: new Date().toISOString() })
                .eq('id', user.id)
                .select();

            if (error) {
                console.warn('Direct update failed (likely row missing):', error);
            } else if (data && data.length > 0) {
                setProfile(prev => ({ ...prev, is_looking_for_work: status }));
                toast.success(status ? 'تم تفعيل حالة البحث عن عمل' : 'تم تعطيل حالة البحث عن عمل');
                return;
            }
        } catch (e) {
            console.warn('Direct update exception:', e);
        }

        // Fallback to full upsert (creates row if missing)
        await updateProfile({ is_looking_for_work: status });
    };

    return {
        profile,
        loading,
        saving,
        lastError,
        updateProfile,
        toggleLookingForWork,
        refresh: fetchProfile
    };
};
