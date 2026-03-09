import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Microscope,
    Calendar,
    Users,
    TrendingUp,
    MessageCircle,
    FileText,
    BarChart,
    ArrowRight,
    Shield,
    Clock,
    CheckCircle,
    MoveRight,
    FlaskConical,
    PackageCheck,
    Bike,
    Briefcase,
    ShoppingBag
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { usePlatform } from '../../contexts/PlatformContext';

export const LabWelcomePage: React.FC = () => {
    const { settings } = usePlatform();
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

    // Hero Carousel Data
    const heroSlides = [
        {
            title: "نظام إدارة المعامل الرقمي",
            subtitle: "استقبل الطلبات من العيادات، تتبع الإنتاج، وأدر حساباتك في منصة واحدة",
            gradient: "from-teal-900 to-cyan-900",
            image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=2070"
        },
        {
            title: "ارفع كفاءة معملك",
            subtitle: "تواصل مباشر مع أطباء الأسنان وتسليم أسرع للحالات",
            gradient: "from-emerald-900 to-teal-900",
            image: "https://images.unsplash.com/photo-1581093458891-2f30b630e5d7?auto=format&fit=crop&q=80&w=2070"
        }
    ];

    // Auto-slide
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentHeroIndex((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 pb-24" dir="rtl">
            <div className="container mx-auto px-4 py-8 max-w-7xl">

                {/* Bento Grid Container */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-auto">

                    {/* 1. Hero Section (Span 4) */}
                    <div className="col-span-1 md:col-span-4 row-span-2 relative h-[400px] md:h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl group">
                        {heroSlides.map((slide, idx) => (
                            <div
                                key={idx}
                                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentHeroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                            >
                                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-[2s]" />
                                <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-80 mix-blend-multiply`}></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                                <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-20 text-white z-20">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full w-fit mb-6 border border-white/10">
                                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                                        <span className="text-sm font-medium text-cyan-100">الحل الأمثل لمعامل الأسنان</span>
                                    </div>
                                    <h1 className="text-4xl md:text-7xl font-black mb-6 leading-tight max-w-4xl tracking-tight">
                                        {slide.title}
                                    </h1>
                                    <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl font-light leading-relaxed">
                                        {slide.subtitle}
                                    </p>
                                    <div className="flex gap-4">
                                        <Link to="/register?type=laboratory">
                                            <Button className="bg-white text-teal-900 hover:bg-gray-100 px-8 py-4 rounded-2xl text-lg font-bold shadow-lg shadow-teal-900/20 transition-all hover:-translate-y-1">
                                                سجل كمعمل الآن
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Slide Indicators */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                            {heroSlides.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentHeroIndex(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${currentHeroIndex === idx ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 2. Key Features Grid */}

                    {/* Feature 1: Case Tracking (Large Vertical) */}
                    <div className="col-span-1 md:col-span-1 md:row-span-2 bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 group border border-gray-100 hover:border-teal-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-[4rem] z-0 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:rotate-6 transition-transform">
                                <Microscope className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">إدارة الطلبات</h3>
                            <p className="text-gray-500 leading-relaxed mb-6 flex-grow">
                                نظام متكامل ودقيق لتتبع وإدارة الطلبات يربط المعمل بالعيادة بشكل مباشر، مع إحصائيات شاملة تغطي كافة الطلبات (المكتملة، الجديدة، المتأخرة، والغير مسددة).
                            </p>
                            <div className="space-y-3">
                                {['استلام الطلبات الجديدة من العيادات بشكل متزامن', 'تغيير حالة كل طلب وتحديثها فورياً لدى العيادة', 'إرسال إشعارات تلقائية عند كل تحديث في حالة الطلب', 'إحصائيات ذكية لمراقبة الإنتاج والتحصيل المالي'].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-xl border border-gray-100">
                                        <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-blue-500' :
                                            i === 1 ? 'bg-orange-500' :
                                                i === 2 ? 'bg-purple-500' : 'bg-green-500'
                                            }`} />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Feature 2: Orders (Wide Horizontal) */}
                    <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-cyan-600 to-teal-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl group">
                        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 h-full">
                            <div className="flex-1">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">طلبات إلكترونية</h3>
                                <p className="text-cyan-100 leading-relaxed">
                                    استقبل طلبات العيادات بتفاصيل كاملة (الألوان، المواد، الملاحظات...) بشكل متزامن و سلس من العيادات .
                                </p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 w-full md:w-auto min-w-[200px]">
                                <div className="flex items-center gap-3 mb-3 border-b border-white/10 pb-3">
                                    <PackageCheck className="w-5 h-5 text-cyan-200" />
                                    <span className="font-bold">طلبات جديدة</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 bg-white/20 rounded-full w-3/4"></div>
                                    <div className="h-2 bg-white/10 rounded-full w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 3: Financials (Square) */}
                    <div className="col-span-1 bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:border-emerald-200 transition-all group">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">إحصائيات مالية شاملة</h3>
                        <p className="text-gray-500 text-sm mb-4">إجمالي الإيرادات - الطلبات الغير مسدد-إدارة قائمة الخدمات والأسعار</p>
                        <div className="flex items-end gap-1 h-8 mt-2">
                            {[40, 70, 50, 90, 60].map((h, i) => (
                                <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-emerald-100 rounded-t-sm group-hover:bg-emerald-500 transition-colors"></div>
                            ))}
                        </div>
                    </div>

                    {/* Feature 4: Representative Status (Square) */}
                    <div className="col-span-1 bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:border-cyan-200 transition-all group">
                        <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center text-cyan-600 mb-4 group-hover:scale-110 transition-transform">
                            <Bike className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">أدارة المندوبين</h3>
                        <p className="text-gray-500 text-sm mb-4">نظام ذكي لإدارة وتتبع المندوبين وجهازية العمل؛ جدولة استلام وتسليم الطلبات من وإلى العيادات بدقة، مع إحصائيات شاملة لكل مندوب تتبع سجل نشاطه وإنتاجيته.</p>
                        <div className="flex items-center gap-2 mt-auto">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-xs text-cyan-600 font-bold">نشطين الآن</span>
                        </div>
                    </div>

                    {/* Feature 5: Clinic Network (Span 2) */}
                    <div className="col-span-1 md:col-span-2 bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-4 border border-gray-700">
                                    <Users className="w-6 h-6 text-teal-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">شبكة عيادات واسعة</h3>
                                <p className="text-gray-400 max-w-sm">وسع نطاق وصولك وتواصل مع مئات العيادات لزيادة مبيعاتك؛ أدر ملفك التعريفي الاحترافي للبروز أمام الأطباء، وتواصل معهم مباشرة مع ميزة المشاركة في المجتمع الموحد للأطباء والموردين.</p>
                            </div>
                            <div className="hidden md:block">
                                <Shield className="w-24 h-24 text-gray-800" />
                            </div>
                        </div>
                    </div>

                    {/* Feature 6: Communication (Small) */}
                    <div className="col-span-1 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl p-6 text-white text-center flex flex-col items-center justify-center shadow-lg hover:shadow-teal-200/50 transition-shadow">
                        <MessageCircle className="w-10 h-10 mb-3 text-white/90" />
                        <h3 className="font-bold text-lg mb-1">محادثات فورية</h3>
                        <p className="text-white/80 text-xs text-center leading-relaxed">تواصل مع الطبيب مباشرة حول الحالات والعمليات المختبرية لضمان أفضل النتائج.</p>
                    </div>

                    {/* Feature 7: Medical Community */}
                    <div className="col-span-1 bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-6 text-white text-center flex flex-col items-center justify-center shadow-lg hover:shadow-orange-200/50 transition-shadow">
                        <MessageCircle className="w-10 h-10 mb-3 text-white/90" />
                        <h3 className="font-bold text-lg mb-1">المجتمع الطبي والتعليم</h3>
                        <p className="text-white/80 text-sm leading-relaxed">تواصل مع زملائك، شارك الخبرات، وتصفح أبرز الندوات والدورات والمصادر العلمية والنماذج التعليمية ثلاثية الأبعاد.</p>
                    </div>

                    {/* Feature 8: Jobs & Vacancies */}
                    <div className="col-span-1 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white text-center flex flex-col items-center justify-center shadow-lg hover:shadow-emerald-200/50 transition-shadow">
                        <Briefcase className="w-10 h-10 mb-3 text-white/90" />
                        <h3 className="font-bold text-lg mb-1">الوظائف والتوظيف</h3>
                        <p className="text-white/80 text-sm leading-relaxed">نظام متكامل وآمن للتوظيف؛ أعلن عن شواغر في معملك أو ابحث عن فنيين محترفين، مع إدارة كاملة لطلبات التوظيف والسير الذاتية.</p>
                    </div>

                    {/* Feature 9: Medical Store */}
                    <div className="col-span-1 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white text-center flex flex-col items-center justify-center shadow-lg hover:shadow-blue-200/50 transition-shadow">
                        <ShoppingBag className="w-10 h-10 mb-3 text-white/90" />
                        <h3 className="font-bold text-lg mb-1">المتجر الطبي</h3>
                        <p className="text-white/80 text-sm leading-relaxed">تسوق من أرقى الموردين الموثوقين بخصومات حصرية، مع نظام تنبيهات ذكي لنقص المخزون وسهولة تامة في طلب المستلزمات الطبية.</p>
                    </div>

                    {/* CTA Banner (Full Width) */}
                    <div className="col-span-1 md:col-span-4 mt-8">
                        <div className="bg-teal-600 rounded-[2.5rem] p-12 text-center relative overflow-hidden shadow-2xl shadow-teal-200">
                            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

                            <div className="relative z-10 max-w-3xl mx-auto">
                                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">نظم عمل معملك اليوم</h2>
                                <p className="text-teal-100 text-xl mb-10">انضم إلى شبكة المعامل المعتمدة واستقبل طلبات من أفضل العيادات.</p>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link to="/register?type=laboratory" className="w-full sm:w-auto">
                                        <Button className="w-full sm:w-auto bg-white text-teal-600 hover:bg-teal-50 px-10 py-5 rounded-2xl text-xl font-bold shadow-xl transition-transform hover:scale-105">
                                            سجل حساب معمل جديد
                                            <ArrowRight className="w-5 h-5 mr-2" />
                                        </Button>
                                    </Link>
                                    <span className="text-teal-200 text-sm">أو</span>
                                    <Link to="/" className="text-white font-medium hover:underline flex items-center gap-2">
                                        تصفح النظام أولاً <MoveRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="mt-20 border-t border-gray-200 pt-8 text-center">
                    <p className="text-gray-500 font-medium">{settings.footer_text || '© 2025 SMART system. جميع الحقوق محفوظة.'}</p>
                </div>

            </div>
        </div>
    );
};
