import React, { useState } from 'react';
import { Users, Search, Trash2, Plus } from 'lucide-react';
import { useAdminCommunity } from '../../../../hooks/useAdminCommunity';
import { Button } from '../../../../components/common/Button';
import { ConfirmDeleteModal } from '../../../../components/admin/AdminModal';

export const GroupsManager: React.FC = () => {
    const { groups, loading, deleteGroup } = useAdminCommunity();
    const [deleteId, setDeleteId] = useState<string | null>(null);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100">
                <div>
                    <h3 className="font-bold text-gray-900">ادارة المجموعات</h3>
                    <p className="text-gray-500 text-sm">المجموعات الطبية والنقاشات</p>
                </div>
                {/* Add Group future feature */}
                <Button disabled className="opacity-50">
                    <Plus className="w-4 h-4 ml-2" /> إضافة مجموعة (قريباً)
                </Button>
            </div>

            {loading ? <div className="text-center py-8">جاري التحميل...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.map(group => (
                        <div key={group.id} className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Users className="w-5 h-5" />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:bg-red-50"
                                    onClick={() => setDeleteId(group.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                            <h4 className="font-bold text-gray-900 mb-1">{group.name}</h4>
                            <p className="text-sm text-gray-500 mb-4">{group.category} • {group.is_private ? 'خاصة' : 'عامة'}</p>

                            <div className="flex items-center justify-between text-sm py-2 border-t border-gray-50">
                                <span className="text-gray-600">الأعضاء: <span className="font-bold text-gray-900">{group.member_count}</span></span>
                                <span className="text-gray-400 text-xs">{new Date(group.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                    {groups.length === 0 && <div className="col-span-full text-center text-gray-500 py-8">لا توجد مجموعات حالياً</div>}
                </div>
            )}

            <ConfirmDeleteModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={() => { if (deleteId) deleteGroup(deleteId); }}
                title="حذف المجموعة"
                message="هل أنت متأكد من حذف هذه المجموعة؟ لا يمكن التراجع عن هذا الإجراء."
            />
        </div>
    );
};
