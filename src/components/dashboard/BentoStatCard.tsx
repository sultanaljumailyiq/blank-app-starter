import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface BentoStatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'indigo' | 'cyan' | 'emerald' | 'violet' | 'amber' | 'slate';
    onClick?: () => void;
    className?: string;
    delay?: number; // for animation
}

export const BentoStatCard: React.FC<BentoStatCardProps> = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    color = 'blue',
    onClick,
    className = '',
    delay = 0
}) => {

    // Color Maps
    const colorStyles = {
        blue: {
            bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
            border: 'border-blue-100',
            iconBg: 'bg-blue-500',
            iconColor: 'text-white',
            text: 'text-blue-900',
            subText: 'text-blue-600/80',
            decorative: 'text-blue-500/10'
        },
        purple: {
            bg: 'bg-gradient-to-br from-purple-50 to-purple-100/50',
            border: 'border-purple-100',
            iconBg: 'bg-purple-500',
            iconColor: 'text-white',
            text: 'text-purple-900',
            subText: 'text-purple-600/80',
            decorative: 'text-purple-500/10'
        },
        green: {
            bg: 'bg-gradient-to-br from-green-50 to-green-100/50',
            border: 'border-green-100',
            iconBg: 'bg-green-500',
            iconColor: 'text-white',
            text: 'text-green-900',
            subText: 'text-green-600/80',
            decorative: 'text-green-500/10'
        },
        orange: {
            bg: 'bg-gradient-to-br from-orange-50 to-orange-100/50',
            border: 'border-orange-100',
            iconBg: 'bg-orange-500',
            iconColor: 'text-white',
            text: 'text-orange-900',
            subText: 'text-orange-600/80',
            decorative: 'text-orange-500/10'
        },
        red: {
            bg: 'bg-gradient-to-br from-red-50 to-red-100/50',
            border: 'border-red-100',
            iconBg: 'bg-red-500',
            iconColor: 'text-white',
            text: 'text-red-900',
            subText: 'text-red-600/80',
            decorative: 'text-red-500/10'
        },
        indigo: {
            bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100/50',
            border: 'border-indigo-100',
            iconBg: 'bg-indigo-500',
            iconColor: 'text-white',
            text: 'text-indigo-900',
            subText: 'text-indigo-600/80',
            decorative: 'text-indigo-500/10'
        },
        cyan: {
            bg: 'bg-gradient-to-br from-cyan-50 to-cyan-100/50',
            border: 'border-cyan-100',
            iconBg: 'bg-cyan-500',
            iconColor: 'text-white',
            text: 'text-cyan-900',
            subText: 'text-cyan-600/80',
            decorative: 'text-cyan-500/10'
        },
        emerald: {
            bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50',
            border: 'border-emerald-100',
            iconBg: 'bg-emerald-500',
            iconColor: 'text-white',
            text: 'text-emerald-900',
            subText: 'text-emerald-600/80',
            decorative: 'text-emerald-500/10'
        },
        violet: {
            bg: 'bg-gradient-to-br from-violet-50 to-violet-100/50',
            border: 'border-violet-100',
            iconBg: 'bg-violet-500',
            iconColor: 'text-white',
            text: 'text-violet-900',
            subText: 'text-violet-600/80',
            decorative: 'text-violet-500/10'
        },
        amber: {
            bg: 'bg-gradient-to-br from-amber-50 to-amber-100/50',
            border: 'border-amber-100',
            iconBg: 'bg-amber-500',
            iconColor: 'text-white',
            text: 'text-amber-900',
            subText: 'text-amber-600/80',
            decorative: 'text-amber-500/10'
        },
        slate: {
            bg: 'bg-gradient-to-br from-slate-50 to-slate-100/50',
            border: 'border-slate-100',
            iconBg: 'bg-slate-800',
            iconColor: 'text-white',
            text: 'text-slate-900',
            subText: 'text-slate-600/80',
            decorative: 'text-slate-800/10'
        },
    };

    const style = colorStyles[color] || colorStyles.blue;

    return (
        <div
            onClick={onClick}
            style={{ animationDelay: `${delay}ms` }}
            className={`
        relative overflow-hidden rounded-[2rem] p-6 border transition-all duration-300 group
        ${style.bg} ${style.border} ${className}
        ${onClick ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-transparent' : ''}
        animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards
      `}
        >
            {/* Decorative Background Icon */}
            <Icon className={`absolute -bottom-4 -left-4 w-32 h-32 rotate-12 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${style.decorative}`} strokeWidth={1.5} />

            <div className="relative z-10 flex flex-col h-full justify-between">

                {/* Header: Icon & Title */}
                <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${style.iconBg} ${style.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6" />
                    </div>

                    {/* Trend Badge */}
                    {trend && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm border shadow-sm
               ${trend === 'up' ? 'bg-green-100/80 text-green-700 border-green-200' :
                                trend === 'down' ? 'bg-red-100/80 text-red-700 border-red-200' :
                                    'bg-slate-100/80 text-slate-700 border-slate-200'}
             `}>
                            {trend === 'up' && <TrendingUp className="w-3 h-3" />}
                            {trend === 'down' && <TrendingDown className="w-3 h-3" />}
                            {trend === 'neutral' && <Minus className="w-3 h-3" />}
                            <span dir="ltr">{trendValue}</span>
                        </div>
                    )}
                </div>

                {/* Content: Value & Title */}
                <div>
                    <h3 className={`text-3xl font-bold mb-1 tracking-tight ${style.text}`}>
                        {value}
                    </h3>
                    <p className={`font-medium text-sm ${style.subText}`}>
                        {title}
                    </p>
                </div>
            </div>
        </div>
    );
};
