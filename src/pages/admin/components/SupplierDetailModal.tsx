import React, { useState, useEffect } from 'react';
import { AdminModal } from '../../../components/admin/AdminModal';
import { supabase } from '../../../lib/supabase';
import { StoreProductsSection } from '../sections/StoreProductsSection';
import { StoreOrdersSection } from '../sections/StoreOrdersSection';
import { Supplier } from '../../../hooks/useAdminSuppliers';
import { Button } from '../../../components/common/Button';
import {
    Building2,
    MapPin,
    Mail,
    Phone,
    Calendar,
    ShieldCheck,
    DollarSign,
    Package,
    ShoppingCart,
    FileText,
    AlertCircle,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';

interface SupplierDetailModalProps {
    supplier: Supplier | any; // Allow any for now to avoid conflicts
    isOpen: boolean;
    onClose: () => void;
    onApprove?: (supplier: Supplier) => void;
    onReject?: (supplier: Supplier) => void;
    onClearCommission?: (supplierId: string) => void;
    onUpdateStatus?: (id: string, status: 'approved' | 'suspended' | 'rejected') => void;
}

export const SupplierDetailModal: React.FC<SupplierDetailModalProps> = ({
    supplier,
    isOpen,
    onClose,
    onApprove,
    onReject,
    onClearCommission,
    onUpdateStatus
}) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'finance' | 'products' | 'orders' | 'settlements'>('profile');



    // Real Stats State
    const [realStats, setRealStats] = useState({
        totalSales: 0,
        totalCommission: 0,
        netProfit: 0,
        pendingCommission: 0,
        ordersCount: 0
    });

    useEffect(() => {
        if (isOpen && supplier?.id) {
            const fetchRealStats = async () => {
                // Fetch ALL delivered orders for this supplier to calculate Total Sales
                const { data: orders } = await supabase
                    .from('store_orders')
                    .select('total_amount, status, created_at')
                    .eq('supplier_id', supplier.id)
                    .eq('status', 'delivered');

                // Fetch Pending Orders for potential commission (optional, usually commission is on delivered)

                const totalSales = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
                const commissionRate = supplier.commissionPercentage || 0;
                const totalCommission = (totalSales * commissionRate) / 100;
                const netProfit = totalSales - totalCommission;

                // Pending Commission (can be calculated from non-settled orders or just use the current month/unpaid flag logic)
                // For now we use the computed totalCommission vs what has been paid (settled).
                // But simpler: just use the fields if we trust them, OR calculate from ORDERS since last settlement.
                // Let's rely on the supplier.pendingCommission prop if it's updated via triggers, 
                // BUT to be safe given the user request "Real Data synchronous with DB", we calculate it from "pending_commission" column in DB directly to be fresh.
                const { data: freshSupplier } = await supabase.from('suppliers').select('pending_commission, total_sales').eq('id', supplier.id).single();

                setRealStats({
                    totalSales: freshSupplier?.total_sales || totalSales, // Prefer DB aggregate if maintained, else calc
                    totalCommission: totalCommission,
                    netProfit: netProfit,
                    pendingCommission: freshSupplier?.pending_commission || 0,
                    ordersCount: orders?.length || 0
                });
            };
            fetchRealStats();
        }
    }, [isOpen, supplier]);

    const commissionAmount = realStats.totalCommission;
    const netProfit = realStats.netProfit;

    const tabs = [
        { id: 'profile', label: 'الملف الشخصي', icon: Building2 },
        { id: 'finance', label: 'المالية والعمولات', icon: DollarSign },
        { id: 'products', label: 'المنتجات', icon: Package },
        { id: 'orders', label: 'الطلبات', icon: ShoppingCart },
        { id: 'settlements', label: 'التسويات', icon: FileText },
    ];

    if (!supplier) return null;

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={`تفاصيل المورد: ${supplier.companyName}`}
            size="xl"
        >
            <div className="flex flex-col h-[70vh]">

                {/* Tab Navigation */}
                <div className="flex gap-2 border-b border-gray-200 pb-2 mb-4 overflow-x-auto shrink-0">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto pr-2">

                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                                <div className="w-16 h-16 bg-white rounded-lg border flex items-center justify-center text-2xl font-bold text-gray-400 overflow-hidden">
                                    {supplier.logo ? (
                                        <img src={supplier.logo} alt={supplier.companyName} className="w-full h-full object-cover" />
                                    ) : (
                                        supplier.companyName?.charAt(0) || supplier.name?.charAt(0) || '?'
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{supplier.companyName}</h3>
                                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {supplier.location || supplier.governorate || supplier.address || ''}</span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                        <span>نوع: {supplier.category}</span>
                                    </div>
                                    <div className="mt-2 text-sm">
                                        <span className={`px-2 py-0.5 rounded-full ${['approved', 'active'].includes(supplier.status) ? 'bg-green-100 text-green-700' :
                                            supplier.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {['approved', 'active'].includes(supplier.status) ? 'نشط' : supplier.status === 'pending' ? 'بانتظار الموافقة' : 'معلق'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border rounded-xl">
                                    <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-900"><UserIcon className="w-4 h-4" /> معلومات المالك</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-gray-500">الاسم الكامل</span>
                                            <span className="font-medium">{supplier.ownerName}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-gray-500">رقم الهاتف</span>
                                            <span className="font-medium" dir="ltr">{supplier.phoneNumber || '+964 770 000 0000'}</span>
                                        </div>
                                        <div className="flex justify-between pt-1">
                                            <span className="text-gray-500">البريد الإلكتروني</span>
                                            <span className="font-medium">{supplier.email}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border rounded-xl">
                                    <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-900"><ShieldCheck className="w-4 h-4" /> معلومات النظام</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-gray-500">تاريخ الانضمام</span>
                                            <span className="font-medium">{new Date(supplier.joinDate).toLocaleDateString('ar-IQ')}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-gray-500">عدد المنتجات</span>
                                            <span className="font-medium">{supplier.productsCount} منتج</span>
                                        </div>
                                        <div className="flex justify-between pt-1">
                                            <span className="text-gray-500">نسبة العمولة الحالية</span>
                                            <span className="font-bold text-purple-600">{supplier.commissionPercentage}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="bg-white border border-gray-200 rounded-xl p-4">
                                <h4 className="font-bold text-gray-900 mb-4">إجراءات الحساب</h4>
                                <div className="flex gap-3">
                                    {supplier.status === 'pending' && (
                                        <>
                                            <Button onClick={() => onApprove(supplier)} className="bg-green-600 hover:bg-green-700 text-white w-full">
                                                <CheckCircle className="w-4 h-4 ml-2" />
                                                موافقة
                                            </Button>
                                            <Button variant="outline" onClick={() => onReject(supplier)} className="text-red-600 hover:bg-red-50 border-red-200 w-full">
                                                <XCircle className="w-4 h-4 ml-2" />
                                                رفض
                                            </Button>
                                        </>
                                    )}
                                    {supplier.status === 'approved' && (
                                        <Button
                                            variant="outline"
                                            onClick={() => onUpdateStatus?.(supplier.id, 'suspended')}
                                            className="text-red-600 border-red-200 hover:bg-red-50 flex-1"
                                        >
                                            <AlertCircle className="w-4 h-4 ml-2" />
                                            تعليق الحساب
                                        </Button>
                                    )}
                                    {supplier.status === 'suspended' && (
                                        <Button onClick={() => onApprove(supplier)} className="bg-green-600 hover:bg-green-700 text-white flex-1">
                                            <CheckCircle className="w-4 h-4 ml-2" />
                                            إعادة تفعيل الحساب
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'finance' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                    <p className="text-sm text-green-600 mb-1">إجمالي المبيعات</p>
                                    <h3 className="text-xl font-bold text-green-700">{formatCurrency(realStats.totalSales)}</h3>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <p className="text-sm text-blue-600 mb-1">صافي ربح المورد</p>
                                    <h3 className="text-xl font-bold text-blue-700">{formatCurrency(netProfit)}</h3>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                    <p className="text-sm text-purple-600 mb-1">إجمالي عمولة المنصة</p>
                                    <h3 className="text-xl font-bold text-purple-700">{formatCurrency(commissionAmount)}</h3>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                    <p className="text-sm text-orange-600 mb-1">عمولة المنصة (المعلقة)</p>
                                    <h3 className="text-xl font-bold text-orange-700">{formatCurrency(realStats.pendingCommission)}</h3>
                                </div>
                            </div>

                            <div className="bg-white border rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="font-bold text-gray-900">تصفية الحسابات</h4>
                                        <p className="text-sm text-gray-500">تصفية المستحقات المالية حتى تاريخ اليوم</p>
                                    </div>
                                    <Button onClick={() => onClearCommission(supplier.id)}>
                                        تصفية العمولة الآن
                                    </Button>
                                </div>

                                <div className="bg-yellow-50 p-4 rounded-lg flex gap-3 text-sm text-yellow-800">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <p>عند الضغط على "تصفية العمولة"، سيتم تسجيل عملية دفع للعمولات المستحقة وتصفير العداد للفترة الحالية.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div className="min-h-[400px]">
                            <StoreProductsSection supplierId={supplier.id} />
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="min-h-[400px]">
                            <StoreOrdersSection supplierId={supplier.id} />
                        </div>
                    )}

                    {activeTab === 'settlements' && (
                        <SettlementsTab supplierId={supplier.id} />
                    )}
                </div>
            </div>
        </AdminModal>
    );
};

const SettlementsTab = ({ supplierId }: { supplierId: string }) => {
    const [settlements, setSettlements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettlements = async () => {
            const { data } = await supabase
                .from('financial_transactions')
                .select('*')
                .eq('supplier_id', supplierId)
                .eq('category', 'commission_clearance')
                .order('transaction_date', { ascending: false });

            if (data) setSettlements(data);
            setLoading(false);
        };
        fetchSettlements();
    }, [supplierId]);

    if (loading) return <div className="p-4 text-center">جاري التحميل...</div>;

    if (settlements.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>لا توجد تسويات سابقة لهذا المورد</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                    <thead className="bg-gray-50 text-gray-600 font-medium">
                        <tr>
                            <th className="p-3">رقم العملية</th>
                            <th className="p-3">التاريخ</th>
                            <th className="p-3">المبلغ</th>
                            <th className="p-3">الوصف</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {settlements.map((tx) => (
                            <tr key={tx.id}>
                                <td className="p-3 font-mono text-gray-500">#{tx.id.substring(0, 8)}</td>
                                <td className="p-3">{new Date(tx.transaction_date).toLocaleDateString('ar-IQ')}</td>
                                <td className="p-3 font-bold text-green-600">{formatCurrency(tx.amount)}</td>
                                <td className="p-3 text-gray-600">{tx.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const UserIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
)
