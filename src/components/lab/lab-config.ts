/**
 * إعدادات مكونات المختبر
 * Lab Components Configuration
 */

/**
 * إعدادات الألوان
 */
export const colors = {
  primary: '#3B82F6',
  primaryDark: '#1E40AF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  purple: '#8B5CF6',
  indigo: '#6366F1',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827'
  }
};

/**
 * إعدادات المسافات
 */
export const spacing = {
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem'
};

/**
 * إعدادات الزوايا المدورة
 */
export const borderRadius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem'
};

/**
 * إعدادات الظلال
 */
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
};

/**
 * إعدادات الانتقالات
 */
export const transitions = {
  fast: '0.15s ease',
  normal: '0.2s ease',
  slow: '0.3s ease'
};

/**
 * إعدادات أحجام الشاشات
 */
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

/**
 * إعدادات الخطوط
 */
export const typography = {
  fontFamily: {
    sans: ['Cairo', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem'
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  }
};

/**
 * إعدادات الحقول (Inputs)
 */
export const inputConfig = {
  height: {
    sm: '2rem',
    md: '2.5rem',
    lg: '3rem'
  },
  padding: {
    sm: '0.5rem 0.75rem',
    md: '0.625rem 0.875rem',
    lg: '0.75rem 1rem'
  },
  borderRadius: borderRadius.md
};

/**
 * إعدادات الأزرار
 */
export const buttonConfig = {
  height: {
    sm: '2rem',
    md: '2.5rem',
    lg: '3rem'
  },
  padding: {
    sm: '0.5rem 0.75rem',
    md: '0.625rem 1rem',
    lg: '0.75rem 1.25rem'
  },
  borderRadius: borderRadius.md
};

/**
 * إعدادات البطاقات
 */
export const cardConfig = {
  padding: spacing.lg,
  borderRadius: borderRadius.xl,
  shadow: shadows.md
};

/**
 * إعدادات الجداول
 */
export const tableConfig = {
  borderRadius: borderRadius.lg,
  headerBg: colors.gray[50],
  headerColor: colors.gray[700],
  cellPadding: spacing.md,
  rowHoverBg: colors.gray[50]
};

/**
 * إعدادات الشارات
 */
export const badgeConfig = {
  padding: '0.25rem 0.5rem',
  fontSize: '0.75rem',
  borderRadius: '9999px'
};

/**
 * إعدادات القوائم المنسدلة
 */
export const dropdownConfig = {
  padding: spacing.sm,
  borderRadius: borderRadius.lg,
  shadow: shadows.lg,
  maxHeight: '20rem'
};

/**
 * إعدادات النوافذ المنبثقة
 */
export const modalConfig = {
  padding: spacing.xl,
  borderRadius: borderRadius.xl,
  shadow: shadows.xl,
  maxWidth: '32rem'
};

/**
 * إعدادات التنبيهات
 */
export const alertConfig = {
  padding: spacing.md,
  borderRadius: borderRadius.lg,
  borderWidth: '1px'
};

/**
 * إعدادات التحميل
 */
export const loadingConfig = {
  size: {
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem'
  },
  colors: {
    primary: colors.primary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error
  }
};

/**
 * إعدادات الرسوم البيانية
 */
export const chartConfig = {
  colors: {
    primary: colors.primary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    purple: colors.purple,
    indigo: colors.indigo
  },
  grid: {
    color: colors.gray[200]
  },
  text: {
    color: colors.gray[600],
    fontSize: '0.75rem'
  }
};

/**
 * إعدادات التنقل
 */
export const navigationConfig = {
  height: '4rem',
  padding: spacing.md,
  itemPadding: spacing.sm,
  borderColor: colors.gray[200],
  activeColor: colors.primary,
  hoverColor: colors.gray[700]
};

/**
 * إعدادات البحث
 */
export const searchConfig = {
  height: inputConfig.height.md,
  padding: inputConfig.padding.md,
  borderRadius: borderRadius.md,
  placeholder: 'البحث...',
  iconColor: colors.gray[400]
};

/**
 * إعدادات الإشعارات
 */
export const notificationConfig = {
  padding: spacing.md,
  borderRadius: borderRadius.lg,
  spacing: spacing.sm,
  autoClose: 5000,
  positions: {
    top: 'top-4',
    bottom: 'bottom-4',
    right: 'right-4',
    left: 'left-4'
  }
};

/**
 * إعدادات التفاعل
 */
export const interactionConfig = {
  hover: {
    scale: 1.02,
    shadow: shadows.lg,
    transition: transitions.normal
  },
  focus: {
    ringWidth: '2px',
    ringColor: colors.primary,
    transition: transitions.fast
  },
  active: {
    scale: 0.98,
    transition: transitions.fast
  }
};

/**
 * إعدادات الرسوم المتحركة
 */
export const animationConfig = {
  fadeIn: {
    duration: '0.3s',
    easing: 'ease-out'
  },
  slideIn: {
    duration: '0.3s',
    easing: 'ease-out'
  },
  scaleIn: {
    duration: '0.2s',
    easing: 'ease-out'
  },
  pulse: {
    duration: '2s',
    easing: 'ease-in-out',
    infinite: true
  }
};

/**
 * إعدادات الاستجابة
 */
export const responsiveConfig = {
  mobile: {
    padding: spacing.sm,
    fontSize: typography.fontSize.sm,
    gridColumns: 1
  },
  tablet: {
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    gridColumns: 2
  },
  desktop: {
    padding: spacing.lg,
    fontSize: typography.fontSize.base,
    gridColumns: 3
  }
};

/**
 * إعدادات الطباعة
 */
export const printConfig = {
  colors: {
    background: '#FFFFFF',
    text: '#000000',
    border: '#CCCCCC'
  },
  shadows: 'none',
  borderRadius: '0'
};

/**
 * إعدادات إمكانية الوصول
 */
export const accessibilityConfig = {
  focus: {
    outline: '2px solid ' + colors.primary,
    outlineOffset: '2px'
  },
  reducedMotion: {
    transition: 'none',
    animation: 'none'
  },
  highContrast: {
    background: '#FFFFFF',
    text: '#000000',
    border: '#000000'
  }
};

/**
 * إعدادات الأداء
 */
export const performanceConfig = {
  lazyLoad: {
    threshold: '0.1',
    rootMargin: '50px'
  },
  virtualization: {
    itemSize: 60,
    overscan: 5
  },
  debounce: {
    search: 300,
    resize: 150,
    scroll: 100
  }
};

/**
 * إعدادات الترجمة
 */
export const i18nConfig = {
  defaultLocale: 'ar',
  supportedLocales: ['ar', 'en'],
  direction: {
    ar: 'rtl',
    en: 'ltr'
  },
  dateFormat: {
    ar: {
      short: 'DD/MM/YYYY',
      long: 'DD MMMM YYYY',
      time: 'HH:mm'
    },
    en: {
      short: 'MM/DD/YYYY',
      long: 'MMMM DD, YYYY',
      time: 'HH:mm'
    }
  }
};

/**
 * إعدادات التخزين
 */
export const storageConfig = {
  prefix: 'lab_',
  expires: 24 * 60 * 60 * 1000, // 24 hours
  compression: false,
  encryption: false
};

/**
 * إعدادات الشبكة
 */
export const networkConfig = {
  timeout: 30000,
  retries: 3,
  backoff: 'exponential',
  cache: {
    enabled: true,
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxSize: 100
  }
};

/**
 * دالة للحصول على تكوين متكامل
 */
export const getFullConfig = () => ({
  colors,
  spacing,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
  typography,
  input: inputConfig,
  button: buttonConfig,
  card: cardConfig,
  table: tableConfig,
  badge: badgeConfig,
  dropdown: dropdownConfig,
  modal: modalConfig,
  alert: alertConfig,
  loading: loadingConfig,
  chart: chartConfig,
  navigation: navigationConfig,
  search: searchConfig,
  notification: notificationConfig,
  interaction: interactionConfig,
  animation: animationConfig,
  responsive: responsiveConfig,
  print: printConfig,
  accessibility: accessibilityConfig,
  performance: performanceConfig,
  i18n: i18nConfig,
  storage: storageConfig,
  network: networkConfig
});

export default getFullConfig();