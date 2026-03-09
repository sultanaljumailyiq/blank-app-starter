import {
    Microscope, Activity, Syringe, Stethoscope, Pill, Sparkles,
    Drill, Anchor, ShieldCheck, Scissors, Box, Layers, Zap, Grid, Smile
} from 'lucide-react';
import { CATEGORIES } from './categories';

const getCategoryStyle = (index: number) => {
    const styles = [
        { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', hover: 'hover:border-blue-300', icon: Stethoscope },
        { color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100', hover: 'hover:border-cyan-300', icon: Drill },
        { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', hover: 'hover:border-slate-300', icon: Scissors },
        { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', hover: 'hover:border-rose-300', icon: Activity },
        { color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100', hover: 'hover:border-violet-300', icon: Layers },
        { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', hover: 'hover:border-amber-300', icon: Syringe },
        { color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100', hover: 'hover:border-teal-300', icon: Anchor },
        { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', hover: 'hover:border-green-300', icon: Box },
        { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', hover: 'hover:border-red-300', icon: ShieldCheck },
        { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', hover: 'hover:border-indigo-300', icon: Sparkles },
        { color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100', hover: 'hover:border-pink-300', icon: Pill },
        { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100', hover: 'hover:border-yellow-300', icon: Zap },
    ];
    return styles[index % styles.length];
};

export const detailedCategories = CATEGORIES.map((cat, idx) => {
    const style = getCategoryStyle(idx);
    return {
        id: cat.id,
        name: cat.name,
        icon: style.icon,
        color: style.color,
        bg: style.bg,
        border: style.border,
        hover: style.hover,
        span: idx === 0 ? 'col-span-2 row-span-2' : 'col-span-1', // Keep first item distinct if desired, or remove span logic
        description: `${cat.subCategories.length} أقسام فرعية`,
        subcategories: cat.subCategories.map(s => s.name)
    };
});

