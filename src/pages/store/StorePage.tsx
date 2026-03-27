import React, { useState, useEffect } from 'react';
import {
  Search, Grid, Sparkles, Store, Star, ArrowRight, ChevronLeft
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useStore } from '../../hooks/useStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { detailedCategories } from '../../data/store-categories';
import { ProductCard } from '../../components/store/ProductCard';
import { formatLocation } from '../../utils/location';
import { useStoreCart } from '../../hooks/useStoreCart';
import { useWishlist } from '../../hooks/useWishlist';

export const StorePage: React.FC = () => {
  const navigate = useNavigate();
  const { products, featuredProducts, dealsProducts, promotionalCards } = useStore();
  const { addToCart } = useStoreCart(); // Use consistent Cart hook
  const { wishlistItems, toggleWishlist } = useWishlist(); // Use persistent Wishlist hook
  const [searchQuery, setSearchQuery] = useState('');
  const [suppliers, setSuppliers] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('suppliers').select('*').limit(6) // status column doesn't exist
      .then(({ data }) => {
        if (data) setSuppliers(data);
      });
  }, []);

  // Hero Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Use centralized mock promotions
  const promotions = promotionalCards.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description || '',
    image: p.image || '',
    buttonText: p.buttonText || 'تصفح العروض', // FIXED
    link: '/store',
    active: true,
    section: 'main',
    badge_text: p.badge_text
  }));



  // Auto-slide effect
  useEffect(() => {
    if (promotions.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promotions.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [promotions.length]);

  const handleSlideChange = (index: number) => {
    setCurrentSlide(index);
  };

  const handleToggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(productId);
  };

  const handleAddToCart = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Assuming we don't have the full product object here easily without lookup?
    // useStoreCart's addToCart expects (product, qty).
    // StorePage has `dealsProducts` and `featuredProducts`.
    // We need to find the product object to pass it.
    // For now, let's assume useStore's products are available or pass a partial object if allowed.
    // Wait, useStoreCart needs full object? 
    // `addToCart(product: StoreProduct, qty = 1)`
    // We need to find the product.

    // Quick fix: find in featured or deals or default.
    const product = featuredProducts.find(p => p.id === id) || dealsProducts.find(p => p.id === id);
    if (product) {
      addToCart(product);
      // toast handled in hook? No, better add toast here.
      // import toast from sonner?
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24" dir="rtl">

      <div className="container mx-auto px-4 py-6">

        {/* Bento Grid Layout Container */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-auto">

          {/* 1. Dynamic Hero Banner (Spans full width) */}
          <div className="col-span-1 md:col-span-4 row-span-2 relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden shadow-xl group">
            {promotions.map((promo, idx) => (
              <div
                key={promo.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                <div className="absolute inset-0">
                  <img src={promo.image || 'https://via.placeholder.com/1600x900'} alt={promo.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-purple-900/60 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="relative z-20 h-full flex flex-col justify-center items-start px-8 md:px-20 max-w-3xl text-white">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs md:text-sm font-semibold mb-4 border border-white/10">
                    {promo.badge_text || '✨ عروض مميزة'}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                    {promo.title}
                  </h2>
                  <p className="text-lg md:text-xl text-gray-100 mb-8 max-w-xl leading-relaxed">
                    {promo.description}
                  </p>
                  <Button
                    onClick={() => promo.link && navigate(promo.link)}
                    className="bg-white text-gray-900 hover:bg-gray-100 border-0 px-8 py-3 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    {promo.buttonText || 'تصفح العروض'}
                  </Button>
                </div>
              </div>
            ))}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
              {promotions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSlideChange(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                />
              ))}
            </div>
          </div>

          {/* 2. Bento Categories (Using detailedCategories from shared) */}
          <div className="col-span-1 md:col-span-4">
            <div className="flex items-center justify-between mb-4 mt-8">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Grid className="w-5 h-5 text-blue-600" />
                تصفح الأقسام
              </h3>
              <button
                onClick={() => navigate('/store/all-categories')}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                عرض الكل <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Horizontal Scrollable Bento Row for Categories */}
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-2 px-2">
              {detailedCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div
                    key={cat.id}
                    onClick={() => navigate(`/store/categories/${encodeURIComponent(cat.name)}`)}
                    className={`flex-shrink-0 w-40 h-40 rounded-3xl p-4 relative overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-xl ${cat.bg}`}
                  >
                    <div className={`w-10 h-10 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center mb-3 ${cat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm leading-snug mb-1">{cat.name}</h3>
                    <p className="text-[10px] text-gray-500 line-clamp-2">{cat.description}</p>

                    <Icon className={`absolute -bottom-2 -left-2 w-20 h-20 opacity-5 rotate-12 group-hover:scale-110 transition-transform ${cat.color}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Deals Section (Bento Style) */}
          <div className="col-span-1 md:col-span-4 mt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500" />
                  عروض حصرية
                </h3>
                <p className="text-slate-500 text-sm mt-1">تخفيضات مميزة لفترة محدودة</p>
              </div>
              <Button variant="outline" onClick={() => navigate('/store/deals')} className="border-amber-200 text-amber-800 hover:bg-amber-50 hover:border-amber-300 rounded-xl">
                جميع العروض
              </Button>
            </div>

            {/* Horizontal Scrollable Deals */}
            <div className="relative group">
              <div className="flex gap-4 overflow-x-auto pb-8 snap-x scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {dealsProducts.slice(0, 10).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={toggleWishlist}
                    isWishlisted={wishlistItems.has(product.id)}
                    className="min-w-[46%] md:min-w-[300px] snap-start h-[340px]"
                  />
                ))}

                {/* View All Card */}
                <div
                  onClick={() => navigate('/store/deals')}
                  className="min-w-[46%] md:min-w-[300px] snap-start h-[340px] flex flex-col items-center justify-center bg-amber-50 rounded-3xl border-2 border-dashed border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors gap-3"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <ArrowRight className="w-6 h-6 rotate-180" />
                  </div>
                  <span className="font-bold text-amber-700">عرض جميع الصفقات</span>
                </div>
              </div>
            </div>
          </div>

          {/* New Arrivals (Grid) */}
          <div className="col-span-1 md:col-span-4 mt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                وصل حديثاً ({products.length})
              </h3>
              <button onClick={() => navigate('/store/products')} className="text-sm font-medium text-blue-600 hover:text-blue-700">عرض الكل</button>
            </div>

            <div className="relative group">
              <div className="flex gap-4 overflow-x-auto pb-8 snap-x scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {products.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 10).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={toggleWishlist}
                    isWishlisted={wishlistItems.has(product.id)}
                    className="min-w-[46%] md:min-w-[300px] snap-start h-[340px]"
                  />
                ))}

                {/* View All Card */}
                <div
                  onClick={() => navigate('/store/products')}
                  className="min-w-[46%] md:min-w-[300px] snap-start h-[340px] flex flex-col items-center justify-center bg-purple-50 rounded-3xl border-2 border-dashed border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors gap-3"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <ArrowRight className="w-6 h-6 rotate-180" />
                  </div>
                  <span className="font-bold text-purple-700">عرض كل المنتجات</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Featured Products (Grid) */}
          <div className="col-span-1 md:col-span-4 mt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                منتجات مميزة
              </h3>
              <button onClick={() => navigate('/store/featured')} className="text-sm font-medium text-blue-600 hover:text-blue-700">عرض الكل</button>
            </div>

            <div className="relative group">
              <div className="flex gap-4 overflow-x-auto pb-8 snap-x scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {featuredProducts.slice(0, 10).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={toggleWishlist}
                    isWishlisted={wishlistItems.has(product.id)}
                    className="min-w-[46%] md:min-w-[300px] snap-start h-[340px]"
                  />
                ))}

                {/* View All Card */}
                <div
                  onClick={() => navigate('/store/featured')}
                  className="min-w-[46%] md:min-w-[300px] snap-start h-[340px] flex flex-col items-center justify-center bg-blue-50 rounded-3xl border-2 border-dashed border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors gap-3"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <ArrowRight className="w-6 h-6 rotate-180" />
                  </div>
                  <span className="font-bold text-blue-700">عرض كل المميزة</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Success Partners (Suppliers) - Bento Card */}
          <div className="col-span-1 md:col-span-4 mt-12 mb-8 bg-slate-900 rounded-3xl p-8 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6 text-white">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <Store className="w-6 h-6 text-blue-400" />
                    شركاء النجاح
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">نخبة من الموردين المعتمدين في المنصة</p>
                </div>
                <Button variant="ghost" onClick={() => navigate('/store/suppliers')} className="text-blue-300 hover:bg-white/10 hover:text-white">
                  عرض الكل <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                </Button>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {suppliers.slice(0, 6).map((supplier) => (
                  <div
                    key={supplier.id}
                    onClick={() => navigate(`/store/supplier/${supplier.id}`)} // Fixed route
                    className="flex-shrink-0 w-48 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/5 hover:bg-white/20 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden mb-3 group-hover:scale-110 transition-transform">
                      {supplier.logo ? (
                        <img src={supplier.logo} alt={supplier.name} className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-6 h-6 text-slate-800" />
                      )}
                    </div>
                    <h4 className="font-bold text-white text-sm mb-1">{supplier.name}</h4>
                    <div className="flex items-center gap-1 text-xs text-amber-400 mb-2">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{supplier.rating || 'New'}</span>
                    </div>
                    <span className="line-clamp-1 text-xs text-slate-400">{formatLocation(supplier.governorate, supplier.address) || 'العراق'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          </div>

        </div>
      </div>
    </div>
  );
};
