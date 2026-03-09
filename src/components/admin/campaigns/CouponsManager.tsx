import React, { useState, useEffect } from 'react';
import { Button } from '../../common/Button';
import { Tag, Plus, Edit2, Trash2, Check, X, Calendar } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { AdminTable, Column } from '../AdminTable';
import { FormModal, ConfirmDeleteModal } from '../AdminModal';

interface Coupon {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_order_value: number;
    usage_limit: number;
    used_count: number;
    status: 'active' | 'expired' | 'disabled';
    start_date?: string;
    end_date?: string;
}

export const CouponsManager: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('store_coupons')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCoupons(data as Coupon[]);
        } catch (error) {
            console.error('Error fetching coupons:', error);
            toast.error('فشل تحميل القسائم');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleSave = async (formData: any) => {
        try {
            const couponData = {
                code: formData.code.toUpperCase(),
                discount_type: formData.discount_type,
                discount_value: Number(formData.discount_value),
                min_order_value: Number(formData.min_order_value),
                usage_limit: Number(formData.usage_limit),
                status: formData.status,
                start_date: formData.start_date || null,
                end_date: formData.end_date || null
            };

            if (editingCoupon?.id) {
                const { error } = await supabase
                    .from('store_coupons')
                    .update(couponData)
                    .eq('id', editingCoupon.id);
                if (error) throw error;
                toast.success('تم تحديث القسيمة بنجاح');
            } else {
                const { error } = await supabase
                    .from('store_coupons')
                    .insert([couponData]);
                if (error) throw error;
                toast.success('تم إنشاء القسيمة بنجاح');
            }

            setIsFormOpen(false);
            fetchCoupons();
        } catch (error) {
            console.error('Error saving coupon:', error);
            toast.error('حدث خطأ أثناء حفظ القسيمة');
        }
    };

    const handleDelete = async () => {
        if (!selectedCoupon) return;
        try {
            const { error } = await supabase
                .from('store_coupons')
                .delete()
                .eq('id', selectedCoupon.id);

            if (error) throw error;
            toast.success('تم حذف القسيمة');
            setShowDeleteModal(false);
            fetchCoupons();
        } catch (error) {
            toast.error('فشل حذف القسيمة');
        }
    };

    const columns: Column[] = [
        {
            key: 'code',
            title: 'كود الخصم',
            sortable: true,
            render: (value) => <span className="font-bold font-mono text-purple-700 bg-purple-50 px-2 py-1 rounded">{value}</span>
        },
        {
            key: 'discount_value',
            title: 'قيمة الخصم',
            sortable: true,
            render: (value, record) => (
                <span className="font-semibold text-green-600">
                    {value} {record.discount_type === 'percentage' ? '%' : 'د.ع'}
                </span>
            )
        },
        {
            key: 'status',
            title: 'الحالة',
            sortable: true,
            render: (value) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${value === 'active' ? 'bg-green-100 text-green-700' :
                    value === 'expired' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                    {value === 'active' ? 'نشط' : value === 'expired' ? 'منتهي' : 'معطل'}
                </span>
            )
        },
        {
            key: 'usage',
            title: 'الاستخدام',
            render: (_, record) => <span>{record.used_count} / {record.usage_limit}</span>
        },
        {
            key: 'actions',
            title: 'الإجراءات',
            render: (_, record) => (
                <div className="flex gap-2">
                    <button onClick={() => { setEditingCoupon(record); setIsFormOpen(true); }} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setSelectedCoupon(record as Coupon); setShowDeleteModal(true); }} className="text-red-600 hover:bg-red-50 p-1 rounded">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    const formFields = [
        { name: 'code', label: 'كود الخصم', type: 'text' as const, required: true },
        {
            name: 'discount_type',
            label: 'نوع الخصم',
            type: 'select' as const,
            options: [
                { value: 'percentage', label: 'نسبة مئوية (%)' },
                { value: 'fixed', label: 'مبلغ ثابت (د.ع)' }
            ],
            required: true
        },
        { name: 'discount_value', label: 'القيمة', type: 'number' as const, required: true },
        { name: 'min_order_value', label: 'الحد الأدنى للطلب', type: 'number' as const, required: true },
        { name: 'usage_limit', label: 'حد الاستخدام', type: 'number' as const, required: true },
        {
            name: 'status',
            label: 'الحالة',
            type: 'select' as const,
            options: [
                { value: 'active', label: 'نشط' },
                { value: 'disabled', label: 'معطل' },
                { value: 'expired', label: 'منتهي' }
            ],
            required: true
        },
        { name: 'start_date', label: 'تاريخ البداية', type: 'date' as const },
        { name: 'end_date', label: 'تاريخ النهاية', type: 'date' as const }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Tag className="w-6 h-6 text-purple-600" />
                    إدارة قسائم التخفيض
                </h3>
                <Button onClick={() => { setEditingCoupon({ status: 'active', discount_type: 'percentage' }); setIsFormOpen(true); }}>
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة قسيمة
                </Button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <AdminTable
                    columns={columns}
                    data={coupons}
                />
            </div>

            <FormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingCoupon?.id ? 'تعديل القسيمة' : 'إضافة قسيمة جديدة'}
                fields={formFields}
                initialValues={editingCoupon || undefined}
                onSubmit={handleSave}
            />

            <ConfirmDeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="حذف القسيمة"
                message={`هل أنت متأكد من حذف القسيمة ${selectedCoupon?.code}؟`}
                itemName={selectedCoupon?.code}
            />
        </div >
    );
};
