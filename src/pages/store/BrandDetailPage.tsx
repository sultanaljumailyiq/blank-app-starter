import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Globe, ShieldCheck, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Brand } from '../../types';
import { useStoreProducts } from '../../hooks/useStoreProducts';
import { ProductCard } from '../../components/store/ProductCard';
import { Button } from '../../components/common/Button';
import { useStoreCart } from '../../hooks/useStoreCart';
import { useWishlist } from '../../hooks/useWishlist';

export const BrandDetailPage: React.FC = () => {
    const { brandId } = useParams<{ brandId: string }>();
    const navigate = useNavigate();
    const [brand, setBrand] = useState<Brand | null>(null);
    const [loading, setLoading] = useState(true);

    const { products: allProducts } = useStoreProducts();
    const { addToCart } = useStoreCart();
    const { wishlistItems, toggleWishlist } = useWishlist();

    useEffect(() => {
        if (brandId) {
            fetchBrandDetails();
        }
    }, [brandId]);

    const fetchBrandDetails = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('brands')
                .select('*')
                .eq('id', brandId)
                .single();

            if (error) throw error;
            setBrand(data);
        } catch (error) {
            console.error('Error fetching brand:', error);
        } finally {
            setLoading(false);
        }
    };

    const brandProducts = allProducts.filter(p => p.brandId === brand?.id);

    // --- Filtering Logic ---
    const allCategories = Array.from(new Set(brandProducts.map(p => p.category))).filter(Boolean);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [sortOption, setSortOption] = useState<'price_asc' | 'price_desc' | 'name'>('name');

    // Toggle Category Filter
    const toggleCategory = (cat: string) => {
        setSelectedCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    // Derived Products
    const displayedProducts = brandProducts
        .filter(p => selectedCategories.length === 0 || selectedCategories.includes(p.category))
        .sort((a, b) => {
            if (sortOption === 'price_asc') return a.price - b.price;
            if (sortOption === 'price_desc') return b.price - a.price;
            return a.name.localeCompare(b.name);
        });

    if (loading) return <div className="p-12 text-center text-gray-500">جاري التحميل...</div>;
    if (!brand) return <div className="p-12 text-center text-red-500">العلامة التجارية غير موجودة</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-12" dir="rtl">
            {/* Brand Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-8">
                    <Button variant="ghost" onClick={() => navigate('/store/brands')} className="mb-4 text-gray-500">
                        <ChevronRight className="w-4 h-4 ml-2" />
                        العودة للعلامات التجارية
                    </Button>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="w-32 h-32 bg-white rounded-2xl border border-gray-100 shadow-lg p-4 flex items-center justify-center">
                            {brand.logo ? (
                                <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
                            ) : (
                                <span className="text-4xl font-bold text-gray-300">{brand.name.charAt(0)}</span>
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-right">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{brand.name}</h1>
                                {brand.verified && <ShieldCheck className="w-6 h-6 text-blue-500" />}
                            </div>

                            <p className="text-gray-600 max-w-2xl mb-4 leading-relaxed">{brand.description}</p>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Globe className="w-4 h-4" />
                                    {brand.country}
                                </div>
                                {brand.website && (
                                    <a href={brand.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                        الموقع الرسمي
                                    </a>
                                )}
                                <div>
                                    {brandProducts.length} منتج متوفر
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid with Sidebar */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Filter Sidebar */}
                    <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                الفئات ({allCategories.length})
                            </h3>
                            <div className="space-y-2">
                                {allCategories.map(cat => (
                                    <label key={cat} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCategories.includes(cat) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                                            {selectedCategories.includes(cat) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={selectedCategories.includes(cat)}
                                            onChange={() => toggleCategory(cat)}
                                        />
                                        <span className={`text-sm ${selectedCategories.includes(cat) ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{cat}</span>
                                        <span className="text-xs text-gray-400 mr-auto">
                                            ({brandProducts.filter(p => p.category === cat).length})
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">منتجات {brand.name} ({displayedProducts.length})</h2>
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value as any)}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="name">الاسم</option>
                                <option value="price_asc">الأقل سعراً</option>
                                <option value="price_desc">الأعلى سعراً</option>
                            </select>
                        </div>

                        {displayedProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayedProducts.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onAddToCart={() => addToCart(product)}
                                        onToggleWishlist={toggleWishlist}
                                        isWishlisted={wishlistItems.has(product.id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                                <p className="text-gray-500">لا توجد منتجات مطابقة للفلتر.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
