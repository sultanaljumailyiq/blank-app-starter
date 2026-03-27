import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  Star, Heart, ShoppingCart, Truck, Shield, AlertCircle,
  Minus, Plus, CheckCircle, Package
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useStore } from '../../hooks/useStore';
import { useStoreCart } from '../../hooks/useStoreCart';
import { useWishlist } from '../../hooks/useWishlist';
import { formatCurrency } from '../../lib/utils';
import { Product } from '../../types';
import { ProductCard } from '../../components/store/ProductCard';
import { toast } from 'sonner';

export const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const id = productId;
  const { products, loading } = useStore();
  const { addToCart } = useStoreCart();
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { cartItems } = useStoreCart(); // To check if item is in cart
  const [quantity, setQuantity] = useState(1);

  // State for direct fetch if not in context
  const [fetchedProduct, setFetchedProduct] = useState<Product | null>(null);
  const [fetching, setFetching] = useState(false);
  const [hasCheckedDb, setHasCheckedDb] = useState(false);

  // Try to find in context first
  const contextProduct = products.find(p => p.id === id);
  const product = contextProduct || fetchedProduct;

  useEffect(() => {
    // If not in context and not loading context, try direct fetch
    if (!loading && id) {
      if (contextProduct) {
        setHasCheckedDb(true);
        return;
      }

      const fetchDirect = async () => {
        setFetching(true);
        try {
          const { data, error } = await supabase
            .from('products')
            .select(`
              *,
              supplier:suppliers (id, name),
              brand:brands (id, name)
            `)
            .eq('id', id)
            .single();

          if (data) {
            const mapped: Product = {
              id: data.id,
              name: data.name,
              description: data.description || '',
              price: Number(data.price),
              originalPrice: data.price, // Assuming no discount column yet or logic needed
              stock: data.stock_quantity || 0,
              category: data.category || 'general',
              image: data.image_url || 'https://via.placeholder.com/300',
              images: data.images || (data.image_url ? [data.image_url] : []),
              rating: Number(data.rating || 0),
              reviews: 0, // Need reviews table eventually
              isNew: false,
              featured: false,
              discount: 0,
              supplierId: data.supplier_id,
              supplierName: data.supplier?.name || 'Unknown Supplier',
              brandId: data.brand_id,
              brandName: data.brand?.name || 'Generic',
              target_audience: ['clinic']
            };
            setFetchedProduct(mapped);
          } else {
            console.error('Direct fetch failed:', error);
          }
        } catch (err) {
          console.error('Fetch exception:', err);
        } finally {
          setFetching(false);
          setHasCheckedDb(true);
        }
      };

      fetchDirect();
    }
  }, [id, contextProduct, loading]);

  // Track Views
  useEffect(() => {
    const trackView = async () => {
      if (!id) return;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('product_views').insert({
          product_id: id,
          viewer_id: user?.id || null
        });
      } catch (e) {
        // Ignore view tracking errors
      }
    };
    trackView();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast.success('تمت الإضافة للسلة');
    }
  };

  // Show spinner only if we have NO product and are loading/fetching
  if ((loading && !product) || fetching || (!product && !hasCheckedDb)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700">المنتج غير موجود</h2>
        <p className="text-gray-500 mb-4 text-sm">تأكد من الرابط أو حاول مرة أخرى</p>
        <Link to="/store" className="mt-4 text-blue-600 hover:underline">العودة للمتجر</Link>
      </div>
    );
  }

  // Calculate if in stock (mock logic if not in types)
  const isInStock = (product as any).stock > 0 || true;

  // Reviews Logic
  const [reviews, setReviews] = useState<any[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) {
      fetchReviews();
    }
  }, [id]);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles:user_id(full_name, avatar_url)') // Assuming profiles link
      .eq('product_id', id)
      .order('created_at', { ascending: false });

    if (data) {
      setReviews(data);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRating === 0) return toast.error('يرجى اختيار التقييم');

    setSubmittingReview(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return toast.error('يرجى تسجيل الدخول للتقييم');

      const { error } = await supabase.from('reviews').insert({
        product_id: id,
        user_id: user.id,
        rating: userRating,
        comment: userComment
      });

      if (error) {
        if (error.code === '23505') return toast.error('لقد قمت بتقييم هذا المنتج مسبقاً');
        throw error;
      }

      toast.success('تم إرسال تقييمك بنجاح');
      setUserRating(0);
      setUserComment('');
      fetchReviews();
    } catch (error) {
      console.error(error);
      toast.error('فشل إرسال التقييم');
    } finally {
      setSubmittingReview(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : (product.rating || '0').toString();

  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/store" className="hover:text-blue-600 transition-colors">المتجر</Link>
            <span>/</span>
            <span>{product.category}</span>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-8 flex items-center justify-center group">
              <img
                src={product.image || 'https://via.placeholder.com/600'}
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            {/* Thumbnails would go here - placeholder */}
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-white rounded-xl border border-gray-100 p-2 cursor-pointer hover:border-blue-500 transition-colors">
                  <img src={product.image || 'https://via.placeholder.com/150'} className="w-full h-full object-contain opacity-70 hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                    {product.category}
                  </span>
                  {(product as any).brandName && (product as any).brandName !== 'Brand' && (product as any).brandName !== 'Generic' && (
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                      {(product as any).brandName}
                    </span>
                  )}
                  {(product as any).isNew && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">جديد</span>}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{product.name}</h1>

                <div className="flex items-center gap-6 text-sm mb-6">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-lg text-gray-900">{averageRating}</span>
                    <span className="text-gray-500">({reviews.length} تقييم)</span>
                  </div>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <Link to={`/store/supplier/${product.supplierId}`} className="flex items-center gap-2 text-blue-600 font-medium hover:underline">
                    <Package className="w-4 h-4" />
                    {product.supplierName}
                  </Link>
                </div>

                <div className="prose prose-sm text-gray-600 mb-8 max-w-none">
                  <p>{product.description}</p>
                </div>

                {/* Features (Mock) */}
                <div className="space-y-3 mb-8">
                  {['منتج أصلي 100%', 'ضمان لمدة سنة', 'شحن سريع'].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-gray-700">
                      <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Price & Action Card */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8 sticky bottom-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-blue-600">{formatCurrency(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-lg text-gray-400 line-through decoration-red-500">{formatCurrency(product.originalPrice)}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">شاملة جميع الرسوم والضرائب</p>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1 border border-gray-200">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-white rounded-lg shadow-sm transition-all"
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-white rounded-lg shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 text-lg py-4 h-auto rounded-xl gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-200/50"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cartItems.find(item => item.id === product.id) ? 'إضافة المزيد' : 'إضافة للسلة'}
                </Button>
                <button className="px-6 rounded-xl border-2 border-gray-200 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all text-gray-400">
                  <Heart className="w-7 h-7" />
                </button>
              </div>

              {/* Trust Badges Row */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100">
                <div className="flex flex-col items-center gap-2 text-center group">
                  <Truck className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="text-xs font-medium text-gray-500">شحن سريع</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center group">
                  <Shield className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="text-xs font-medium text-gray-500">دفع آمن</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center group">
                  <AlertCircle className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="text-xs font-medium text-gray-500">دعم 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">التقييمات والمراجعات</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Add Review Form */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h4 className="font-bold text-lg mb-4">أضف تقييمك</h4>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${userRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="اكتب تعليقك هنا..."
                  className="w-full h-32 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                ></textarea>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={submittingReview}
                >
                  {submittingReview ? 'جاري الإرسال...' : 'نشر التقييم'}
                </Button>
              </form>
            </div>

            {/* Reviews List */}
            <div className="md:col-span-2 space-y-6">
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  لا توجد تقييمات بعد. كن أول من يقيم هذا المنتج!
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="border-b last:border-0 border-gray-100 pb-6 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                          {review.profiles?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{review.profiles?.full_name || 'مستخدم'}</div>
                          <div className="flex text-yellow-400 text-xs">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString('ar-IQ')}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-2">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Similar Products Sections */}
        <div className="mt-16 space-y-12">

          {/* More from Supplier */}
          {products.filter(p => p.supplierId === product.supplierId && p.id !== product.id).length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">المزيد من {product.supplierName}</h3>
                <Link to={`/store/supplier/${product.supplierId}`} className="text-blue-600 hover:underline">عرض المتجر</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {products
                  .filter(p => p.supplierId === product.supplierId && p.id !== product.id)
                  .slice(0, 4)
                  .map(p => (
                    <div key={p.id} className="h-[340px]">
                      <ProductCard
                        product={p}
                        onAddToCart={(id, e) => { e.stopPropagation(); addToCart(p); toast.success('تمت الإضافة'); }}
                        onToggleWishlist={(id, e) => { e.stopPropagation(); toggleWishlist(p.id); }}
                        isWishlisted={wishlistItems.has(p.id)}
                        className="h-full border-gray-100 hover:border-blue-200"
                      />
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* Related Products (Same Category) */}
          {products.filter(p => p.category === product.category && p.id !== product.id).length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">منتجات مشابهة</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {products
                  .filter(p => p.category === product.category && p.id !== product.id)
                  .slice(0, 4)
                  .map(p => (
                    <div key={p.id} className="h-[340px]">
                      <ProductCard
                        product={p}
                        onAddToCart={(id, e) => { e.stopPropagation(); addToCart(p); toast.success('تمت الإضافة'); }}
                        onToggleWishlist={(id, e) => { e.stopPropagation(); toggleWishlist(p.id); }}
                        isWishlisted={wishlistItems.has(p.id)}
                        className="h-full border-gray-100 hover:border-blue-200"
                      />
                    </div>
                  ))
                }
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
