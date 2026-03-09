import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    originalPrice?: number;
    imageUrl?: string;
    image?: string; // Alias for imageUrl or icon
    images?: string[]; // Array of images
    category: string;
    stock: number;
    isActive: boolean;
    status: 'available' | 'out_of_stock' | 'low_stock';
    rating: number;
    reviews: number;
    sales: number;
    views: number;
    isNew?: boolean;
    featured?: boolean;
    discount: number;
    createdAt: string;
    updatedAt: string;
}

export const useSupplierProducts = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [supplierId, setSupplierId] = useState<string | null>(null);

    // Helper to get or fetch the supplier ID
    const getSupplierIdForUser = async (): Promise<string | null> => {
        if (supplierId) return supplierId;

        const { data, error } = await supabase
            .from('suppliers')
            .select('id')
            .or(`user_id.eq.${user?.id},profile_id.eq.${user?.id}`)
            .maybeSingle();

        if (error || !data) {
            console.warn('No supplier found for user:', user?.id);
            return null;
        }

        setSupplierId(data.id);
        return data.id;
    };

    useEffect(() => {
        if (user) {
            fetchProducts();
        }
    }, [user]);

    const fetchProducts = async () => {
        try {
            setLoading(true);

            // First, get the supplier ID from the suppliers table using user_id
            const { data: supplierData, error: supplierError } = await supabase
                .from('suppliers')
                .select('id')
                .or(`user_id.eq.${user?.id},profile_id.eq.${user?.id}`) // Fix: use OR for robustness
                .maybeSingle();

            if (supplierError) {
                console.error('Error fetching supplier:', supplierError);
                throw supplierError;
            }

            const supplierId = supplierData?.id;

            if (!supplierId) {
                console.warn('No supplier found for user:', user?.id);
                setProducts([]);
                return;
            }

            // Now fetch products using the correct supplier_id
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('supplier_id', supplierId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Fetch real sales data
            let salesMap: Record<string, number> = {};
            if (data && data.length > 0) {
                const productIds = data.map(p => p.id);
                // Allow fetching order items for these products
                const { data: orderItems, error: salesError } = await supabase
                    .from('order_items')
                    .select('product_id, quantity')
                    .in('product_id', productIds);

                if (!salesError && orderItems) {
                    orderItems.forEach((item: any) => {
                        salesMap[item.product_id] = (salesMap[item.product_id] || 0) + (item.quantity || 1);
                    });
                }
            }

            setProducts((data || []).map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                price: p.price,
                originalPrice: p.original_price || p.price,
                imageUrl: p.image_url,
                image: (p.images && p.images.length > 0) ? p.images[0] : (p.image_url || '📦'),
                images: (p.images && p.images.length > 0) ? p.images : (p.image_url ? [p.image_url] : []),
                category: p.category || 'عام',
                stock: p.stock || 0,
                isActive: p.is_active !== false,
                status: (p.stock || 0) === 0 ? 'out_of_stock' : (p.stock || 0) < 10 ? 'low_stock' : 'available',
                rating: p.rating || 0,
                reviews: p.reviews_count || 0,
                sales: salesMap[p.id] || 0, // REAL SALES
                views: p.views || 0, // Real views if column exists, else 0
                isNew: false, // Logic for 'new' could be date based: new Date() - createdAt < 7 days
                featured: p.is_featured || false,
                discount: p.original_price && p.price < p.original_price ? Math.round((1 - p.price / p.original_price) * 100) : 0,
                createdAt: p.created_at,
                updatedAt: p.updated_at
            })));
        } catch (err) {
            console.error('Error fetching supplier products:', err);
        } finally {
            setLoading(false);
        }
    };

    const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const supplierIdToUse = await getSupplierIdForUser();
            if (!supplierIdToUse) throw new Error('Not a registered supplier');

            const { data, error } = await supabase
                .from('products')
                .insert([{
                    supplier_id: supplierIdToUse,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    image_url: product.imageUrl,
                    images: product.images || (product.imageUrl ? [product.imageUrl] : []),
                    category: product.category,
                    stock: product.stock,
                    is_active: product.isActive
                }])
                .select()
                .single();

            if (error) throw error;
            await fetchProducts();
            return data;
        } catch (err) {
            console.error('Error adding product:', err);
            throw err;
        }
    };

    const updateProduct = async (id: string, updates: Partial<Product>) => {
        try {
            const supplierIdToUse = await getSupplierIdForUser();
            if (!supplierIdToUse) throw new Error('Not a registered supplier');

            const updateData: any = {};
            if (updates.name) updateData.name = updates.name;
            if (updates.description) updateData.description = updates.description;
            if (updates.price) updateData.price = updates.price;
            if (updates.imageUrl) updateData.image_url = updates.imageUrl;
            if (updates.images) updateData.images = updates.images;
            if (updates.category) updateData.category = updates.category;
            if (updates.stock !== undefined) updateData.stock = updates.stock;
            if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
            updateData.updated_at = new Date().toISOString();

            const { error } = await supabase
                .from('products')
                .update(updateData)
                .eq('id', id)
                .eq('supplier_id', supplierIdToUse);

            if (error) throw error;
            await fetchProducts();
        } catch (err) {
            console.error('Error updating product:', err);
            throw err;
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            const supplierIdToUse = await getSupplierIdForUser();
            if (!supplierIdToUse) throw new Error('Not a registered supplier');

            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id)
                .eq('supplier_id', supplierIdToUse);

            if (error) throw error;
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error('Error deleting product:', err);
            throw err;
        }
    };

    const toggleFeatured = async (id: string, currentStatus: boolean) => {
        try {
            const supplierIdToUse = await getSupplierIdForUser();
            if (!supplierIdToUse) throw new Error('Not a registered supplier');

            const { error } = await supabase
                .from('products')
                .update({ is_featured: !currentStatus })
                .eq('id', id)
                .eq('supplier_id', supplierIdToUse);

            if (error) throw error;

            // Optimistic update
            setProducts(prev => prev.map(p => p.id === id ? { ...p, featured: !currentStatus } : p));
        } catch (err) {
            console.error('Error toggling featured status:', err);
            throw err;
        }
    };

    return {
        products,
        loading,
        refresh: fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleFeatured
    };
};
