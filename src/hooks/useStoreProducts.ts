import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface StoreProduct {
    id: string;
    name: string;
    category: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating: number;
    reviews: number;
    isNew?: boolean;
    isSale?: boolean;
    stock: number;
    description: string; // Required to match Product
    features?: string[];
    brandName?: string; // Renamed from brand
    brandId?: string;
    supplierId: string;
    supplierName: string;
    // Add missing Product fields compatibility
    discount?: number;
    featured?: boolean;
    images?: string[];
}

export interface StoreCategory {
    id: string;
    name: string;
    count: number;
    image?: string;
}

export const useStoreProducts = () => {
    const [products, setProducts] = useState<StoreProduct[]>([]);
    const [categories, setCategories] = useState<StoreCategory[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    supplier:suppliers!inner(id, name, is_verified),
                    brand:brands(id, name)
                `)
                .eq('is_active', true)
                .eq('supplier.is_verified', true);

            if (error) throw error;

            const mappedProducts: StoreProduct[] = (data || []).map((p: any) => ({
                id: p.id,
                name: p.name,
                category: p.category,
                price: Number(p.price),
                originalPrice: p.original_price ? Number(p.original_price) : undefined,
                image: p.cover_image || p.images?.[0] || 'https://via.placeholder.com/300',
                images: p.images || [],
                rating: Number(p.rating) || 0,
                reviews: 0,
                isNew: p.is_new,
                isSale: (p.discount > 0),
                discount: p.discount,
                featured: p.is_featured,
                stock: p.stock,
                description: p.description || '', // Fallback
                brandName: p.brand?.name || 'General',
                brandId: p.brand?.id,
                supplierId: p.supplier_id,
                supplierName: p.supplier?.name
            }));

            setProducts(mappedProducts);

            // Derive categories
            const categoryMap = new Map<string, number>();
            mappedProducts.forEach(p => {
                categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + 1);
            });

            const mappedCategories: StoreCategory[] = Array.from(categoryMap.entries()).map(([name, count], index) => ({
                id: `cat-${index}`,
                name,
                count
            }));

            setCategories(mappedCategories);

        } catch (error) {
            console.error('Error fetching store products:', error);
        } finally {
            setLoading(false);
        }
    };

    const getProductById = (id: string) => {
        return products.find(p => p.id === id);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return {
        products,
        categories,
        loading,
        getProductById,
        refresh: fetchProducts
    };
};
