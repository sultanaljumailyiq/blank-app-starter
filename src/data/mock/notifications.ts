// Mock Notifications with Clinic Association

export interface Notification {
  id: string;
  clinicId: string;
  type: 'appointment' | 'confirmation' | 'alert' | 'reminder' | 'message' | 'system';
  title: string;
  description: string;
  time: string;
  priority: 'low' | 'normal' | 'high';
  isRead: boolean;
  createdAt: string;
}

// Notifications for different clinics
export const mockNotifications: Notification[] = [
  // Clinic 1
  {
    id: 'not-001',
    clinicId: '1',
    type: 'appointment',
    title: 'موعد جديد تم حجزه',
    description: 'أحمد محمد - فحص دوري',
    time: 'منذ ساعتين',
    priority: 'normal',
    isRead: false,
    createdAt: '2025-11-26T08:00:00.000Z',
  },
  {
    id: 'not-002',
    clinicId: '1',
    type: 'confirmation',
    title: 'تم تأكيد الموعد',
    description: 'سارة أحمد - تنظيف الأسنان',
    time: 'منذ 4 ساعات',
    priority: 'normal',
    isRead: true,
    createdAt: '2025-11-26T06:00:00.000Z',
  },
  {
    id: 'not-003',
    clinicId: '1',
    type: 'alert',
    title: 'إشعار المخزون',
    description: 'نقص في معاجين الأسنان',
    time: 'أمس',
    priority: 'high',
    isRead: false,
    createdAt: '2025-11-25T10:00:00.000Z',
  },
  // Clinic 2
  {
    id: 'not-004',
    clinicId: '2',
    type: 'appointment',
    title: 'موعد جديد - طفل',
    description: 'علي حسن (8 سنوات) - فحص أسنان',
    time: 'منذ ساعة',
    priority: 'normal',
    isRead: false,
    createdAt: '2025-11-26T09:00:00.000Z',
  },
  {
    id: 'not-005',
    clinicId: '2',
    type: 'reminder',
    title: 'تذكير بالمخزون',
    description: 'انتهاء صلاحية بعض المواد غداً',
    time: 'منذ 3 ساعات',
    priority: 'high',
    isRead: false,
    createdAt: '2025-11-26T07:00:00.000Z',
  },
  {
    id: 'not-006',
    clinicId: '2',
    type: 'message',
    title: 'رسالة من المختبر',
    description: 'طقم الأسنان جاهز للاستلام',
    time: 'منذ 5 ساعات',
    priority: 'normal',
    isRead: true,
    createdAt: '2025-11-26T05:00:00.000Z',
  },
  // Clinic 5
  {
    id: 'not-007',
    clinicId: '5',
    type: 'appointment',
    title: 'إلغاء موعد',
    description: 'محمد سالم - ألغى موعد زراعة الأسنان',
    time: 'منذ 30 دقيقة',
    priority: 'normal',
    isRead: false,
    createdAt: '2025-11-26T09:30:00.000Z',
  },
  {
    id: 'not-008',
    clinicId: '5',
    type: 'alert',
    title: 'صيانة الأجهزة',
    description: 'جهاز الأشعة يحتاج صيانة دورية',
    time: 'منذ يومين',
    priority: 'high',
    isRead: false,
    createdAt: '2025-11-24T10:00:00.000Z',
  },
];

// Helper functions
export const getNotificationsByClinic = (clinicId: string): Notification[] => {
  return mockNotifications.filter(n => n.clinicId === clinicId);
};

export const getUnreadNotificationsCount = (clinicId: string): number => {
  return mockNotifications.filter(n => n.clinicId === clinicId && !n.isRead).length;
};

export const getAllUnreadCount = (): number => {
  return mockNotifications.filter(n => !n.isRead).length;
};
