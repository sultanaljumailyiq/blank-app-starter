import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export interface SupplierOrder {
    id: string;
    orderNumber: string;
    clinicId: number;
    clinicName?: string;
    totalAmount: number;
    total: number;
    status: 'pending' | 'received' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
    paymentStatus: 'unpaid' | 'paid' | 'refunded';
    paymentMethod: string;
    shippingAddress?: string;
    notes?: string;
    createdAt: string;
    orderDate: string;
    expectedDelivery: string;
    priority: 'high' | 'medium' | 'low' | 'عالية' | 'متوسطة' | 'منخفضة';
    updatedAt: string;
    items?: SupplierOrderItem[];
    customer: {
        name: string;
        phone: string;
        address: string;
        governorate?: string;
        city?: string;
        rating: number;
    };
}

export interface SupplierOrderItem {
    id: string;
    orderId: string;
    productId: string;
    productName?: string;
    name?: string;
    image?: string;
    quantity: number;
    priceAtTime: number;
    price?: number;
    status?: 'pending' | 'accepted' | 'unavailable';
    returnRequested?: boolean;
    returnReason?: string;
}

export const useSupplierOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<SupplierOrder[]>([]);
    const [loading, setLoading] = useState(true);

    // Get the Supplier ID linked to the current user (Refactor this to a shared hook/context if used often)
    const [supplierId, setSupplierId] = useState<string | null>(null);

    useEffect(() => {
        const fetchSupplierId = async () => {
            if (!user) return;
            try {
                // Check by user_id or profile_id
                const { data, error } = await supabase
                    .from('suppliers')
                    .select('id')
                    .or(`user_id.eq.${user.id},profile_id.eq.${user.id}`)
                    .maybeSingle();

                if (data) {
                    setSupplierId(data.id);
                } else {
                    // Fallback to direct ID match if applicable (legacy/demo)
                    const { data: direct } = await supabase
                        .from('suppliers')
                        .select('id')
                        .eq('id', user.id)
                        .maybeSingle();

                    if (direct) setSupplierId(direct.id);
                    else {
                        console.warn('No specific supplier profile found, using user.id as fallback');
                        setSupplierId(user.id);
                    }
                }
            } catch (err) {
                console.error(err);
                setSupplierId(user.id);
            }
        };
        fetchSupplierId();
    }, [user]);

    // Fetch Platform Stats (Real User Counts)
    const [platformStats, setPlatformStats] = useState({
        totalCustomers: 0,
        totalClinics: 0,
        totalLabs: 0,
        monthlyViews: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Count Unique Customers from store_orders for this supplier
                const { data: ordersData } = await supabase
                    .from('store_orders')
                    .select('user_name')
                    .eq('supplier_id', supplierId || user?.id);

                const uniqueCustomersCount = new Set(ordersData?.map(o => o.user_name).filter(Boolean) || []).size;

                // Views from products (sum views for this supplier)
                const { data: productsData } = await supabase
                    .from('products')
                    .select('views')
                    .eq('supplier_id', supplierId || user?.id);

                const totalViews = productsData?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0;

                setPlatformStats({
                    totalCustomers: uniqueCustomersCount,
                    totalClinics: uniqueCustomersCount, // Placeholder or same fallback
                    totalLabs: 0,
                    monthlyViews: totalViews
                });

            } catch (err) {
                console.error('Error fetching platform stats:', err);
            }
        };

        if (supplierId) fetchStats();
    }, [supplierId]);

    useEffect(() => {
        if (supplierId) {
            fetchOrders();
        }
    }, [supplierId]);

    const fetchOrders = async () => {
        try {
            setLoading(true);

            // Use current Supplier ID
            const targetId = supplierId || user?.id;
            console.log('Fetching orders for supplier:', targetId);

            // First fetch orders
            const { data, error } = await supabase
                .from('store_orders')
                .select(`
                    *,
                    items:store_order_items (
                        id,
                        product_id,
                        quantity,
                        price_at_purchase,
                        item_status,
                        return_requested,
                        return_reason,
                        product:products(name, image_url)
                    )
                `)
                .eq('supplier_id', targetId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            console.log('Fetched Supplier Orders:', data);

            const mappedOrders: SupplierOrder[] = data.map((o: any) => ({
                id: o.id,
                orderNumber: o.order_number || o.id.slice(0, 8),
                clinicId: 0, // Not explicitly in simple orders table unless we join users->clinics
                clinicName: o.user_name || 'Client',
                totalAmount: o.total_amount,
                total: o.total_amount,
                status: o.status,
                paymentStatus: o.payment_status || 'unpaid',
                paymentMethod: 'Cash',
                shippingAddress: typeof o.shipping_address === 'string' ? o.shipping_address : o.shipping_address?.address || 'العنوان',
                notes: o.notes,
                createdAt: o.created_at,
                orderDate: o.created_at,
                expectedDelivery: o.estimated_delivery || new Date(new Date(o.created_at).setDate(new Date(o.created_at).getDate() + 3)).toISOString(),
                priority: 'متوسطة',
                updatedAt: o.updated_at,
                items: (o.items || []).map((item: any) => ({
                    id: item.id,
                    orderId: o.id,
                    productId: item.product_id,
                    productName: item.product?.name || 'منتج',
                    name: item.product?.name || 'منتج',
                    image: item.product?.image_url || 'https://via.placeholder.com/50',
                    quantity: item.quantity,
                    priceAtTime: item.price_at_purchase,
                    price: item.price_at_purchase,
                    status: item.item_status || 'pending',
                    returnRequested: item.return_requested || false,
                    returnReason: item.return_reason || ''
                })),
                customer: {
                    name: o.user_name || 'Client',
                    phone: o.shipping_address?.phone || '',
                    address: typeof o.shipping_address === 'string' ? o.shipping_address : o.shipping_address?.address || '',
                    governorate: typeof o.shipping_address === 'object' ? o.shipping_address?.governorate : undefined,
                    city: typeof o.shipping_address === 'object' ? o.shipping_address?.city : undefined,
                    rating: 5.0
                }
            }));

            setOrders(mappedOrders);
        } catch (err) {
            console.error('Error fetching supplier orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (id: string, status: SupplierOrder['status']) => {
        try {
            const { error } = await supabase
                .from('store_orders')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
        } catch (err) {
            console.error('Error updating order status:', err);
            throw err;
        }
    };

    const updateItemStatus = async (orderId: string, itemId: string, status: 'pending' | 'accepted' | 'unavailable') => {
        try {
            // 1. Update item status
            const { error: itemError } = await supabase
                .from('store_order_items')
                .update({ item_status: status })
                .eq('id', itemId);

            if (itemError) throw itemError;

            // 2. Recalculate Order Total (Call RPC)
            const { error: rpcError } = await supabase.rpc('recalculate_order_total', { order_id_param: orderId });
            if (rpcError) {
                console.error('Error recalculating total:', rpcError);
                toast.error('حدث خطأ في إعادة حساب الإجمالي'); // Assuming toast is available or imported, otherwise console
            }

            // 3. Refresh Orders to get new total
            await fetchOrders();

        } catch (err) {
            console.error('Error updating item status:', err);
            throw err;
        }
    };

    const stats = {
        total: orders.length,
        new: orders.filter(o => o.status === 'pending').length,
        inProgress: orders.filter(o => ['received', 'processing', 'shipped'].includes(o.status)).length,
        completed: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => ['cancelled', 'returned'].includes(o.status)).length
    };

    // Analytics Calculation
    const getAnalytics = () => {
        const productStats: Record<string, { name: string, count: number }> = {};
        const clinicStats: Record<string, { name: string, count: number }> = {};

        orders.forEach(order => {
            // Clinic Stats
            const clinicName = order.clinicName || 'Unknown Clinic';
            if (!clinicStats[clinicName]) {
                clinicStats[clinicName] = { name: clinicName, count: 0 };
            }
            clinicStats[clinicName].count += 1;

            // Product Stats
            order.items?.forEach(item => {
                const productName = item.name || 'Unknown Product';
                if (!productStats[productName]) {
                    productStats[productName] = { name: productName, count: 0 };
                }
                productStats[productName].count += item.quantity;
            });
        });

        // Convert to Arrays, Sort, Top 5
        const topProducts = Object.values(productStats).sort((a, b) => b.count - a.count).slice(0, 5);
        const topClinics = Object.values(clinicStats).sort((a, b) => b.count - a.count).slice(0, 5);

        return { topProducts, topClinics };
    };

    const analytics = getAnalytics();

    return {
        orders,
        stats,
        analytics,
        platformStats, // New Real Stats
        loading,
        refresh: fetchOrders,
        updateOrderStatus,
        updateItemStatus
    };
};
