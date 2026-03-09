import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Product, Supplier, Brand, PromotionalCard } from '../types';
import { toast } from 'sonner';

// --- Types ---

export interface CartItem extends Product {
    quantity: number;
}

export interface StoreState {
    products: Product[];
    suppliers: Supplier[];
    brands: Brand[];
    categories: string[];
    featuredProducts: Product[];
    newProducts: Product[];
    dealsProducts: Product[];
    promotionalCards: PromotionalCard[];
    loading: boolean;
    error: string | null;
}

interface StoreContextType extends StoreState {
    // Actions
    refresh: () => Promise<void>;

    // Cart
    cart: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    cartTotals: {
        subtotal: number;
        tax: number;
        shipping: number;
        total: number;
    };

    // Wishlist
    wishlist: string[]; // List of IDs
    addToWishlist: (productId: string) => void;
    removeFromWishlist: (productId: string) => void;
    toggleWishlist: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // --- Store Data State ---
    const [state, setState] = useState<StoreState>({
        products: [],
        suppliers: [],
        brands: [],
        categories: [],
        featuredProducts: [],
        newProducts: [],
        dealsProducts: [],
        promotionalCards: [],
        loading: true,
        error: null
    });
    const mountedRef = useRef(true);

    // --- Cart State ---
    const [cart, setCart] = useState<CartItem[]>(() => {
        if (typeof window === 'undefined') return [];
        const saved = localStorage.getItem('store_cart');
        return saved ? JSON.parse(saved) : [];
    });

    // --- Wishlist State ---
    const [wishlist, setWishlist] = useState<string[]>(() => {
        if (typeof window === 'undefined') return [];
        const saved = localStorage.getItem('store_wishlist');
        return saved ? JSON.parse(saved) : [];
    });

    // --- Effects ---

    // 1. Fetch Store Data
    const fetchStoreData = async () => {
        try {
            setState(prev => ({ ...prev, loading: true }));

            // 1. Fetch Suppliers (Critical) - Only Approved
            const suppliersResult = await supabase
                .from('suppliers')
                .select('*'); // Removed status filter - column doesn't exist (use is_verified if needed) 
            // 2026 schema has 'is_verified'. 2025 schema had 'is_verified'.
            // The code uses .eq('status', 'approved'). 
            // Migration 20260126 show is_verified boolean.
            // Migration 20251227 show is_verified boolean.
            // PROBABLY 'status' column is missing too! 
            // Let's assume is_verified is the one needed or I need to add status column. 
            // Let's stick to fixing the column name first, and maybe switch to is_verified if status fails?  
            // Wait, if status fails, I'll get another error.
            // error was: column suppliers_1.company_name does not exist. 
            // It didn't complain about status yet (maybe because select * works, but filter might fail if column missing).
            // I'll change company_name first.

            // 2. Fetch Products (Critical) - Only Active
            // We will filter products by approved suppliers in memory to ensure consistency
            const productsResult = await supabase
                .from('products')
                .select('*, supplier:suppliers(name)') // Changed company_name to name
                .eq('is_active', true);

            // ...



            // ...



            // 3. Fetch Brands (Optional)
            let brandsData: any[] = [];
            try {
                const { data } = await supabase.from('brands').select('*');
                if (data) brandsData = data;
            } catch (e: any) {
                if (e?.name !== 'AbortError' && !e?.message?.includes('AbortError')) console.warn('Brands fetch failed', e);
            }

            // 4. Fetch Promos (Optional - Likely Missing)
            let promosData: any[] = [];
            try {
                const { data } = await supabase.from('promotional_cards').select('*').eq('active', true);
                if (data) promosData = data;
            } catch (e: any) {
                if (e?.name !== 'AbortError' && !e?.message?.includes('AbortError')) console.warn('Promos fetch failed', e);
            }

            // 5. Fetch Favorites (Optional - Likely Missing)
            let favoritesData: any[] = [];
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data } = await supabase.from('favorites').select('product_id').eq('user_id', user.id);
                    if (data) favoritesData = data;
                }
            } catch (e: any) {
                if (e?.name !== 'AbortError' && !e?.message?.includes('AbortError')) console.warn('Favorites fetch failed', e);
            }

            // Mock Response structure to reuse existing logic
            const productsResponse = productsResult;
            const suppliersResponse = suppliersResult;
            const brandsResponse = { data: brandsData, error: null };
            const promoResponse = { data: promosData, error: null };
            const favoritesResponse = { data: favoritesData, error: null };

            // Update Wishlist from DB if available
            if (favoritesResponse.data && favoritesResponse.data.length > 0) {
                const dbWishlist = favoritesResponse.data.map((f: any) => f.product_id);
                setWishlist(dbWishlist);
                localStorage.setItem('store_wishlist', JSON.stringify(dbWishlist));
            }

            let mergedProducts: any[] = [];
            let mergedSuppliers: any[] = [];
            let mergedBrands: any[] = [];
            let promos: any[] = [];

            // Process Brands
            if (brandsResponse.data) {
                mergedBrands = brandsResponse.data;
            }

            // Process Promos
            if (promoResponse.data) {
                promos = promoResponse.data;
            }

            if (!suppliersResponse.error && suppliersResponse.data?.length) {
                const dbSuppliers = suppliersResponse.data.map(s => ({
                    id: s.id,
                    name: s.name,
                    description: s.description || '',
                    rating: Number(s.rating),
                    reviews: 0,
                    totalProducts: 0,
                    location: s.address || s.location || 'بغداد',
                    address: s.address || '',
                    governorate: s.governorate || s.city || 'بغداد',
                    phone: s.phone || '',
                    email: s.email || s.contact_email || '',
                    logo: s.logo || s.image_url || '',
                    logo_url: s.logo || s.image_url || '',
                    verified: s.is_verified || false,
                    trusted: false,
                    joinedDate: s.created_at,
                    categories: [],
                    brands: []
                }));
                mergedSuppliers = dbSuppliers;
            } else {
                mergedSuppliers = [];
            }

            if (!productsResponse.error && productsResponse.data) {
                // Only show products from VERIFIED suppliers
                const approvedSupplierIds = new Set(mergedSuppliers.filter(s => s.verified).map(s => s.id));
                const dbProducts = productsResponse.data
                    .filter(p => p.supplier_id && approvedSupplierIds.has(p.supplier_id)) // FILTER HERE
                    .map(p => ({
                        id: p.id,
                        name: p.name,
                        description: p.description,
                        price: Number(p.price),
                        originalPrice: p.price,
                        stock: p.stock,
                        category: p.category,
                        image: p.image_url || 'https://via.placeholder.com/300',
                        images: p.image_url ? [p.image_url] : [],
                        rating: Number(p.rating || 0),
                        reviews: p.reviews_count || 0,
                        isNew: p.is_new || (new Date().getTime() - new Date(p.created_at).getTime() < 7 * 24 * 60 * 60 * 1000),
                        featured: p.is_featured || false,
                        discount: p.discount || 0,
                        supplierId: p.supplier_id,
                        supplierName: p.supplier?.name || 'Unknown',
                        brandId: p.brand_id || 'brand-1',
                        brandName: p.brand || 'Generic',
                        isDeal: (p.discount > 0),
                        dealBadge: p.discount > 0 ? `${p.discount}% OFF` : '',
                        target_audience: p.target_audience || ['clinic', 'lab', 'both'],
                        created_at: p.created_at
                    }));
                mergedProducts = dbProducts;
            } else {
                if (productsResponse.error && !productsResponse.error?.message?.includes('AbortError')) {
                    console.error('Error fetching products from DB:', productsResponse.error);
                }
                mergedProducts = [];
            }

            // Deduplicate Products by ID just in case
            const uniqueProducts = Array.from(new Map(mergedProducts.map(item => [item.id, item])).values());

            const categories = Array.from(new Set(uniqueProducts.map(p => p.category)));

            setState({
                products: uniqueProducts,
                suppliers: mergedSuppliers,
                brands: mergedBrands,
                categories,
                featuredProducts: uniqueProducts.filter(p => p.featured),
                newProducts: uniqueProducts.filter(p => p.isNew),
                dealsProducts: uniqueProducts.filter(p => (p.discount || 0) > 0 || p.isDeal),
                promotionalCards: promos.map(p => ({
                    id: p.id,
                    title: p.title,
                    description: p.description,
                    image: p.image || '',
                    buttonText: p.button_text || 'تسوق الآن',
                    link: p.link || '/store',
                    active: p.active,
                    section: p.section || 'hero',
                    badge_text: p.badge_text
                })),
                loading: false,
                error: null
            });

        } catch (err: any) {
            if (err?.name === 'AbortError' || err?.message?.includes('AbortError')) return;
            if (mountedRef.current) {
                console.error('Context Fetch Error:', err);
                setState(prev => ({
                    ...prev,
                    loading: false,
                    products: [],
                    error: err.message
                }));
            }
        }
    };

    useEffect(() => {
        mountedRef.current = true;
        fetchStoreData();
        return () => { mountedRef.current = false; };
    }, []);

    // 2. Persist Cart & Wishlist
    useEffect(() => {
        localStorage.setItem('store_cart', JSON.stringify(cart));

        // Sync with DB if logged in
        syncCartToDb(cart);
    }, [cart]);

    const syncCartToDb = async (currentCart: CartItem[]) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Simple sync strategy: Clear and re-insert (Or Upsert loop)
        // Ideally we debounce this or use specific add/remove actions to trigger DB calls directly
        // For Context refactor, better to do DB calls in actions.
    };

    // Load Cart from DB on Mount/Auth Change
    useEffect(() => {
        const loadUserCart = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('cart_items').select('*, product:products(*)').eq('user_id', user.id);
                if (data && data.length > 0) {
                    const dbCart = data.map((item: any) => ({
                        ...item.product, // Spread product details
                        quantity: item.quantity
                    }));
                    setCart(dbCart);
                }
            }
        };
        loadUserCart();
    }, []);

    useEffect(() => {
        localStorage.setItem('store_wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    // --- Actions ---

    // Cart Actions
    const addToCart = async (product: Product, quantity = 1) => {
        // Optimistic UI Update
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            return [...prev, { ...product, quantity }];
        });

        // DB Sync
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // Check if exists
            const { data: existing } = await supabase.from('cart_items').select('id, quantity').match({ user_id: user.id, product_id: product.id }).single();
            if (existing) {
                await supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id);
            } else {
                await supabase.from('cart_items').insert({ user_id: user.id, product_id: product.id, quantity });
            }
        }

        toast.dismiss();
        toast.success('تمت الإضافة للسلة');
    };

    const removeFromCart = async (productId: string) => {
        setCart(prev => prev.filter(item => item.id !== productId));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('cart_items').delete().match({ user_id: user.id, product_id: productId });
        }

        toast.error('تم حذف المنتج من السلة');
    };

    const updateQuantity = async (productId: string, qty: number) => {
        if (qty < 1) {
            removeFromCart(productId);
            return;
        }
        setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity: qty } : item));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('cart_items').update({ quantity: qty }).match({ user_id: user.id, product_id: productId });
        }
    };

    const clearCart = async () => {
        setCart([]);
        localStorage.removeItem('store_cart');

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('cart_items').delete().eq('user_id', user.id);
        }
    };

    // Calculate Totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = 0;
    const shipping = subtotal > 500000 ? 0 : 5000;
    const total = subtotal + tax + shipping;

    // Wishlist Actions
    const addToWishlist = async (productId: string) => {
        setWishlist(prev => {
            if (prev.includes(productId)) return prev;
            return [...prev, productId];
        });

        // Persist to DB
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { error } = await supabase
                .from('favorites')
                .upsert({ user_id: user.id, product_id: productId }, { onConflict: 'user_id,product_id' });

            if (error) {
                console.error('Failed to add to wishlist DB:', error);
                toast.error('فشل حفظ المفضلة في السحابة');
            } else {
                toast.success('تمت الإضافة للمفضلة');
            }
        } else {
            toast.success('تمت الإضافة للمفضلة (محلياً)');
        }
    };

    const removeFromWishlist = async (productId: string) => {
        setWishlist(prev => prev.filter(id => id !== productId));

        // Remove from DB
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { error } = await supabase
                .from('favorites')
                .delete()
                .match({ user_id: user.id, product_id: productId });

            if (error) {
                console.error('Failed to remove from wishlist DB:', error);
            } else {
                toast.success('تم الحذف من المفضلة');
            }
        } else {
            toast.success('تم الحذف من المفضلة');
        }
    };

    const toggleWishlist = (productId: string) => {
        if (wishlist.includes(productId)) {
            removeFromWishlist(productId);
        } else {
            addToWishlist(productId);
        }
    };

    const isInWishlist = (productId: string) => wishlist.includes(productId);

    return (
        <StoreContext.Provider value={{
            ...state,
            refresh: fetchStoreData,
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotals: { subtotal, tax, shipping, total },
            wishlist,
            addToWishlist,
            removeFromWishlist,
            toggleWishlist,
            isInWishlist
        }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStoreContext = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useStoreContext must be used within a StoreProvider');
    }
    return context;
};
