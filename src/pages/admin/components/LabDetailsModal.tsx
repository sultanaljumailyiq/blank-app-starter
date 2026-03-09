import React, { useState, useEffect } from 'react';
import { AdminModal } from '../../../components/admin/AdminModal';
import { Laboratory } from '../../../hooks/useAdminLabs';
import { Button } from '../../../components/common/Button';
import { supabase } from '../../../lib/supabase';
import {
    TestTube,
    MapPin,
    Phone,
    User,
    DollarSign,
    List,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
    Package,
    Building2,
    ShieldCheck
} from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';
import { toast } from 'sonner';

interface LabDetailsModalProps {
    lab: Laboratory | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdateStatus: (id: string, status: 'active' | 'suspended' | 'rejected' | 'pending', reason?: string) => void;
    onClearCommission: (labId: string) => void;
}

export const LabDetailsModal: React.FC<LabDetailsModalProps> = ({
    lab,
    isOpen,
    onClose,
    onUpdateStatus,
    onClearCommission
}) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'finance' | 'prices' | 'orders' | 'settlements'>('profile');

    const [services, setServices] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        if (isOpen && lab) {
            fetchLabDetails();
        }
    }, [isOpen, lab]);

    const fetchLabDetails = async () => {
        if (!lab) return;
        setLoadingData(true);
        try {
            // Fetch Services
            // Note: Checking table name, assuming 'dental_lab_services' or 'lab_services'
            // Based on standard naming: dental_lab_services
            const { data: servicesData } = await supabase
                .from('dental_lab_services')
                .select('*')
                .eq('lab_id', lab.id);
            setServices(servicesData || []);

            // Fetch Orders
            const { data: ordersData } = await supabase
                .from('dental_lab_orders')
                .select('*')
                .eq('laboratory_id', lab.id)
                .order('created_at', { ascending: false })
                .limit(20);
            setOrders(ordersData || []);

        } catch (error) {
            console.error('Error fetching lab details:', error);
        } finally {
            setLoadingData(false);
        }
    };

    if (!lab) return null;

    // Calculations
    const commissionAmount = (lab.totalRevenue * lab.commissionPercentage) / 100;
    const netProfit = lab.totalRevenue - commissionAmount;

    const tabs = [
        { id: 'profile', label: 'الملف الشخصي', icon: Building2 },
        { id: 'finance', label: 'المالية والعمولات', icon: DollarSign },
        { id: 'prices', label: 'الأسعار', icon: Package },
        { id: 'orders', label: 'الطلبات', icon: List },
        { id: 'settlements', label: 'التسويات', icon: FileText },
    ];

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={`تفاصيل المختبر: ${lab.name}`}
            size="xl"
        >
            <div className="flex flex-col h-[70vh]">
                {/* Tabs Header ... */}
                <div className="flex gap-2 border-b border-gray-200 pb-2 mb-4 overflow-x-auto shrink-0">
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

                <div className="flex-1 overflow-y-auto pr-2">
                    {/* ... Profile Tab ... */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            {/* Header Card */}
                            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-16 h-16 bg-white rounded-lg border flex items-center justify-center text-blue-500 font-bold text-2xl overflow-hidden">
                                    {lab.logo ? (
                                        <img src={lab.logo} alt={lab.name} className="w-full h-full object-cover" />
                                    ) : (
                                        lab.name.charAt(0)
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{lab.name}</h3>
                                            <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {lab.address}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                                <span>{lab.governorate}</span>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${lab.status === 'active' ? 'bg-green-100 text-green-700' :
                                            lab.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {lab.status === 'active' ? 'نشط' : lab.status === 'pending' ? 'بانتظار التفعيل' : 'معلق'}
                                        </span>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${lab.isVerified ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            <ShieldCheck className="w-4 h-4" /> {lab.isVerified ? 'موثق' : 'غير موثق'}
                                        </span>
                                        {lab.isAccredited && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                                <CheckCircle className="w-4 h-4" /> معتمد
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Info Grids */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Owner Info */}
                                <div className="p-4 border rounded-xl bg-white">
                                    <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-900">
                                        <User className="w-4 h-4" /> معلومات المالك
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between border-b border-gray-50 pb-2">
                                            <span className="text-gray-500">الاسم الكامل</span>
                                            <span className="font-medium">{lab.ownerName}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-50 pb-2">
                                            <span className="text-gray-500">رقم الهاتف</span>
                                            <span className="font-medium" dir="ltr">{lab.phone}</span>
                                        </div>
                                        <div className="flex justify-between pt-1">
                                            <span className="text-gray-500">البريد الإلكتروني</span>
                                            <span className="font-medium">{lab.email}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* System Info */}
                                <div className="p-4 border rounded-xl bg-white">
                                    <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-900">
                                        <ShieldCheck className="w-4 h-4" /> معلومات النظام
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between border-b border-gray-50 pb-2">
                                            <span className="text-gray-500">تاريخ الانضمام</span>
                                            <span className="font-medium">{new Date(lab.joinDate).toLocaleDateString('ar-IQ')}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-50 pb-2">
                                            <span className="text-gray-500">عدد الطلبات</span>
                                            <span className="font-medium">{orders.length} طلب</span>
                                        </div>
                                        <div className="flex justify-between pt-1">
                                            <span className="text-gray-500">نسبة العمولة الحالية</span>
                                            <span className="font-bold text-purple-600">{lab.commissionPercentage}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="bg-white border rounded-xl p-4">
                                <h4 className="font-bold text-gray-900 mb-4">إجراءات الحساب</h4>
                                <div className="flex flex-wrap gap-3">
                                    {/* Action Buttons */}
                                    {lab.status === 'pending' && (
                                        <div className="flex gap-2 w-full">
                                            <Button
                                                className="bg-green-600 hover:bg-green-700 flex-1"
                                                onClick={() => onUpdateStatus(lab.id, 'active')}
                                            >
                                                <CheckCircle className="w-4 h-4 ml-2" />
                                                تفعيل الحساب
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="border-red-200 text-red-600 hover:bg-red-50 flex-1"
                                                onClick={() => onUpdateStatus(lab.id, 'rejected')}
                                            >
                                                <XCircle className="w-4 h-4 ml-2" />
                                                رفض
                                            </Button>
                                        </div>
                                    )}

                                    {lab.status === 'active' && (
                                        <Button
                                            variant="outline"
                                            className="border-red-200 text-red-600 hover:bg-red-50 w-full"
                                            onClick={() => onUpdateStatus(lab.id, 'suspended')}
                                        >
                                            <AlertCircle className="w-4 h-4 ml-2" />
                                            تعليق الحساب
                                        </Button>
                                    )}

                                    {lab.status === 'suspended' && (
                                        <Button
                                            className="bg-green-600 hover:bg-green-700 w-full"
                                            onClick={() => onUpdateStatus(lab.id, 'active')}
                                        >
                                            <CheckCircle className="w-4 h-4 ml-2" />
                                            إعادة تفعيل الحساب
                                        </Button>
                                    )}

                                    {/* Accredit Button */}
                                    {lab.isAccredited ? (
                                        <Button
                                            variant="outline"
                                            className="border-purple-200 text-purple-600 hover:bg-purple-50"
                                            onClick={async () => {
                                                try {
                                                    await supabase.rpc('toggle_lab_activation', {
                                                        p_lab_id: lab.id,
                                                        p_action: 'unaccredit',
                                                        p_admin_id: null
                                                    });
                                                    toast.success('تم إلغاء اعتماد المختبر');
                                                    onClose();
                                                } catch (err) {
                                                    toast.error('حدث خطأ');
                                                }
                                            }}
                                        >
                                            <CheckCircle className="w-4 h-4 ml-2" />
                                            إلغاء الاعتماد
                                        </Button>
                                    ) : (
                                        <Button
                                            className="bg-purple-600 hover:bg-purple-700"
                                            onClick={async () => {
                                                try {
                                                    await supabase.rpc('toggle_lab_activation', {
                                                        p_lab_id: lab.id,
                                                        p_action: 'accredit',
                                                        p_admin_id: null
                                                    });
                                                    toast.success('تم اعتماد المختبر بنجاح');
                                                    onClose();
                                                } catch (err) {
                                                    toast.error('حدث خطأ');
                                                }
                                            }}
                                        >
                                            <CheckCircle className="w-4 h-4 ml-2" />
                                            اعتماد المختبر
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Additional Profile Details Section */}
                        </div>
                    )}

                    {/* ... Finance Tab (keep as is or small update) ... */}
                    {activeTab === 'finance' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <p className="text-sm text-blue-600 mb-1">إجمالي الإيرادات</p>
                                    <h3 className="text-xl font-bold text-blue-700">{formatCurrency(lab.totalRevenue)}</h3>
                                </div>
                                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                    <p className="text-sm text-green-600 mb-1">صافي للمختبر</p>
                                    <h3 className="text-xl font-bold text-green-700">{formatCurrency(netProfit)}</h3>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                    <p className="text-sm text-purple-600 mb-1">إجمالي العمولة</p>
                                    <h3 className="text-xl font-bold text-purple-700">{formatCurrency(commissionAmount)}</h3>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                    <p className="text-sm text-orange-600 mb-1">العمولة (هذا الشهر)</p>
                                    <h3 className="text-xl font-bold text-orange-700">{formatCurrency(lab.pendingCommission)}</h3>
                                </div>
                            </div>

                            <div className="bg-white border rounded-xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="font-bold text-gray-900">تصفية المستحقات</h4>
                                        <p className="text-sm text-gray-500">تصفية عمولة المنصة المستحقة لهذا الشهر ({formatCurrency(lab.pendingCommission)})</p>
                                    </div>
                                    <Button onClick={() => onClearCommission(lab.id)} className="bg-purple-600 hover:bg-purple-700">
                                        <DollarSign className="w-4 h-4 ml-2" />
                                        تصفية العمولة الآن
                                    </Button>
                                </div>
                                <div className="flex gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-gray-400" />
                                    <p>عند الضغط على تصفية العمولة، سيتم تصفير عمولة هذا الشهر وترحيلها إلى سجل التسويات.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'prices' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-gray-900">قائمة الخدمات والأسعار</h3>
                                <Button size="sm" variant="outline">تحديث الأسعار</Button>
                            </div>
                            <div className="border rounded-xl overflow-hidden">
                                <table className="w-full text-sm text-right">
                                    <thead className="bg-gray-50 text-gray-500 font-medium">
                                        <tr>
                                            <th className="p-3">اسم الخدمة</th>
                                            <th className="p-3">مدة العمل (أيام)</th>
                                            <th className="p-3">السعر</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {loadingData ? (
                                            <tr><td colSpan={3} className="p-4 text-center">جاري التحميل...</td></tr>
                                        ) : services.length === 0 ? (
                                            <tr><td colSpan={3} className="p-4 text-center text-gray-500">لا توجد خدمات مسجلة</td></tr>
                                        ) : services.map((svc, i) => (
                                            <tr key={i} className="hover:bg-gray-50">
                                                <td className="p-3 font-medium">{svc.name}</td>
                                                <td className="p-3">{svc.duration || svc.days || '-'} أيام</td>
                                                <td className="p-3 font-bold text-green-600">{formatCurrency(svc.price)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900">سجل الطلبات الحديثة</h3>
                            <div className="border rounded-xl overflow-hidden">
                                <table className="w-full text-sm text-right">
                                    <thead className="bg-gray-50 text-gray-500 font-medium">
                                        <tr>
                                            <th className="p-3">رقم الطلب</th>
                                            <th className="p-3">المريض</th>
                                            <th className="p-3">الخدمة</th>
                                            <th className="p-3">التاريخ</th>
                                            <th className="p-3">الحالة</th>
                                            <th className="p-3">السعر</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {loadingData ? (
                                            <tr><td colSpan={6} className="p-4 text-center">جاري التحميل...</td></tr>
                                        ) : orders.length === 0 ? (
                                            <tr><td colSpan={6} className="p-4 text-center text-gray-500">لا توجد طلبات لهذا المختبر</td></tr>
                                        ) : orders.map(order => (
                                            <tr key={order.id} className="hover:bg-gray-50">
                                                <td className="p-3 font-mono text-gray-600">{order.id.slice(0, 8)}</td>
                                                <td className="p-3">{order.patient_name}</td>
                                                <td className="p-3">{order.service_name}</td>
                                                <td className="p-3">{new Date(order.created_at).toLocaleDateString('ar-IQ')}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 font-bold text-gray-900">{(order.price || 0).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settlements' && (
                        <LabSettlementsTab labId={lab.id} />
                    )}
                </div>
            </div>
        </AdminModal>
    );
};

// Settlements Component adapted for Labs
const LabSettlementsTab = ({ labId }: { labId: string }) => {
    const [settlements, setSettlements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettlements = async () => {
            const { data } = await supabase
                .from('financial_transactions')
                .select('*')
                .eq('lab_id', labId)
                .eq('category', 'commission_clearance')
                .order('transaction_date', { ascending: false });

            if (data) setSettlements(data);
            setLoading(false);
        };
        fetchSettlements();
    }, [labId]);

    if (loading) return <div className="p-4 text-center">جاري التحميل...</div>;

    if (settlements.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>لا توجد تسويات سابقة لهذا المختبر</p>
                <p className="text-xs text-gray-400 mt-2">عمليات تصفية العمولة ستظهر هنا</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-gray-900">سجل التسويات المالية</h3>
            <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-sm text-right">
                    <thead className="bg-gray-50 text-gray-600 font-medium">
                        <tr>
                            <th className="p-3">رقم العملية</th>
                            <th className="p-3">التاريخ</th>
                            <th className="p-3">المبلغ</th>
                            <th className="p-3">الوصف</th>
                            <th className="p-3">الحالة</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {settlements.map((tx) => (
                            <tr key={tx.id}>
                                <td className="p-3 font-mono text-gray-500">#{tx.id.substring(0, 8)}</td>
                                <td className="p-3">{new Date(tx.transaction_date).toLocaleDateString('ar-IQ')}</td>
                                <td className="p-3 font-bold text-green-600">{formatCurrency(tx.amount)}</td>
                                <td className="p-3 text-gray-600">{tx.description}</td>
                                <td className="p-3">
                                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs flex items-center w-fit gap-1">
                                        <CheckCircle className="w-3 h-3" /> تم التحويل
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
