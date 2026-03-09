import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Store,
  Briefcase,
  TrendingUp,
  MessageCircle,
  BarChart,
  ShoppingCart,
  ArrowRight,
  Globe,
  PieChart,
  MoveRight,
  DollarSign,
  Settings,
  UserCircle
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { usePlatform } from '../../contexts/PlatformContext';

export const SupplierWelcomePage: React.FC = () => {
  const { settings } = usePlatform();
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  const heroSlides = [
    {
      title: "مركز الموردين الطبيين #1",
      subtitle: "أكبر منصة لربط شركات التجهيز الطبي مع آلاف العيادات في العراق",
      gradient: "from-orange-900 to-red-900",
      image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=2069"
    },
    {
      title: "وسع نطاق مبيعاتك",
      subtitle: "افتح متجرك الإلكتروني اليوم وابدأ البيع لآلاف الأطباء مباشرة",
      gradient: "from-slate-900 to-orange-900",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2070"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-24" dir="rtl">
      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Bento Grid */}
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
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
                    <span className="text-sm font-medium text-orange-100">شريك النجاح الأول للقطاع الطبي</span>
                  </div>
                  <h1 className="text-4xl md:text-7xl font-black mb-6 leading-tight max-w-4xl tracking-tight">
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl font-light leading-relaxed">
                    {slide.subtitle}
                  </p>
                  <div className="flex gap-4">
                    <Link to="/register?type=supplier">
                      <Button className="bg-white text-orange-900 hover:bg-gray-100 px-8 py-4 rounded-2xl text-lg font-bold shadow-lg shadow-orange-900/20 transition-all hover:-translate-y-1">
                        انضم كمورد الآن
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 2. Store Management (Large Feature) */}
          <div className="col-span-1 md:col-span-1 md:row-span-2 bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group border border-gray-100 hover:border-orange-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-[4rem] z-0 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-4 group-hover:rotate-6 transition-transform">
                <Store className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">متجر إلكتروني متكامل</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-grow">
                مركز متكامل لإدارة متجرك الإلكتروني: اعرض منتجاتك، أدر مخزونك، وتابع طلباتك ومبيعاتك
              </p>
              <div className="space-y-2 mb-4">
                {[
                  'واجهة احترافية لعرض المنتجات للعيادات و معامل الاسنان',
                  'نظام إدارة المخزون وتنبيهات النقص التلقائية',
                  'استقبال الطلبات وإدارتها لحظياً وبشكل مؤتمت'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-orange-500' :
                      i === 1 ? 'bg-blue-500' :
                        i === 2 ? 'bg-purple-500' : 'bg-green-500'
                      }`} />
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-auto">
                <div className="flex -space-x-2 space-x-reverse overflow-hidden mb-4">
                  {[1, 2, 3, 4].map((i) => (
                    <img key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src={`https://i.pravatar.cc/150?u=${i}`} alt="" />
                  ))}
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500 ring-2 ring-white">+2k</div>
                </div>
                <p className="text-xs text-gray-400 font-medium">طبيب يثقون بمنصتنا</p>
              </div>
            </div>
          </div>

          {/* 3. Global Reach (Span 2) */}
          <div className="col-span-1 md:col-span-2 bg-gray-900 rounded-3xl p-6 text-white relative overflow-hidden group">
            {/* Map Background Illustration (Abstract) */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
              <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-orange-500 rounded-full animate-ping delay-75"></div>
              <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-green-500 rounded-full animate-ping delay-150"></div>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 h-full">
              <div className="max-w-2xl">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400">
                    <Globe className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold">وصول أوسع للعملاء</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 md:line-clamp-none">
                  ريادة رقمية تتخطى الحدود: ضاعف حجم مبيعاتك بالوصول المباشر إلى آلاف العيادات ومعامل الأسنان في كافة محافظات العراق. عزز هوية علامتك التجارية وانخرط في المجتمع الطبي، وكن أول من يعلم بأحدث الدورات والندوات العلمية لتضمن تواجدك في طليعة المجهزين الطبيين الموثوقين.
                </p>
              </div>
              <div className="mt-4 md:mt-0 bg-gray-800/50 p-4 rounded-2xl border border-gray-700 flex items-center justify-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="font-bold text-lg text-white">ضاعف مبيعاتك</div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Order Management (Large Feature) */}
          <div className="col-span-1 md:col-span-1 md:row-span-2 bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group border border-gray-100 hover:border-blue-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-50 rounded-br-[4rem] z-0 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:rotate-6 transition-transform">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">إدارة الطلبات</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-grow">
                نظام دقيق لتتبع وإدارة الطلبات يربط متجرك بالعيادات والمعامل مباشرة، مع أتمتة كاملة لإشعارات التحديث والحالات.
              </p>
              <div className="space-y-2 mb-4">
                {[
                  'ادارة حالة كل طلب بسهولة  (تحضير، شحن، تسليم)',
                  'تحديثات فورية وإشعارات تلقائية للعملاء',
                  'إدارة مرتجعات منظمة وتواصل مباشر مع المشتري'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-blue-500' :
                      i === 1 ? 'bg-cyan-500' :
                        i === 2 ? 'bg-indigo-500' : 'bg-teal-500'
                      }`} />
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-auto bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600">كفاءة العمل</span>
                  <span className="text-xs font-black text-blue-700">+98%</span>
                </div>
                <div className="w-full bg-blue-200/50 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-blue-500 h-full w-[98%]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Finance & Reports (Small Light Card) */}
          <div className="col-span-1 bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:border-orange-200 transition-all group">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">المالية و التقارير</h3>
            <p className="text-gray-500 text-sm mb-4">رؤية بانورامية لنمو مبيعاتك: تتبع لحظي للإيرادات مع إحصائيات دقيقة لأكثر المنتجات طلباً، وتحديد العيادات ومعامل الأسنان الأكثر نشاطاً.</p>
            <div className="flex items-end gap-1 h-8 mt-2">
              {[40, 70, 50, 90, 60].map((h, i) => (
                <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-orange-100 rounded-t-sm group-hover:bg-orange-500 transition-colors"></div>
              ))}
            </div>
          </div>

          {/* 6. Product Management (Small Light Card) */}
          <div className="col-span-1 bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:border-blue-200 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <Settings className="w-10 h-10 mb-4 text-indigo-600" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">إدارة المنتجات</h3>
              <p className="text-gray-500 text-sm mb-4">تحكم ذكي بمتجرك: تتبع دقيق للمخزون، مراقبة عدد المشاهدات والمبيعات لكل منتج، مع سهولة إطلاق العروض والتخفيضات.</p>
              <div className="mt-4">
                <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 mb-1.5">
                  <span>تغطية المخزون</span>
                  <span className="text-indigo-600">92%</span>
                </div>
                <div className="flex gap-1 h-1">
                  {[...Array(18)].map((_, i) => (
                    <div key={i} className={`flex-1 rounded-full ${i < 16 ? 'bg-indigo-500' : 'bg-gray-200'}`}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 7. Profile Management (Small Light Card) */}
          <div className="col-span-1 bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:border-violet-200 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-50/50 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <UserCircle className="w-10 h-10 mb-4 text-violet-600" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">الملف الشخصي</h3>
              <p className="text-gray-500 text-sm mb-4"> اعرض و أدر ملفك التجاري بشكل احترافي أمام الأطباء والمعامل لبناء الثقة وجذب الشركاء</p>
              <div className="flex -space-x-1 space-x-reverse">
                <div className="w-6 h-6 rounded-full bg-violet-100 border border-white"></div>
                <div className="w-6 h-6 rounded-full bg-violet-200 border border-white"></div>
                <div className="w-6 h-6 rounded-full bg-violet-300 border border-white"></div>
              </div>
            </div>
          </div>

          {/* 8. Flash Chat (Small) */}
          <div className="col-span-1 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl p-6 text-white text-center flex flex-col items-center justify-center shadow-lg hover:shadow-teal-200/50 transition-shadow">
            <MessageCircle className="w-10 h-10 mb-3 text-white/90" />
            <h3 className="font-bold text-lg mb-1">محادثات فورية</h3>
            <p className="text-white/80 text-xs text-center leading-relaxed">تواصل مباشر مع الأطباء والمعامل حول استفسارات المنتجات والطلبات لضمان خدمة عملاء متميزة.</p>
          </div>

          {/* 8. Community & Communication (Small) */}
          <div className="col-span-1 bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-6 text-white text-center flex flex-col items-center justify-center shadow-lg hover:shadow-orange-200/50 transition-shadow">
            <MessageCircle className="w-10 h-10 mb-3 text-white/90" />
            <h3 className="font-bold text-lg mb-1">المجتمع الطبي والتعليم</h3>
            <p className="text-white/80 text-xs leading-relaxed">عزز حضورك المهني بالمشاركة في المجتمع؛ واعرض أحدث منتجاتك مباشرة للأطباء والمعامل، وابقَ على اطلاع بأحدث الندوات والدورات العلمية كطريق إضافي لزيادة مبيعاتك.</p>
          </div>

          {/* 8. Jobs & Hiring (Small) */}
          <div className="col-span-1 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white text-center flex flex-col items-center justify-center shadow-lg hover:shadow-emerald-200/50 transition-shadow">
            <Briefcase className="w-10 h-10 mb-3 text-white/90" />
            <h3 className="font-bold text-lg mb-1">الوظائف والتوظيف</h3>
            <p className="text-white/80 text-xs leading-relaxed">أعلن عن شواغر المندوبين والموظفين واستقبل السير الذاتية مباشرة.</p>
          </div>


          {/* CTA Banner */}
          <div className="col-span-1 md:col-span-4 mt-8">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-[2.5rem] p-12 text-center relative overflow-hidden shadow-2xl shadow-orange-200">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

              <div className="relative z-10 max-w-3xl mx-auto text-white">
                <h2 className="text-4xl md:text-5xl font-black mb-6">جاهز لمضاعفة أرباحك؟</h2>
                <p className="text-orange-100 text-xl mb-10">لا تفوت الفرصة. سجل الآن وابدأ بعرض منتجاتك لأكبر شبكة طبية في العراق.</p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/register?type=supplier" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-white text-orange-600 hover:bg-gray-50 px-10 py-5 rounded-2xl text-xl font-bold shadow-xl transition-transform hover:scale-105">
                      ابدأ البيع الآن
                      <ArrowRight className="w-5 h-5 mr-2" />
                    </Button>
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
