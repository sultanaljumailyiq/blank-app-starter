import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Calendar,
    DollarSign,
    Building2,
    MessageCircle,
    Store,
    Briefcase,
    Bell,
    Star,
    Zap,
    ShoppingCart,
    FileText,
    Settings,
    Eye,
    ChevronRight,
    CircleAlert,
    CheckCircle,
    Clock,
    ArrowRight,
    Activity, // Added back
    RefreshCw
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDoctorContext } from '../../contexts/DoctorContext';
import { useAppointments } from '../../hooks/useAppointments';
import { useTasks } from '../../hooks/useTasks';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Card } from '../../components/common/Card';
import { NotificationContent } from '../../components/common/NotificationContent';
import { FlaskConical } from 'lucide-react';


import { useLowStockItems } from '../../hooks/useLowStockItems';
import { useRecentActivities } from '../../hooks/useRecentActivities';
import { useTransactions } from '../../hooks/useTransactions';
import { usePatients } from '../../hooks/usePatients';
import { useDemoClinicData } from '../../hooks/useDemoClinicData';
import { useDoctorSubscription } from '../../hooks/useDoctorSubscription';

export const DoctorOverviewPage: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { user } = useAuth();
    // Use Global Context
    const { clinics, loading: clinicsLoading, selectedClinicId } = useDoctorContext();
    const { appointments } = useAppointments(); // Keep for today's appointments if hooked
    const { patients } = usePatients();

    // --- Logic & Filtering ---
    const isOwner = user?.role === 'doctor';
    const isStaff = user?.role === 'staff';

    // Helper to check if item belongs to selected context
    const isRelevant = (clinicId?: string | number) => {
        // Staff Logic: Only show data for the first assigned clinic (My Clinic)
        if (isStaff) {
            return clinics.length > 0 && clinicId?.toString() === clinics[0].id.toString();
        }

        // Owner Logic: Respect Selected Clinic ID
        if (!clinicId) return true; // Show global/system items (no clinic ID)
        return selectedClinicId === 'all' || selectedClinicId.toString() === clinicId.toString();
    };

    // --- Real Data Integration ---

    // 2. Stats Calculation
    // Total Clinics: For Staff -> 1. For Owner -> All (if 'all' selected) or 1.
    const totalClinics = (selectedClinicId === 'all' && !isStaff) ? clinics.length : 1;
    const totalPatients = patients?.filter(p => isRelevant(p.clinicId)).length || 0;

    // Calculate Revenue
    const { transactions } = useTransactions();

    // Filter transactions relevant to accessible clinics AND selected context
    const relevantTransactions = transactions.filter(t =>
        (selectedClinicId === 'all' && clinics.some(c => c.id.toString() === t.clinicId.toString())) ||
        (selectedClinicId.toString() === t.clinicId.toString())
    );

    const totalRevenue = relevantTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const affectedCustomers = totalPatients;

    // Today's Appointments
    const todayAppointments = appointments.filter(
        a => a.date === new Date().toISOString().split('T')[0]
    ).length;

    // Logic for Clinic Stats
    const clinicStats = clinics.map(clinic => {
        const clinicPatients = patients ? patients.filter(p => p.clinicId === clinic.id).length : 0;

        // Calculate specific clinic revenue
        const clinicRevenue = transactions
            .filter(t => t.clinicId === clinic.id && t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            id: clinic.id,
            name: clinic.name,
            patients: clinicPatients,
            revenue: clinicRevenue,
            status: 'active'
        };
    });

    const [realLowStockItems, setRealLowStockItems] = React.useState<any[]>([]);
    // 3. Purchase Suggestions (Real Data)
    const { items: lowStockItems, loading: lowStockLoading } = useLowStockItems();

    // 4. Notifications (Unified Source)
    const { notifications: allNotifications, loading: notificationsLoading } = useNotifications();

    // 5. Recent Activities
    const { activities, loading: activitiesLoading } = useRecentActivities(selectedClinicId);

    // --- Filtering Logic ---
    // --- Filtering Logic ---
    const filteredActivities = activities.filter(a => isRelevant(a.clinicId));
    const filteredLowStock = lowStockItems.filter(item => isRelevant((item as any).clinicId));

    // 4b. Merge Updates into Notifications for Dashboard
    const { updates } = useNotifications();

    const mappedUpdates = updates.map((u: any) => ({
        id: `update-${u.id}`,
        type: 'update',
        title: u.title,
        description: u.content,
        time: formatDate(u.release_date),
        icon: RefreshCw,
        color: 'purple',
        clinicId: null,
        clinicName: 'النظام',
        createdAt: u.release_date
    }));

    const mappedNotifications = allNotifications.filter(n => isRelevant(n.clinicId)).map(n => {
        let Icon = Bell;
        let color = 'blue';

        if (n.type === 'appointment') { Icon = Calendar; color = 'blue'; }
        if (n.type === 'alert' || n.type === 'reminder') { Icon = CircleAlert; color = 'orange'; }
        if (n.type === 'message') { Icon = MessageCircle; color = 'green'; }

        // Logic to show clinic name if available
        const clinicName = n.clinicName || clinics.find(c => c.id === n.clinicId)?.name || 'عيادة عامة';

        return {
            id: n.id,
            type: n.type,
            title: n.title,
            description: n.description,
            time: formatDate(n.createdAt),
            icon: Icon,
            color: color,
            clinicId: n.clinicId,
            clinicName: clinicName,
            createdAt: n.createdAt
        };
    });

    // Combine and Sort
    const recentNotifications = [...mappedNotifications, ...mappedUpdates]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);


    // 6. Subscription Data
    const { subscription, loading: subLoading } = useDoctorSubscription();

    const subscriptionInfo = subscription ? {
        currentPlan: subscription.plan.name,
        status: subscription.status === 'approved' ? 'نشطة' :
            subscription.status === 'pending' ? 'قيد المراجعة' : 'منتهية',
        expiryDate: subscription.endDate,
        features: subscription.plan.features.slice(0, 3) // Show first 3 features
    } : {
        currentPlan: 'الباقة المجانية',
        status: 'نشطة',
        expiryDate: 'مدى الحياة',
        features: ['إدارة عيادة واحدة', 'عدد محدود من المرضى']
    };

    const { generateDemoClinicData, seeding } = useDemoClinicData();

    if (clinicsLoading) return <div className="p-8 text-center text-gray-500">جاري تحميل البيانات...</div>;

    return (
        <div className="space-y-6">


            {/* 1. Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Clinics (Blue) */}
                <div
                    onClick={() => navigate('/doctor/clinics')}
                    style={{ animationDelay: '100ms' }}
                    className="relative overflow-hidden rounded-[2rem] p-6 border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100/50 transition-all duration-300 group cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-transparent animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
                >
                    {/* Decorative Icon */}
                    <Building2 className="absolute -bottom-4 -left-4 w-32 h-32 text-blue-500/10 rotate-12 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" strokeWidth={1.5} />

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm bg-blue-500 text-white group-hover:scale-110 transition-transform duration-300">
                                <Building2 className="w-6 h-6" />
                            </div>
                        </div>
                        <div>
                            <p className="text-blue-600/80 font-medium text-sm mb-1">{isStaff ? 'عيادتي' : 'عدد العيادات'}</p>
                            <h3 className="text-3xl font-bold text-blue-900 mb-4">{totalClinics}</h3>
                            {/* Progress Bar */}
                            <div className="w-full h-1.5 bg-blue-200/50 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-2/3 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Patients (Green) */}
                <div
                    style={{ animationDelay: '200ms' }}
                    className="relative overflow-hidden rounded-[2rem] p-6 border border-green-100 bg-gradient-to-br from-green-50 to-green-100/50 transition-all duration-300 group hover:shadow-xl hover:-translate-y-1 hover:border-transparent animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
                >
                    <Users className="absolute -bottom-4 -left-4 w-32 h-32 text-green-500/10 rotate-12 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" strokeWidth={1.5} />

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm bg-green-500 text-white group-hover:scale-110 transition-transform duration-300">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                        <div>
                            <p className="text-green-600/80 font-medium text-sm mb-1">المرضى النشطين</p>
                            <h3 className="text-3xl font-bold text-green-900 mb-4">{affectedCustomers}</h3>
                            {/* Progress Bar */}
                            <div className="w-full h-1.5 bg-green-200/50 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-3/4 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Revenue (Amber/Yellow) - OWNER ONLY */}
                {!isStaff && (
                    <div
                        style={{ animationDelay: '300ms' }}
                        className="relative overflow-hidden rounded-[2rem] p-6 border border-amber-100 bg-gradient-to-br from-amber-50 to-amber-100/50 transition-all duration-300 group hover:shadow-xl hover:-translate-y-1 hover:border-transparent animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
                    >
                        <DollarSign className="absolute -bottom-4 -left-4 w-32 h-32 text-amber-500/10 rotate-12 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" strokeWidth={1.5} />

                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm bg-amber-500 text-white group-hover:scale-110 transition-transform duration-300">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                            </div>
                            <div>
                                <p className="text-amber-600/80 font-medium text-sm mb-1">إجمالي الإيرادات</p>
                                <h3 className="text-3xl font-bold text-amber-900 mb-4">{(totalRevenue / 1000000).toFixed(1)}M</h3>
                                {/* Progress Bar */}
                                <div className="w-full h-1.5 bg-amber-200/50 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 w-1/2 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Today Appointments (Purple) */}
                <div
                    style={{ animationDelay: '400ms' }}
                    className="relative overflow-hidden rounded-[2rem] p-6 border border-purple-100 bg-gradient-to-br from-purple-50 to-purple-100/50 transition-all duration-300 group hover:shadow-xl hover:-translate-y-1 hover:border-transparent animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
                >
                    <Calendar className="absolute -bottom-4 -left-4 w-32 h-32 text-purple-500/10 rotate-12 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" strokeWidth={1.5} />

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm bg-purple-500 text-white group-hover:scale-110 transition-transform duration-300">
                                <Calendar className="w-6 h-6" />
                            </div>
                        </div>
                        <div>
                            <p className="text-purple-600/80 font-medium text-sm mb-1">مواعيد اليوم</p>
                            <h3 className="text-3xl font-bold text-purple-900 mb-4">{todayAppointments}</h3>
                            {/* Progress Bar */}
                            <div className="w-full h-1.5 bg-purple-200/50 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 w-full rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* 3. Notifications & Clinics Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Notifications (Enhanced with Clinic Name) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Bell className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">الإشعارات الحديثة</h3>
                                <p className="text-xs text-gray-600">{isStaff ? 'تنبيهات العيادة' : 'آخر التحديثات والتنبيهات'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {notificationsLoading ? (
                                <p className="text-center text-gray-500 py-4">جاري تحميل الإشعارات...</p>
                            ) : recentNotifications.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">لا توجد إشعارات حديثة</p>
                            ) : (
                                recentNotifications.map((notification) => {
                                    const IconComponent = notification.icon;
                                    return (
                                        <div key={notification.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100" onClick={() => navigate('/doctor/notifications')}>
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${notification.color === 'blue' ? 'bg-blue-100' :
                                                notification.color === 'green' ? 'bg-green-100' : 'bg-yellow-100'
                                                } `}>
                                                <IconComponent className={`w-4 h-4 ${notification.color === 'blue' ? 'text-blue-600' :
                                                    notification.color === 'green' ? 'text-green-600' : 'text-yellow-600'
                                                    } `} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
                                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200 whitespace-nowrap">
                                                        {(notification as any).clinicName || (notification.clinicId?.toString() === '102' ? 'مركز الابتسامة الرقمي' : 'عيادة النور التخصصية')}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    <NotificationContent text={notification.description} />
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-xs text-gray-400">{notification.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <button onClick={() => navigate('/doctor/notifications')} className="w-full mt-4 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
                            عرض الكل
                        </button>
                    </div>
                </div>

                {/* Clinics Summary - Only show if Owner or Single Clinic Info for Staff (Without Revenue) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{isStaff ? 'أداء العيادة' : 'ملخص العيادات'}</h3>
                                <p className="text-xs text-gray-600">{isStaff ? 'نظرة عامة' : `أداء العيادات (${clinics.length})`}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {clinicStats.filter(c => isRelevant(c.id)).map((clinic) => (
                                <div
                                    key={clinic.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                                    onClick={() => navigate(`/doctor/clinic/${clinic.id}`)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <Building2 className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">{clinic.name}</p>
                                            <p className="text-xs text-gray-600">{clinic.patients} مريض</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {/* Hide Revenue for Staff */}
                                        {!isStaff && <p className="font-bold text-gray-900 text-sm">{(clinic.revenue / 1000).toFixed(0)}K د.ع</p>}
                                        <div className={`inline-block px-2 py-1 rounded-full text-xs ${clinic.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            } `}>
                                            {clinic.status === 'active' ? 'نشطة' : 'صيانة'}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Purchase Suggestions & Activities (Adjusted Layout for Staff) */}
            <div className={`grid grid-cols-1 ${!isStaff ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-6`}>
                {/* Purchase Suggestions (Enhanced with Clinic Name) - OWNER ONLY or AUTHORED Staff */}
                {/* Hiding for Staff as per typical 'Review' flow, or keep if they manage inventory. User said 'Only clinic stats'. Let's hide Suggestions if simplifies view, OR allow if relevant. Let's hide for now to match 'Owner manages money/purchases' vibe unless specifically asked. But wait, Staff might need to order? I'll hide it for simplified view per request 'Overview shows ONLY clinic stats'. */}
                {!isStaff && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-pink-50 to-pink-100 px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                                    <ShoppingCart className="w-5 h-5 text-pink-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">اقتراحات الشراء</h3>
                                    <p className="text-xs text-gray-600">نواقص المخزون في العيادات</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="space-y-4">
                                    {lowStockLoading ? (
                                        <div className="text-center py-4 text-gray-500 text-sm">جاري تحميل الاقتراحات...</div>
                                    ) : filteredLowStock.length === 0 ? (
                                        <div className="text-center py-4 text-gray-500 text-sm">لا توجد نواقص في المخزون لهذه العيادة</div>
                                    ) : (
                                        filteredLowStock.slice(0, 5).map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                                                onClick={() => navigate(`/doctor/clinic/${(item as any).clinicId || '1'}?tab=inventory`)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                                        <CircleAlert className="w-4 h-4 text-yellow-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full border border-pink-100 whitespace-nowrap inline-block">
                                                                {(item as any).clinicName || `عيادة ${(item as any).clinicId}`}
                                                            </span>
                                                            <span className="text-[10px] text-gray-500">
                                                                الحد الأدنى: {item.minStock}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`inline-block px-2 py-1 rounded-full text-xs mb-1 bg-red-100 text-red-700`}>
                                                        كمية حرجة
                                                    </div>
                                                    <p className="text-xs text-gray-600">{item.quantity} {item.unit}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Activities (Enhanced with Owner/Staff Logic) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <Activity className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">النشاطات الأخيرة</h3>
                                <p className="text-xs text-gray-600">{!isStaff ? 'جميع نشاطات العيادات' : 'نشاطات عيادتي'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            <div className="space-y-4">
                                {activitiesLoading ? (
                                    <p className="text-center text-gray-500 py-4">جاري تحميل النشاطات...</p>
                                ) : filteredActivities.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                                        onClick={() => {
                                            const clinicId = (activity as any).clinicId || '1';
                                            let tab = 'overview';

                                            if (activity.type === 'appointment') tab = 'appointments';
                                            if (activity.type === 'inventory') tab = 'inventory'; // Fixed to inventory
                                            navigate(`/doctor/clinic/${clinicId}?tab=${tab}`);
                                        }}
                                    >
                                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <activity.icon className={`w-4 h-4 ${activity.color === 'blue' ? 'text-blue-600' : 'text-indigo-600'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                                                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100 whitespace-nowrap">
                                                    {(activity as any).clinicName || (activity.clinicId?.toString() === '102' ? 'مركز الابتسامة الرقمي' : 'عيادة النور التخصصية')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                                            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    </div>
                                ))}
                                {!activitiesLoading && activities.length === 0 && (
                                    <div className="text-center py-4 text-gray-500 text-sm">لا توجد نشاطات حديثة</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            {/* 5. Additional Services (Now Linked) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Settings className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">الخدمات الإضافية</h3>
                            <p className="text-xs text-gray-600">موارد وأدوات إضافية</p>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Community */}
                        <div
                            onClick={() => navigate('/community')}
                            className="p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl hover:shadow-lg transition-all text-right group cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-1">المجتمع الطبي</h4>
                                    <p className="text-xs text-gray-600">تواصل مع الزملاء</p>
                                </div>
                                <MessageCircle className="w-10 h-10 text-cyan-600 group-hover:scale-110 transition-transform" />
                            </div>
                            <p className="text-sm text-gray-700 mb-4">شارك الخبرات والمعرفة مع زملائك الأطباء</p>
                            <button className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500 text-white rounded-full text-xs font-medium hover:bg-cyan-600 transition-colors">
                                <Eye className="w-3 h-3" />
                                عرض
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>

                        {/* Store */}
                        <div
                            onClick={() => navigate('/store')}
                            className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl hover:shadow-lg transition-all text-right group cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-1">المتجر الطبي</h4>
                                    <p className="text-xs text-gray-600">مستلزمات وأدوات</p>
                                </div>
                                <Store className="w-10 h-10 text-amber-600 group-hover:scale-110 transition-transform" />
                            </div>
                            <p className="text-sm text-gray-700 mb-4">احصل على المعدات والمستلزمات الطبية</p>
                            <button className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-medium hover:bg-amber-600 transition-colors">
                                <Eye className="w-3 h-3" />
                                عرض
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>

                        {/* Jobs */}
                        <div
                            onClick={() => navigate('/jobs')}
                            className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl hover:shadow-lg transition-all text-right group cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-1">التوظيف</h4>
                                    <p className="text-xs text-gray-600">فرص عمل طبية</p>
                                </div>
                                <Briefcase className="w-10 h-10 text-indigo-600 group-hover:scale-110 transition-transform" />
                            </div>
                            <p className="text-sm text-gray-700 mb-4">ابحث عن مساعدين أو فرص عمل جديدة</p>
                            <button className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500 text-white rounded-full text-xs font-medium hover:bg-indigo-600 transition-colors">
                                <Eye className="w-3 h-3" />
                                عرض
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. Subscription (Moved to Bottom) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                            <Star className="w-5 h-5 text-cyan-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">الاشتراكات والعروض</h3>
                            <p className="text-xs text-gray-600">حالة باقتك الحالية</p>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-right flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-full flex items-center justify-center">
                                <Star className="w-8 h-8 text-cyan-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg mb-1">{subscriptionInfo.currentPlan}</h4>
                                <div className="flex items-center gap-2">
                                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${subscriptionInfo.status === 'نشطة' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {subscriptionInfo.status}
                                    </div>
                                    <span className="text-xs text-gray-500">ينتهي في {subscriptionInfo.expiryDate}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3">
                            {subscriptionInfo.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        {subscription?.status !== 'approved' && (
                            <button
                                onClick={() => navigate('/doctor/subscription/upgrade')}
                                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium px-6 py-3 rounded-lg hover:shadow-md transition-all flex items-center gap-2"
                            >
                                <Zap className="w-4 h-4" />
                                {subscription?.status === 'pending' ? 'عرض حالة الطلب' : 'ترقية الباقة'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

        </div >
    );
};
