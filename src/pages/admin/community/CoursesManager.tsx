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
    Image as ImageIcon,
    CheckCircle,
    FileText,
    User,
    MapPin,
    Clock,
    DollarSign,
    TrendingUp,
    Award
} from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { useCommunity } from '../../../hooks/useCommunity'; // Added import

export const CoursesManager: React.FC = () => {
    const { events, adminAddEvent, adminUpdateEvent, adminDeleteEvent } = useCommunity();

    // Filter only courses from the global event list
    const courses = events.filter(c => c.category === 'دورة');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState<'general' | 'instructor' | 'details' | 'content'>('general');

    const isEventEnded = (dateString: string) => {
        try {
            return new Date(dateString) < new Date();
        } catch (e) { return false; }
    };

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        level: 'مبتدئ',
        featured: false,
        image: '',
        instructor: '',
        instructorTitle: '',
        instructorImage: '',
        instructorBio: '',
        date: '',
        location: '',
        duration: '',
        price: 0,
        features: [''] as string[],
        syllabus: [{ title: '', duration: '' }] as { title: string; duration: string }[]
    });

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            level: 'مبتدئ',
            featured: false,
            image: '',
            instructor: '',
            instructorTitle: '',
            instructorImage: '',
            instructorBio: '',
            date: '',
            location: '',
            duration: '',
            price: 0,
            features: [''],
            syllabus: [{ title: '', duration: '' }]
        });
        setEditingCourse(null);
        setActiveTab('general');
    };

    const handleOpenModal = (course?: any) => {
        if (course) {
            setEditingCourse(course);
            setFormData({
                title: course.title,
                description: course.description || '',
                level: course.level || 'مبتدئ',
                featured: course.featured || false,
                image: course.image || '',
                instructor: course.instructor || '',
                instructorTitle: 'خبير',
                instructorImage: '',
                instructorBio: 'نبذة...',
                date: course.date || '',
                location: course.location || 'Online',
                duration: course.duration || '20 ساعة',
                price: course.price || 0,
                features: course.features || [''],
                syllabus: course.syllabus || [{ title: '', duration: '' }]
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleSubmit = async () => {
        const courseData = {
            ...formData,
            category: 'دورة' as const,
            level: formData.level as "مبتدئ" | "متوسط" | "متقدم",
            rating: editingCourse?.rating || 5,
            students: editingCourse?.students || 0
        };

        if (editingCourse) {
            await adminUpdateEvent({ ...courseData, id: editingCourse.id });
        } else {
            await adminAddEvent(courseData);
        }
        handleCloseModal();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الدورة؟')) {
            await adminDeleteEvent(id);
        }
    };

    const handleArrayChange = (type: 'features' | 'syllabus', index: number, field: string | null, value: string) => {
        if (type === 'features') {
            const newFeatures = [...formData.features];
            newFeatures[index] = value;
            setFormData({ ...formData, features: newFeatures });
        } else {
            const newSyllabus = [...formData.syllabus];
            // @ts-ignore
            newSyllabus[index][field] = value;
            setFormData({ ...formData, syllabus: newSyllabus });
        }
    };

    const addArrayItem = (type: 'features' | 'syllabus') => {
        if (type === 'features') {
            setFormData({ ...formData, features: [...formData.features, ''] });
        } else {
            setFormData({ ...formData, syllabus: [...formData.syllabus, { title: '', duration: '' }] });
        }
    };

    const removeArrayItem = (type: 'features' | 'syllabus', index: number) => {
        if (type === 'features') {
            setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });
        } else {
            setFormData({ ...formData, syllabus: formData.syllabus.filter((_, i) => i !== index) });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">إدارة الدورات التدريبية</h2>
                    <p className="text-gray-500">لديك {courses.length} دورة نشطة</p>
                </div>
                <Button className="bg-purple-600 text-white" onClick={() => handleOpenModal()}>
                    <Plus className="w-5 h-5 ml-2" /> إضافة دورة جديدة
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {courses.map((course) => {
                    const isEnded = isEventEnded(course.date);
                    return (
                        <div key={course.id} className={`flex items-center justify-between p-4 bg-white border rounded-xl transition-shadow hover:shadow-md ${isEnded ? 'bg-gray-50 border-gray-200' : 'border-gray-100'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold text-xl overflow-hidden ${isEnded ? 'bg-gray-200 text-gray-400' : 'bg-purple-50 text-purple-600'}`}>
                                    {course.image ? (
                                        <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        course.title.charAt(0)
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className={`font-bold ${isEnded ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{course.title}</h3>
                                        {isEnded && <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">منتهية</span>}
                                        {course.featured && !isEnded && <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">مميزة</span>}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                        <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {course.students} طالب</span>
                                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {course.date}</span>
                                        <span className="flex items-center gap-1 font-bold text-purple-600">
                                            {course.price === 0 ? 'مجاني' : `${course.price.toLocaleString()} د.ع`}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleOpenModal(course)} className="text-blue-600 hover:bg-blue-50">
                                    <Edit2 className="w-4 h-4 ml-1" /> تعديل
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(course.id)} className="text-red-500 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-900">{editingCourse ? 'تعديل الدورة' : 'إضافة دورة جديدة'}</h3>
                            <Button variant="ghost" size="sm" onClick={handleCloseModal}><X className="w-6 h-6" /></Button>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex gap-1 p-2 bg-gray-50 border-b border-gray-100 overflow-x-auto">
                            {[
                                { id: 'general', label: 'معلومات الدورة', icon: FileText },
                                { id: 'instructor', label: 'المحاضر', icon: User },
                                { id: 'details', label: 'التفاصيل والوقت', icon: Calendar },
                                { id: 'content', label: 'المحتوى والمنهج', icon: CheckCircle },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}
                                >
                                    <tab.icon className="w-4 h-4" /> {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {activeTab === 'general' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">اسم الدورة</label>
                                            <input type="text" className="w-full px-4 py-2 rounded-xl border border-gray-200" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">وصف الدورة</label>
                                            <textarea rows={4} className="w-full px-4 py-2 rounded-xl border border-gray-200" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">المستوى</label>
                                            <select className="w-full px-4 py-2 rounded-xl border border-gray-200" value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })}>
                                                <option value="مبتدئ">مبتدئ</option>
                                                <option value="متوسط">متوسط</option>
                                                <option value="متقدم">متقدم</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">صورة الخلفية</label>
                                            <input type="text" className="w-full px-4 py-2 rounded-xl border border-gray-200" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="flex items-center gap-2 cursor-pointer p-4 border border-purple-100 bg-purple-50 rounded-xl">
                                                <input type="checkbox" className="w-5 h-5 text-purple-600 rounded" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} />
                                                <span className="font-bold text-purple-900">تمييز الدورة (Featured)</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'instructor' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المحاضر</label>
                                            <input type="text" className="w-full px-4 py-2 rounded-xl border border-gray-200" value={formData.instructor} onChange={(e) => setFormData({ ...formData, instructor: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'details' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                                            <input type="text" className="w-full px-4 py-2 rounded-xl border border-gray-200" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">المدة</label>
                                            <input type="text" className="w-full px-4 py-2 rounded-xl border border-gray-200" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">المكان</label>
                                            <input type="text" className="w-full px-4 py-2 rounded-xl border border-gray-200" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">السعر (د.ع)</label>
                                            <input type="number" className="w-full px-4 py-2 rounded-xl border border-gray-200" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'content' && (
                                <div className="p-4 text-center text-gray-500">
                                    {/* Simplified content editor for now */}
                                    يمكن إضافة المحتوى التفصيلي لاحقاً
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <Button variant="ghost" onClick={handleCloseModal}>إلغاء</Button>
                            <Button onClick={handleSubmit} className="bg-purple-600 text-white px-8">{editingCourse ? 'حفظ التغييرات' : 'إضافة الدورة'}</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
