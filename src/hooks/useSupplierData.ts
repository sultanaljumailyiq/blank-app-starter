import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { SupplierStats, SupplierOrder, Order } from '../types';

export interface TopProduct {
    name: string;
    sales: number;
    revenue: number;
    views: number;
}

export function useSupplierData() {
    const { user } = useAuth();
    const [stats, setStats] = useState<SupplierStats>({
        totalProducts: 0,
        activeOrders: 0,
        monthlyRevenue: 0,
        customerRating: 0,
        totalCustomers: 0,
        viewsThisMonth: 0
    });

    const [supplierStatus, setSupplierStatus] = useState<'pending' | 'approved' | 'rejected' | 'suspended'>('pending');

    const [recentOrders, setRecentOrders] = useState<SupplierOrder[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSupplierData = async () => {
        try {
            setLoading(true);

            // 1. Get Supplier ID (Align logic with useSupplier.ts)
            let supplierId = '';

            if (user) {
                // Try fetching from DB first - use both user_id and profile_id
                const { data: supplier } = await supabase
                    .from('suppliers')
                    .select('id, is_verified')
                    .or(`user_id.eq.${user.id},profile_id.eq.${user.id}`)
                    .maybeSingle();

                if (supplier) {
                    supplierId = supplier.id;
                    setSupplierStatus(supplier.is_verified ? 'approved' : 'pending');
                } else {
                    // Fallback: check if user.id IS the supplier.id (some setups use this)
                    const { data: directMatch } = await supabase
                        .from('suppliers')
                        .select('id, is_verified')
                        .eq('id', user.id)
                        .maybeSingle();

                    if (directMatch) {
                        console.log('DEBUG [useSupplierData]: User ID matches Supplier ID directly:', directMatch.id);
                        supplierId = directMatch.id;
                        setSupplierStatus(directMatch.is_verified ? 'approved' : 'pending');
                    } else if (user.email === 'supplier.demo@smartdental.com') {
                        // Fallback for demo only if DB fails
                        supplierId = 'c83cf236-1175-4181-8222-d60ca2f9327d';
                        setSupplierStatus('approved');
                    }
                }
            }

            if (!supplierId) {
                setLoading(false);
                return;
            }

            // 2. Fetch Products Count
            const { count: productsCount } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .eq('supplier_id', supplierId);

            // 2b. Fetch Products to calc views and rating
            const { data: productsData } = await supabase
                .from('products')
                .select('views, rating')
                .eq('supplier_id', supplierId);

            const totalViews = productsData?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0;
            const avgRating = productsData && productsData.length > 0
                ? productsData.reduce((acc, curr) => acc + (curr.rating || 0), 0) / productsData.length
                : 5.0; // Default new to 5

            // 3. Fetch Orders (Recent & All for stats)
            const { data: ordersData, error: ordersError } = await supabase
                .from('store_orders')
                .select(`
                    id, customer:user_name, total:total_amount, status, created_at, shipping_address,
                    items:store_order_items(product_id, quantity, price:price_at_purchase, product:products(name))
                `)
                .eq('supplier_id', supplierId)
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;

            const orders = ordersData || [];

            // 4. Calculate Stats
            const activeOrders = orders.filter(o => ['pending', 'processing', 'shipped', 'received'].includes(o.status)).length;

            // Monthly Revenue (Current Month)
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const monthlyRevenue = orders
                .filter(o => o.created_at >= startOfMonth && o.status !== 'cancelled')
                .reduce((sum, o) => sum + (o.total || 0), 0);

            // Total Customers (Unique names/IDs)
            const uniqueCustomers = new Set(orders.map(o => o.customer)).size;

            setStats({
                totalProducts: productsCount || 0,
                activeOrders,
                monthlyRevenue,
                customerRating: Number(avgRating.toFixed(1)),
                totalCustomers: uniqueCustomers,
                viewsThisMonth: totalViews // In real app, we'd filter views by date if we had a view_logs table, but using total views for now is better than mock
            });

            // 5. Format Recent Orders
            const mappedOrders: SupplierOrder[] = orders.slice(0, 5).map(o => ({
                id: o.id,
                customer: {
                    name: o.shipping_address?.recipientName || o.customer || 'Unknown',
                    clinicName: o.shipping_address?.clinicName,
                    phone: o.shipping_address?.phone || '',
                    backupPhone: o.shipping_address?.backupPhone,
                    address: o.shipping_address?.address || '',
                    avatar: `https://ui-avatars.com/api/?name=${o.customer}&background=random`
                },
                items: o.items.map((i: any) => ({
                    id: i.product_id,
                    name: i.product?.name || 'Product',
                    price: i.price,
                    quantity: i.quantity
                })),
                total: o.total,
                status: o.status as any,
                orderDate: o.created_at,
                paymentMethod: 'cash', // Default
            }));

            setRecentOrders(mappedOrders);

            // 6. Calculate Top Products
            const productSales: Record<string, TopProduct> = {};
            orders.forEach(o => {
                if (o.status === 'cancelled') return;
                o.items.forEach((i: any) => {
                    const pName = i.product?.name || 'Unknown';
                    if (!productSales[pName]) {
                        productSales[pName] = { name: pName, sales: 0, revenue: 0, views: i.product?.views || 0 };
                    }
                    productSales[pName].sales += i.quantity;
                    productSales[pName].revenue += (i.quantity * i.price);
                });
            });

            const sortedProducts = Object.values(productSales)
                .sort((a, b) => b.sales - a.sales)
                .slice(0, 5);

            setTopProducts(sortedProducts);

        } catch (err) {
            console.error('Error fetching supplier data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSupplierData();
    }, [user]);

    return {
        stats,
        recentOrders,
        topProducts,
        loading,
        refresh: fetchSupplierData,
        supplierStatus
    };
}
