import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types';

export function useSupplier() {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get the Supplier ID linked to the current user
    const [supplierId, setSupplierId] = useState<string | null>(null);

    useEffect(() => {
        const fetchSupplierId = async () => {
            if (!user) return;
            try {
                // Try to find supplier by user_id first, then by profile_id (for legacy data)
                let { data, error } = await supabase
                    .from('suppliers')
                    .select('id')
                    .or(`user_id.eq.${user.id},profile_id.eq.${user.id}`)
                    .maybeSingle();

                if (data) {
                    console.log('DEBUG: Found Supplier ID:', data.id, 'for User ID:', user.id);
                    setSupplierId(data.id);
                } else {
                    // Fallback: check if user.id IS the supplier.id (some setups use this)
                    const { data: directMatch } = await supabase
                        .from('suppliers')
                        .select('id')
                        .eq('id', user.id)
                        .maybeSingle();

                    if (directMatch) {
                        console.log('DEBUG: User ID matches Supplier ID directly:', directMatch.id);
                        setSupplierId(directMatch.id);
                    } else {
                        console.log('User is not a registered supplier');
                        setLoading(false);
                    }
                }
            } catch (err) {
                console.error('Error fetching supplier profile:', err);
                setLoading(false);
            }
        };
        fetchSupplierId();
    }, [user]);

    const fetchData = async () => {
        if (!supplierId) return;
        setLoading(true);
        try {
            // Fetch Supplier Products
            const { data, error } = await supabase
                //.from('supplier_products')
                .from('products')
                .select('*')
                .eq('supplier_id', supplierId)
                .order('created_at', { ascending: false });

            console.log('DEBUG: Fetching products for Supplier ID:', supplierId, 'Count:', data?.length, 'Error:', error);

            if (error) throw error;

            // Fetch real sales data like in useSupplierProducts
            let salesMap: Record<string, number> = {};
            if (data && data.length > 0) {
                const productIds = data.map(p => p.id);
                const { data: orderItems } = await supabase
                    .from('store_order_items')
                    .select('product_id, quantity')
                    .in('product_id', productIds);

                if (orderItems) {
                    orderItems.forEach((item: any) => {
                        salesMap[item.product_id] = (salesMap[item.product_id] || 0) + (item.quantity || 1);
                    });
                }
            }

            const mappedProducts: Product[] = (data || []).map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                price: p.price,
                stock: p.stock,
                category: p.category,
                subCategory: p.sub_category,
                image: (p.images && p.images.length > 0) ? p.images[0] : (p.image_url || 'https://via.placeholder.com/150'),
                images: (p.images && p.images.length > 0) ? p.images : (p.image_url ? [p.image_url] : []),
                sales: salesMap[p.id] || 0, // Real Sales
                views: p.views || 0, // Real Views
                rating: p.rating || 0,
                reviews: p.reviews_count || 0,
                isNew: p.is_new,
                featured: p.is_featured,
                discount: p.discount,
                supplierId: p.supplier_id,
                supplier_id: p.supplier_id, // Also include snake_case for compatibility
                supplierName: '',
                brandId: p.brand_id || '',
                tags: []
            }));

            setProducts(mappedProducts);

        } catch (err: any) {
            console.error('Error fetching supplier data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (supplierId) {
            fetchData();
        }
    }, [supplierId]);

    const addProduct = async (productData: any) => {
        if (!supplierId) return;
        try {
            const payload = {
                supplier_id: supplierId,
                name: productData.name,
                description: productData.description,
                price: productData.price,
                stock: productData.stock,
                category: productData.category,
                sub_category: productData.subCategory,
                child_category: productData.childCategory || null, // Map childCategory
                image_url: productData.image,
                images: productData.images || (productData.image ? [productData.image] : []),
                is_new: productData.isNew,
                is_featured: productData.featured,
                discount: productData.discount,
                target_audience: productData.target_audience
            };

            const { data, error } = await supabase
                .from('products') // Correct table
                .insert([payload])
                .select()
                .single();

            if (error) throw error;

            fetchData();
            return data;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const updateProduct = async (id: string, updates: any) => {
        try {
            const payload: any = { ...updates };
            // Map frontend keys to DB keys if needed
            if (updates.subCategory) payload.sub_category = updates.subCategory;
            if (updates.childCategory !== undefined) payload.child_category = updates.childCategory || null; // Map childCategory
            if (updates.image) payload.image_url = updates.image;
            if (updates.images) payload.images = updates.images;
            if (updates.isNew !== undefined) payload.is_new = updates.isNew;
            if (updates.featured !== undefined) payload.is_featured = updates.featured;

            // Clean up frontend-only keys
            delete payload.subCategory;
            delete payload.childCategory;
            delete payload.image;
            delete payload.isNew;
            delete payload.featured;

            const { error } = await supabase
                .from('products')
                .update(payload)
                .eq('id', id)
                .select();

            if (error) throw error;
            fetchData();
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            const { error } = await supabase
                .from('products') // Correct table
                .delete()
                .eq('id', id);

            if (error) throw error;
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const toggleFeatured = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ is_featured: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            setProducts(prev => prev.map(p => p.id === id ? { ...p, featured: !currentStatus } : p));
        } catch (err: any) {
            console.error('Error toggling featured:', err);
            throw err;
        }
    };

    return {
        products,
        loading,
        error,
        addProduct,
        updateProduct,
        deleteProduct,
        refresh: fetchData,
        toggleFeatured
    };
}
