import React, { useState } from 'react';
import { Tag, Clock, TrendingDown, Sparkles, Flame, ShoppingCart, ArrowLeft, Heart } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { ProductCard } from '../../components/store/ProductCard';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { detailedCategories } from '../../data/store-categories';

export default function DealsPage() {
  const navigate = useNavigate();
  const { dealsProducts, promotionalCards, addToCart } = useStore();
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
    const product = dealsProducts.find(p => p.id === id);
    if (product) {
      addToCart(product);
    }
  };

  // Sort deals by discount descending
  const sortedDeals = [...dealsProducts].sort((a, b) => (b.discount || 0) - (a.discount || 0));

  // Decide what to show in Hero
  const heroPromo = promotionalCards.length > 0 ? promotionalCards[0] : null;
  const secondaryPromo = promotionalCards.length > 1 ? promotionalCards[1] : null;

  // If no hero promo, use top deal product
  const topDealProduct = !heroPromo && sortedDeals.length > 0 ? sortedDeals[0] : null;

  // Remaining deals for grid (exclude top deal if used as hero)
  const gridDeals = topDealProduct ? sortedDeals.slice(1) : sortedDeals;

  // Stats
  const maxDiscount = Math.max(...dealsProducts.map(p => p.discount || 0), 0);
  const totalDealsCount = dealsProducts.length;

  return (
    <div className="min-h-screen bg-slate-50 pb-24" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Flame className="w-8 h-8 text-orange-500 fill-orange-500 animate-pulse" />
              عروض وتخفيضات
            </h1>
            <p className="text-slate-500 mt-1">أقوى العروض الحصرية والخصومات المميزة</p>
          </div>
          <button
            onClick={() => navigate('/store')}
            className="flex items-center gap-2 text-slate-500 hover:text-orange-600 font-medium transition-colors px-4 py-2 hover:bg-white rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            العودة للمتجر
          </button>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-max">

          {/* 1. Hero Section (Promo Card or Product) */}
          {(heroPromo || topDealProduct) && (
            <div
              onClick={() => heroPromo ? (heroPromo.link && navigate(heroPromo.link)) : navigate(`/store/product/${topDealProduct!.id}`)}
              className="col-span-1 md:col-span-2 md:row-span-2 rounded-[2rem] bg-gradient-to-br from-orange-500 to-red-600 p-1 relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300"
            >
              <div className="bg-white h-full w-full rounded-[1.8rem] relative overflow-hidden flex flex-col md:flex-row">
                {/* Image Section */}
                <div className="w-full md:w-1/2 relative overflow-hidden h-64 md:h-auto">
                  <img
                    src={heroPromo ? (heroPromo.image || 'https://via.placeholder.com/600') : topDealProduct!.image}
                    alt={heroPromo ? heroPromo.title : topDealProduct!.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {!heroPromo && topDealProduct && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white font-bold px-4 py-2 rounded-full shadow-lg z-10 animate-bounce">
                      -{topDealProduct.discount}%
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-center bg-gradient-to-br from-white to-orange-50">
                  <div className="flex items-center gap-2 text-orange-600 font-bold mb-3 bg-orange-100 w-fit px-3 py-1 rounded-lg">
                    <Sparkles className="w-4 h-4" /> {heroPromo ? 'حدث مميز' : 'صفقة اليوم'}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 leading-tight">
                    {heroPromo ? heroPromo.title : topDealProduct!.name}
                  </h2>
                  <p className="text-slate-500 mb-6 line-clamp-3 leading-relaxed">
                    {heroPromo ? heroPromo.description : topDealProduct!.description}
                  </p>

                  <div className="mt-auto">
                    {!heroPromo && topDealProduct && (
                      <div className="flex items-end gap-3 mb-6">
                        <span className="text-4xl font-bold text-slate-900">
                          {topDealProduct.price.toLocaleString()}
                        </span>
                        {topDealProduct.originalPrice && (
                          <span className="text-xl text-slate-400 line-through decoration-red-500/30 mb-1">
                            {topDealProduct.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}

                    <Button
                      className="w-full bg-slate-900 text-white hover:bg-orange-600 border-0 py-4 text-lg rounded-xl shadow-xl transition-all"
                      onClick={(e) => {
                        if (heroPromo) {
                          if (heroPromo.link) navigate(heroPromo.link);
                        } else {
                          handleAddToCart(topDealProduct!.id, e);
                        }
                      }}
                    >
                      {heroPromo ? (heroPromo.buttonText || 'اكتشف المزيد') : (
                        <>
                          <ShoppingCart className="w-5 h-5 ml-2" />
                          أضف للسلة
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Stat: Total Deals */}
          <div className="col-span-1 bg-white rounded-3xl p-6 border border-slate-100 flex flex-col justify-between hover:border-orange-200 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-4xl font-bold text-slate-800 block mb-1">{totalDealsCount}</span>
              <span className="text-slate-500 text-sm">منتج مخفض حالياً</span>
            </div>
          </div>

          {/* 3. Stat: Max Discount */}
          <div className="col-span-1 bg-white rounded-3xl p-6 border border-slate-100 flex flex-col justify-between hover:border-red-200 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <span className="text-4xl font-bold text-slate-800 block mb-1">{maxDiscount}%</span>
              <span className="text-slate-500 text-sm">أعلى نسبة خصم</span>
            </div>
          </div>

          {/* 4. Secondary Promo / Limited Time Banner */}
          {secondaryPromo ? (
            <div
              onClick={() => secondaryPromo.link && navigate(secondaryPromo.link)}
              className="col-span-1 md:col-span-2 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-center cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <div className="relative z-10 w-2/3">
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-orange-400 animate-pulse" />
                  {secondaryPromo.title}
                </h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {secondaryPromo.description}
                </p>
                <span className="inline-block px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold">
                  {secondaryPromo.buttonText || 'تسوق الآن'}
                </span>
              </div>
              {secondaryPromo.image && (
                <div className="absolute right-0 top-0 h-full w-1/3">
                  <img src={secondaryPromo.image} className="h-full w-full object-cover opacity-50 mask-image-gradient" alt="" />
                </div>
              )}
              <div className="absolute right-0 top-0 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none"></div>
            </div>
          ) : (
            <div className="col-span-1 md:col-span-2 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden flex items-center justify-between">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-orange-400 animate-pulse" />
                  عروض لفترة محدودة
                </h3>
                <p className="text-slate-400 text-sm max-w-xs">
                  تنتهي هذه العروض قريباً. سارع بالشراء قبل نفاذ الكمية.
                </p>
              </div>
              <div className="absolute right-0 top-0 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none"></div>
            </div>
          )}

          {/* Remaining Deals Grid */}
          {/* Remaining Deals Grid */}
          {gridDeals.map((product) => (
            <div key={product.id} className="col-span-1 h-[340px]">
              <ProductCard
                product={product}
                onAddToCart={handleAddToCart}
                onToggleWishlist={toggleFavorite}
                isWishlisted={favorites.includes(product.id)}
                className="h-full"
              />
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
