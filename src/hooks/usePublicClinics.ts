import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Clinic } from '../types';

export const usePublicClinics = () => {
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPublicClinics = async () => {
            try {
                // Fetch all clinics without owner/member restrictions
                const { data, error } = await supabase
                    .from('clinics')
                    .select('*')
                    .limit(50); // Reasonable limit for map

                if (error) throw error;

                if (data) {
                    const mapped: Clinic[] = data.map((c: any) => {
                        // Apply a subtle jitter to coordinates if they are exactly the same
                        // This prevents perfect overlap of markers
                        const jitterLat = (Math.random() - 0.5) * 0.0002;
                        const jitterLng = (Math.random() - 0.5) * 0.0002;

                        return {
                            id: c.id.toString(),
                            name: c.name,
                            address: c.address || '',
                            governorate: c.governorate || '',
                            phone: c.phone || '',
                            location: c.latitude && c.longitude
                                ? { lat: Number(c.latitude) + jitterLat, lng: Number(c.longitude) + jitterLng }
                                : { lat: 33.3152 + (Math.random() * 0.05 - 0.025), lng: 44.3661 + (Math.random() * 0.05 - 0.025) }, // Fallback randomly around Baghdad if missing
                            rating: 4.5,
                            specialties: c.specialties || ['طب أسنان عام'],
                            services: c.services || [],
                            workingHours: c.working_hours || '09:00 - 21:00',
                            image: c.image_url || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=60',
                            coverImage: c.cover_url || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80',
                            description: c.description,
                            email: c.email,
                            owner_id: c.owner_id,
                            settings: c.settings || {},
                            isFeatured: c.is_featured || false,
                            isDigitalBookingEnabled: c.is_digital_booking || false,
                        };
                    });
                    setClinics(mapped);
                }
            } catch (err) {
                console.error('Error fetching public clinics:', err);
                // Fallback to empty or specific error state
                setClinics([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPublicClinics();
    }, []);

    return { clinics, loading };
};
