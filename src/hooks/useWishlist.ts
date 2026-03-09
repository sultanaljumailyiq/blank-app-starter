import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const useWishlist = () => {
    const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    // Fetch Wishlist
    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('favorites')
                    .select('product_id')
                    .eq('user_id', user.id);

                if (data) {
                    setWishlistItems(new Set(data.map(item => item.product_id)));
                }
            } else {
                // Fallback to localStorage
                const saved = localStorage.getItem('wishlist');
                if (saved) {
                    setWishlistItems(new Set(JSON.parse(saved)));
                }
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleWishlist = async (productId: string) => {
        const { data: { user } } = await supabase.auth.getUser();

        // Optimistic Update
        setWishlistItems(prev => {
            const newSet = new Set(prev);
            const isRemoving = newSet.has(productId);
            if (isRemoving) {
                newSet.delete(productId);
                // Async DB call
                if (user) {
                    supabase.from('favorites').delete().match({ user_id: user.id, product_id: productId }).then(({ error }) => {
                        if (error) { toast.error('فشل إزالة المنتج من المفضلة'); }
                        else { toast.success('تمت الإزالة من المفضلة'); }
                    });
                }
            } else {
                newSet.add(productId);
                // Async DB call
                if (user) {
                    supabase.from('favorites').upsert({ user_id: user.id, product_id: productId }).then(({ error }) => {
                        if (error) { toast.error('فشل إضافة المنتج للمفضلة'); }
                        else { toast.success('تمت الإضافة للمفضلة'); }
                    });
                }
            }

            // Sync LocalStorage
            localStorage.setItem('wishlist', JSON.stringify(Array.from(newSet)));
            return newSet;
        });
    };

    return {
        wishlistItems,
        toggleWishlist,
        loading
    };
};
