import React, { useState } from 'react';
import { FileText, Download, Trash2, Plus, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { useAdminCommunity } from '../../../../hooks/useAdminCommunity';
import { Button } from '../../../../components/common/Button';
import { AdminModal, FormModal, ConfirmDeleteModal } from '../../../../components/admin/AdminModal';

export const ResourcesManager: React.FC = () => {
    const { resources, loading, addResource, deleteResource } = useAdminCommunity();
    const [showAddModal, setShowAddModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleSubmit = async (data: any) => {
        const success = await addResource(data);
        if (success) setShowAddModal(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100">
                <div>
                    <h3 className="font-bold text-gray-900">المصادر التعليمية</h3>
                    <p className="text-gray-500 text-sm">الملفات، المستندات، والروابط المفيدة</p>
                </div>
                <Button onClick={() => setShowAddModal(true)} className="bg-green-600 text-white shadow-md">
                    <Plus className="w-4 h-4 ml-2" /> إضافة مصدر
                </Button>
            </div>

            {loading ? <div className="text-center py-8">جاري التحميل...</div> : (
                <div className="grid grid-cols-1 gap-3">
                    {resources.map(res => (
                        <div key={res.id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                                    {res.type === 'video' ? '🎬' : res.type === 'link' ? <LinkIcon className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{res.title}</h4>
                                    <a href={res.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1">
                                        {res.url} <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-center px-4 border-l border-gray-100">
                                    <div className="text-lg font-bold text-gray-900">{res.downloads_count}</div>
                                    <div className="text-xs text-gray-500">تحميل</div>
                                </div>
                                <Button variant="ghost" className="text-red-500" onClick={() => setDeleteId(res.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {resources.length === 0 && <div className="text-center text-gray-500 py-8">لا توجد مصادر مضافة</div>}
                </div>
            )}

            <FormModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="إضافة مصدر جديد"
                onSubmit={handleSubmit}
                fields={[
                    { name: 'title', label: 'عنوان المصدر', type: 'text', required: true },
                    { name: 'url', label: 'الرابط (URL)', type: 'text', required: true },
                    {
                        name: 'type', label: 'النوع', type: 'select', options: [
                            { value: 'document', label: 'مستند (PDF/Doc)' },
                            { value: 'video', label: 'فيديو' },
                            { value: 'link', label: 'رابط خارجي' }
                        ], required: true
                    },
                    { name: 'category', label: 'التصنيف', type: 'text' }
                ]}
            />

            <ConfirmDeleteModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={() => { if (deleteId) deleteResource(deleteId); }}
                title="حذف المصدر"
                message="هل أنت متأكد؟"
            />
        </div>
    );
};
