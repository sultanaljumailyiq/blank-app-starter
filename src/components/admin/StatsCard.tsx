import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  size?: 'sm' | 'md' | 'lg';
}

const colorClasses = {
  blue: {
    bg: 'from-blue-50 to-indigo-50',
    icon: 'text-blue-600',
    border: 'border-blue-200',
    trend: 'text-blue-600'
  },
  green: {
    bg: 'from-green-50 to-emerald-50',
    icon: 'text-green-600',
    border: 'border-green-200',
    trend: 'text-green-600'
  },
  purple: {
    bg: 'from-purple-50 to-indigo-50',
    icon: 'text-purple-600',
    border: 'border-purple-200',
    trend: 'text-purple-600'
  },
  orange: {
    bg: 'from-orange-50 to-amber-50',
    icon: 'text-orange-600',
    border: 'border-orange-200',
    trend: 'text-orange-600'
  },
  red: {
    bg: 'from-red-50 to-pink-50',
    icon: 'text-red-600',
    border: 'border-red-200',
    trend: 'text-red-600'
  }
};

const sizeClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  color = 'blue',
  trend,
  size = 'md'
}) => {
  const colorClass = colorClasses[color];

  // تنسيق القيم الكبيرة
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}م`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}ألف`;
      }
      return val.toString();
    }
    return val;
  };

  return (
    <div className={`
      relative overflow-hidden
      bg-white rounded-3xl border border-gray-100 
      transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-${color}-200
      group
      ${sizeClasses[size]}
    `}>
      {/* Background Gradient Blob */}
      <div className={`
        absolute -top-10 -right-10 w-32 h-32 
        bg-gradient-to-br ${colorClass.bg} 
        rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl
      `} />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`
            p-3.5 rounded-2xl transition-colors duration-300
            bg-gradient-to-br ${colorClass.bg} ${colorClass.icon} shadow-sm group-hover:shadow-md
          `}>
            <Icon className={`${size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`} />
          </div>
          {trend && (
            <div className={`
              flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border
              ${trend.direction === 'up'
                ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                : 'text-red-700 bg-red-50 border-red-100'}
            `}>
              <span>{trend.value}%</span>
              {trend.direction === 'up' ? <span>↗</span> : <span>↘</span>}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-gray-500 font-medium text-sm mb-1">{title}</h3>
          <div className="flex items-baseline gap-2">
            <span className={`font-bold text-gray-900 tracking-tight ${size === 'lg' ? 'text-3xl' : 'text-2xl'}`}>
              {formatValue(value)}
            </span>
          </div>
          {description && <p className="text-gray-400 text-xs mt-2 font-medium">{description}</p>}
        </div>
      </div>
    </div>
  );
};