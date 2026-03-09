import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../../data/categories';
import { ChevronRight, ArrowLeftCircle, Box, Layers, Smile, Scissors, Activity, Stethoscope, Sparkles, Grid } from 'lucide-react';

export const AllCategoriesPage: React.FC = () => {
    const navigate = useNavigate();

    // Reusing the style mapping for consistency
    const getCategoryStyle = (index: number) => {
        const styles = [
            { color: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', icon: Stethoscope, pill: 'bg-blue-100 text-blue-700' },
            { color: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', icon: Box, pill: 'bg-emerald-100 text-emerald-700' },
            { color: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-700', icon: Layers, pill: 'bg-purple-100 text-purple-700' },
            { color: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', icon: Smile, pill: 'bg-amber-100 text-amber-700' },
            { color: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', icon: Scissors, pill: 'bg-rose-100 text-rose-700' },
            { color: 'bg-cyan-50', border: 'border-cyan-100', text: 'text-cyan-700', icon: Activity, pill: 'bg-cyan-100 text-cyan-700' },
            { color: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700', icon: Sparkles, pill: 'bg-indigo-100 text-indigo-700' },
            { color: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-700', icon: Grid, pill: 'bg-orange-100 text-orange-700' },
        ];
        return styles[index % styles.length];
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24" dir="rtl">
            <div className="container mx-auto px-4 py-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-3">الدليل الشامل</h1>
                        <p className="text-slate-500 text-lg">خريطة كاملة لجميع أقسام ومنتجات المتجر</p>
                    </div>
                    <button
                        onClick={() => navigate('/store/categories')}
                        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-colors px-4 py-2 hover:bg-white rounded-xl"
                    >
                        <ArrowLeftCircle className="w-5 h-5" />
                        العودة للأقسام الرئيسية
                    </button>
                </div>

                {/* Masonry-like Grid (using simple CSS Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
                    {CATEGORIES.map((category, idx) => {
                        const style = getCategoryStyle(idx);
                        const Icon = style.icon;

                        return (
                            <div
                                key={category.id}
                                className={`
                                    rounded-[2rem] p-6 border transition-all duration-300 hover:shadow-xl
                                    ${style.color} ${style.border} group
                                `}
                            >
                                {/* Card Header */}
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/50">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl bg-white shadow-sm text-slate-700`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className={`text-xl font-bold ${style.text}`}>{category.name}</h2>
                                            <span className="text-xs text-slate-500 font-medium bg-white/60 px-2 py-0.5 rounded-lg">
                                                {category.subCategories.length} أقسام فرعية
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/store/categories/${encodeURIComponent(category.name)}`)}
                                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-blue-600 hover:scale-110 transition-all shadow-sm"
                                    >
                                        <ChevronRight className="w-5 h-5 rotate-180" />
                                    </button>
                                </div>

                                {/* Subcategories Content */}
                                <div className="space-y-4">
                                    {category.subCategories.map((sub) => (
                                        <div key={sub.id} className="bg-white/60 rounded-2xl p-4 hover:bg-white transition-colors">
                                            <div
                                                className="flex items-center gap-2 mb-2 cursor-pointer group/sub"
                                                onClick={() => navigate(`/store/categories/${encodeURIComponent(category.name)}/${encodeURIComponent(sub.name)}`)}
                                            >
                                                <div className={`w-2 h-2 rounded-full ${style.pill.split(' ')[0].replace('bg-', 'bg-slate-400 group-hover/sub:bg-blue-500')}`}></div>
                                                <h3 className="font-bold text-slate-800 group-hover/sub:text-blue-600 transition-colors">
                                                    {sub.name}
                                                </h3>
                                            </div>

                                            {/* Child Categories (Chips) */}
                                            <div className="flex flex-wrap gap-2 pr-3">
                                                {sub.childCategories.length > 0 ? (
                                                    sub.childCategories.map((child, cIdx) => (
                                                        <span
                                                            key={cIdx}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/store/categories/${encodeURIComponent(category.name)}/${encodeURIComponent(sub.name)}?childCategory=${encodeURIComponent(child)}`);
                                                            }}
                                                            className={`
                                                                text-[11px] px-2.5 py-1 rounded-lg cursor-pointer transition-all duration-200
                                                                hover:scale-105 active:scale-95 border border-transparent hover:border-blue-100
                                                                ${style.pill} bg-opacity-50 hover:bg-opacity-100
                                                            `}
                                                        >
                                                            {child}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 italic pr-1">-- عام --</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
