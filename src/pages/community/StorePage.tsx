import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, Search, Filter, Star, TrendingUp, Calendar,
  MapPin, Users, Clock, X, Plus, Minus, ChevronDown, Package,
  Award, BookOpen, Sparkles
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { mockProducts, mockCourses } from '../../data/mock';
import { Product, Course } from '../../types';

interface CartItem {
  id: string;
  type: 'product' | 'course';
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export const StorePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'courses'>('products');

  const productCategories = ['all', 'أجهزة', 'مستهلكات', 'مواد', 'أدوات', 'أدوية'];
  const priceRanges = [
    { value: 'all', label: 'كل الأسعار' },
    { value: '0-500000', label: 'أقل من 500,000 د.ع' },
    { value: '500000-2000000', label: '500,000 - 2,000,000 د.ع' },
    { value: '2000000-10000000', label: '2,000,000 - 10,000,000 د.ع' },
    { value: '10000000-plus', label: 'أكثر من 10,000,000 د.ع' },
  ];

  // Featured Courses للقسم الترويجي
  const featuredCourses = mockCourses.filter(c => c.featured).slice(0, 3);

  // تصفية وترتيب المنتجات
  const filteredProducts = useMemo(() => {
    let filtered = mockProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      let matchesPrice = true;
      if (selectedPriceRange !== 'all') {
        const [min, max] = selectedPriceRange.split('-').map(v => v === 'plus' ? Infinity : parseInt(v));
        matchesPrice = product.price >= min && (max === Infinity || product.price <= max);
      }
      
      const matchesRating = !selectedRating || (product.rating || 0) >= selectedRating;
      
      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    });

    // الترتيب
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedPriceRange, selectedRating, sortBy]);

  // تصفية الدورات
  const filteredCourses = useMemo(() => {
    return mockCourses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery]);

  // إضافة للسلة
  const addToCart = (item: Product | Course, type: 'product' | 'course') => {
    const existingItem = cart.find(i => i.id === item.id && i.type === type);
    
    if (existingItem) {
      setCart(cart.map(i => 
        i.id === item.id && i.type === type 
          ? { ...i, quantity: i.quantity + 1 } 
          : i
      ));
    } else {
      const newItem: CartItem = {
        id: item.id,
        type,
        name: type === 'product' ? (item as Product).name : (item as Course).title,
        price: item.price,
        quantity: 1,
        image: item.image,
      };
      setCart([...cart, newItem]);
    }
  };

  // تحديث الكمية
  const updateQuantity = (id: string, type: 'product' | 'course', delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id && item.type === type) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  // حذف من السلة
  const removeFromCart = (id: string, type: 'product' | 'course') => {
    setCart(cart.filter(item => !(item.id === id && item.type === type)));
  };

  // حساب الإجمالي
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - الدورات المميزة */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">المتجر الطبي المتقدم</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">منصة التسوق الشاملة للمحترفين</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              أفضل المنتجات الطبية والدورات التدريبية من موردين موثوقين
            </p>
          </div>

          {/* الدورات المميزة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <Card key={course.id} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all">
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-yellow-300" />
                        <span className="text-xs font-medium text-yellow-300">{course.category}</span>
                      </div>
                      <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                      <p className="text-sm text-white/80 mb-3">بواسطة {course.instructor}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-white/90">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{course.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{course.location}</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <div>
                      <p className="text-2xl font-bold">{course.price.toLocaleString()}</p>
                      <p className="text-xs text-white/70">د.ع</p>
                    </div>
                    <Button 
                      variant="secondary"
                      size="sm"
                      onClick={() => addToCart(course, 'course')}
                      className="bg-white text-blue-600 hover:bg-gray-100"
                    >
                      سجل الآن
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs - المنتجات / الدورات */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-3 rounded-md font-medium transition-all flex items-center gap-2 ${
                activeTab === 'products'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Package className="w-5 h-5" />
              المنتجات الطبية ({mockProducts.length})
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-6 py-3 rounded-md font-medium transition-all flex items-center gap-2 ${
                activeTab === 'courses'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              الدورات التدريبية ({mockCourses.length})
            </button>
          </div>

          {/* Cart Button */}
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-md flex items-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">السلة</span>
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>

        {/* البحث والفلاتر */}
        {activeTab === 'products' && (
          <div className="mb-8 space-y-4">
            {/* البحث */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن منتجات، أدوات، أجهزة..."
                  className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-5 h-5" />
                <span>الفلاتر</span>
              </button>
            </div>

            {/* الفلاتر */}
            <div className={`${showFilters ? 'block' : 'hidden md:block'}`}>
              <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* الفئة */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">الفئة</label>
                    <div className="space-y-2">
                      {productCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`w-full text-right px-4 py-2 rounded-lg transition-all text-sm ${
                            selectedCategory === category
                              ? 'bg-blue-600 text-white font-medium'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {category === 'all' ? 'كل الفئات' : category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* نطاق السعر */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">نطاق السعر</label>
                    <div className="space-y-2">
                      {priceRanges.map((range) => (
                        <button
                          key={range.value}
                          onClick={() => setSelectedPriceRange(range.value)}
                          className={`w-full text-right px-4 py-2 rounded-lg transition-all text-sm ${
                            selectedPriceRange === range.value
                              ? 'bg-blue-600 text-white font-medium'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* التقييم */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">التقييم</label>
                    <div className="space-y-2">
                      {[0, 4, 4.5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setSelectedRating(rating)}
                          className={`w-full text-right px-4 py-2 rounded-lg transition-all text-sm flex items-center gap-2 ${
                            selectedRating === rating
                              ? 'bg-blue-600 text-white font-medium'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {rating === 0 ? (
                            'كل التقييمات'
                          ) : (
                            <>
                              <Star className="w-4 h-4 fill-current" />
                              <span>{rating} فأكثر</span>
                            </>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* الترتيب */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">ترتيب حسب</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                    >
                      <option value="popular">الأكثر شعبية</option>
                      <option value="price-low">السعر: الأقل أولاً</option>
                      <option value="price-high">السعر: الأعلى أولاً</option>
                      <option value="rating">التقييم الأعلى</option>
                      <option value="name">الاسم (أ-ي)</option>
                    </select>
                  </div>
                </div>

                {/* إعادة تعيين */}
                {(selectedCategory !== 'all' || selectedPriceRange !== 'all' || selectedRating !== 0) && (
                  <div className="mt-4 pt-4 border-t">
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSelectedPriceRange('all');
                        setSelectedRating(0);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      إعادة تعيين الفلاتر
                    </button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {activeTab === 'products' && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                عرض <span className="font-bold">{filteredProducts.length}</span> من أصل <span className="font-bold">{mockProducts.length}</span> منتج
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} hover className="overflow-hidden group">
                  {/* Product Image */}
                  <div className="h-56 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
                    <Package className="w-20 h-20 text-blue-300 group-hover:scale-110 transition-transform" />
                    {product.rating && product.rating >= 4.5 && (
                      <div className="absolute top-3 right-3 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        الأفضل
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-5 space-y-3">
                    {/* Category Badge */}
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {product.category}
                    </span>

                    {/* Product Name */}
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2 min-h-[3.5rem]">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    {product.rating && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating!)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                      </div>
                    )}

                    {/* Supplier */}
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {product.supplierName}
                    </p>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
                      {product.description}
                    </p>

                    {/* Stock Status */}
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        product.stock > 50 ? 'bg-green-500' : 
                        product.stock > 10 ? 'bg-yellow-500' : 
                        product.stock > 0 ? 'bg-orange-500' : 'bg-red-500'
                      }`}></span>
                      <span className="text-sm font-medium">
                        {product.stock > 50 ? 'متوفر بكثرة' : 
                         product.stock > 10 ? 'متوفر' :
                         product.stock > 0 ? `متبقي ${product.stock} فقط` : 'غير متوفر'}
                      </span>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">
                          {product.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">دينار عراقي</p>
                      </div>
                      <Button 
                        variant="primary" 
                        size="sm"
                        disabled={product.stock === 0}
                        onClick={() => addToCart(product, 'product')}
                        className="flex items-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {product.stock > 0 ? 'أضف' : 'غير متوفر'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد منتجات</h3>
                <p className="text-gray-500 mb-4">جرب تغيير الفلاتر أو البحث بكلمات مختلفة</p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedPriceRange('all');
                    setSelectedRating(0);
                  }}
                >
                  إعادة تعيين الفلاتر
                </Button>
              </div>
            )}
          </>
        )}

        {/* Courses Grid */}
        {activeTab === 'courses' && (
          <>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن دورات، ندوات، ورش عمل..."
                  className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} hover className="overflow-hidden">
                  {/* Course Header */}
                  <div className="h-40 bg-gradient-to-br from-purple-600 to-blue-600 flex flex-col items-center justify-center text-white p-6 relative">
                    <BookOpen className="w-16 h-16 mb-2 opacity-90" />
                    <span className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                      {course.category}
                    </span>
                    <span className="absolute top-3 left-3 bg-yellow-400 text-gray-900 px-2 py-1 rounded-full text-xs font-bold">
                      {course.level}
                    </span>
                  </div>

                  {/* Course Info */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 mb-2">{course.title}</h3>
                      <p className="text-sm text-gray-600">المدرب: {course.instructor}</p>
                    </div>

                    <p className="text-sm text-gray-700 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(course.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{course.rating}</span>
                      <span className="text-sm text-gray-500">({course.students} متدرب)</span>
                    </div>

                    {/* Course Details */}
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>{course.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>{course.location}</span>
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-2xl font-bold text-purple-600">
                          {course.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">دينار عراقي</p>
                      </div>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => addToCart(course, 'course')}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        سجل الآن
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد دورات</h3>
                <p className="text-gray-500">جرب البحث بكلمات مختلفة</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={() => setShowCart(false)}>
          <div 
            className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cart Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-900">سلة التسوق</h2>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96">
                <ShoppingCart className="w-20 h-20 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">السلة فارغة</p>
                <p className="text-gray-400 text-sm mt-2">ابدأ بإضافة منتجات أو دورات</p>
              </div>
            ) : (
              <>
                <div className="p-6 space-y-4">
                  {cart.map((item) => (
                    <Card key={`${item.type}-${item.id}`} className="p-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.type === 'product' ? (
                            <Package className="w-10 h-10 text-blue-600" />
                          ) : (
                            <BookOpen className="w-10 h-10 text-purple-600" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 mb-1 line-clamp-2">{item.name}</h4>
                          <p className="text-sm text-gray-500 mb-2">
                            {item.type === 'product' ? 'منتج طبي' : 'دورة تدريبية'}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.type, -1)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.type, 1)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id, item.type)}
                              className="text-red-500 hover:text-red-700 text-sm font-medium"
                            >
                              حذف
                            </button>
                          </div>

                          <div className="mt-2 pt-2 border-t">
                            <p className="font-bold text-blue-600">
                              {(item.price * item.quantity).toLocaleString()} د.ع
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Cart Footer */}
                <div className="sticky bottom-0 bg-white border-t px-6 py-6 space-y-4">
                  <div className="flex items-center justify-between text-lg">
                    <span className="font-medium text-gray-700">المجموع الكلي:</span>
                    <span className="font-bold text-2xl text-blue-600">
                      {cartTotal.toLocaleString()} د.ع
                    </span>
                  </div>

                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="w-full"
                    onClick={() => {
                      alert('سيتم إضافة نظام الدفع قريباً!');
                    }}
                  >
                    <ShoppingCart className="w-5 h-5 ml-2" />
                    إتمام الطلب ({cartItemsCount} عنصر)
                  </Button>

                  <button
                    onClick={() => setCart([])}
                    className="w-full text-center text-red-600 hover:text-red-700 font-medium text-sm py-2"
                  >
                    إفراغ السلة
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
