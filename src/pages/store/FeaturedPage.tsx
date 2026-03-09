import React, { useState } from 'react';
import { Star, Sparkles, ShoppingCart, ArrowLeft, Heart } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { ProductCard } from '../../components/store/ProductCard';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';

export default function FeaturedPage() {
    const navigate = useNavigate();
    const { featuredProducts, addToCart } = useStore();
    const [favorites, setFavorites] = useState<string[]>([]);

    const toggleFavorite = (productId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setFavorites(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const handleAddToCart = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const product = featuredProducts.find(p => p.id === id);
        if (product) addToCart(product);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24" dir="rtl">
            <div className="max-w-7xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <Sparkles className="w-8 h-8 text-yellow-500 fill-yellow-500 animate-pulse" />
                            منتجات مميزة
                        </h1>
                        <p className="text-slate-500 mt-1">تشكيلة مختارة من أفضل المنتجات والأكثر مبيعاً</p>
                    </div>
                    <button
                        onClick={() => navigate('/store')}
                        className="flex items-center gap-2 text-slate-500 hover:text-yellow-600 font-medium transition-colors px-4 py-2 hover:bg-white rounded-xl"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        العودة للمتجر
                    </button>
                </div>

                {/* Featured Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {featuredProducts.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            لا توجد منتجات مميزة حالياً
                        </div>
                    ) : (
                        featuredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={handleAddToCart}
                                onToggleWishlist={toggleFavorite}
                                isWishlisted={favorites.includes(product.id)}
                                className="h-[340px]"
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
