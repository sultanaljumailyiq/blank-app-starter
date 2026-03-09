import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Star, Search, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../common/Button';

interface FeaturedProduct {
    id: string;
    name: string;
    image: string;
    price: number;
    supplier: {
        name: string;
    };
    featured_order: number;
}

export const FeaturedManager: React.FC = () => {
    const [featured, setFeatured] = useState<FeaturedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);

    const fetchFeatured = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select(`
          id, name, images, price, featured_order,
          supplier:suppliers(name)
        `)
                .eq('is_featured', true)
                .order('featured_order', { ascending: true });

            if (error) throw error;

            const mapped = (data || []).map((p: any) => ({
                ...p,
                image: p.images?.[0] || 'https://via.placeholder.com/100'
            }));

            setFeatured(mapped);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeatured();
    }, []);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 3) {
            setSearchResults([]);
            return;
        }

        const { data } = await supabase
            .from('products')
            .select('id, name, images, price, supplier:suppliers(name)')
            .ilike('name', `%${query}%`)
            .eq('is_featured', false) // Only show non-featured
            .limit(5);

        setSearchResults(data || []);
    };

    const addToFeatured = async (product: any) => {
        try {
            await supabase
                .from('products')
                .update({
                    is_featured: true,
                    featured_order: featured.length + 1
                })
                .eq('id', product.id);

            setSearchQuery('');
            setSearchResults([]);
            setIsAdding(false);
            fetchFeatured();
        } catch (err) {
            console.error(err);
        }
    };

    const removeFromFeatured = async (id: string) => {
        try {
            await supabase
                .from('products')
                .update({ is_featured: false, featured_order: null })
                .eq('id', id);

            fetchFeatured();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    المنتجات المميزة
                </h3>
                <Button onClick={() => setIsAdding(!isAdding)} variant="outline" size="sm">
                    {isAdding ? 'إلغاء' : 'إضافة منتج'}
                </Button>
            </div>

            {isAdding && (
                <div className="p-4 bg-gray-50/50 border-b border-gray-100 animate-in fade-in slide-in-from-top-2">
                    <div className="relative mb-3">
                        <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ابحث عن منتج لإضافته للمميزة..."
                            className="w-full pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 focus:outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                    {searchResults.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-lg divide-y divide-gray-100 max-h-60 overflow-y-auto custom-scrollbar">
                            {searchResults.map(p => (
                                <div key={p.id} className="p-3 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-100">
                                            <img src={p.images?.[0]} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900">{p.name}</p>
                                            <p className="text-xs text-gray-500">{p.supplier?.name}</p>
                                        </div>
                                    </div>
                                    <Button size="sm" onClick={() => addToFeatured(p)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                                        <Plus className="w-4 h-4 ml-1" />
                                        إضافة
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="divide-y divide-gray-50">
                {featured.map((item, index) => (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50/80 transition-colors group">
                        <div className="flex items-center gap-4">
                            <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold ${index < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                {index + 1}
                            </span>
                            <div className="w-14 h-14 rounded-xl border border-gray-100 overflow-hidden bg-white shadow-sm relative group-hover:shadow-md transition-all">
                                <img src={item.image} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.name}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                    {item.supplier?.name}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg text-sm">{item.price.toLocaleString()} د.ع</span>
                            <button
                                onClick={() => removeFromFeatured(item.id)}
                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                title="إزالة من المميزة"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
                {featured.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Star className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium">قائمة المنتجات المميزة فارغة</p>
                        <p className="text-gray-400 text-sm mt-1">اضغط على "إضافة منتج" لاختيار منتجات للعرض في الصفحة الرئيسية</p>
                    </div>
                )}
            </div>
        </div>
    );
};
