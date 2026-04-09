import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useJobs } from '../../hooks/useJobs';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

interface PostJobModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({ isOpen, onClose }) => {
    const { createJob } = useJobs();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        type: 'دوام كامل',
        salary: '',
        location: '',
        governorate: 'بغداد',
        district: '',
        description: '',
        requirements: '',
        category: 'أطباء',
        experience: 'سنة واحدة'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Fetch clinic ID associated with this user (owner)
            const { data: { user } } = await supabase.auth.getUser();
            let clinicId = undefined;
            let laboratoryId = undefined;

            if (user) {
                // Try finding clinic
                const { data: clinic } = await supabase
                    .from('clinics')
                    .select('id')
                    .eq('owner_id', user.id)
                    .single();

                if (clinic) {
                    clinicId = clinic.id;
                } else {
                    // Try finding lab
                    const { data: lab } = await supabase
                        .from('dental_laboratories')
                        .select('id')
                        .eq('owner_id', user.id)
                        .single();
                    if (lab) laboratoryId = lab.id;
                }
            }

            await createJob({
                ...formData,
                requirements: formData.requirements.split(',').map(r => r.trim()),
                clinicId,
                laboratoryId
            });
            toast.success('تم نشر الوظيفة بنجاح');
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('حدث خطأ أثناء النشر');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="نشر فرصة عمل جديدة"
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">عنوان الوظيفة</label>
                        <input
                            required
                            className="w-full p-2 border rounded-lg"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="مثال: طبيب أسنان عام"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">نوع الوظيفة</label>
                        <select
                            className="w-full p-2 border rounded-lg"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option>دوام كامل</option>
                            <option>دوام جزئي</option>
                            <option>لوكم (Locum)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">الراتب المتوقع</label>
                        <input
                            className="w-full p-2 border rounded-lg"
                            value={formData.salary}
                            onChange={e => setFormData({ ...formData, salary: e.target.value })}
                            placeholder="مثال: 1,500,000 د.ع"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">التصنيف</label>
                        <select
                            className="w-full p-2 border rounded-lg"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="أطباء">أطباء أسنان</option>
                            <option value="مساعدين">مساعدين</option>
                            <option value="فنيين">فنيي مختبر</option>
                            <option value="اداريين">موظفي استقبال/إدارة</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">المحافظة</label>
                        <select
                            className="w-full p-2 border rounded-lg"
                            value={formData.governorate}
                            onChange={e => setFormData({ ...formData, governorate: e.target.value })}
                        >
                            <option>بغداد</option>
                            <option>البصرة</option>
                            <option>أربيل</option>
                            <option>النجف</option>
                            <option>نينوى</option>
                            {/* Add other provinces */}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">المنطقة / القضاء</label>
                        <input
                            required
                            className="w-full p-2 border rounded-lg"
                            value={formData.district}
                            onChange={e => setFormData({ ...formData, district: e.target.value })}
                            placeholder="مثال: المنصور"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">الوصف الوظيفي</label>
                    <textarea
                        required
                        rows={4}
                        className="w-full p-2 border rounded-lg"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="اشرح تفاصيل الوظيفة والمهام المطلوبة..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">المتطلبات (افصل بفاصلة)</label>
                    <input
                        className="w-full p-2 border rounded-lg"
                        value={formData.requirements}
                        onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                        placeholder="مثال: خبرة سنتين, سكن قريب, إجادة اللغة الإنجليزية"
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                        {loading ? 'جاري النشر...' : 'نشر الوظيفة'}
                    </Button>
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                        إلغاء
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
