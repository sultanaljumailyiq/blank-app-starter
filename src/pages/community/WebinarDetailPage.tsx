import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowRight, Calendar, Clock, MapPin,
    Share2, Bookmark, User, Video,
    CheckCircle, MessageSquare, Star, Shield
} from 'lucide-react';
import { mockCourses } from '../../data/mock';
import { useAuth } from '../../contexts/AuthContext';
import { useCommunity } from '../../hooks/useCommunity';
import { Button } from '../../components/common/Button';

export const WebinarDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { events, registerForEvent, myEnrollments, toggleSave, isSaved } = useCommunity();
    const webinar = events.find(c => c.id === id);
    const isEnrolled = myEnrollments.some(e => e.itemId === id && e.status === 'registered');
    const isItemSaved = webinar ? isSaved(webinar.id) : false;

    const [activeTab, setActiveTab] = useState<'about' | 'speakers' | 'discussions'>('about');

    if (!webinar) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <h2 className="text-xl font-bold text-gray-900 mb-2">الندوة غير موجودة</h2>
                <Button onClick={() => navigate(-1)} variant="outline">
                    <ArrowRight className="w-4 h-4 ml-2" />
                    رجوع
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
            {/* 1. HERO HEADER (Mobile First) */}
            <div className="relative h-[40vh] md:h-[50vh] w-full bg-gray-900 rounded-b-[3rem] overflow-hidden shadow-2xl shadow-purple-900/20">
                <img
                    src={webinar.image || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800'}
                    className="w-full h-full object-cover opacity-60"
                    alt="Webinar Cover"
                />

                {/* Navbar Overlay */}
                <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all">
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <div className="flex gap-2">
                        <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => toggleSave(webinar, 'webinar')}
                            className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${isItemSaved ? 'bg-orange-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            <Bookmark className={`w-5 h-5 ${isItemSaved ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Title & Badge Overlay */}
                <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-gray-900/90 to-transparent pt-20">
                    <span className="inline-block px-3 py-1 rounded-full bg-purple-500 text-white text-xs font-bold mb-3 shadow-lg shadow-purple-500/30">
                        {webinar.category}
                    </span>
                    <h1 className="text-3xl font-black text-white leading-tight mb-2 drop-shadow-sm">{webinar.title}</h1>
                    <div className="flex items-center gap-3 text-white/80 text-sm">
                        <span className="flex items-center gap-1"><User className="w-4 h-4" /> {webinar.instructor}</span>
                        <span className="w-1 h-1 rounded-full bg-white/50"></span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {webinar.duration}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10">

                {/* 2. STATS ROW */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <StatCard icon={Calendar} label="الموعد" value={webinar.date} color="text-purple-500" bg="bg-purple-50" />
                    <StatCard icon={Video} label="المنصة" value="Zoom" color="text-blue-500" bg="bg-blue-50" />
                    <StatCard icon={Shield} label="الشهادة" value={(webinar as any).certification ? 'نعم' : 'لا'} color="text-pink-500" bg="bg-pink-50" />
                </div>

                {/* 3. TABS */}
                <div className="flex p-1 bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
                    {['about', 'speakers', 'discussions'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === tab ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            {tab === 'about' && 'التفاصيل'}
                            {tab === 'speakers' && 'المتحدثون'}
                            {tab === 'discussions' && 'الأسئلة'}
                        </button>
                    ))}
                </div>

                {/* 4. CONTENT */}
                <div className="space-y-6 pb-24">
                    {activeTab === 'about' && (
                        <>
                            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 text-lg mb-3">عن الندوة</h3>
                                <p className="text-gray-600 leading-7 text-sm">{webinar.description}</p>
                            </div>

                            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 text-lg mb-4">ماذا ستتعلم؟</h3>
                                <div className="grid gap-3">
                                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-2xl">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <span className="font-bold text-gray-700 text-sm">أحدث التقنيات في المجال</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-2xl">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <span className="font-bold text-gray-700 text-sm">مناقشة حالات سريرية</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'speakers' && (
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl font-bold text-purple-500">
                                {webinar.instructor?.[0] || '?'}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{webinar.instructor || 'Unknown Instructor'}</h3>
                                <p className="text-purple-600 text-sm font-medium">المتحدث الرئيسي</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'discussions' && (
                        <div className="bg-white rounded-[2rem] p-8 text-center border border-gray-100 border-dashed">
                            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-bold">لا توجد أسئلة بعد</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 5. ACTION BAR */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 pb-6 z-50 flex items-center justify-between shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                <div>
                    <p className="text-xs text-gray-500 font-bold mb-0.5">التكلفة</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-purple-600">
                            {webinar.price === 0 ? 'مجاني' : `$${webinar.price}`}
                        </span>
                    </div>
                </div>
                {new Date(webinar.date) < new Date() ? (
                    <button
                        disabled
                        className="px-8 py-3 rounded-2xl font-bold bg-gray-100 text-gray-400 cursor-not-allowed flex items-center gap-2"
                    >
                        منتهية
                    </button>
                ) : (
                    <button
                        onClick={() => id && registerForEvent(id)}
                        disabled={isEnrolled}
                        className={`px-8 py-3 rounded-2xl font-bold shadow-lg shadow-purple-900/20 active:scale-95 transition-transform flex items-center gap-2 ${isEnrolled ? 'bg-green-600 text-white cursor-default' : 'bg-purple-900 text-white'}`}
                    >
                        {isEnrolled ? (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                مسجل
                            </>
                        ) : (
                            <>
                                حجز مقعد
                                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color, bg }: any) => (
    <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center h-28">
        <div className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center ${color} mb-2`}>
            <Icon className="w-5 h-5" />
        </div>
        <span className="text-[10px] text-gray-400 font-bold mb-0.5">{label}</span>
        <span className="font-bold text-gray-900 text-xs line-clamp-1">{value}</span>
    </div>
);
