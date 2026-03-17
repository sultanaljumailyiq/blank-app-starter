import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Clinic } from '../types';

export const useClinics = () => {
    const { user } = useAuth();
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [loading, setLoading] = useState(true);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        if (user) fetchClinics();
        return () => { mountedRef.current = false; };
    }, [user]);

    const fetchClinics = async () => {
        setLoading(true);
        try {
            if (!user) return;

            // 1. Fetch Clinics Owned by User
            const { data: ownedClinics, error: ownerError } = await supabase
                .from('clinics')
                .select('*')
                .eq('owner_id', user.id);

            if (ownerError) throw ownerError;

            // 2. Fetch Clinics where User is a Member (Staff)
            // 2. Fetch Clinics where User is a Member (Staff)
            let memberClinics = [];
            try {
                // Check 'staff' table using both user_id and auth_user_id for compatibility
                const { data: staffData, error: staffError } = await supabase
                    .from('staff')
                    .select('clinic:clinics(*)')
                    .or(`user_id.eq.${user.id},auth_user_id.eq.${user.id}`)
                    .in('status', ['active', 'on_leave']);

                if (staffError) {
                    console.warn('Staff fetch error (ignoring):', staffError);
                } else {
                    memberClinics = staffData?.map((m: any) => m.clinic).filter(Boolean) || [];
                }

                // Legacy check for clinic_members if it still exists (optional)
                /*
                const { data: memberData, error: memberError } = await supabase
                    .from('clinic_members')
                    .select('clinic:clinics(*)')
                    .eq('user_id', user.id);
                if (!memberError && memberData) {
                    const legacyClinics = memberData.map((m: any) => m.clinic);
                    memberClinics = [...memberClinics, ...legacyClinics];
                }
                */
            } catch (err) {
                console.warn('Member fetch exception (ignoring):', err);
            }

            // 3. Merge and Deduplicate
            let allClinics = [...(ownedClinics || []), ...memberClinics].filter((c, index, self) =>
                index === self.findIndex((t) => (t.id === c.id))
            );



            // Map to Interface
            const mappedClinics: Clinic[] = allClinics.map((c: any) => ({
                id: c.id.toString(),
                name: c.name,
                phone: c.phone || '',
                location: (c.latitude && c.longitude)
                    ? { lat: c.latitude, lng: c.longitude }
                    : { lat: 33.3152, lng: 44.3661 },
                rating: 4.8,
                specialties: c.specialties || ['طب أسنان عام'],
                services: c.services || [],
                workingHours: (typeof c.working_hours === 'string' ? c.working_hours : '09:00 - 21:00'),
                image: c.image_url || c.image || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=60',
                coverImage: c.cover_url || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80',
                description: c.description,
                email: c.email,
                owner_id: c.owner_id,
                settings: c.settings || {},
                isFeatured: c.is_featured || false,
                isDigitalBookingEnabled: c.is_digital_booking || false,
                governorate: c.governorate || '',
                address: c.address || '',
            }));

            setClinics(mappedClinics);
        } catch (err: any) {
            if (err?.name === 'AbortError' || err?.message?.includes('AbortError')) return;
            if (mountedRef.current) console.error('Error fetching clinics:', err);
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    };

    const addClinic = async (clinicData: any) => {
        try {
            const { data, error } = await supabase.from('clinics').insert({
                ...clinicData,
                owner_id: user?.id
            }).select().single();

            if (error) throw error;
            fetchClinics();
            return data;
        } catch (err) {
            console.error('Error adding clinic:', err);
            throw err;
        }
    };

    const updateClinic = async (id: string, updates: Partial<Clinic>) => {
        try {
            // Optimistic update
            setClinics(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

            // Map frontend camelCase to DB snake_case
            const dbUpdates: any = { ...updates };
            if ('coverImage' in updates) {
                dbUpdates.cover_url = updates.coverImage;
                delete dbUpdates.coverImage;
            }
            if ('workingHours' in updates) {
                dbUpdates.working_hours = updates.workingHours;
                delete dbUpdates.workingHours;
            }
            if ('image' in updates) {
                dbUpdates.image_url = updates.image;
                delete dbUpdates.image;
            }
            if ('logo' in updates) {
                dbUpdates.image_url = updates.logo; // Handle legacy 'logo' prop
                delete dbUpdates.logo;
            }
            if ('location' in updates && updates.location) {
                dbUpdates.latitude = updates.location.lat;
                dbUpdates.longitude = updates.location.lng;
                delete dbUpdates.location;
            }
            if ('isFeatured' in updates) {
                dbUpdates.is_featured = updates.isFeatured;
                delete dbUpdates.isFeatured;
            }
            if ('isDigitalBookingEnabled' in updates) {
                dbUpdates.is_digital_booking = updates.isDigitalBookingEnabled;
                delete dbUpdates.isDigitalBookingEnabled;
            }

            const { error } = await supabase
                .from('clinics')
                .update(dbUpdates)
                .eq('id', id);

            if (error) throw error;
            // Background refresh to ensure consistency
            fetchClinics();
        } catch (err) {
            console.error('Error updating clinic:', err);
            // Revert on error (optional, but good practice)
            fetchClinics();
            throw err;
        }
    };

    const deleteClinic = async (id: string) => {
        try {
            const { error } = await supabase
                .from('clinics')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setClinics(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error('Error deleting clinic:', err);
            throw err;
        }
    };

    return {
        clinics,
        loading,
        addClinic,
        updateClinic,
        deleteClinic,
        refresh: fetchClinics
    };
};
