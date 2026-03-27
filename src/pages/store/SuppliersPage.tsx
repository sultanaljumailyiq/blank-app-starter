import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Package, ArrowRight, Star, MapPin, Phone, CheckCircle2, Factory, Filter, ArrowDownAZ, ArrowUpAZ, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
// import { mockSuppliers } from '../../data/mock/store';
import { Button } from '../../components/common/Button';
import { BottomNavigation } from '../../components/layout/BottomNavigation';
import { formatLocation } from '../../utils/location';

export default function SuppliersPage() {
    const navigate = useNavigate();

    // Filter States
    const [selectedCity, setSelectedCity] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'rating' | 'alpha-asc' | 'alpha-desc'>('rating');
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');

    const cities = [
        'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء',
        'كركوك', 'ديالى', 'الأنبار', 'بابل', 'واسط',
        'صلاح الدين', 'المثنى', 'القادسية', 'ذي قار',
        'ميسان', 'السليمانية', 'دهوك'
    ];

    const specialties = [
        { id: 'ortho', label: 'تقويم الأسنان (Orthodontics)' },
        { id: 'implant', label: 'زراعة الأسنان (Implants)' },
        { id: 'equipment', label: 'أجهزة ومعدات (Equipment)' },
        { id: 'lab', label: 'مختبرات (Lab)' },
        { id: 'consumables', label: 'مستهلكات (Consumables)' }
    ];

    // State for Real Data
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuppliersData = async () => {
            try {
                const { data, error } = await supabase
                    .from('suppliers')
                    .select('*'); // Fetch all suppliers (status column doesn't exist)

                if (error) throw error;
                setSuppliers(data || []);
            } catch (err) {
                console.error('Error loading suppliers:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSuppliersData();
    }, []);

    // Filter Logic
    const filteredSuppliers = useMemo(() => {
        let result = [...suppliers];

        // 1. City Filter
        if (selectedCity !== 'all') {
            result = result.filter(s => s.governorate === selectedCity);
        }

        // 2. Sorting
        result.sort((a, b) => {
            const ratingA = a.rating || 0;
            const ratingB = b.rating || 0;
            const nameA = a.name || '';
            const nameB = b.name || '';

            if (sortBy === 'rating') return ratingB - ratingA;
            if (sortBy === 'alpha-asc') return nameA.localeCompare(nameB, 'ar');
            if (sortBy === 'alpha-desc') return nameB.localeCompare(nameA, 'ar');
            return 0;
        });

        return result;
    }, [suppliers, selectedCity, sortBy, selectedSpecialty]);

    return (
        <div className="min-h-screen bg-slate-50 pb-20" dir="rtl">


            <div className="max-w-7xl mx-auto px-4 py-6 text-right">

                {/* Filters Section (Bento Style) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

                    {/* City Select */}
                    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm relative group">
                        <label className="text-xs font-bold text-slate-400 mb-2 block flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            المحافظة
                        </label>
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none p-3"
                        >
                            <option value="all">كل العراق</option>
                            {cities.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                        <ChevronDown className="absolute left-6 bottom-7 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Sort Select */}
                    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm relative">
                        <label className="text-xs font-bold text-slate-400 mb-2 block flex items-center gap-2">
                            <Filter className="w-3 h-3" />
                            الترتيب
                        </label>
                        <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1">
                            <button onClick={() => setSortBy('rating')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${sortBy === 'rating' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>التقييم</button>
                            <button onClick={() => setSortBy('alpha-asc')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex justify-center items-center gap-1 ${sortBy === 'alpha-asc' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>
                                <ArrowDownAZ className="w-3 h-3" /> أ-ي
                            </button>
                            <button onClick={() => setSortBy('alpha-desc')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex justify-center items-center gap-1 ${sortBy === 'alpha-desc' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>
                                <ArrowUpAZ className="w-3 h-3" /> ي-أ
                            </button>
                        </div>
                    </div>

                    {/* Specialty Select */}
                    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm relative">
                        <label className="text-xs font-bold text-slate-400 mb-2 block flex items-center gap-2">
                            <Factory className="w-3 h-3" />
                            التصنيف / التخصص
                        </label>
                        <select
                            value={selectedSpecialty}
                            onChange={(e) => setSelectedSpecialty(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none p-3"
                        >
                            <option value="all">جميع التخصصات</option>
                            {specialties.map(spec => <option key={spec.id} value={spec.id}>{spec.label}</option>)}
                        </select>
                        <ChevronDown className="absolute left-6 bottom-7 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[280px]">

                    {/* Featured / Info Card */}
                    <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 to-blue-900 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-center text-white">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold mb-4">نخبة الموردين</h2>
                            <p className="text-blue-100 text-lg mb-8 max-w-md leading-relaxed">
                                تصفح قائمة الموردين المعتمدين لدينا. نضمن لك جودة المنتجات وسرعة التوصيل مع شركائنا المميزين.
                            </p>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    <span className="text-sm font-medium">موثوق 100%</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                                    <Package className="w-5 h-5 text-amber-400" />
                                    <span className="text-sm font-medium">+5000 منتج</span>
                                </div>
                            </div>
                        </div>
                        {/* Decor */}
                        <Factory className="absolute -bottom-10 -left-10 w-64 h-64 text-white opacity-5 rotate-12" />
                    </div>

                    {/* Suppliers Cards */}
                    {filteredSuppliers.map((supplier, idx) => {
                        return (
                            <div
                                key={supplier.id}
                                onClick={() => navigate(`/store/supplier/${supplier.id}`)}
                                className="group relative bg-white rounded-3xl p-5 border border-slate-100 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
                                        {supplier.logo_url ? (
                                            <img src={supplier.logo_url} alt={supplier.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Store className="w-8 h-8 text-indigo-600" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                        <span className="text-xs font-bold text-amber-700">{supplier.rating}</span>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">{supplier.name}</h3>
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                                        {supplier.description || 'مورد معتمد يوفر أفضل المنتجات الطبية الأصلية بأسعار تنافسية.'}
                                    </p>

                                    <div className="space-y-2 mt-auto">
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span className="line-clamp-1">{formatLocation(supplier.governorate, supplier.address) || 'العراق'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Action */}
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-end">
                                    <span className="bg-indigo-600 text-white p-2 rounded-full shadow-lg">
                                        <ArrowRight className="w-5 h-5 rotate-180" />
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <BottomNavigation />
        </div>
    );
}
