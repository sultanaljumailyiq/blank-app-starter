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
    CheckCircle
} from 'lucide-react';
import { Button } from '../../../../components/common/Button';
import { useAdminCommunity, CommunityEvent } from '../../../../hooks/useAdminCommunity';
import { FormModal, ConfirmDeleteModal } from '../../../../components/admin/AdminModal';

export const CoursesManager: React.FC = () => {
    const { courses, loading, addEvent, updateEvent, deleteEvent } = useAdminCommunity();
    const [selectedCourse, setSelectedCourse] = useState<CommunityEvent | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
    const [activeDetailTab, setActiveDetailTab] = useState<'info' | 'students' | 'inquiries'>('info');
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Mock Inquiries for Admin (Placeholder until strict schema)
    const [inquiries, setInquiries] = useState([
        { id: 1, user: 'د. أحمد', question: 'هل الشهادة معتمدة دولياً؟', date: '2024-03-10', status: 'pending', reply: '' },
        { id: 2, user: 'د. سارة', question: 'هل يمكن تقسيط المبلغ؟', date: '2024-03-11', status: 'replied', reply: 'نعم دكتورة، يمكن الدفع على دفعتين.' },
    ]);

    const handleReply = (id: number, text: string) => {
        setInquiries(inquiries.map(img => img.id === id ? { ...img, status: 'replied', reply: text } : img));
    };

    const handleSave = async (formData: any) => {
        const data = {
            title: formData.title,
            instructor: formData.instructor,
            price: parseFloat(formData.price),
            date: formData.date,
            description: formData.description,
            type: 'course',
            status: 'scheduled'
        };

        if (selectedCourse && viewMode !== 'list') {
            // If editing from list/details
            // Logic handled below for update
        } else {
            await addEvent(data);
        }
        setShowFormModal(false);
    };

    const handleUpdate = async () => {
        if (!selectedCourse) return;
        // In a real form we would gather inputs. For now assuming local state binding or creating a form for update.
        // Let's use the form modal for updates too.
        setShowFormModal(true);
    }

    const confirmDelete = async () => {
        if (selectedCourse) {
            await deleteEvent(selectedCourse.id);
            setShowDeleteModal(false);
            setSelectedCourse(null);
            setViewMode('list');
        }
    };

    const renderCourseList = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="بحث في الدورات..."
                        className="w-full pr-10 pl-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <Button className="bg-purple-600 text-white" onClick={() => { setSelectedCourse(null); setShowFormModal(true); }}>
                    <Plus className="w-5 h-5 ml-2" />
                    إضافة دورة جديدة
                </Button>
            </div>

            {loading ? <div className="text-center p-8">جاري التحميل...</div> : (
                <div className="grid grid-cols-1 gap-4">
                    {courses.map((course) => (
                        <div key={course.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center text-purple-600 font-bold text-xl">
                                    {course.title[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{course.title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            {course.current_attendees} مشترك
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(course.date).toLocaleDateString('ar-IQ')}
                                        </span>
                                        <span className="flex items-center gap-1 font-bold text-purple-600">
                                            {course.price.toLocaleString()} د.ع
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => { setSelectedCourse(course); setViewMode('details'); }}
                                    className="text-blue-600 hover:bg-blue-50"
                                >
                                    <Eye className="w-4 h-4 ml-1" />
                                    التفاصيل
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-500 hover:bg-gray-50"
                                    onClick={() => { setSelectedCourse(course); setShowFormModal(true); }}
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:bg-red-50"
                                    onClick={() => { setSelectedCourse(course); setShowDeleteModal(true); }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {courses.length === 0 && <div className="text-center p-8 text-gray-500">لا توجد دورات حالياً</div>}
                </div>
            )}
        </div>
    );

    const renderDetails = () => (
        <div className="space-y-6 animate-in slide-in-from-left-4">
            {selectedCourse && (
                <>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" onClick={() => setViewMode('list')}>
                                <X className="w-5 h-5" />
                            </Button>
                            <h2 className="text-xl font-bold">{selectedCourse.title}</h2>
                        </div>
                        <div className="flex gap-2">
                            <Button className="bg-blue-600 text-white" onClick={() => updateEvent(selectedCourse.id, { /* capture form state if needed, or simply re-open modal */ })}>
                                حفظ التغييرات
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-2 border-b border-gray-200 pb-1">
                        <button
                            onClick={() => setActiveDetailTab('info')}
                            className={`px-4 py-2 font-medium text-sm transition-colors ${activeDetailTab === 'info' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
                        >
                            المعلومات الأساسية
                        </button>
                        <button
                            onClick={() => setActiveDetailTab('students')}
                            className={`px-4 py-2 font-medium text-sm transition-colors ${activeDetailTab === 'students' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
                        >
                            المشتركين ({selectedCourse.current_attendees})
                        </button>
                        <button
                            onClick={() => setActiveDetailTab('inquiries')}
                            className={`px-4 py-2 font-medium text-sm transition-colors ${activeDetailTab === 'inquiries' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
                        >
                            الاستفسارات <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-xs mx-1">{inquiries.filter(i => i.status === 'pending').length}</span>
                        </button>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-6">
                        {activeDetailTab === 'info' && (
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الدورة</label>
                                    <input type="text" defaultValue={selectedCourse.title} className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                        onBlur={(e) => updateEvent(selectedCourse.id, { title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">المحاضر</label>
                                    <input type="text" defaultValue={selectedCourse.instructor} className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                        onBlur={(e) => updateEvent(selectedCourse.id, { instructor: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">السعر (د.ع)</label>
                                    <input type="number" defaultValue={selectedCourse.price} className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                        onBlur={(e) => updateEvent(selectedCourse.id, { price: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                                    <input type="date" defaultValue={selectedCourse.date} className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                        onBlur={(e) => updateEvent(selectedCourse.id, { date: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                                    <textarea defaultValue={selectedCourse.description} rows={4} className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                        onBlur={(e) => updateEvent(selectedCourse.id, { description: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {activeDetailTab === 'students' && (
                            <div className="text-center py-12 text-gray-500">
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>قائمة المشتركين ستظهر هنا</p>
                            </div>
                        )}

                        {activeDetailTab === 'inquiries' && (
                            <div className="space-y-4">
                                {inquiries.map((inquiry) => (
                                    <div key={inquiry.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900">{inquiry.user}</span>
                                                <span className="text-xs text-gray-500">{inquiry.date}</span>
                                            </div>
                                            {inquiry.status === 'replied' ? (
                                                <span className="text-green-600 text-xs font-bold flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" />
                                                    تم الرد
                                                </span>
                                            ) : (
                                                <span className="text-amber-600 text-xs font-bold bg-amber-100 px-2 py-1 rounded-full">
                                                    بانتظار الرد
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-800 font-medium mb-3">{inquiry.question}</p>

                                        {inquiry.status === 'replied' ? (
                                            <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm text-gray-600">
                                                <span className="font-bold text-purple-600 block mb-1">ردك:</span>
                                                {inquiry.reply}
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input type="text" placeholder="اكتب رداً..." className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm" />
                                                <Button size="sm" className="bg-purple-600 text-white" onClick={() => handleReply(inquiry.id, 'تم الرد (تجريبي)')}>
                                                    إرسال الرد
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );

    return (
        <>
            {viewMode === 'list' ? renderCourseList() : renderDetails()}

            <FormModal
                isOpen={showFormModal}
                onClose={() => { setShowFormModal(false); setSelectedCourse(null); }}
                title={selectedCourse ? 'تعديل الدورة' : 'إضافة دورة جديدة'}
                fields={[
                    { name: 'title', label: 'عنوان الدورة', type: 'text', required: true },
                    { name: 'instructor', label: 'المحاضر', type: 'text', required: true },
                    { name: 'price', label: 'السعر (د.ع)', type: 'number', required: true },
                    { name: 'date', label: 'التاريخ', type: 'date', required: true },
                    { name: 'description', label: 'الوصف', type: 'textarea', required: true }
                ]}
                initialValues={selectedCourse || {}}
                onSubmit={selectedCourse ? (data) => updateEvent(selectedCourse.id, data).then(() => setShowFormModal(false)) : handleSave}
            />

            <ConfirmDeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="حذف الدورة"
                message="هل أنت متأكد من حذف هذه الدورة؟ لا يمكن التراجع عن هذا الإجراء."
                itemName={selectedCourse?.title}
            />
        </>
    );
};

