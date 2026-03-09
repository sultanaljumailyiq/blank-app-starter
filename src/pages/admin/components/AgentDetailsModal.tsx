import React, { useState, useEffect } from 'react';
import { AdminModal } from '../../../components/admin/AdminModal';
import { Button } from '../../../components/common/Button';
import { supabase } from '../../../lib/supabase';
import {
    CreditCard,
    DollarSign,
    CheckCircle,
    Clock,
    Search,
    Download,
    Filter
} from 'lucide-react';
import { toast } from 'sonner';

interface AgentDetailsModalProps {
    agent: any;
    isOpen: boolean;
    onClose: () => void;
}

export const AgentDetailsModal: React.FC<AgentDetailsModalProps> = ({
    agent,
    isOpen,
    onClose
}) => {
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        totalSettled: 0,
        totalPending: 0
    });

    useEffect(() => {
        if (isOpen && agent) {
            fetchAgentTransactions();
        }
    }, [isOpen, agent]);

    const fetchAgentTransactions = async () => {
        setLoading(true);
        try {
            // Fetch requests where payment_details->agentId equals agent.id
            const { data, error } = await supabase
                .from('subscription_requests')
                .select('*, doctor:profiles!doctor_id(full_name, phone)')
                .contains('payment_details', { agentId: agent.id })
                .order('created_at', { ascending: false });

            if (error) throw error;

            const txs = data || [];
            setTransactions(txs);

            // Calculate Stats
            const totalOrders = txs.length;
            const totalRevenue = txs.reduce((sum, tx) => sum + (tx.amount_paid || 0), 0);
            const totalSettled = txs.filter(tx => tx.is_settled).reduce((sum, tx) => sum + (tx.amount_paid || 0), 0);
            const totalPending = totalRevenue - totalSettled;

            setStats({
                totalOrders,
                totalRevenue,
                totalSettled,
                totalPending
            });

        } catch (error) {
            console.error('Error fetching agent transactions:', error);
            toast.error('حدث خطأ أثناء تحميل بيانات الوكيل');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSettlement = async (txId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('subscription_requests')
                .update({ is_settled: !currentStatus })
                .eq('id', txId);

            if (error) throw error;

            toast.success(currentStatus ? 'تم إلغاء التسوية' : 'تمت التسوية بنجاح');

            // Update local state optimizingly
            const updatedTxs = transactions.map(tx =>
                tx.id === txId ? { ...tx, is_settled: !currentStatus } : tx
            );
            setTransactions(updatedTxs);

            // Recalculate stats
            const totalOrders = updatedTxs.length;
            const totalRevenue = updatedTxs.reduce((sum, tx) => sum + (tx.amount_paid || 0), 0);
            const totalSettled = updatedTxs.filter(tx => tx.is_settled).reduce((sum, tx) => sum + (tx.amount_paid || 0), 0);
            const totalPending = totalRevenue - totalSettled;

            setStats({
                totalOrders,
                totalRevenue,
                totalSettled,
                totalPending
            });

        } catch (error) {
            console.error(error);
            toast.error('فشل تحديث حالة التسوية');
        }
    };

    if (!isOpen || !agent) return null;

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={`تفاصيل الوكيل: ${agent.name}`}
            size="xl"
        >
            <div className="space-y-6">

                {/* Header Info */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div>
                        <div className="text-sm text-gray-500 mb-1">المعلومات الاساسية</div>
                        <div className="flex gap-4 text-sm font-medium">
                            <span>{agent.phone}</span>
                            <span className="w-px h-4 bg-gray-300"></span>
                            <span>{agent.governorate}</span>
                        </div>
                    </div>
                    <div className="mt-2 md:mt-0">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${agent.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {agent.status === 'active' ? 'حساب نشط' : 'معطل'}
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <CreditCard className="w-4 h-4" />
                            <span className="text-xs">عدد الطلبات</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-xs">إجمالي المبيعات</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-green-100 bg-green-50/50 shadow-sm">
                        <div className="flex items-center gap-2 text-green-700 mb-2">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs font-bold">تمت التسوية</span>
                        </div>
                        <div className="text-2xl font-bold text-green-700">{stats.totalSettled.toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-orange-100 bg-orange-50/50 shadow-sm">
                        <div className="flex items-center gap-2 text-orange-700 mb-2">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-bold">معلق (مطلوب)</span>
                        </div>
                        <div className="text-2xl font-bold text-orange-700">{stats.totalPending.toLocaleString()}</div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white border server-gray-200 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h4 className="font-bold text-gray-900">سجل العمليات والطلبات</h4>
                        <div className="text-xs text-gray-500">يتم عرض أحدث الطلبات أولاً</div>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-500">جاري تحميل البيانات...</div>
                    ) : transactions.length > 0 ? (
                        <div className="overflow-x-auto max-h-[400px]">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-gray-50 text-gray-600 font-semibold sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-4 py-3">رقم الطلب / الطبيب</th>
                                        <th className="px-4 py-3">المبلغ</th>
                                        <th className="px-4 py-3">التاريخ</th>
                                        <th className="px-4 py-3">حالة الطلب</th>
                                        <th className="px-4 py-3">التسوية المالية</th>
                                        <th className="px-4 py-3">الإجراء</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-gray-900 mb-0.5 truncate max-w-[150px]" title={tx.id}>{tx.id.split('-')[0]}...</div>
                                                <div className="text-xs text-gray-500">{tx.doctor?.full_name || 'طبيب غير معروف'}</div>
                                            </td>
                                            <td className="px-4 py-3 font-mono font-bold text-gray-900">
                                                {tx.amount_paid?.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {new Date(tx.created_at).toLocaleDateString('ar-IQ')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${tx.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {tx.status === 'approved' ? 'مقبول' : tx.status === 'pending' ? 'انتظار' : 'مرفوض'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`flex items-center gap-1 text-xs font-bold ${tx.is_settled ? 'text-green-600' : 'text-orange-600'
                                                    }`}>
                                                    {tx.is_settled ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                    {tx.is_settled ? 'نعم' : 'لا'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Button
                                                    size="sm"
                                                    variant={tx.is_settled ? 'outline' : 'primary'}
                                                    className={`h-8 text-xs ${tx.is_settled ? 'border-gray-300 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                                                    onClick={() => handleToggleSettlement(tx.id, tx.is_settled)}
                                                >
                                                    {tx.is_settled ? 'إلغاء التسوية' : 'تسوية المبلغ'}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-gray-500">
                            لا توجد طلبات مسجلة لهذا الوكيل حتى الآن.
                        </div>
                    )}
                </div>
            </div>
        </AdminModal>
    );
};
