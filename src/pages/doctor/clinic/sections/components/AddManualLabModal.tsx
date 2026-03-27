import React, { useState } from 'react';
import { X, Save, Building2, Phone, MapPin } from 'lucide-react';
import { Button } from '../../../../../components/common/Button';
import { useClinicLabs } from '../../../../../hooks/useClinicLabs';
import { toast } from 'sonner';

interface AddManualLabModalProps {
    isOpen: boolean;
    onClose: () => void;
    clinicId: string;
    onSuccess?: () => void;
}

export const AddManualLabModal: React.FC<AddManualLabModalProps> = ({ isOpen, onClose, clinicId, onSuccess }) => {
    const { addCustomLab } = useClinicLabs(clinicId);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            await addCustomLab({
                name: formData.get('name') as string,
                address: formData.get('address') as string,
                phone: formData.get('phone') as string,
                specialties: (formData.get('specialties') as string).split(',').map(s => s.trim())
            });
            toast.success('تم إضافة المختبر بنجاح');
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('حدث خطأ أثناء إضافة المختبر');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">إضافة مختبر يدوي</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">اسم المختبر</label>
                        <div className="relative">
                            <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                name="name"
                                required
                                className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="مثال: مختبر النجاح"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                        <div className="relative">
                            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                name="address"
                                required
                                className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="المنطقة - الشارع"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                        <div className="relative">
                            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                name="phone"
                                required
                                className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="07xxxxxxxxx"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">التخصصات (مفصولة بفاصلة)</label>
                        <input
                            name="specialties"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="تيجان, زراعة, تقويم"
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                        >
                            إلغاء
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={loading}
                        >
                            {loading ? 'جاري الحفظ...' : 'حفظ المختبر'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
