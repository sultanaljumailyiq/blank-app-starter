import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bookmark, ArrowRight, LayoutGrid, FileText,
    Video, BookOpen, Share2, MoreVertical, Heart, MessageCircle, Box
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useCommunity } from '../../hooks/useCommunity';

// --- Card Components ---

// 1. Post Card (Reused from OverviewTab/PremiumPostCard but simplified for grid)
const SavedPostCard = ({ post, onUnsave }: any) => (
    <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 flex flex-col h-full group hover:shadow-md transition-all">
        <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                {post.authorName[0]}
            </div>
            <div>
                <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{post.authorName}</h4>
                <p className="text-[10px] text-gray-500">{post.date}</p>
            </div>
            {/* Post doesn't usually have a dedicated page, but we could add a modal open here if needed */}
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">{post.content}</p>
        {post.image && (
            <div className="h-32 rounded-xl bg-gray-50 mb-4 overflow-hidden">
                <img src={post.image} alt="Post" className="w-full h-full object-cover" />
            </div>
        )}
        <div className="flex justify-end pt-2 border-t border-gray-50">
            <button
                onClick={onUnsave}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
            >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
                إزالة من المحفوظات
            </button>
        </div>
    </div>
);

// 2. Course Card
const SavedCourseCard = ({ course, onUnsave, onClick }: any) => (
    <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full group hover:shadow-md transition-all">
        <div className="h-40 bg-purple-100 relative cursor-pointer" onClick={onClick}>
            <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-purple-300" />
            </div>
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-purple-600">
                دورة تدريبية
            </div>
        </div>
        <div className="p-4 flex flex-col flex-1">
            <h3 className="font-bold text-gray-900 mb-1 cursor-pointer hover:text-purple-600 transition-colors" onClick={onClick}>
                {course.title || 'دورة تعليمية'}
            </h3>
            <p className="text-gray-500 text-xs mb-4">{course.instructor || 'د. غير محدد'}</p>
            <div className="mt-auto flex justify-between items-center">
                <span className="text-xs font-bold text-purple-600">{course.price ? `${course.price} د.ع` : 'مجاني'}</span>
                <button
                    onClick={onUnsave}
                    className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                >
                    <Bookmark className="w-4 h-4 fill-current" />
                </button>
            </div>
        </div>
    </div>
);

// 3. Webinar Card
const SavedWebinarCard = ({ webinar, onUnsave, onClick }: any) => (
    <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full group hover:shadow-md transition-all">
        <div className="h-40 bg-emerald-100 relative cursor-pointer" onClick={onClick}>
            <div className="absolute inset-0 flex items-center justify-center">
                <Video className="w-12 h-12 text-emerald-300" />
            </div>
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-600">
                ندوة مباشرة
            </div>
        </div>
        <div className="p-4 flex flex-col flex-1">
            <h3 className="font-bold text-gray-900 mb-1 cursor-pointer hover:text-emerald-600 transition-colors" onClick={onClick}>
                {webinar.title || 'ندوة علمية'}
            </h3>
            <p className="text-gray-500 text-xs mb-4">{webinar.date || 'قريباً'}</p>
            <div className="mt-auto flex justify-between items-center">
                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold">تسجيل متاح</span>
                <button
                    onClick={onUnsave}
                    className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                >
                    <Bookmark className="w-4 h-4 fill-current" />
                </button>
            </div>
        </div>
    </div>
);

// 4. Resource Card
const SavedResourceCard = ({ resource, onUnsave, onClick }: any) => (
    <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 flex flex-col h-full group hover:shadow-md transition-all">
        <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                <FileText className="w-5 h-5" />
            </div>
            <button
                onClick={onUnsave}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
                <Bookmark className="w-4 h-4 fill-current" />
            </button>
        </div>
        <h3 className="font-bold text-gray-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors" onClick={onClick}>
            {resource.title || 'مصدر علمي'}
        </h3>
        <p className="text-gray-500 text-xs line-clamp-2 mb-3">{resource.description || 'وصف المصدر...'}</p>
        <div className="mt-auto pt-3 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
            <span>{resource.category || 'عام'}</span>
            <span className="flex items-center gap-1 font-bold text-blue-600 cursor-pointer" onClick={onClick}>
                عرض <ArrowRight className="w-3 h-3" />
            </span>
        </div>
    </div>
);

// 5. Model Card
const SavedModelCard = ({ model, onUnsave, onClick }: any) => (
    <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full group hover:shadow-md transition-all">
        <div className="h-40 bg-gray-900 relative cursor-pointer" onClick={onClick}>
            {model.image && (
                <img src={model.image} alt={model.title} className="w-full h-full object-cover opacity-60" />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
                <Box className="w-12 h-12 text-blue-300" />
            </div>
            <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-white">
                3D نموذج
            </div>
        </div>
        <div className="p-4 flex flex-col flex-1">
            <h3 className="font-bold text-gray-900 mb-1 cursor-pointer hover:text-blue-600 transition-colors" onClick={onClick}>
                {model.title || 'نموذج ثلاثي الأبعاد'}
            </h3>
            <p className="text-gray-500 text-xs mb-4">{model.author || 'Sketchfab'}</p>
            <div className="mt-auto flex justify-between items-center">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">تفاعلي</span>
                <button
                    onClick={onUnsave}
                    className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                >
                    <Bookmark className="w-4 h-4 fill-current" />
                </button>
            </div>
        </div>
    </div>
);

export const SavedPage: React.FC = () => {
    const navigate = useNavigate();
    const { savedItems, toggleSave } = useCommunity();
    const [activeTab, setActiveTab] = useState<'posts' | 'webinars' | 'courses' | 'resources' | '3d'>('posts');

    // Filter Items
    const getFilteredItems = () => {
        return savedItems.filter(item => {
            if (activeTab === 'posts') return item.type === 'post';
            if (activeTab === 'webinars') return item.type === 'webinar';
            if (activeTab === 'courses') return item.type === 'course';
            if (activeTab === 'resources') return item.type === 'resource';
            if (activeTab === '3d') return item.type === 'model';
            return false;
        });
    };

    const filteredItems = getFilteredItems();

    const handleUnsave = (item: any) => {
        toggleSave(item.data, item.type);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4 mb-4">
                        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                        <h1 className="text-2xl font-black text-gray-900">المحفوظات</h1>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                        <TabButton label="المنشورات" active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} icon={LayoutGrid} />
                        <TabButton label="الندوات" active={activeTab === 'webinars'} onClick={() => setActiveTab('webinars')} icon={Video} />
                        <TabButton label="الدورات" active={activeTab === 'courses'} onClick={() => setActiveTab('courses')} icon={BookOpen} />
                        <TabButton label="المصادر" active={activeTab === 'resources'} onClick={() => setActiveTab('resources')} icon={FileText} />
                        <TabButton label="3D" active={activeTab === '3d'} onClick={() => setActiveTab('3d')} icon={Box} />
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="container mx-auto px-4 py-6">
                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredItems.map(item => (
                            <div key={item.id}>
                                {activeTab === 'posts' && <SavedPostCard post={item.data} onUnsave={() => handleUnsave(item)} />}
                                {activeTab === 'courses' && <SavedCourseCard course={item.data} onUnsave={() => handleUnsave(item)} onClick={() => navigate(`/community/course/${item.data.id}`)} />}
                                {activeTab === 'webinars' && <SavedWebinarCard webinar={item.data} onUnsave={() => handleUnsave(item)} onClick={() => navigate(`/community/webinar/${item.data.id}`)} />}
                                {activeTab === 'resources' && <SavedResourceCard resource={item.data} onUnsave={() => handleUnsave(item)} onClick={() => navigate(`/community/resource/${item.data.id}`)} />}
                                {activeTab === '3d' && <SavedModelCard model={item.data} onUnsave={() => handleUnsave(item)} onClick={() => navigate(`/community/model/${item.data.id}`)} />}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            {activeTab === 'posts' && <LayoutGrid className="w-10 h-10 text-gray-300" />}
                            {activeTab === 'courses' && <BookOpen className="w-10 h-10 text-gray-300" />}
                            {activeTab === 'webinars' && <Video className="w-10 h-10 text-gray-300" />}
                            {activeTab === 'resources' && <FileText className="w-10 h-10 text-gray-300" />}
                            {activeTab === '3d' && <Box className="w-10 h-10 text-gray-300" />}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">لا توجد عناصر محفوظة</h3>
                        <p className="text-gray-500">لم تقم بحفظ أي {
                            activeTab === 'posts' ? 'منشورات' :
                                activeTab === 'courses' ? 'دورات' :
                                    activeTab === 'webinars' ? 'ندوات' :
                                        activeTab === 'resources' ? 'مصادر' : 'نماذج 3D'
                        } بعد</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const TabButton = ({ label, active, onClick, icon: Icon }: any) => (
    <button
        onClick={onClick}
        className={`
            flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all
            ${active
                ? 'bg-gray-900 text-white shadow-lg shadow-gray-200'
                : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-200'
            }
        `}
    >
        <Icon className="w-4 h-4" />
        {label}
    </button>
);
