import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useClinics } from './useClinics';
import { supabase } from '../lib/supabase';

export interface ShippingAddress {
    id: string;
    name: string;
    city: string;
    area?: string;
    street: string;
    phone: string;
    isDefault: boolean;
    type?: 'custom' | 'clinic' | 'lab';
    sourceId?: string;
    governorate?: string;
}


// Map DB Address to Frontend interface
const mapAddress = (dbAddr: any): ShippingAddress => ({
    id: dbAddr.id,
    name: dbAddr.name || 'عنوان محفوظ',
    city: dbAddr.city,
    governorate: dbAddr.governorate,
    area: '', // Not stored in our simple schema, optional
    street: dbAddr.address,
    phone: dbAddr.phone,
    isDefault: dbAddr.is_default,
    type: 'custom'
});

export const useStoreAddresses = () => {
    const { user } = useAuth();
    const { clinics } = useClinics();
    const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAddresses = async () => {
        if (!user) return;
        setLoading(true);
        const newAddressList: ShippingAddress[] = [];

        try {
            // 1. Fetch Saved User Addresses
            const { data: savedData, error } = await supabase
                .from('shipping_addresses')
                .select('*')
                .eq('user_id', user.id)
                .order('is_default', { ascending: false });

            if (savedData && !error) {
                savedData.forEach(addr => newAddressList.push(mapAddress(addr)));
            }

            // 2. Fetch Lab Address if User is Lab Owner
            if (user.role === 'laboratory') {
                const { data: labData } = await supabase
                    .from('dental_laboratories')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (labData) {
                    newAddressList.push({
                        id: `LAB-${labData.id}`,
                        name: labData.lab_name,
                        city: labData.address || '',
                        governorate: labData.governorate || 'بغداد',
                        area: '',
                        street: '',
                        phone: labData.phone || '',
                        isDefault: false,
                        type: 'lab',
                        sourceId: labData.id
                    });
                }
            }

            // 3. Fetch Clinic Addresses if User is Doctor (Owner)
            if (user.role === 'doctor' && clinics.length > 0) {
                // Filter clinics owned by this user
                const mine = clinics.filter(c => c.owner_id === user.id);

                mine.forEach(clinic => {
                    newAddressList.push({
                        id: `CLINIC-${clinic.id}`,
                        name: clinic.name || '',
                        city: clinic.address || '',
                        governorate: clinic.governorate || 'بغداد',
                        area: '',
                        street: '',
                        phone: clinic.phone || '',
                        isDefault: false,
                        type: 'clinic',
                        sourceId: clinic.id
                    });
                });
            }
        } catch (err) {
            console.error('Error fetching addresses:', err);
        } finally {
            setAddresses(newAddressList);
            setLoading(false);
        }
    };

    const addAddress = async (address: Omit<ShippingAddress, 'id' | 'isDefault'>) => {
        if (!user) return;
        try {
            const { error } = await supabase.from('shipping_addresses').insert({
                user_id: user.id,
                name: address.name,
                city: address.city,
                address: address.street,
                phone: address.phone,
                governorate: address.governorate,
                is_default: false
            });
            if (error) throw error;
            fetchAddresses();
        } catch (err) {
            console.error('Failed to add address', err);
            throw err;
        }
    };

    const deleteAddress = async (id: string) => {
        // Only delete custom addresses (UUIDs), not generated ones like LAB- or CLINIC-
        if (id.startsWith('LAB-') || id.startsWith('CLINIC-')) return;

        try {
            const { error } = await supabase.from('shipping_addresses').delete().eq('id', id);
            if (error) throw error;
            fetchAddresses();
        } catch (err) {
            console.error('Failed to delete address', err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAddresses();
        }
    }, [user, clinics]);

    return {
        addresses,
        loading,
        addAddress,
        deleteAddress,
        refresh: fetchAddresses
    };
};
