// Lab Components Index
// جميع مكونات المختبر المحسنة

import { formatNumericDate } from '../../lib/date';
export { LabRequestsTable } from './LabRequestsTable';
export { AddLabOrderModal } from './AddLabOrderModal';
export { LabStatsCard, getDefaultLabStats } from './LabStatsCard';
export { LabNavigation, getDefaultLabNavigation } from './LabNavigation';
export { SampleInfoCard } from './SampleInfoCard';

// أمثلة وأدوات مساعدة



// مكونات إضافية للتحسينات المتقدمة
export * from './LabRequestCard';
export * from './LabRequestsTable';
export * from './LabStatsCard';
export * from './LabNavigation';
export * from './LabMainCard';
export * from './SampleInfoCard';
export * from './lab-config';
export * from './lab-utils';

// أنماط CSS إضافية للمكونات
export const labComponentsStyles = `
  /* أنماط مخصصة لمكونات المختبر */
  
  .lab-card {
    @apply bg-white rounded-xl shadow-md border border-gray-100 transition-all duration-200;
  }
  
  .lab-card:hover {
    @apply shadow-lg transform translate-y-[-2px];
  }
  
  .lab-card-header {
    @apply p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white;
  }
  
  .lab-card-content {
    @apply p-6;
  }
  
  .lab-card-footer {
    @apply px-6 py-4 border-t border-gray-200 bg-gray-50;
  }
  
  /* أنماط الجداول المحسنة */
  .lab-table {
    @apply w-full border-collapse bg-white rounded-lg overflow-hidden shadow-md;
  }
  
  .lab-table th {
    @apply px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50;
  }
  
  .lab-table td {
    @apply px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-200;
  }
  
  .lab-table tr:hover {
    @apply bg-gray-50;
  }
  
  /* أنماط الأزرار المحسنة */
  .lab-button-primary {
    @apply flex items-center space-x-2 space-x-reverse px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors duration-200;
  }
  
  .lab-button-secondary {
    @apply flex items-center space-x-2 space-x-reverse px-4 py-2 bg-white text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200;
  }
  
  .lab-button-danger {
    @apply flex items-center space-x-2 space-x-reverse px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors duration-200;
  }
  
  /* أنماط الإحصائيات */
  .lab-stat-card {
    @apply p-6 bg-white rounded-xl shadow-md border-r-4 transition-all duration-200 hover:shadow-lg;
  }
  
  .lab-stat-icon {
    @apply w-10 h-10 rounded-lg flex items-center justify-center text-white;
  }
  
  /* أنماط الحالات */
  .lab-status-pending {
    @apply bg-amber-100 text-amber-800 border-amber-200;
  }
  
  .lab-status-in-progress {
    @apply bg-blue-100 text-blue-800 border-blue-200;
  }
  
  .lab-status-completed {
    @apply bg-green-100 text-green-800 border-green-200;
  }
  
  .lab-status-cancelled {
    @apply bg-red-100 text-red-800 border-red-200;
  }
  
  /* أنماط الأولوية */
  .lab-priority-emergency {
    @apply bg-red-500 text-white;
  }
  
  .lab-priority-urgent {
    @apply bg-orange-500 text-white;
  }
  
  .lab-priority-normal {
    @apply bg-gray-500 text-white;
  }
  
  /* أنماط التنقل */
  .lab-nav-item {
    @apply flex items-center space-x-2 space-x-reverse py-4 px-3 border-b-2 font-medium text-sm transition-all duration-200;
  }
  
  .lab-nav-item.active {
    @apply border-primary text-primary;
  }
  
  .lab-nav-item:not(.active) {
    @apply border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300;
  }
  
  /* أنماط المعلومات */
  .lab-info-section {
    @apply bg-gray-50 rounded-lg p-4 border-r-4;
  }
  
  .lab-info-item {
    @apply flex items-center space-x-2 space-x-reverse;
  }
  
  /* أنماط التحريك */
  .lab-fade-in {
    animation: fade-in 0.3s ease-out;
  }
  
  .lab-slide-up {
    animation: slide-up 0.3s ease-out;
  }
  
  .lab-scale-in {
    animation: scale-in 0.2s ease-out;
  }
  
  @keyframes slide-up {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  /* أنماط الاستجابة */
  @media (max-width: 768px) {
    .lab-card {
      @apply mx-2;
    }
    
    .lab-table {
      @apply text-xs;
    }
    
    .lab-table th,
    .lab-table td {
      @apply px-3 py-2;
    }
    
    .lab-nav-item {
      @apply px-2 py-2 text-xs;
    }
  }
  
  /* أنماط الطباعة */
  @media print {
    .lab-card {
      @apply shadow-none border border-gray-300;
    }
    
    .lab-button-primary,
    .lab-button-secondary,
    .lab-button-danger {
      @apply hidden;
    }
  }
`;

// مكونات مساعدة للتصدير والتهيئة
export interface LabComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// ثوابت الألوان المستخدمة في مكونات المختبر
export const labColors = {
  primary: '#3B82F6',
  primaryDark: '#1E40AF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827'
};

// ثوابت المسافات والحجوم
export const labSpacing = {
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem'
};

// ثوابت الأحجام
export const labSizes = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl'
};

// دالة مساعدة لإنشاء الفئات
export const labCn = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// دالة مساعدة لالتنسيق
export const formatLabDate = (date: string | Date): string => {
  return formatNumericDate(date);
};

export const formatLabTime = (time: string | Date): string => {
  const t = new Date(time);
  return t.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// دالة مساعدة لحساب المدة
export const calculateDuration = (startTime: string, endTime: string): string => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 0) {
    return `${diffHours}س ${diffMinutes}د`;
  }
  return `${diffMinutes} دقيقة`;
};

// دالة مساعدة لإنشاء رقم مرجعي فريد
export const generateLabReference = (prefix: string = 'LAB'): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${prefix}-${timestamp}-${random}`;
};

// ثوابت حالات المختبر
export const labStatuses = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export const labPriorities = {
  NORMAL: 'normal',
  URGENT: 'urgent',
  EMERGENCY: 'emergency'
} as const;

export const labConditions = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor'
} as const;