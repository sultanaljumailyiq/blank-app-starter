import React, { useState, useEffect } from 'react';
import { AdminModal } from '../../../components/admin/AdminModal';
import { Button } from '../../../components/common/Button';
import { supabase } from '../../../lib/supabase';
import {
    Users,
    CreditCard,
    Building2,
    Calendar,
    Eye,
    Activity,
    Phone,
    Mail,
    MapPin,
    ShieldCheck,
    Ban,
    CheckCircle,
    Star,
    Zap,
    XCircle
} from 'lucide-react';
import { ClinicDetailsModal } from './ClinicDetailsModal';
import { toast } from 'sonner';

interface OwnerDetailsModalProps {
    ownerId: string;
    isOpen: boolean;
    onClose: () => void;
}

export const OwnerDetailsModal: React.FC<OwnerDetailsModalProps> = ({
    ownerId,
    isOpen,
    onClose
}) => {
    const [loading, setLoading] = useState(true);
    const [ownerData, setOwnerData] = useState<any>(null);
    const [clinics, setClinics] = useState<any[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'profile' | 'clinics' | 'subscriptions'>('profile');
    const [activeSubscription, setActiveSubscription] = useState<any>(null);
    const [pendingSubscription, setPendingSubscription] = useState<any>(null);
    const [lastCancelledSubscription, setLastCancelledSubscription] = useState<any>(null);

    // Clinic Details Modal State
    const [selectedClinic, setSelectedClinic] = useState<any>(null);
    const [showClinicModal, setShowClinicModal] = useState(false);

    useEffect(() => {
        if (isOpen && ownerId) {
            fetchOwnerDetails();
        }
    }, [isOpen, ownerId]);

    const fetchOwnerDetails = async () => {
        setLoading(true);
        try {
            // 1. Fetch Profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', ownerId)
                .single();
            setOwnerData(profile);

            // 2. Fetch Clinics (by owner_id)
            console.log('Fetching clinics for ownerId:', ownerId);
            const { data: userClinics, error: clinicsError } = await supabase
                .from('clinics')
                .select('*')
                .eq('owner_id', ownerId);

            console.log('Clinics result:', { userClinics, clinicsError });
            if (clinicsError) console.error("Error fetching clinics", clinicsError);
            setClinics(userClinics || []);

            // 3. Fetch Subscriptions (Fix: Explicit FK relationship)
            console.log('Fetching subscriptions for ownerId:', ownerId);
            const { data: subs, error: subsError } = await supabase
                .from('subscription_requests')
                .select('*, plan:subscription_plans!plan_id(*)') // Explicit FK: plan_id
                .eq('doctor_id', ownerId)
                .order('created_at', { ascending: false });

            console.log('Subscriptions Result:', { subs, subsError });

            if (subsError) console.error("Error fetching subs", subsError);

            setSubscriptions(subs || []);

            // Determine Subscription States
            const active = subs?.find((s: any) => s.status === 'approved');
            const pending = subs?.find((s: any) => s.status === 'pending');
            const cancelled = subs?.find((s: any) => s.status === 'cancelled');

            setActiveSubscription(active || null);
            setPendingSubscription(pending || null);
            setLastCancelledSubscription(cancelled || null);

        } catch (error) {
            console.error('Error fetching owner details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewClinic = (clinic: any) => {
        setSelectedClinic({
            ...clinic,
            ownerName: ownerData?.full_name,
            ownerPhone: ownerData?.phone
        });
        setShowClinicModal(true);
    };

    const handleUpdateAccountStatus = async (status: 'active' | 'suspended') => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ account_status: status })
                .eq('id', ownerId);

            if (error) throw error;

            toast.success(`تم ${status === 'active' ? 'تفعيل' : 'تعليق'} الحساب بنجاح`);
            fetchOwnerDetails();
        } catch (e) {
            console.error(e);
            toast.error('حدث خطأ أثناء تحديث حالة الحساب');
        }
    };

    const handleToggleSubscription = async (requestId: string, action: 'activate' | 'cancel') => {
        try {
            const newStatus = action === 'activate' ? 'approved' : 'cancelled';
            const { error } = await supabase
                .from('subscription_requests')
                .update({ status: newStatus })
                .eq('id', requestId);

            if (error) throw error;

            toast.success(`تم ${action === 'activate' ? 'تفعيل' : 'إلغاء'} الاشتراك بنجاح`);
            fetchOwnerDetails();
        } catch (e) {
            console.error(e);
            toast.error('حدث خطأ أثناء تحديث الاشتراك');
        }
    };

    if (!isOpen) return null;

    const tabs = [
        { id: 'profile', label: 'الملف الشخصي', icon: Users },
        { id: 'clinics', label: 'العيادات', icon: Building2 },
        { id: 'subscriptions', label: 'الاشتراكات والطلبات', icon: CreditCard },
    ];

    // Determine badges
    // Fix: Default account status to 'active' if not set, not 'pending'
    const accountStatus = ownerData?.account_status || 'active';

    // Subscription status logic
    const subStatus = activeSubscription ? 'active' : pendingSubscription ? 'pending' : 'free';
    let planName = 'الباقة المجانية';
    if (activeSubscription?.plan?.name) {
        planName = activeSubscription.plan.name;
    } else if (pendingSubscription) {
        const pName = pendingSubscription.plan?.name || '...';
        planName = `${pName} (قيد الانتظار)`;
    }

    return (
        <>
            <AdminModal
                isOpen={isOpen}
                onClose={onClose}
                title="تفاصيل الطبيب / مالك العيادة"
                size="xl"
            >
                {loading ? (
                    <div className="p-12 text-center text-gray-500">جاري تحميل البيانات...</div>
                ) : (
                    <div className="flex flex-col h-[60vh]">
                        {/* Status Badges Header */}
                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                            <div className="flex gap-4">
                                {/* Account Status Badge */}
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${accountStatus === 'active' ? 'bg-green-50 border-green-200 text-green-700' :
                                    accountStatus === 'suspended' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                                    }`}>
                                    {accountStatus === 'active' ? <CheckCircle className="w-4 h-4" /> :
                                        accountStatus === 'suspended' ? <Ban className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                                    <span className="font-bold text-sm">
                                        {accountStatus === 'active' ? 'حساب نشط' :
                                            accountStatus === 'suspended' ? 'حساب معلق' : 'قيد المراجعة'}
                                    </span>
                                </div>

                                {/* Subscription Badge */}
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${subStatus === 'active' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                                    subStatus === 'pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                        'bg-gray-100 border-gray-200 text-gray-600'
                                    }`}>
                                    <Star className="w-4 h-4" />
                                    <span className="font-bold text-sm">{planName}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 border-b border-gray-200 p-2 bg-white sticky top-0 z-10">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Avatar & Basic Info */}
                                        <div className="w-full md:w-1/3 flex flex-col items-center text-center p-6 border border-gray-100 rounded-2xl bg-gray-50/50">
                                            <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-md flex items-center justify-center text-blue-600 font-bold text-3xl overflow-hidden mb-4 relative">
                                                {ownerData?.avatar_url ? (
                                                    <img src={ownerData.avatar_url} alt={ownerData?.full_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                                                        {ownerData?.full_name?.charAt(0) || 'D'}
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">{ownerData?.full_name}</h3>
                                            <p className="text-gray-500">{ownerData?.specialization || 'طبيب أسنان'}</p>
                                        </div>

                                        {/* Contact Info */}
                                        <div className="w-full md:w-2/3 bg-white border border-gray-100 rounded-2xl p-6">
                                            <h4 className="font-bold text-gray-900 mb-4 pb-2 border-b">معلومات التواصل</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <Phone className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <div className="text-xs text-gray-500">رقم الهاتف</div>
                                                        <div className="font-medium" dir="ltr">{ownerData?.phone || '-'}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <Mail className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <div className="text-xs text-gray-500">البريد الإلكتروني</div>
                                                        <div className="font-medium">{ownerData?.email || '-'}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <MapPin className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <div className="text-xs text-gray-500">العنوان</div>
                                                        <div className="font-medium">{ownerData?.governorate || ownerData?.city || 'بغداد'}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <Calendar className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <div className="text-xs text-gray-500">تاريخ الانضمام</div>
                                                        <div className="font-medium">{new Date(ownerData?.created_at || Date.now()).toLocaleDateString('ar-IQ')}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ACTIONS SECTION */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                                        {/* Account Actions */}
                                        <div className="bg-white border text-center border-gray-200 rounded-xl p-5 shadow-sm">
                                            <h4 className="font-bold text-gray-900 mb-2">إجراءات الحساب (Login)</h4>
                                            <p className="text-xs text-gray-500 mb-4 h-8">تحكم في إمكانية دخول الطبيب للنظام</p>

                                            {accountStatus === 'active' ? (
                                                <Button
                                                    onClick={() => handleUpdateAccountStatus('suspended')}
                                                    className="w-full bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                                                    variant="outline"
                                                >
                                                    <Ban className="w-4 h-4 ml-2" />
                                                    تعليق الحساب
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => handleUpdateAccountStatus('active')}
                                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    <CheckCircle className="w-4 h-4 ml-2" />
                                                    تفعيل الحساب
                                                </Button>
                                            )}
                                        </div>

                                        {/* Subscription Actions */}
                                        <div className="bg-white border text-center border-gray-200 rounded-xl p-5 shadow-sm">
                                            <h4 className="font-bold text-gray-900 mb-2">إجراءات الاشتراك (Subscription)</h4>
                                            <p className="text-xs text-gray-500 mb-4 h-8">تحكم في حالة الاشتراك والباقة الحالية</p>

                                            {activeSubscription ? (
                                                // Has active subscription - show cancel button
                                                <Button
                                                    onClick={() => handleToggleSubscription(activeSubscription.id, 'cancel')}
                                                    className="w-full bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200"
                                                    variant="outline"
                                                >
                                                    <XCircle className="w-4 h-4 ml-2" />
                                                    إلغاء الاشتراك الحالي ({activeSubscription?.plan?.name})
                                                </Button>
                                            ) : pendingSubscription ? (
                                                // Has pending subscription - show activate button
                                                <Button
                                                    onClick={() => handleToggleSubscription(pendingSubscription.id, 'activate')}
                                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                                                >
                                                    <CheckCircle className="w-4 h-4 ml-2" />
                                                    تفعيل الاشتراك ({pendingSubscription?.plan?.name})
                                                </Button>
                                            ) : lastCancelledSubscription ? (
                                                // Has cancelled subscription - allow reactivation
                                                <Button
                                                    onClick={() => handleToggleSubscription(lastCancelledSubscription.id, 'activate')}
                                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    <Zap className="w-4 h-4 ml-2" />
                                                    إعادة تفعيل الاشتراك ({lastCancelledSubscription?.plan?.name})
                                                </Button>
                                            ) : (
                                                // No subscriptions at all
                                                <div className="p-2 text-sm text-gray-500 bg-gray-50 rounded-lg">
                                                    لا يوجد اشتراك أو طلب حالياً.
                                                    <br />
                                                    الطبيب يستخدم الباقة المجانية.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'clinics' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-gray-900 border-r-4 border-blue-500 pr-3">
                                            العيادات المسجلة <span className="text-gray-400 font-normal text-sm">({clinics.length})</span>
                                        </h4>
                                    </div>

                                    <div className="space-y-3">
                                        {clinics.length > 0 ? (
                                            clinics.map(clinic => (
                                                <div key={clinic.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                                                <Building2 className="w-6 h-6" />
                                                            </div>
                                                            <div>
                                                                <h5 className="font-bold text-gray-900 text-lg">{clinic.name}</h5>
                                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                    <MapPin className="w-3 h-3" />
                                                                    {clinic.governorate && clinic.address ? `${clinic.governorate}، ${clinic.address}` : clinic.governorate || clinic.address || ''}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleViewClinic(clinic)}
                                                        >
                                                            <Eye className="w-4 h-4 ml-2" />
                                                            عرض التفاصيل
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-500">لا توجد عيادات مسجلة لهذا الطبيب</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'subscriptions' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-gray-900 border-r-4 border-purple-500 pr-3">
                                            سجل الاشتراكات والطلبات <span className="text-gray-400 font-normal text-sm">({subscriptions.length})</span>
                                        </h4>
                                    </div>

                                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                        {subscriptions.length > 0 ? (
                                            <table className="w-full text-sm text-right">
                                                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                                                    <tr>
                                                        <th className="px-5 py-4">تفاصيل الباقة</th>
                                                        <th className="px-5 py-4">تاريخ الطلب</th>
                                                        <th className="px-5 py-4">الحالة</th>
                                                        <th className="px-5 py-4">الإجراء</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 bg-white">
                                                    {subscriptions.map(sub => (
                                                        <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-5 py-4">
                                                                <div className="font-bold text-gray-900">{sub.plan?.name || 'Unknown Plan'}</div>
                                                                <div className="text-xs text-gray-500 font-mono mt-0.5">{sub.plan?.price?.monthly?.toLocaleString()} IQD</div>
                                                            </td>
                                                            <td className="px-5 py-4 text-gray-600">
                                                                {new Date(sub.created_at).toLocaleDateString('ar-IQ')}
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${sub.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                                    sub.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                        'bg-red-100 text-red-700'
                                                                    }`}>
                                                                    {sub.status === 'approved' ? 'نشط' :
                                                                        sub.status === 'pending' ? 'قيد الانتظار' : 'ملغي/مرفوض'}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                {sub.status === 'pending' ? (
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleToggleSubscription(sub.id, 'activate')}
                                                                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3"
                                                                    >
                                                                        تفعيل الاشتراك
                                                                    </Button>
                                                                ) : sub.status === 'approved' ? (
                                                                    <div className="text-xs text-green-600 flex items-center gap-1 font-bold">
                                                                        <CheckCircle className="w-3 h-3" />
                                                                        الاشتراك الحالي
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-gray-400 text-xs">-</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="p-12 text-center">
                                                <CreditCard className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                                <p className="text-gray-500">لا يوجد سجل اشتراكات أو طلبات لهذا الطبيب</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </AdminModal>

            {/* Reused Clinic Details Modal */}
            <ClinicDetailsModal
                clinic={selectedClinic}
                isOpen={showClinicModal}
                onClose={() => setShowClinicModal(false)}
            />
        </>
    );
};

