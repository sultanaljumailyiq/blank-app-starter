/**
 * أدوات مساعدة لمكونات المختبر
 * Lab Components Utilities
 */

/**
 * متغيرات الألوان المستخدمة في مكونات المختبر
 */
export const labColors = {
  primary: '#3B82F6',
  primaryDark: '#1E40AF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  purple: '#8B5CF6',
  indigo: '#6366F1',
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

/**
 * فئات CSS للعمليات الحسابية
 */
export const labSpacing = {
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem'
};

/**
 * أحجام العناصر
 */
export const labSizes = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl'
};

/**
 * دالة مساعدة لإنشاء فئات مدمجة
 */
export const labCn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * دالة لتنسيق التواريخ
 */
export const formatLabDate = (date) => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * دالة لتنسيق الأوقات
 */
export const formatLabTime = (time) => {
  const t = new Date(time);
  return t.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * دالة لتنسيق التاريخ والوقت معاً
 */
export const formatLabDateTime = (dateTime) => {
  const dt = new Date(dateTime);
  const day = dt.getDate().toString().padStart(2, '0');
  const month = (dt.getMonth() + 1).toString().padStart(2, '0');
  const year = dt.getFullYear();
  const time = dt.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return `${day}/${month}/${year} ${time}`;
};

/**
 * دالة لحساب المدة الزمنية
 */
export const calculateDuration = (startTime, endTime) => {
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

/**
 * دالة لإنشاء رقم مرجعي فريد
 */
export const generateLabReference = (prefix = 'LAB') => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `${prefix}-${date}-${timestamp}-${random}`;
};

/**
 * دالة لإنشاء رقم مرجعي العينة
 */
export const generateSampleReference = () => {
  return generateLabReference('SMP');
};

/**
 * ثوابت حالات المختبر
 */
export const labStatuses = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  COLLECTED: 'collected',
  RECEIVED: 'received',
  PROCESSING: 'processing',
  REJECTED: 'rejected'
};

/**
 * ثوابت أولويات المختبر
 */
export const labPriorities = {
  NORMAL: 'normal',
  URGENT: 'urgent',
  EMERGENCY: 'emergency'
};

/**
 * ثوابت حالة العينة
 */
export const labConditions = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor'
};

/**
 * دالة للحصول على تكوين الحالة
 */
export const getStatusConfig = (status) => {
  const configs = {
    [labStatuses.PENDING]: {
      icon: 'Clock',
      label: 'في الانتظار',
      className: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    [labStatuses.IN_PROGRESS]: {
      icon: 'Activity',
      label: 'قيد التنفيذ',
      className: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    [labStatuses.COMPLETED]: {
      icon: 'CheckCircle',
      label: 'مكتمل',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    [labStatuses.CANCELLED]: {
      icon: 'XCircle',
      label: 'ملغي',
      className: 'bg-red-100 text-red-800 border-red-200'
    },
    [labStatuses.COLLECTED]: {
      icon: 'TestTube',
      label: 'تم جمعها',
      className: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    [labStatuses.RECEIVED]: {
      icon: 'FileText',
      label: 'تم استلامها',
      className: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    [labStatuses.PROCESSING]: {
      icon: 'Activity',
      label: 'قيد المعالجة',
      className: 'bg-orange-100 text-orange-800 border-orange-200'
    },
    [labStatuses.REJECTED]: {
      icon: 'XCircle',
      label: 'مرفوضة',
      className: 'bg-red-100 text-red-800 border-red-200'
    }
  };

  return configs[status] || configs[labStatuses.PENDING];
};

/**
 * دالة للحصول على تكوين الأولوية
 */
export const getPriorityConfig = (priority) => {
  const configs = {
    [labPriorities.EMERGENCY]: {
      label: 'طارئ',
      className: 'bg-red-500 text-white'
    },
    [labPriorities.URGENT]: {
      label: 'عاجل',
      className: 'bg-orange-500 text-white'
    },
    [labPriorities.NORMAL]: {
      label: 'عادي',
      className: 'bg-gray-500 text-white'
    }
  };

  return configs[priority] || configs[labPriorities.NORMAL];
};

/**
 * دالة للحصول على تكوين حالة العينة
 */
export const getConditionConfig = (condition) => {
  const configs = {
    [labConditions.EXCELLENT]: {
      label: 'ممتازة',
      className: 'text-green-600 bg-green-100'
    },
    [labConditions.GOOD]: {
      label: 'جيدة',
      className: 'text-blue-600 bg-blue-100'
    },
    [labConditions.FAIR]: {
      label: 'متوسطة',
      className: 'text-amber-600 bg-amber-100'
    },
    [labConditions.POOR]: {
      label: 'ضعيفة',
      className: 'text-red-600 bg-red-100'
    }
  };

  return configs[condition] || configs[labConditions.GOOD];
};

/**
 * دالة للحصول على لون الاختبار
 */
export const getTestStatusColor = (status) => {
  const colors = {
    pending: 'text-gray-600 bg-gray-100',
    'in-progress': 'text-blue-600 bg-blue-100',
    completed: 'text-green-600 bg-green-100'
  };

  return colors[status] || colors.pending;
};

/**
 * دالة لتحسين النصوص
 */
export const formatLabText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * دالة لتحديد عمر النتيجة
 */
export const getResultAge = (resultDate) => {
  const now = new Date();
  const result = new Date(resultDate);
  const diffMs = now.getTime() - result.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} يوم`;
  } else if (diffHours > 0) {
    return `${diffHours} ساعة`;
  } else {
    return 'أقل من ساعة';
  }
};

/**
 * دالة لتحديد لون التقدم
 */
export const getProgressColor = (percentage) => {
  if (percentage >= 80) return 'success';
  if (percentage >= 60) return 'warning';
  return 'error';
};

/**
 * دالة لإنشاء معرف فريد
 */
export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * دالة لتنسيق الأرقام
 */
export const formatLabNumber = (number, decimals = 0) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

/**
 * دالة لتحويل الحالات إلى لغات أخرى
 */
export const translateStatus = (status, language = 'ar') => {
  const translations = {
    ar: {
      pending: 'في الانتظار',
      'in-progress': 'قيد التنفيذ',
      completed: 'مكتمل',
      cancelled: 'ملغي',
      collected: 'تم جمعها',
      received: 'تم استلامها',
      processing: 'قيد المعالجة',
      rejected: 'مرفوضة'
    },
    en: {
      pending: 'Pending',
      'in-progress': 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      collected: 'Collected',
      received: 'Received',
      processing: 'Processing',
      rejected: 'Rejected'
    }
  };

  return translations[language]?.[status] || status;
};

/**
 * دالة لتحويل الأولويات إلى لغات أخرى
 */
export const translatePriority = (priority, language = 'ar') => {
  const translations = {
    ar: {
      normal: 'عادي',
      urgent: 'عاجل',
      emergency: 'طارئ'
    },
    en: {
      normal: 'Normal',
      urgent: 'Urgent',
      emergency: 'Emergency'
    }
  };

  return translations[language]?.[priority] || priority;
};

/**
 * دالة لتحويل حالة العينة إلى لغات أخرى
 */
export const translateCondition = (condition, language = 'ar') => {
  const translations = {
    ar: {
      excellent: 'ممتازة',
      good: 'جيدة',
      fair: 'متوسطة',
      poor: 'ضعيفة'
    },
    en: {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor'
    }
  };

  return translations[language]?.[condition] || condition;
};

/**
 * دالة للتحقق من صحة البيانات
 */
export const validateLabData = (data, schema) => {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} مطلوب`);
      continue;
    }

    if (value && rules.type) {
      switch (rules.type) {
        case 'email':
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push(`${field} يجب أن يكون بريد إلكتروني صحيح`);
          }
          break;
        case 'phone':
          if (!/^(\+966|0)?[5][0-9]{8}$/.test(value)) {
            errors.push(`${field} يجب أن يكون رقم هاتف سعودي صحيح`);
          }
          break;
        case 'date':
          if (isNaN(Date.parse(value))) {
            errors.push(`${field} يجب أن يكون تاريخ صحيح`);
          }
          break;
        case 'number':
          if (isNaN(Number(value))) {
            errors.push(`${field} يجب أن يكون رقم`);
          }
          break;
      }
    }

    if (value && rules.minLength && value.length < rules.minLength) {
      errors.push(`${field} يجب أن يكون على الأقل ${rules.minLength} أحرف`);
    }

    if (value && rules.maxLength && value.length > rules.maxLength) {
      errors.push(`${field} يجب ألا يتجاوز ${rules.maxLength} أحرف`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * دالة لتخزين البيانات محلياً
 */
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(`lab_${key}`, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('خطأ في حفظ البيانات:', error);
    return false;
  }
};

/**
 * دالة لاسترجاع البيانات من التخزين المحلي
 */
export const loadFromLocalStorage = (key) => {
  try {
    const data = localStorage.getItem(`lab_${key}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('خطأ في استرجاع البيانات:', error);
    return null;
  }
};

/**
 * دالة لحذف البيانات من التخزين المحلي
 */
export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(`lab_${key}`);
    return true;
  } catch (error) {
    console.error('خطأ في حذف البيانات:', error);
    return false;
  }
};

/**
 * دالة لإزالة البيانات المنتهية الصلاحية
 */
export const cleanupExpiredData = () => {
  try {
    const keys = Object.keys(localStorage);
    const now = new Date().getTime();

    keys.forEach(key => {
      if (key.startsWith('lab_')) {
        const data = loadFromLocalStorage(key.replace('lab_', ''));
        if (data && data.expiry && new Date(data.expiry).getTime() < now) {
          removeFromLocalStorage(key.replace('lab_', ''));
        }
      }
    });
  } catch (error) {
    console.error('خطأ في تنظيف البيانات:', error);
  }
};

/**
 * دالة لمحاكاة تأخير الشبكة
 */
export const simulateNetworkDelay = (min = 500, max = 2000) => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * دالة لتجميع البيانات
 */
export const groupDataBy = (data, key) => {
  return data.reduce((groups, item) => {
    const group = (groups[item[key]] = groups[item[key]] || []);
    group.push(item);
    return groups;
  }, {});
};

/**
 * دالة لحساب الإحصائيات
 */
export const calculateLabStats = (data) => {
  const stats = {
    total: data.length,
    byStatus: {},
    byPriority: {},
    byDate: {}
  };

  data.forEach(item => {
    // تجميع بالحالة
    stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;

    // تجميع بالأولوية
    stats.byPriority[item.priority] = (stats.byPriority[item.priority] || 0) + 1;

    // تجميع بالتاريخ
    const date = new Date(item.createdAt).toISOString().split('T')[0];
    stats.byDate[date] = (stats.byDate[date] || 0) + 1;
  });

  return stats;
};

/**
 * دالة لفلترة البيانات
 */
export const filterLabData = (data, filters) => {
  return data.filter(item => {
    for (const [key, value] of Object.entries(filters)) {
      if (value && value !== 'all') {
        if (item[key] !== value) {
          return false;
        }
      }
    }
    return true;
  });
};

/**
 * دالة لترتيب البيانات
 */
export const sortLabData = (data, sortBy, sortOrder = 'asc') => {
  return [...data].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // تحويل التواريخ للمقارنة
    if (sortBy.includes('Date') || sortBy.includes('Time')) {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
};

export default {
  labColors,
  labSpacing,
  labSizes,
  labCn,
  formatLabDate,
  formatLabTime,
  formatLabDateTime,
  calculateDuration,
  generateLabReference,
  generateSampleReference,
  labStatuses,
  labPriorities,
  labConditions,
  getStatusConfig,
  getPriorityConfig,
  getConditionConfig,
  getTestStatusColor,
  formatLabText,
  getResultAge,
  getProgressColor,
  generateUniqueId,
  formatLabNumber,
  translateStatus,
  translatePriority,
  translateCondition,
  validateLabData,
  saveToLocalStorage,
  loadFromLocalStorage,
  removeFromLocalStorage,
  cleanupExpiredData,
  simulateNetworkDelay,
  groupDataBy,
  calculateLabStats,
  filterLabData,
  sortLabData
};