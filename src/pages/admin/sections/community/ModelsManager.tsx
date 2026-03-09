import React, { useState } from 'react';
import { Box, Trash2, Plus, ExternalLink } from 'lucide-react';
import { useAdminCommunity } from '../../../../hooks/useAdminCommunity';
import { Button } from '../../../../components/common/Button';
import { FormModal, ConfirmDeleteModal } from '../../../../components/admin/AdminModal';

export const ModelsManager: React.FC = () => {
    const { models, loading, addModel, deleteModel } = useAdminCommunity();
    const [showAddModal, setShowAddModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleSubmit = async (data: any) => {
        const success = await addModel(data);
        if (success) setShowAddModal(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100">
                <div>
                    <h3 className="font-bold text-gray-900">النماذج ثلاثية الأبعاد</h3>
                    <p className="text-gray-500 text-sm">مكتبة النماذج التفاعلية (Sketchfab Embeds)</p>
                </div>
                <Button onClick={() => setShowAddModal(true)} className="bg-purple-600 text-white shadow-md">
                    <Plus className="w-4 h-4 ml-2" /> إضافة نموذج
                </Button>
            </div>

            {loading ? <div className="text-center py-8">جاري التحميل...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {models.map(model => (
                        <div key={model.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="h-48 bg-gray-100 relative">
                                {model.embed_url && (
                                    <iframe
                                        src={`${model.embed_url}/embed`}
                                        title={model.title}
                                        className="w-full h-full"
                                        allow="autoplay; fullscreen; vr"
                                    />
                                )}
                            </div>
                            <div className="p-4">
                                <h4 className="font-bold text-gray-900 mb-1">{model.title}</h4>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{model.category || 'عام'}</span>
                                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setDeleteId(model.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {models.length === 0 && <div className="col-span-full text-center text-gray-500 py-8">لا توجد نماذج حالياً</div>}
                </div>
            )}

            <FormModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="إضافة نموذج 3D"
                onSubmit={handleSubmit}
                fields={[
                    { name: 'title', label: 'اسم النموذج', type: 'text', required: true },
                    { name: 'embed_url', label: 'رابط التضمين (Sketchfab)', type: 'text', required: true, placeholder: 'https://sketchfab.com/models/...' },
                    { name: 'category', label: 'التصنيف', type: 'text' }
                ]}
            />

            <ConfirmDeleteModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={() => { if (deleteId) deleteModel(deleteId); }}
                title="حذف النموذج"
                message="هل أنت متأكد من حذف هذا النموذج؟"
            />
        </div>
    );
};
