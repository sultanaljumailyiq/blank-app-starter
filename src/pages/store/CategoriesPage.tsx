import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../../data/categories';
import { LayoutGrid, ChevronLeft, ArrowRight, List, Grid, Layers, Box, Activity, Stethoscope, Smile, Sparkles, AlertCircle, Scissors, Camera, GraduationCap, PenTool, FlaskConical, Search } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();

  // Map categories to icons and colors (simplified mapping)
  const getCategoryStyle = (index: number) => {
    const styles = [
      { color: 'bg-blue-100', text: 'text-blue-600', icon: Stethoscope },
      { color: 'bg-emerald-100', text: 'text-emerald-600', icon: Box },
      { color: 'bg-purple-100', text: 'text-purple-600', icon: Layers },
      { color: 'bg-amber-100', text: 'text-amber-600', icon: Smile },
      { color: 'bg-rose-100', text: 'text-rose-600', icon: Scissors },
      { color: 'bg-cyan-100', text: 'text-cyan-600', icon: Activity },
      { color: 'bg-indigo-100', text: 'text-indigo-600', icon: Sparkles },
      { color: 'bg-orange-100', text: 'text-orange-600', icon: Grid },
    ];
    return styles[index % styles.length];
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24" dir="rtl">
      <div className="container mx-auto px-4 py-8">

        {/* Header Section matching Menu styles somewhat */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">أقسام المتجر</h1>
            <p className="text-gray-600">تسوق حسب الفئة الرئيسية للمنتجات</p>
          </div>
          <button
            onClick={() => navigate('/store/all-categories')}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-blue-600 rounded-2xl font-bold hover:bg-blue-50 transition-colors shadow-sm"
          >
            <List className="w-5 h-5" />
            عرض الشجرة الكاملة
          </button>
        </div>

        {/* Grid Layout similar to StoreMenuPage */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[180px]">
          {CATEGORIES.map((category, idx) => {
            const style = getCategoryStyle(idx);
            const Icon = style.icon;

            return (
              <div
                key={category.id}
                onClick={() => navigate(`/store/categories/${encodeURIComponent(category.name)}`)}
                className={`
                                    relative overflow-hidden rounded-3xl p-6 cursor-pointer
                                    transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group
                                    bg-white border border-slate-100 flex flex-col justify-between
                                `}
              >
                {/* Hover background effect */}
                <div className={`
                                    absolute top-0 right-0 w-full h-full opacity-0 group-hover:opacity-5 transition-opacity duration-300
                                    ${style.color.replace('bg-', 'bg-')} 
                                `}></div>

                <div className="flex justify-between items-start z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${style.color} ${style.text}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-white transition-colors">
                    <ChevronLeft className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>

                <div className="z-10">
                  <h3 className="text-lg font-bold text-slate-800 mb-1 leading-tight">{category.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {category.subCategories.length} أقسام فرعية
                  </p>
                </div>

                {/* Decorative Icon Background */}
                <Icon className={`
                                    absolute -bottom-4 -left-4 w-32 h-32 opacity-5 
                                    rotate-12 transition-transform duration-500 
                                    group-hover:scale-110 group-hover:rotate-6
                                    text-slate-900
                                `} />
              </div>
            );
          })}

          {/* View All Categories Card */}
          <div
            onClick={() => navigate('/store/all-categories')}
            className={`
                            relative overflow-hidden rounded-3xl p-6 cursor-pointer
                            transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group
                            bg-slate-800 border border-slate-700 flex flex-col justify-between text-white
                        `}
          >
            <div className="flex justify-between items-start z-10">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10 text-white backdrop-blur-sm">
                <List className="w-6 h-6" />
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors rotate-180" />
              </div>
            </div>

            <div className="z-10">
              <h3 className="text-lg font-bold text-white mb-1 leading-tight">جميع الفئات</h3>
              <p className="text-xs text-slate-400">
                تصفح الشجرة الكاملة
              </p>
            </div>

            <List className={`
                            absolute -bottom-4 -left-4 w-32 h-32 opacity-5 
                            rotate-12 transition-transform duration-500 
                            group-hover:scale-110 group-hover:rotate-6
                            text-white
                        `} />
          </div>
        </div>
      </div>
    </div>
  );
};
