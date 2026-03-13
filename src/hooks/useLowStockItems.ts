import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { InventoryItem } from './useInventory';
import { useClinics } from './useClinics';

export const useLowStockItems = () => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { clinics } = useClinics();
    const mountedRef = useRef(true);

    const fetchLowStock = async () => {
        try {
            let query = supabase
                .from('inventory')
                .select('*')
                .order('quantity', { ascending: true });

            const clinicIds = clinics.map(c => c.id);
            if (clinicIds.length > 0) {
                query = query.in('clinic_id', clinicIds);
            } else {
                // If user has no clinics, don't fetch any inventory
                setItems([]);
                setLoading(false);
                return;
            }

            const { data, error } = await query;

            if (error) throw error;

            // JS Filtering for quantity <= min_stock & Mapping
            const lowStock = (data || []).filter(i => i.quantity <= i.min_stock).map(item => {
                const clinic = clinics.find(c => c.id === item.clinic_id?.toString());
                return {
                    id: item.id.toString(),
                    name: item.item_name,
                    category: item.category,
                    quantity: item.quantity,
                    unitPrice: parseFloat(item.unit_price),
                    minStock: item.min_stock,
                    unit: item.unit || 'pcs',
                    supplier: item.supplier_name,
                    status: (item.quantity <= 0 ? 'out_of_stock' : 'low_stock') as 'out_of_stock' | 'low_stock',
                    lastRestockDate: item.last_restock_date || item.updated_at || '',
                    clinicId: item.clinic_id?.toString(),
                    clinicName: clinic ? clinic.name : (item.clinic_id === 1 ? 'عيادة النور' : (item.clinic_id === 2 ? 'مركز الابتسامة' : `عيادة ${item.clinic_id}`))
                };
            });

            if (lowStock.length === 0) {
                setItems([]);
            } else {
                setItems(lowStock);
            }
        } catch (err: any) {
            if (err?.name === 'AbortError' || err?.message?.includes('AbortError')) return;
            if (mountedRef.current) {
                console.error('Error fetching low stock:', err);
                setItems([]);
            }
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    };

    useEffect(() => {
        mountedRef.current = true;
        fetchLowStock();
        return () => { mountedRef.current = false; };
    }, [clinics]);

    return { items, loading, error, refresh: fetchLowStock };
};
