import React, { useState } from 'react';
import {
  Package, Plus, Search, Filter, Edit3, Trash2, Eye, Star,
  Grid, List, TrendingUp, AlertTriangle, Check, Megaphone
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../lib/utils';
import { useSupplier } from '../../hooks/useSupplier';
import { SupplierProductModal } from '../../components/supplier/SupplierProductModal';
import { PromotionRequestModal } from '../../components/supplier/PromotionRequestModal';
import { supabase } from '../../lib/supabase';

export const SupplierProductsPage: React.FC = () => {
  const { products, loading, deleteProduct, toggleFeatured, addProduct, updateProduct } = useSupplier();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'sales' | 'views'>('name');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Promo Modal State
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoProduct, setPromoProduct] = useState<any>(null);

  // Categories derived from products + default ones
  const categories = ['الكل', ...new Set(products.map(p => p.category))];

  const handleRequestPromotion = (product: any) => {
    setPromoProduct(product);
    setIsPromoModalOpen(true);
  };

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'all' || selectedCategory === 'الكل' || product.category === selectedCategory;
    const searchMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  }).sort((a, b) => {
    if (sortBy === 'price') return b.price - a.price;
    if (sortBy === 'sales') return b.sales - a.sales;
    if (sortBy === 'views') return b.views - a.views;
    return a.name.localeCompare(b.name);
  });

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    setSelectedProducts(
      selectedProducts.length === filteredProducts.length
        ? []
        : filteredProducts.map(p => p.id)
    );
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (data: any) => {
    // Extract promotion fields and frontend-only flags
    const {
      promotionStartDate,
      promotionEndDate,
      promotionNotes,
      isOfferRequest,
      isNewRequest,
      isFeaturedRequest,
      offerDiscount,
      brandId, // handled by brand_id inside modal but let's be safe
      ...productData
    } = data;

    let productId = editingProduct?.id;
    let savedProduct = null;

    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
      savedProduct = { ...editingProduct, ...productData }; // Optimistic
    } else {
      savedProduct = await addProduct(productData);
      productId = savedProduct?.id;
    }

    // Handle Promotion Request
    if (data.isOfferRequest && productId) {
      try {
        // Check if there is already a pending request? Maybe just insert new one.
        const { error } = await supabase.from('deal_requests').insert([
          {
            product_id: productId,
            supplier_id: savedProduct.supplier_id || savedProduct.supplierId, // Handle both cases
            discount_percentage: data.offerDiscount,
            start_date: promotionStartDate,
            end_date: promotionEndDate,
            notes: promotionNotes,
            status: 'pending'
          }
        ]);

        if (error) {
          console.error('Error creating promotion request:', error);
          // Optionally show toast error here
        } else {
          console.log('Promotion request created successfully');
        }
      } catch (err) {
        console.error('Failed to create promotion request:', err);
      }
    }

    setIsModalOpen(false);
  };


  const getProductStatus = (product: any) => {
    if (product.stock === 0) return 'out_of_stock';
    if (product.stock < 5) return 'low_stock';
    return 'available';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700 border-green-200';
      case 'out_of_stock': return 'bg-red-100 text-red-700 border-red-200';
      case 'low_stock': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'متوفر';
      case 'out_of_stock': return 'نفد';
      case 'low_stock': return 'منخفض';
      default: return status;
    }
  };

  if (loading && products.length === 0) return <div className="p-8 text-center text-gray-500">جاري تحميل المنتجات...</div>;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">إدارة المنتجات</h1>
          <p className="text-gray-600 mt-1">إدارة جميع منتجاتك بسهولة وفعالية</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            تصدير
          </Button>
          <Button variant="primary" className="flex items-center gap-2" onClick={handleAddProduct}>
            <Plus className="w-4 h-4" />
            إضافة منتج
          </Button>
        </div>
      </div>

      {/* Stats Cards - Bento Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-3xl p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
                <Package className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{products.length}</p>
              <p className="text-sm text-gray-600 font-medium">إجمالي المنتجات</p>
            </div>
          </div>
          <Package className="absolute -bottom-6 -left-6 w-32 h-32 text-blue-500 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-500" />
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-3xl p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500 rounded-2xl shadow-lg shadow-green-500/20 text-white">
                <Check className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {products.filter(p => p.stock > 0).length}
              </p>
              <p className="text-sm text-gray-600 font-medium">المتوفرة</p>
            </div>
          </div>
          <Check className="absolute -bottom-6 -left-6 w-32 h-32 text-green-500 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-500" />
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-3xl p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-500 rounded-2xl shadow-lg shadow-red-500/20 text-white">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {products.filter(p => p.stock === 0).length}
              </p>
              <p className="text-sm text-gray-600 font-medium">نفدت</p>
            </div>
          </div>
          <AlertTriangle className="absolute -bottom-6 -left-6 w-32 h-32 text-red-500 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-500" />
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-3xl p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500 rounded-2xl shadow-lg shadow-purple-500/20 text-white">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {products.reduce((acc, p) => acc + p.sales, 0)}
              </p>
              <p className="text-sm text-gray-600 font-medium">إجمالي المبيعات</p>
            </div>
          </div>
          <TrendingUp className="absolute -bottom-6 -left-6 w-32 h-32 text-purple-500 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>

      {/* Filters and Controls */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative col-span-2 sm:w-64 sm:col-span-1">
                <Search className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في المنتجات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg w-full"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white w-full sm:w-auto"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white w-full sm:w-auto"
              >
                <option value="name">الاسم</option>
                <option value="price">السعر</option>
                <option value="sales">المبيعات</option>
                <option value="views">المشاهدات</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Products Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative">
                {/* Product Image */}
                <div className="h-48 bg-white flex items-center justify-center border-b border-gray-100">
                  <img
                    src={product.image || 'https://via.placeholder.com/300'}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                {/* Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  {product.isNew && (
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                      جديد
                    </span>
                  )}
                  {product.featured && (
                    <span className="bg-yellow-500 text-gray-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                      مميز
                    </span>
                  )}
                  {product.discount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                      -{product.discount}%
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                  <Button size="sm" variant="outline" className={`p-2 bg-white/90 shadow-sm border-0 hover:bg-yellow-50 ${product.featured ? 'text-yellow-500' : 'text-gray-400'}`} onClick={() => toggleFeatured(product.id, product.featured || false)} title={product.featured ? "إلغاء التمييز" : "تمييز"}>
                    <Star className={`w-4 h-4 ${product.featured ? 'fill-current' : ''}`} />
                  </Button>
                  <Button size="sm" variant="outline" className="p-2 bg-white/90 shadow-sm border-0 hover:bg-purple-50 text-purple-600" onClick={() => handleRequestPromotion(product)} title="طلب ترويج">
                    <Megaphone className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="p-2 bg-white/90 shadow-sm border-0 hover:bg-blue-50 text-blue-600">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="p-2 bg-white/90 shadow-sm border-0 hover:bg-orange-50 text-orange-600" onClick={() => handleEditProduct(product)}>
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4">
                {/* Category */}
                <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg mb-2">
                  {product.category}
                </span>

                {/* Product Name */}
                <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem] leading-tight group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold text-gray-700">{product.rating}</span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">({product.reviews} تقييم)</span>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-3 bg-gray-50 p-2 rounded-lg">
                  <span>{product.sales} مبيعة</span>
                  <span>{product.views} مشاهدة</span>
                </div>

                {/* Price and Status */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div>
                    {product.originalPrice && (
                      <p className="text-xs text-gray-400 line-through font-medium">
                        {formatCurrency(product.originalPrice)}
                      </p>
                    )}
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(getProductStatus(product))}`}>
                    {getStatusLabel(getProductStatus(product))}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-right p-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="text-right p-4 font-semibold text-gray-700">المنتج</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الفئة</th>
                  <th className="text-right p-4 font-semibold text-gray-700">السعر</th>
                  <th className="text-right p-4 font-semibold text-gray-700">المخزون</th>
                  <th className="text-right p-4 font-semibold text-gray-700">المبيعات</th>
                  <th className="text-right p-4 font-semibold text-gray-700">التقييم</th>
                  <th className="text-right p-4 font-semibold text-gray-700">الحالة</th>
                  <th className="text-center p-4 font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden p-1">
                          <img src={product.image || 'https://via.placeholder.com/150'} alt={product.name} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{product.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {product.isNew && <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded">جديد</span>}
                            {product.featured && <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-1.5 py-0.5 rounded">مميز</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-100">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-gray-900">{formatCurrency(product.price)}</p>
                        {product.originalPrice && (
                          <p className="text-xs text-gray-400 line-through">
                            {formatCurrency(product.originalPrice)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`font-bold ${product.stock === 0 ? 'text-red-600' : product.stock < 10 ? 'text-orange-600' : 'text-green-600'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-gray-600">{product.sales}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold">{product.rating}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(getProductStatus(product))}`}>
                        {getStatusLabel(getProductStatus(product))}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button size="sm" variant="outline" className={`p-2 hover:bg-yellow-50 transition-colors ${product.featured ? 'text-yellow-500' : 'text-gray-400'}`} onClick={() => toggleFeatured(product.id, product.featured || false)} title={product.featured ? "إلغاء التمييز" : "تمييز"}>
                          <Star className={`w-4 h-4 ${product.featured ? 'fill-current' : ''}`} />
                        </Button>
                        <Button size="sm" variant="outline" className="p-2 hover:bg-purple-50 text-purple-600 transition-colors" onClick={() => handleRequestPromotion(product)} title="طلب ترويج">
                          <Megaphone className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="p-2 hover:bg-gray-100 transition-colors">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button size="sm" variant="outline" className="p-2 hover:bg-blue-50 text-blue-600 transition-colors" onClick={() => handleEditProduct(product)}>
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="p-2 hover:bg-red-50 text-red-600 transition-colors"
                          onClick={() => deleteProduct(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-500 mb-6">لم يتم العثور على منتجات تطابق البحث</p>
            <Button variant="primary" onClick={handleAddProduct}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة منتج جديد
            </Button>
          </div>
        </Card>
      )}

      {/* Add/Edit Product Modal */}
      <SupplierProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        initialData={editingProduct}
        title={editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
      />

      <PromotionRequestModal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
        product={promoProduct}
      />
    </div>
  );
};