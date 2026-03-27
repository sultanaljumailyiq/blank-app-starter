import React, { useState } from 'react';
import { Users, Search, Eye } from 'lucide-react';
import { useAdminCommunity } from '../../../../hooks/useAdminCommunity';
import { AdminTable } from '../../../../components/admin/AdminTable';
import { Button } from '../../../../components/common/Button';
import { supabase } from '../../../../lib/supabase';
import { SupplierDetailModal } from '../../components/SupplierDetailModal';
import { LabDetailsModal } from '../../components/LabDetailsModal';
import { OwnerDetailsModal } from '../../components/OwnerDetailsModal';
import { toast } from 'sonner';

export const UsersManager: React.FC = () => {
    const { users, loading } = useAdminCommunity();
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [modalType, setModalType] = useState<'supplier' | 'lab' | 'owner' | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch full details for the selected user type before opening modal
    const handleViewDetails = async (user: any) => {
        if (user.role === 'supplier') {
            // Fetch supplier details - Try multiple potential foreign keys to find the supplier profile
            let data = null;

            // 1. Try by user_id
            const { data: dataByUserId } = await supabase.from('suppliers').select('*').eq('user_id', user.id).maybeSingle();
            if (dataByUserId) data = dataByUserId;

            // 2. Try by id (direct link)
            if (!data) {
                const { data: dataById } = await supabase.from('suppliers').select('*').eq('id', user.id).maybeSingle();
                if (dataById) data = dataById;
            }

            // 3. Try by owner_id (some schemas use this)
            if (!data) {
                const { data: dataByOwnerId } = await supabase.from('suppliers').select('*').eq('owner_id', user.id).maybeSingle();
                if (dataByOwnerId) data = dataByOwnerId;
            }

            if (data) {
                // Map DB snake_case fields to Component camelCase props
                const mappedUser = {
                    id: data.id,
                    companyName: data.company_name || data.name || user.full_name, // Handle company_name
                    ownerName: data.contact_person || data.owner_name || user.full_name,
                    phoneNumber: data.phone_number || data.phone || user.phone_number || '',
                    email: data.contact_email || data.email || user.email || '',
                    location: data.address || data.location || user.location || '',
                    status: data.status || (data.is_verified ? 'approved' : 'pending'),
                    logo: data.logo || user.avatar_url || undefined,
                    // Fallback to current date if join_date/created_at is missing to prevent invalid date error
                    joinDate: data.created_at || user.created_at || new Date().toISOString(),
                    productsCount: 0, // Could fetch this if needed
                    category: data.category || 'تجهيزات طبية',
                    commissionPercentage: data.commission_percentage || 0,
                    totalSales: data.total_sales || 0,
                    pendingCommission: data.pending_commission || 0,
                    rating: data.rating || 0
                };
                setSelectedUser(mappedUser);
                setModalType('supplier');
            } else {
                // Fallback: If no supplier record found, create a temporary one from user profile
                // This allows the modal to open even if the linkage is missing, allowing admins to see the user details.
                const fallbackUser = {
                    id: user.id, // Use user ID as fallback
                    companyName: user.full_name || 'غير محدد',
                    ownerName: user.full_name,
                    phoneNumber: user.phone_number || '',
                    email: user.email || '',
                    location: user.location || '',
                    status: 'pending', // Default to pending if no record exists
                    joinDate: user.created_at || new Date().toISOString(),
                    productsCount: 0,
                    category: 'تجهيزات طبية',
                    commissionPercentage: 0,
                    totalSales: 0,
                    pendingCommission: 0,
                    rating: 0
                };
                setSelectedUser(fallbackUser);
                setModalType('supplier');
                toast.warning('تم عرض بيانات المستخدم (لا يوجد سجل مورد مرتبط بعد)');
            }
        } else if (user.role === 'lab' || user.role === 'laboratory') {
            // Fetch lab details
            let { data } = await supabase.from('dental_laboratories').select('*').eq('owner_id', user.id).maybeSingle();

            if (!data) {
                const { data: dataById } = await supabase.from('dental_laboratories').select('*').eq('id', user.id).maybeSingle();
                data = dataById;
            }
            // Also try searching by user_id column if it exists (some tables use user_id instead of owner_id)
            if (!data) {
                const { data: dataByUserId } = await supabase.from('dental_laboratories').select('*').eq('user_id', user.id).maybeSingle();
                data = dataByUserId;
            }

            if (data) {
                // Map DB fields to Component expected props
                setSelectedUser({
                    ...data,
                    id: data.id,
                    name: data.lab_name || data.name || user.full_name,
                    ownerName: user.full_name,
                    phone: data.phone || user.phone_number,
                    address: data.address || user.location,
                    joinDate: data.created_at || user.created_at,
                    totalRevenue: data.total_revenue || 0,
                    pendingCommission: data.pending_commission || 0,
                    commissionPercentage: data.commission_percentage || 0,
                    status: data.account_status || (data.is_verified ? 'active' : 'pending'),
                    isVerified: data.is_verified || false
                });
                setModalType('lab');
            } else {
                toast.error('لم يتم العثور على بيانات المختبر المرتبطة');
            }
        } else if (user.role === 'doctor') {
            // For doctor/owner, we just pass the ID to the modal and it fetches the rest
            setSelectedUser(user);
            setModalType('owner');
        }
    };

    const filteredUsers = users.filter((user: any) =>
        ['doctor', 'lab', 'laboratory', 'supplier', 'admin'].includes(user.role) &&
        (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const columns = [
        {
            key: 'full_name',
            title: 'الاسم الكامل',
            render: (val: string, record: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                        {record.avatar_url ? (
                            <img src={record.avatar_url} alt={val || ''} className="w-full h-full object-cover" />
                        ) : (
                            val?.charAt(0) || 'U'
                        )}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900">{val || 'غير محدد'}</div>
                        <div className="text-xs text-gray-500">{record.email}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'role',
            title: 'الدور',
            render: (val: string) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${val === 'doctor' ? 'bg-blue-100 text-blue-700' :
                    val === 'lab' || val === 'laboratory' ? 'bg-orange-100 text-orange-700' :
                        val === 'supplier' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                    }`}>
                    {val === 'doctor' ? 'طبيب' :
                        val === 'lab' || val === 'laboratory' ? 'مختبر' :
                            val === 'supplier' ? 'مجهز' :
                                val === 'admin' ? 'مسؤول' : 'مستخدم'}
                </span>
            )
        },
        { key: 'governorate', title: 'المحافظة', render: (val: string) => val || '-' },
        {
            key: 'created_at',
            title: 'تاريخ الانضمام',
            render: (val: string) => new Date(val).toLocaleDateString('ar-IQ')
        },
        {
            key: 'actions',
            title: 'إجراءات',
            render: (_, record: any) => (
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-600 hover:bg-blue-50"
                        onClick={() => handleViewDetails(record)}
                        title="عرض التفاصيل"
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100">
                <div>
                    <h3 className="font-bold text-gray-900">المستخدمين المسجلين</h3>
                    <p className="text-gray-500 text-sm">عرض كافة المستخدمين في المنصة</p>
                </div>
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="بحث..."
                        className="pl-4 pr-10 py-2 bg-gray-50 border rounded-lg text-sm focus:bg-white transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? <div className="text-center py-8">جاري التحميل...</div> : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <AdminTable
                        columns={columns}
                        data={filteredUsers}
                        actions={{
                            delete: () => alert('لا يمكن حذف المستخدمين من هنا حالياً')
                        }}
                    />
                </div>
            )}

            {/* Modals */}
            {modalType === 'supplier' && (
                <SupplierDetailModal
                    isOpen={true}
                    onClose={() => setModalType(null)}
                    supplier={selectedUser}
                    onApprove={async (s) => {
                        const { error: supErr } = await supabase.from('suppliers').update({ is_verified: true }).eq('id', s.id);
                        // Also lift any ban on the profile
                        await supabase.from('profiles').update({ banned: false }).eq('id', s.id);
                        if (!supErr) {
                            toast.success('تم تفعيل حساب المورد');
                            setModalType(null);
                        } else {
                            toast.error('حدث خطأ في التفعيل');
                            console.error(supErr);
                        }
                    }}
                    onReject={async (s) => {
                        const { error: supErr } = await supabase.from('suppliers').update({ is_verified: false }).eq('id', s.id);
                        if (!supErr) {
                            toast.success('تم رفض حساب المورد');
                            setModalType(null);
                        } else {
                            toast.error('حدث خطأ في الرفض');
                        }
                    }}
                    onUpdateStatus={async (id, status) => {
                        const isSuspending = status === 'suspended';
                        const isActivating = status === 'approved';
                        // Update suppliers.is_verified
                        const { error: supErr } = await supabase
                            .from('suppliers')
                            .update({ is_verified: isActivating })
                            .eq('id', id);
                        // Update profiles.banned (suspend = ban, activate = unban)
                        const { error: profErr } = await supabase
                            .from('profiles')
                            .update({ banned: isSuspending })
                            .eq('id', id);
                        if (!supErr && !profErr) {
                            toast.success(isSuspending ? 'تم تعليق حساب المورد وإخفاؤه من المنصة' : 'تم إعادة تفعيل حساب المورد');
                            setModalType(null);
                        } else {
                            toast.error('حدث خطأ في تحديث الحالة');
                            console.error({ supErr, profErr });
                        }
                    }}
                    onClearCommission={async (id, amount) => {
                        // Basic commission clearance implementation for Users Manager context
                        try {
                            const { data: supplier } = await supabase.from('suppliers').select('pending_commission').eq('id', id).single();
                            if (!supplier || !supplier.pending_commission) {
                                toast.error('لا توجد عمولة مستحقة');
                                return false;
                            }

                            const clearanceAmount = amount || supplier.pending_commission;

                            const { error: txError } = await supabase.from('financial_transactions').insert({
                                type: 'debit',
                                category: 'commission_clearance',
                                amount: clearanceAmount,
                                description: `تسوية عمولة المنصة`,
                                supplier_id: id,
                                status: 'completed',
                                transaction_date: new Date().toISOString()
                            });

                            if (txError) throw txError;

                            const { error: updateError } = await supabase.from('suppliers').update({ pending_commission: 0 }).eq('id', id);
                            if (updateError) throw updateError;

                            toast.success('تم تصفية العمولة بنجاح');
                            return true;
                        } catch (e) {
                            toast.error('فشلت العملية');
                            console.error(e);
                            return false;
                        }
                    }}
                />
            )}

            {modalType === 'lab' && (
                <LabDetailsModal
                    isOpen={true}
                    onClose={() => setModalType(null)}
                    lab={selectedUser}
                    onUpdateStatus={async (id, status) => {
                        try {
                            const isSuspending = status === 'suspended';
                            const action = status === 'active' ? 'activate' : 'deactivate';
                            const { data: { user } } = await supabase.auth.getUser();

                            // Call the existing RPC to toggle lab status
                            const { error: rpcError } = await supabase.rpc('toggle_lab_activation', {
                                p_lab_id: id,
                                p_action: action,
                                p_admin_id: user?.id
                            });

                            if (rpcError) throw rpcError;

                            // Also sync profiles.banned so Community and LabDashboard know
                            // Need to find the profile ID from the lab record
                            const { data: labRecord } = await supabase
                                .from('dental_laboratories')
                                .select('owner_id, user_id')
                                .eq('id', id)
                                .single();
                            const profileId = labRecord?.owner_id || labRecord?.user_id;
                            if (profileId) {
                                await supabase.from('profiles').update({ banned: isSuspending }).eq('id', profileId);
                            }

                            toast.success(`تم ${action === 'activate' ? 'تفعيل' : 'تعليق'} حساب المختبر`);
                            setModalType(null);
                        } catch (e) {
                            console.error(e);
                            toast.error('حدث خطأ في تحديث الحالة');
                        }
                    }}
                    onClearCommission={async (id) => {
                        try {
                            const { data: lab } = await supabase.from('dental_laboratories').select('pending_commission').eq('id', id).single();
                            if (!lab || !lab.pending_commission) {
                                toast.error('لا توجد عمولة مستحقة');
                                return;
                            }

                            const amount = lab.pending_commission;

                            const { error: txError } = await supabase.from('financial_transactions').insert({
                                type: 'debit',
                                category: 'commission_clearance',
                                amount: amount,
                                description: `تسوية عمولة المنصة`,
                                lab_id: id, // specific column for labs if schema separates them, or ensure safe type
                                status: 'completed',
                                transaction_date: new Date().toISOString()
                            });

                            if (txError) throw txError;

                            const { error: updateError } = await supabase.from('dental_laboratories').update({ pending_commission: 0 }).eq('id', id);
                            if (updateError) throw updateError;

                            toast.success('تم تصفية العمولة بنجاح');
                        } catch (e) {
                            toast.error('فشلت العملية');
                            console.error(e);
                        }
                    }}
                />
            )}

            {modalType === 'owner' && (
                <OwnerDetailsModal
                    isOpen={true}
                    onClose={() => setModalType(null)}
                    ownerId={selectedUser?.id}
                />
            )}
        </div>
    );
};
