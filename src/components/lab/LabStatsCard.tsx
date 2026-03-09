import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  User,
  Calendar,
  Activity,
  Timer
} from 'lucide-react';
import { Card } from '../common/Card';
import { cn } from '@/lib/utils';

interface LabStatItem {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: React.ElementType;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'indigo';
  description?: string;
}

interface LabStatsCardProps {
  stats: LabStatItem[];
  className?: string;
  showCharts?: boolean;
  period?: 'today' | 'week' | 'month';
}

const getColorConfig = (color: LabStatItem['color']) => {
  switch (color) {
    case 'blue':
      return {
        bg: 'bg-blue-50',
        icon: 'bg-blue-500',
        text: 'text-blue-600',
        border: 'border-blue-200'
      };
    case 'green':
      return {
        bg: 'bg-green-50',
        icon: 'bg-green-500',
        text: 'text-green-600',
        border: 'border-green-200'
      };
    case 'amber':
      return {
        bg: 'bg-amber-50',
        icon: 'bg-amber-500',
        text: 'text-amber-600',
        border: 'border-amber-200'
      };
    case 'red':
      return {
        bg: 'bg-red-50',
        icon: 'bg-red-500',
        text: 'text-red-600',
        border: 'border-red-200'
      };
    case 'purple':
      return {
        bg: 'bg-purple-50',
        icon: 'bg-purple-500',
        text: 'text-purple-600',
        border: 'border-purple-200'
      };
    case 'indigo':
      return {
        bg: 'bg-indigo-50',
        icon: 'bg-indigo-500',
        text: 'text-indigo-600',
        border: 'border-indigo-200'
      };
  }
};

const getPeriodLabel = (period: 'today' | 'week' | 'month') => {
  switch (period) {
    case 'today':
      return 'اليوم';
    case 'week':
      return 'هذا الأسبوع';
    case 'month':
      return 'هذا الشهر';
  }
};

export const LabStatsCard: React.FC<LabStatsCardProps> = ({
  stats,
  className,
  showCharts = false,
  period = 'today'
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إحصائيات المختبر</h2>
          <p className="text-sm text-gray-600 mt-1">
            إحصائيات شاملة لفترة {getPeriodLabel(period)}
          </p>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">{getPeriodLabel(period)}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const colorConfig = getColorConfig(stat.color);
          const Icon = stat.icon;
          
          return (
            <Card 
              key={index} 
              hover 
              className={cn(
                'p-6 border-r-4',
                colorConfig.border
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 space-x-reverse mb-2">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      colorConfig.icon
                    )}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      {stat.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {stat.description}
                        </p>
                      )}
                    </div>
                    
                    {stat.change && (
                      <div className={cn(
                        'flex items-center space-x-1 space-x-reverse px-2 py-1 rounded-full text-xs font-medium',
                        stat.change.type === 'increase' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      )}>
                        {stat.change.type === 'increase' ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>{Math.abs(stat.change.value)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Progress Bar (if showing charts) */}
              {showCharts && typeof stat.value === 'number' && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all duration-500',
                        colorConfig.icon
                      )}
                      style={{
                        width: `${Math.min((stat.value / 100) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Quick Stats Section */}
      <div className="bg-gradient-to-r from-primary/5 to-primary-dark/5 rounded-xl p-6 border border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">ملخص سريع</h3>
          <Activity className="w-5 h-5 text-primary" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-xs text-gray-600">متوسط وقت المعالجة</p>
            <p className="text-lg font-bold text-gray-900">2.5 ساعة</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-xs text-gray-600">معدل الدقة</p>
            <p className="text-lg font-bold text-gray-900">98.5%</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Timer className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-xs text-gray-600">الطلبات المعلقة</p>
            <p className="text-lg font-bold text-gray-900">12</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-xs text-gray-600">الحالات العاجلة</p>
            <p className="text-lg font-bold text-gray-900">3</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Default stats for lab dashboard
export const getDefaultLabStats = (): LabStatItem[] => [
  {
    title: 'إجمالي الطلبات',
    value: 156,
    change: {
      value: 12,
      type: 'increase'
    },
    icon: FileText,
    color: 'blue',
    description: 'طلب جديد اليوم'
  },
  {
    title: 'مكتملة',
    value: 89,
    change: {
      value: 8,
      type: 'increase'
    },
    icon: CheckCircle,
    color: 'green',
    description: 'تم الإنجاز اليوم'
  },
  {
    title: 'قيد التنفيذ',
    value: 34,
    change: {
      value: 5,
      type: 'increase'
    },
    icon: Activity,
    color: 'amber',
    description: 'جاري العمل عليها'
  },
  {
    title: 'في الانتظار',
    value: 23,
    change: {
      value: 2,
      type: 'decrease'
    },
    icon: Clock,
    color: 'red',
    description: 'بانتظار المراجعة'
  },
  {
    title: 'المرضى المسجلين',
    value: 1247,
    change: {
      value: 15,
      type: 'increase'
    },
    icon: User,
    color: 'purple',
    description: 'هذا الشهر'
  },
  {
    title: 'الفحوصات اليومية',
    value: 45,
    change: {
      value: 7,
      type: 'increase'
    },
    icon: BarChart3,
    color: 'indigo',
    description: 'متوسط يومي'
  }
];