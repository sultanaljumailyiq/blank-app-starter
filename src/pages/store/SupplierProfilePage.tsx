import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Phone, Mail, Store,
  BadgeCheck, Shield, Award, MessageSquare, Grid,
  TrendingUp, Calendar, Package, Star, ChevronLeft
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useStore } from '../../hooks/useStore';
import { ProductCard } from '../../components/store/ProductCard';
import { formatLocation } from '../../utils/location';

export const SupplierProfilePage: React.FC = () => {
  const { supplierId } = useParams<{ supplierId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'brands'>('products');
  const { suppliers, products, brands, addToCart } = useStore();
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());

  // Find supplier from store data
  const supplier = suppliers.find(s => s.id === supplierId);
  const supplierProducts = products.filter(p => p.supplierId === supplierId);

  // Derive categories from supplier products
  const categories = Array.from(new Set(supplierProducts.map(p => p.category)));

  // Get Supplier Brands (matched by name from the supplier's brand list or by product association)
  // Using product association to be safe and get full Brand objects
  const brandIds = new Set(supplierProducts.map(p => p.brandId).filter(Boolean));
  // Also include brands that might be listed in supplier.brands but no products yet (if name matches)
  const fullSupplierBrands = brands.filter(b =>
    brandIds.has(b.id) || (supplier?.brands?.includes(b.name))
  );

  const handleAddToCart = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const product = products.find(p => p.id === id);
    if (product) addToCart(product);
  };

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlistItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  if (!supplier) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Store className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">المورد غير موجود</h2>
          <Button onClick={() => navigate('/store')}>العودة للمتجر</Button>
        </div>
      </div>
    );
  }

  // Group products by category
  const productsByCategory = categories.map(category => ({
    category,
    products: supplierProducts.filter(p => p.category === category),
    count: supplierProducts.filter(p => p.category === category).length
  }));

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Cover Image */}
      <div className="h-64 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="container mx-auto px-4">
        {/* Profile Card */}
        <Card className="relative -mt-32 z-10 mb-8 overflow-hidden rounded-3xl border-none shadow-xl">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-gray-100 overflow-hidden">
                  {(supplier.logo_url || supplier.logo) ? (
                    <img src={supplier.logo_url || supplier.logo} alt={supplier.name} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-16 h-16 text-blue-600" />
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                      {supplier.name}
                      {supplier.verified && (
                        <BadgeCheck className="w-8 h-8 text-blue-500" />
                      )}
                    </h1>
                    <p className="text-lg text-gray-600 mb-3">{supplier.description || 'مورد موثوق للمواد الطبية ومستلزمات الأسنان.'}</p>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin className="w-5 h-5" />
                      <span>{formatLocation(supplier.governorate, supplier.address)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="primary"
                      className="flex items-center justify-center gap-2"
                      onClick={() => navigate('/store/messages')}
                    >
                      <MessageSquare className="w-5 h-5" />
                      مراسلة المورد
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex items-center justify-center gap-2 border border-gray-300"
                    >
                      <Store className="w-5 h-5" />
                      متابعة
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-2xl font-bold">{supplier.rating}</span>
                    </div>
                    <p className="text-sm text-gray-600">التقييم</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-100">
                    <div className="flex items-center gap-2 text-purple-600 mb-1">
                      <Package className="w-5 h-5" />
                      <span className="text-2xl font-bold">{supplierProducts.length}</span>
                    </div>
                    <p className="text-sm text-gray-600">منتج</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-100">
                    <div className="flex items-center gap-2 text-green-600 mb-1">
                      <TrendingUp className="w-5 h-5" />
                      <span className="text-2xl font-bold">{supplier.reviews}</span>
                    </div>
                    <p className="text-sm text-gray-600">تقييم</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-100">
                    <div className="flex items-center gap-2 text-orange-600 mb-1">
                      <Calendar className="w-5 h-5" />
                      <span className="text-2xl font-bold">2023</span>
                    </div>
                    <p className="text-sm text-gray-600">عضو منذ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info Row */}
            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">رقم الهاتف</p>
                  <p className="font-medium text-gray-900" dir="ltr">{supplier.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                  <p className="font-medium text-gray-900" dir="ltr">{supplier.email}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm mb-8 sticky top-20 z-30 border border-slate-100 p-1.5">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {[
              { id: 'products', label: 'المنتجات', icon: Package, count: supplierProducts.length },
              { id: 'categories', label: 'الفئات', icon: Grid, count: categories.length },
              { id: 'brands', label: 'العلامات التجارية', icon: Award, count: fullSupplierBrands.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap flex-1 justify-center ${activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-500 hover:bg-slate-50'
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label} <span className="text-xs opacity-80">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="pb-12">
          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {supplierProducts.map((product) => (
                  <div key={product.id} className="h-[340px]">
                    <ProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={toggleWishlist}
                      isWishlisted={wishlistItems.has(product.id)}
                      className="h-full"
                    />
                  </div>
                ))}
              </div>
              {supplierProducts.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                  <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">لا توجد منتجات لعرضها حالياً</p>
                </div>
              )}
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              {productsByCategory.map((categoryGroup) => (
                categoryGroup.count > 0 && (
                  <div key={categoryGroup.category}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Grid className="w-6 h-6 text-blue-600" />
                        {categoryGroup.category}
                      </h3>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                      {categoryGroup.products.map(product => (
                        <div key={product.id} className="w-72 h-[340px] flex-shrink-0">
                          <ProductCard
                            product={product}
                            onAddToCart={handleAddToCart}
                            onToggleWishlist={toggleWishlist}
                            isWishlisted={wishlistItems.has(product.id)}
                            className="h-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Brands Tab */}
          {activeTab === 'brands' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {fullSupplierBrands.length > 0 ? (
                fullSupplierBrands.map((brand) => (
                  <Card
                    key={brand.id}
                    onClick={() => navigate(`/store/brand/${brand.id}`)}
                    className="p-6 hover:shadow-lg transition-all rounded-3xl border-slate-100 group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2 shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
                        {brand.logo ? (
                          <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
                        ) : (
                          <Award className="w-8 h-8 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{brand.name}</h3>
                          {brand.verified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                        </div>
                        <p className="text-sm text-gray-500 mb-1">{brand.country}</p>
                        <p className="text-xs text-gray-400 line-clamp-1">{brand.description}</p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                  <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">لا توجد علامات تجارية مرتبطة حالياً</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
