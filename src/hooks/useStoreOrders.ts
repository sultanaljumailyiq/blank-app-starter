import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface BuyerOrder {
    id: string;
    order_number: string;
    date: string;
    items: string[]; // This will be improved to show real item names
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
    trackingNumber?: string;
    createdAt?: string;
    supplierName?: string;
    supplierId?: string;
    creatorName?: string;
}

export const useStoreOrders = () => {
    const [orders, setOrders] = useState<BuyerOrder[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setOrders([]);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('store_orders')
                .select(`
                    *,
                    supplier:suppliers(name),
                    items:store_order_items(
                        product:products(name)
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mappedOrders: BuyerOrder[] = (data || []).map((order: any) => ({
                id: order.id,
                order_number: order.order_number,
                date: new Date(order.created_at).toLocaleDateString('ar-IQ'),
                items: order.items?.map((i: any) => i.product?.name || 'منتج') || [],
                total: order.total_amount,
                status: order.status,
                trackingNumber: order.tracking_number,
                createdAt: order.created_at,
                supplierName: order.supplier?.name || order.items?.[0]?.supplier?.name,
                supplierId: order.supplier_id || order.items?.[0]?.supplier_id,
                creatorName: order.ordered_by || order.user_name?.split(' - ')[0]
            }));

            setOrders(mappedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const returnOrder = async (orderId: string, reason: string) => {
        try {
            // In a real app, we would log the return request in a separate table or update a 'return_reason' column
            // For this demo, we just update the status to 'returned'
            const { error } = await supabase
                .from('store_orders') // Fixed table name
                .update({ status: 'return_requested' }) //, return_reason: reason 
                .eq('id', orderId);

            if (error) throw error;

            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'return_requested' as any } : o));
            return true;
        } catch (error) {
            console.error('Error returning order:', error);
            throw error;
        }
    };

    return {
        orders,
        loading,
        refresh: fetchOrders,
        returnOrder
    };
};
