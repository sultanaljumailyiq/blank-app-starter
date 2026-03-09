import React, { useState } from 'react';
import { X, Save, Calendar, User, FileText, DollarSign, Stethoscope } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { supabase } from '../../lib/supabase';

interface AddLabOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    clinicId: string;
    lab: {
        id: string;
        name: string;
        isCustom: boolean;
    };
    onSuccess?: () => void;
}

export const AddLabOrderModal: React.FC<AddLabOrderModalProps> = ({
    isOpen,
    onClose,
    clinicId,
    lab,
    onSuccess
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        const orderData = {
            clinic_id: clinicId,
            patient_name: formData.get('patientName') as string,
            doctor_id: (await supabase.auth.getUser()).data.user?.id, // Best effort to get current user
            service_name: formData.get('serviceName') as string,
            price: Number(formData.get('price')),
            notes: formData.get('notes') as string,
            expected_delivery_date: formData.get('expectedDate') as string,
            status: 'pending',
            priority: 'normal',
            order_number: `ORD-${Date.now().toString().slice(-6)}`, // Simple ID generation

            // Critical Distinction Logic
            laboratory_id: lab.isCustom ? null : lab.id,
            custom_lab_name: lab.isCustom ? lab.name : null
        };

        try {
            const { error: insertError } = await supabase
                .from('dental_lab_orders')
                .insert(orderData);

            if (insertError) throw insertError;

            onSuccess?.();
            onClose();
        } catch (err: any) {
            console.error('Error creating order:', err);
            setError(err.message || 'حدث خطأ أثناء إنشاء الطلب');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`إضافة طلب جديد - ${lab.name}`}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم المريض</label>
                    <div className="relative">
                        <User className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                        <input
                            name="patientName"
                            required
                            type="text"
                            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="اسم المريض الثلاثي"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الخدمة المطلوبة</label>
                    <div className="relative">
                        <Stethoscope className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                        <input
                            name="serviceName"
                            required
                            type="text"
                            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="مثال: تاج زركون، طقم متحرك..."
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">السعر المتوقع (د.ع)</label>
                        <div className="relative">
                            <DollarSign className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                            <input
                                name="price"
                                type="number"
                                min="0"
                                required
                                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="0"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ التسليم المتوقع</label>
                        <div className="relative">
                            <input
                                name="expectedDate"
                                type="date"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ltr-text text-right"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات إضافية</label>
                    <textarea
                        name="notes"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="أي تفاصيل مهمة للمختبر..."
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                    <Button type="button" variant="outline" onClick={onClose}>
                        إلغاء
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                    >
                        {loading ? 'جارِ الحفظ...' : 'إنشاء الطلب'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
