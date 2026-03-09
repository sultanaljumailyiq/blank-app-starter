import React, { useState, useEffect } from 'react';
import { Card } from '../../../../components/common/Card';
import { Button } from '../../../../components/common/Button';
import { useAdminData } from '../../../../hooks/useAdminData';
import {
    Users,
    Building2,
    Package,
    Clock,
    Eye,
    CheckCircle,
    XCircle,
    UserCheck,
    Stethoscope,
    CreditCard,
    TestTube
} from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import { toast } from 'sonner';

// Import Modals
import { OwnerDetailsModal } from '../../../admin/components/OwnerDetailsModal';
import { LabDetailsModal } from '../../../admin/components/LabDetailsModal';
import { SupplierDetailModal } from '../../../admin/components/SupplierDetailModal';
import { SubscriptionReviewModal } from '../../../admin/components/SubscriptionReviewModal';

export const PendingRequestsManager = () => {
    const { loading: dataLoading } = useAdminData(); // refreshData removed

    const [subscriptionRequests, setSubscriptionRequests] = useState<any[]>([]);
    const [accountRequests, setAccountRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [modalType, setModalType] = useState<'doctor' | 'lab' | 'supplier' | null>(null);

    // Owner Details
    const [showOwnerDetails, setShowOwnerDetails] = useState(false);
    const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            // 1. Fetch Subscription Requests (Doctors)
            const { data: subs } = await supabase
                .from('subscription_requests')
                .select('*')
                .eq('status', 'pending');

            // 2. Fetch Pending Labs
            const { data: labs } = await supabase
                .from('dental_laboratories')
                .select('*')
                .eq('account_status', 'pending');

            // 3. Fetch Pending Suppliers
            const { data: suppliers } = await supabase
                .from('suppliers')
                .select('*')
                .eq('status', 'pending');

            const formattedSubs = (subs || []).map(r => ({
                ...r,
                doctorName: r.doctor_name || 'Unknown',
                clinicName: r.clinic_name || 'Unknown',
                phone: r.phone || '',
                email: r.email || '',
                requestedPlan: r.plan_id === 'plan-3' ? 'الباقة الشاملة' : r.plan_id === 'plan-2' ? 'الباقة المتقدمة' : 'الباقة الأساسية',
                paymentMethod: r.payment_method,
                user_id: r.user_id
            }));

            setSubscriptionRequests(formattedSubs || []);

            const formattedLabs = (labs || []).map(l => ({ ...l, type: 'lab', requestDate: l.created_at }));
            const formattedSuppliers = (suppliers || []).map(s => ({ ...s, type: 'supplier', requestDate: s.created_at }));

            setAccountRequests([
                ...formattedLabs,
                ...formattedSuppliers
            ].sort((a, b) => new Date(b.requestDate || '').getTime() - new Date(a.requestDate || '').getTime()));

        } catch (error) {
            console.error("Error fetching requests", error);
            toast.error("فشل تحميل الطلبات");
        } finally {
            setLoading(false);
        }
    };

    const handleApproveSubscription = async (id: string, planId: string) => {
        try {
            const { error } = await supabase
                .from('subscription_requests') // Mock table update
                .update({ status: 'approved' })
                .eq('id', id);

            if (error) throw error;
            toast.success('تم تفعيل اشتراك الطبيب بنجاح');
            fetchRequests();
        } catch (e) {
            console.error(e);
            toast.error('حدث خطأ أثناء تفعيل الاشتراك');
        }
    };

    const handleApproveAccount = async (id: string, type: 'lab' | 'supplier') => {
        try {
            if (type === 'lab') {
                const { data: { user } } = await supabase.auth.getUser();
                const { error } = await supabase.rpc('toggle_lab_activation', {
                    p_lab_id: id,
                    p_action: 'activate',
                    p_admin_id: user?.id
                });
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('suppliers')
                    .update({ status: 'approved' })
                    .eq('id', id);
                if (error) throw error;
            }

            toast.success(`تم تفعيل حساب ${type === 'lab' ? 'المختبر' : 'المورد'} بنجاح`);
            fetchRequests();
        } catch (e) {
            console.error(e);
            toast.error('حدث خطأ أثناء تفعيل الحساب');
        }
    };

    const handleViewDetails = (request: any) => {
        setSelectedRequest(request);
        setModalType(request.type);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'lab': return <TestTube className="w-5 h-5 text-purple-600" />;
            case 'supplier': return <Package className="w-5 h-5 text-green-600" />;
            default: return <Users className="w-5 h-5 text-gray-600" />;
        }
    };

    const getTypeName = (type: string) => {
        switch (type) {
            case 'lab': return 'مختبر أسنان';
            case 'supplier': return 'مورد مواد';
            default: return 'مستخدم';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Stats */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div>
                    <h3 className="font-bold text-lg text-gray-900">سجل الطلبات المعلقة</h3>
                    <p className="text-gray-500 text-sm">إدارة طلبات الاشتراكات وتفعيل الحسابات الجديدة</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-blue-50 px-4 py-2 rounded-lg text-blue-700 font-bold border border-blue-100">
                        {subscriptionRequests.length} اشتراكات
                    </div>
                    <div className="bg-orange-50 px-4 py-2 rounded-lg text-orange-700 font-bold border border-orange-100">
                        {accountRequests.length} حسابات جديدة
                    </div>
                </div>
            </div>

            {/* Section 1: Subscription Requests (Doctors) */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg"><CreditCard className="w-5 h-5 text-blue-600" /></div>
                    طلبات اشتراك الأطباء (الباقات)
                </h3>
                <Card className="overflow-hidden border border-gray-200 shadow-sm rounded-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase">
                                <tr>
                                    <th className="px-6 py-4">الطبيب / العيادة</th>
                                    <th className="px-6 py-4">الباقة المطلوبة</th>
                                    <th className="px-6 py-4">رقم الهاتف</th>
                                    <th className="px-6 py-4">تاريخ الطلب</th>
                                    <th className="px-6 py-4">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={5} className="text-center py-8">جاري التحميل...</td></tr>
                                ) : subscriptionRequests.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-8 text-gray-500">لا توجد طلبات اشتراك معلقة</td></tr>
                                ) : subscriptionRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{req.doctorName}</div>
                                            <div className="text-xs text-gray-500">{req.clinicName}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {req.plan_id === 'plan-3' ? 'Elite' : req.plan_id === 'plan-2' ? 'Pro' : 'Basic'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm" dir="ltr">{req.phone}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(req.created_at).toLocaleDateString('ar-IQ')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => { setSelectedRequest(req); setModalType('doctor'); }}
                                                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                                >
                                                    <Eye className="w-4 h-4 ml-1" />
                                                    عرض
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleApproveSubscription(req.id, req.plan_id)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                                >
                                                    <CheckCircle className="w-4 h-4 ml-1" />
                                                    تفعيل
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Section 2: Account Activation Requests (Labs & Suppliers) */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <div className="p-1.5 bg-orange-100 rounded-lg"><UserCheck className="w-5 h-5 text-orange-600" /></div>
                    طلبات انضمام الموردين والمختبرات
                </h3>
                <Card className="overflow-hidden border border-gray-200 shadow-sm rounded-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase">
                                <tr>
                                    <th className="px-6 py-4">مقدم الطلب</th>
                                    <th className="px-6 py-4">نوع الحساب</th>
                                    <th className="px-6 py-4">تاريخ الطلب</th>
                                    <th className="px-6 py-4">الحالة</th>
                                    <th className="px-6 py-4">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={5} className="text-center py-8">جاري التحميل...</td></tr>
                                ) : accountRequests.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-8 text-gray-500">لا توجد طلبات انضمام معلقة</td></tr>
                                ) : accountRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                                    {(req.logo_url || req.logo) ? (
                                                        <img src={req.logo_url || req.logo} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        getTypeIcon(req.type)
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{req.name || req.lab_name || req.companyName}</div>
                                                    <div className="text-xs text-gray-500" dir="ltr">{req.phone || req.phone_number}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700`}>
                                                {getTypeName(req.type)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(req.requestDate).toLocaleDateString('ar-IQ')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
                                                <Clock className="w-3 h-3" />
                                                بانتظار التفعيل
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleViewDetails(req)}
                                                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                                >
                                                    <Eye className="w-4 h-4 ml-1" />
                                                    مراجعة
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleApproveAccount(req.id, req.type)}
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    <CheckCircle className="w-4 h-4 ml-1" />
                                                    قبول
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Modals */}
            {modalType === 'doctor' && (
                <SubscriptionReviewModal
                    request={selectedRequest}
                    isOpen={true}
                    onClose={() => { setModalType(null); setSelectedRequest(null); }}
                    onApprove={(req) => { handleApproveSubscription(req.id, req.plan_id); setModalType(null); }}
                    onReject={() => { }} // Implement rejection logic if needed
                    onViewDoctor={async (req) => {
                        let ownerId = req.user_id || req.doctor_id;

                        // Fallback: Lookup user by email or phone if ID is missing (common with seed data)
                        if (!ownerId && (req.email || req.phone)) {
                            try {
                                // Try finding by email first
                                if (req.email) {
                                    const { data } = await supabase.from('users').select('id').eq('email', req.email);
                                    if (data && data.length > 0) ownerId = data[0].id;
                                }
                                // If not found, try phone
                                if (!ownerId && req.phone) {
                                    const { data } = await supabase.from('users').select('id').eq('phone_number', req.phone);
                                    if (data && data.length > 0) ownerId = data[0].id;
                                }
                            } catch (err) {
                                console.error("Error looking up user:", err);
                            }
                        }

                        if (ownerId) {
                            setSelectedOwnerId(ownerId);
                            setShowOwnerDetails(true);
                        } else {
                            toast.error("لم يتم العثور على حساب المستخدم المرتبط لهذا الطلب");
                        }
                    }}
                />
            )}

            {modalType === 'lab' && (
                <LabDetailsModal
                    lab={selectedRequest}
                    isOpen={true}
                    onClose={() => setModalType(null)}
                    onUpdateStatus={(id, status) => {
                        handleApproveAccount(id, 'lab');
                        setModalType(null);
                    }}
                    onClearCommission={() => { }}
                />
            )}

            {modalType === 'supplier' && (
                <SupplierDetailModal
                    supplier={selectedRequest}
                    isOpen={true}
                    onClose={() => setModalType(null)}
                    onUpdateStatus={(id, status) => {
                        handleApproveAccount(id, 'supplier');
                        setModalType(null);
                    }}
                    onClearCommission={() => { }}
                    onApprove={() => handleApproveAccount(selectedRequest.id, 'supplier')}
                    onReject={() => { }}
                />
            )}

            {/* Owner Details Modal */}
            {selectedOwnerId && (
                <OwnerDetailsModal
                    ownerId={selectedOwnerId}
                    isOpen={showOwnerDetails}
                    onClose={() => setShowOwnerDetails(false)}
                />
            )}

            {modalType === 'supplier' && (
                <SupplierDetailModal
                    supplier={selectedRequest}
                    isOpen={true}
                    onClose={() => setModalType(null)}
                    onUpdateStatus={(id, status) => {
                        if (status === 'approved') handleApproveAccount(id, 'supplier');
                        setModalType(null);
                    }}
                />
            )}
        </div>
    );
};
