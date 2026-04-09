import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, GraduationCap, Video, Play, Award, CheckCircle } from 'lucide-react';
import { mockCourses } from '../../data/mock';
import { useCommunity } from '../../hooks/useCommunity';

export const MyLearningPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') === 'webinars' ? 'webinars' : 'courses';

    const setTab = (tab: 'courses' | 'webinars') => {
        setSearchParams({ tab });
    };

    const { myEnrollments } = useCommunity();

    // Filter "Registered" items (Real)
    const enrolledItems = myEnrollments
        .map(e => {
            const item = mockCourses.find(c => c.id === e.itemId);
            return item ? { ...item, enrollmentStatus: e.status } : null;
        })
        .filter((item): item is Exclude<typeof item, null> => item !== null);

    const myCourses = enrolledItems.filter(c => c.category === 'دورة');
    const myWebinars = enrolledItems.filter(c => c.category === 'ندوة');

    const items = activeTab === 'courses' ? myCourses : myWebinars;

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* 1. Header (Mobile Optimized) */}
            <div className="bg-white sticky top-0 z-30 shadow-sm px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">تعليمي</h1>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        2 شهادة
                    </div>
                </div>
            </div>

            {/* 2. Toggle Switcher */}
            <div className="p-4 sticky top-[72px] z-20 bg-gray-50/95 backdrop-blur-sm">
                <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 flex">
                    <button
                        onClick={() => setTab('courses')}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'courses' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <GraduationCap className="w-4 h-4" />
                        الدورات
                    </button>
                    <button
                        onClick={() => setTab('webinars')}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'webinars' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <Video className="w-4 h-4" />
                        الندوات
                    </button>
                </div>
            </div>

            {/* 3. Content List */}
            <div className="px-4 space-y-4">
                {items.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => navigate(activeTab === 'courses' ? `/community/course/${item.id}` : `/community/webinar/${item.id}`)}
                        className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 cursor-pointer active:scale-[0.98] transition-all"
                    >
                        <div className="aspect-video w-full rounded-2xl overflow-hidden mb-4 relative">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                                    <Play className="w-6 h-6 fill-current ml-1" />
                                </div>
                            </div>

                            {activeTab === 'courses' && (
                                <div className="absolute bottom-3 left-3 right-3">
                                    <div className="bg-black/50 backdrop-blur-md rounded-full h-2 w-full overflow-hidden">
                                        <div className="bg-green-500 h-full w-[75%]"></div>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[10px] text-white font-medium">مكتمل 75%</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${activeTab === 'courses' ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                    {activeTab === 'courses' ? 'دورة مسجلة' : 'ندوة مسجلة'}
                                </span>
                                {item.id === '1' && (
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-green-50 text-green-600 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> مكتمل
                                    </span>
                                )}
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2">{item.title}</h3>
                            <p className="text-sm text-gray-500">{item.instructor}</p>

                            <button className={`w-full mt-4 py-3 rounded-xl font-bold text-sm text-white shadow-lg shadow-gray-200 transition-all ${activeTab === 'courses' ? 'bg-gray-900' : 'bg-emerald-600'}`}>
                                {activeTab === 'courses' ? 'متابعة المشاهدة' : 'مشاهدة التسجيل'}
                            </button>
                        </div>
                    </div>
                ))}

                {items.length === 0 && (
                    <div className="text-center py-10">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            {activeTab === 'courses' ? <GraduationCap className="w-8 h-8" /> : <Video className="w-8 h-8" />}
                        </div>
                        <h3 className="font-bold text-gray-900">لا يوجد محتوى مسجل</h3>
                        <p className="text-gray-500 text-sm mt-2">تصفح المكتبة لإضافة محتوى جديد</p>
                    </div>
                )}
            </div>
        </div>
    );
};
