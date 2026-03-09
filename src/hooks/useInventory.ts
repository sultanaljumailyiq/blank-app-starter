import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface InventoryItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unitPrice: number;
    minStock: number;
    unit: string;
    lastRestockDate?: string;
    expiryDate?: string;
    supplier?: string;
    status: 'available' | 'low_stock' | 'out_of_stock' | 'expired';
    brand?: string;
    location?: string;
    batchNumber?: string;
    notes?: string;
    clinicId?: string;
    clinicName?: string;
}

export const useInventory = (clinicId?: string) => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInventory();
    }, [clinicId]);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            let query = supabase.from('inventory').select('*');

            if (clinicId) {
                query = query.eq('clinic_id', clinicId);
            }

            const { data, error } = await query;

            if (error) throw error;

            const mappedItems: InventoryItem[] = (data || []).map((i: any) => ({
                id: i.id.toString(),
                name: i.item_name,
                category: i.category,
                quantity: i.quantity,
                unitPrice: Number(i.unit_price),
                minStock: i.min_stock,
                unit: i.unit,
                lastRestockDate: i.last_restock_date,
                expiryDate: i.expiry_date,
                supplier: i.supplier_name,
                status: i.status || 'available', // DB Generated
                brand: i.brand,
                location: i.location,
                batchNumber: i.batch_number || '', // If added to schema
                notes: i.notes || '', // If added to schema
                clinicId: i.clinic_id.toString()
            }));

            setInventory(mappedItems);
        } catch (err) {
            console.error('Error fetching inventory:', err);
        } finally {
            setLoading(false);
        }
    };

    const addItem = async (newItem: Omit<InventoryItem, 'id' | 'status'>) => {
        try {
            const dbItem = {
                clinic_id: clinicId || '101', // Fallback clinic ID
                item_name: newItem.name,
                category: newItem.category,
                quantity: newItem.quantity,
                unit_price: newItem.unitPrice,
                min_stock: newItem.minStock,
                unit: newItem.unit,
                supplier_name: newItem.supplier,
                brand: newItem.brand,
                location: newItem.location,
                expiry_date: newItem.expiryDate
                // status is generated
            };

            const { error } = await supabase.from('inventory').insert([dbItem]);
            if (error) throw error;
            fetchInventory();
        } catch (err) {
            console.error('Error adding inventory item:', err);
        }
    };

    const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
        try {
            const dbUpdates: any = {};
            if (updates.name) dbUpdates.item_name = updates.name;
            if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
            if (updates.minStock !== undefined) dbUpdates.min_stock = updates.minStock;
            if (updates.unitPrice !== undefined) dbUpdates.unit_price = updates.unitPrice;
            if (updates.expiryDate) dbUpdates.expiry_date = updates.expiryDate;
            if (updates.supplier) dbUpdates.supplier_name = updates.supplier;
            if (updates.location) dbUpdates.location = updates.location;

            const { error } = await supabase.from('inventory').update(dbUpdates).eq('id', id);
            if (error) throw error;
            fetchInventory();
        } catch (err) {
            console.error('Error updating inventory item:', err);
        }
    };

    const deleteItem = async (id: string) => {
        try {
            const { error } = await supabase.from('inventory').delete().eq('id', id);
            if (error) throw error;
            fetchInventory();
        } catch (err) {
            console.error('Error deleting inventory item:', err);
        }
    };

    return {
        inventory,
        loading,
        addItem,
        updateItem,
        deleteItem,
        refresh: fetchInventory
    };
};
