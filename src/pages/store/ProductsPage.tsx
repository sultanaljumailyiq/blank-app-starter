import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams, Link } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import { ProductCard } from '../../components/store/ProductCard';
import { detailedCategories } from '../../data/store-categories';
import { CATEGORIES } from '../../data/categories';
import { SlidersHorizontal, ChevronLeft, Filter, Tag, CheckCircle } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';

export const ProductsPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const params = useParams();
    const { products, addToCart } = useStore();
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const { wishlistItems, toggleWishlist } = useWishlist();

    // Resolve category/subcategory from URL params or Query params (Route params take precedence)
    const categoryName = params.category || searchParams.get('category');
    const subCategoryName = params.subCategory || searchParams.get('subCategory');
    const childCategoryName = searchParams.get('childCategory');
    const query = searchParams.get('q');

    // Find current category data for sub-categories display
    const currentCategoryData = CATEGORIES.find(c => c.name === categoryName);
    const subCategories = currentCategoryData?.subCategories || [];

    useEffect(() => {
        let filtered = [...products];

        if (categoryName) {
            filtered = filtered.filter(p => p.category === categoryName);
        }

        if (subCategoryName) {
            filtered = filtered.filter(p => p.subCategory === subCategoryName);
        }

        if (childCategoryName) {
            filtered = filtered.filter(p => p.childCategory === childCategoryName);
        }

        if (query) {
            const lowerQuery = query.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(lowerQuery) ||
                p.description.toLowerCase().includes(lowerQuery)
            );
        }

        setFilteredProducts(filtered);
    }, [products, categoryName, subCategoryName, childCategoryName, query]);

    const handleAddToCart = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const product = products.find(p => p.id === id); // Use global products list
        if (product) addToCart(product);
    };

    const handleToggleWishlist = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        toggleWishlist(id);
    };

    // Breadcrumb text
    const breadcrumb = [
        categoryName,
        subCategoryName,
        childCategoryName
    ].filter(Boolean);

    return (
        <div className="min-h-screen bg-slate-50 pb-20" dir="rtl">
            <div className="max-w-7xl mx-auto px-4 py-8">

                {/* Header & Navigation */}
                <div className="flex flex-col gap-6 mb-8">


                    {/* Top Categories Navigation (Bento Row) */}
                    <div>

                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
                            {detailedCategories.map((cat) => {
                                const Icon = cat.icon;
                                const isActive = cat.name === categoryName;
                                return (
                                    <div
                                        key={cat.id}
                                        onClick={() => navigate(`/store/categories/${encodeURIComponent(cat.name)}`)}
                                        className={`
                                        flex-shrink-0 w-40 h-40 rounded-3xl p-4 relative overflow-hidden cursor-pointer group transition-all duration-300
                                        ${isActive ? 'ring-4 ring-blue-500/20 scale-105 shadow-xl' : 'hover:scale-105 hover:shadow-xl'}
                                        ${cat.bg}
                                    `}
                                    >
                                        <div className={`w-10 h-10 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center mb-3 ${cat.color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <h3 className={`font-bold text-sm leading-snug mb-1 ${isActive ? 'text-blue-900' : 'text-gray-800'}`}>{cat.name}</h3>
                                        <p className="text-[10px] text-gray-500 line-clamp-2">{cat.description}</p>

                                        <Icon className={`absolute -bottom-2 -left-2 w-20 h-20 opacity-5 rotate-12 group-hover:scale-110 transition-transform ${cat.color}`} />

                                        {isActive && (
                                            <div className="absolute inset-0 border-2 border-blue-500 rounded-3xl pointer-events-none"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sub-Category & Child-Category Filters (Horizontal Scroll) */}
                {(categoryName && subCategories.length > 0) && (
                    <div className="mb-8 space-y-4">

                        {/* 1. Sub Categories Row */}
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            <button
                                onClick={() => navigate(`/store/categories/${encodeURIComponent(categoryName)}`)}
                                className={`
                                    flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all border
                                    ${!subCategoryName
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                                    }
                                `}
                            >
                                الكل
                            </button>

                            {subCategories.map(sub => (
                                <button
                                    key={sub.id}
                                    onClick={() => navigate(`/store/categories/${encodeURIComponent(categoryName)}/${encodeURIComponent(sub.name)}`)}
                                    className={`
                                        flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all border flex items-center gap-2
                                        ${subCategoryName === sub.name
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                                        }
                                    `}
                                >
                                    {sub.name}
                                    {subCategoryName === sub.name && <CheckCircle className="w-4 h-4 text-blue-200" />}
                                </button>
                            ))}
                        </div>

                        {/* 2. Child Categories Row (Conditional) */}
                        {subCategoryName && (
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide bg-slate-50/50 p-2 rounded-xl border border-slate-100/50">
                                <span className="text-xs font-bold text-slate-400 ml-2 flex-shrink-0">
                                    تصفية دقيقة:
                                </span>
                                {subCategories.find(s => s.name === subCategoryName)?.childCategories.length ? (
                                    subCategories.find(s => s.name === subCategoryName)?.childCategories.map(child => (
                                        <button
                                            key={child}
                                            onClick={() => navigate(`/store/categories/${encodeURIComponent(categoryName)}/${encodeURIComponent(subCategoryName)}?childCategory=${encodeURIComponent(child)}`)}
                                            className={`
                                                flex-shrink-0 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all border
                                                ${childCategoryName === child
                                                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-blue-200 hover:text-blue-600'
                                                }
                                            `}
                                        >
                                            {child}
                                        </button>
                                    ))
                                ) : (
                                    <span className="text-xs text-slate-400 italic">لا توجد تصنيفات فرعية إضافية</span>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Products Grid Section */}
                <div className="w-full">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            {breadcrumb.length > 0 ? (
                                <>
                                    <span className="text-slate-400 font-normal">تصفح:</span>
                                    {breadcrumb[breadcrumb.length - 1]}
                                </>
                            ) : query ? `نتائج البحث: "${query}"` : categoryName ? categoryName : 'جميع المنتجات'}
                        </h1>
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">
                            {filteredProducts.length} منتج
                        </span>
                    </div>

                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="h-full">
                                    <ProductCard
                                        product={product}
                                        onAddToCart={handleAddToCart}
                                        onToggleWishlist={handleToggleWishlist}
                                        isWishlisted={wishlistItems.has(product.id)}
                                        className="h-[340px] border-slate-100 hover:border-blue-200"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm text-center px-4">
                            <div className="bg-slate-50 p-6 rounded-full shadow-inner mb-4">
                                <SlidersHorizontal className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد منتجات</h3>
                            <p className="text-slate-500 max-w-md">للاسف، لا تتوفر منتجات في هذا القسم حالياً. يرجى التحقق من قسم آخر.</p>
                            <button
                                onClick={() => navigate('/store/all-categories')}
                                className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                            >
                                تصفح جميع الأقسام
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
