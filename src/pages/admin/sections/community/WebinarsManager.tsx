import React, { useState } from 'react';
import {
    Search,
    Plus,
    Calendar,
    Users,
    Edit2,
    Trash2,
    Eye,
    X,
    Video,
    Clock
} from 'lucide-react';
import { Button } from '../../../../components/common/Button';
import { useAdminCommunity, CommunityEvent } from '../../../../hooks/useAdminCommunity';
import { FormModal, ConfirmDeleteModal } from '../../../../components/admin/AdminModal';

export const WebinarsManager: React.FC = () => {
    const { webinars, loading, addEvent, updateEvent, deleteEvent } = useAdminCommunity();
    const [selectedWebinar, setSelectedWebinar] = useState<CommunityEvent | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleSave = async (formData: any) => {
        const data = {
            title: formData.title,
            instructor: formData.instructor,
            price: parseFloat(formData.price || 0),
            date: formData.date,
            time: formData.time,
            type: 'webinar',
            status: 'scheduled',
            max_attendees: parseInt(formData.max_attendees) || 100
        };

        if (selectedWebinar && viewMode !== 'list') {
            // Logic handled below
        } else {
            await addEvent(data);
        }
        setShowFormModal(false);
    };

    const confirmDelete = async () => {
        if (selectedWebinar) {
            await deleteEvent(selectedWebinar.id);
            setShowDeleteModal(false);
            setSelectedWebinar(null);
            setViewMode('list');
        }
    };

    const renderWebinarList = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="بحث في الندوات..."
                        className="w-full pr-10 pl-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <Button className="bg-green-600 text-white" onClick={() => { setSelectedWebinar(null); setShowFormModal(true); }}>
                    <Plus className="w-5 h-5 ml-2" />
                    جدولة ندوة جديدة
                </Button>
            </div>

            {loading ? <div className="text-center p-8">جاري التحميل...</div> : (
                <div className="grid grid-cols-1 gap-4">
                    {webinars.map((webinar) => (
                        <div key={webinar.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center text-green-600 font-bold text-xl">
                                    <Video className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{webinar.title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            {webinar.current_attendees}/{webinar.max_attendees}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(webinar.date).toLocaleDateString('ar-IQ')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {webinar.time}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => { setSelectedWebinar(webinar); setViewMode('details'); }}
                                    className="text-blue-600 hover:bg-blue-50"
                                >
                                    <Eye className="w-4 h-4 ml-1" />
                                    التفاصيل
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-500 hover:bg-gray-50"
                                    onClick={() => { setSelectedWebinar(webinar); setShowFormModal(true); }}
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:bg-red-50"
                                    onClick={() => { setSelectedWebinar(webinar); setShowDeleteModal(true); }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {webinars.length === 0 && <div className="text-center p-8 text-gray-500">لا توجد ندوات مجدولة حالياً</div>}
                </div>
            )}
        </div>
    );

    const renderDetails = () => (
        <div className="space-y-6 animate-in slide-in-from-left-4">
            {selectedWebinar && (
                <>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" onClick={() => setViewMode('list')}>
                                <X className="w-5 h-5" />
                            </Button>
                            <h2 className="text-xl font-bold">{selectedWebinar.title}</h2>
                        </div>
                        <div className="flex gap-2">
                            {/* Save button logic could be improved with local state binding */}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الندوة</label>
                                <input type="text" defaultValue={selectedWebinar.title} className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                    onBlur={(e) => updateEvent(selectedWebinar.id, { title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">المحاضر</label>
                                <input type="text" defaultValue={selectedWebinar.instructor} className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                    onBlur={(e) => updateEvent(selectedWebinar.id, { instructor: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                                <input type="date" defaultValue={selectedWebinar.date} className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                    onBlur={(e) => updateEvent(selectedWebinar.id, { date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الوقت</label>
                                <input type="time" defaultValue={selectedWebinar.time} className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                    onBlur={(e) => updateEvent(selectedWebinar.id, { time: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">السعر (0 = مجاني)</label>
                                <input type="number" defaultValue={selectedWebinar.price} className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                    onBlur={(e) => updateEvent(selectedWebinar.id, { price: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الحد الأقصى للحضور</label>
                                <input type="number" defaultValue={selectedWebinar.max_attendees} className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                    onBlur={(e) => updateEvent(selectedWebinar.id, { max_attendees: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    return (
        <>
            {viewMode === 'list' ? renderWebinarList() : renderDetails()}

            <FormModal
                isOpen={showFormModal}
                onClose={() => { setShowFormModal(false); setSelectedWebinar(null); }}
                title={selectedWebinar ? 'تعديل الندوة' : 'جدولة ندوة جديدة'}
                fields={[
                    { name: 'title', label: 'عنوان الندوة', type: 'text', required: true },
                    { name: 'instructor', label: 'المحاضر', type: 'text', required: true },
                    { name: 'date', label: 'التاريخ', type: 'date', required: true },
                    { name: 'time', label: 'الوقت', type: 'time', required: true },
                    { name: 'max_attendees', label: 'الحد الأقصى للحضور', type: 'number', required: true, placeholder: '100' },
                    { name: 'price', label: 'السعر (اتركه فارغاً للمجاني)', type: 'number', required: false }
                ]}
                initialValues={selectedWebinar || {}}
                onSubmit={selectedWebinar ? (data) => updateEvent(selectedWebinar.id, data).then(() => setShowFormModal(false)) : handleSave}
            />

            <ConfirmDeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="حذف الندوة"
                message="هل انت متأكد من حذف هذه الندوة؟"
                itemName={selectedWebinar?.title}
            />
        </>
    );
};
