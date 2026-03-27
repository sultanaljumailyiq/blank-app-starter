import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunity } from '../../../hooks/useCommunity';
import { Calendar, BookOpen, Layers, Video, Box, ExternalLink, Play, Clock, Users, Bookmark, CheckCircle } from 'lucide-react';

export const EducationTab: React.FC = () => {
    const { events, resources, models } = useCommunity();
    const [activeSubTab, setActiveSubTab] = useState<'courses' | 'webinars' | 'resources' | '3d'>('courses');

    const courses = events.filter(e => e.category === 'دورة').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const webinars = events.filter(e => e.category === 'ندوة').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Sub-Navigation items
    const subTabs = [
        { id: 'courses', label: 'دورات', icon: BookOpen },
        { id: 'webinars', label: 'ندوات', icon: Video },
        { id: 'resources', label: 'مصادر', icon: Layers },
        { id: '3d', label: '3D', icon: Box },
    ];

    const getActiveClass = (id: string) => {
        switch (id) {
            case 'courses': return 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/20';
            case 'webinars': return 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20';
            case 'resources': return 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20';
            case '3d': return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20';
            default: return 'bg-gray-900 text-white shadow-md';
        }
    };

    return (
        <div className="pb-20 space-y-6">

            {/* 1. Sub-Navigation (Pills) */}
            <div className="sticky top-[54px] z-30 bg-gray-50/95 backdrop-blur-sm py-1 px-4">
                <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex overflow-x-auto no-scrollbar">
                    {subTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id as any)}
                            className={`
                                flex-1 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap px-4
                                ${activeSubTab === tab.id
                                    ? getActiveClass(tab.id)
                                    : 'text-gray-500 hover:bg-gray-50'
                                }
                            `}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Content Grid */}
            <div className="px-4 space-y-4">

                {/* COURSES VIEW */}
                {activeSubTab === 'courses' && courses.map(c => (
                    <PremiumCourseCard key={c.id} event={c} type="course" />
                ))}

                {/* WEBINARS VIEW */}
                {activeSubTab === 'webinars' && webinars.map(w => (
                    <PremiumCourseCard key={w.id} event={w} type="webinar" />
                ))}

                {/* RESOURCES VIEW */}
                {activeSubTab === 'resources' && resources.map(r => (
                    <PremiumResourceCard key={r.id} resource={r} />
                ))}

                {/* 3D MODELS VIEW */}
                {activeSubTab === '3d' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Render Database Models */}
                        {models.map((model: any) => (
                            <PremiumModelCard
                                key={model.id}
                                id={model.id}
                                title={model.title}
                                author="Smart Dental" // Or model.author if available
                                image={model.thumbnail_url || 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&q=80'}
                            />
                        ))}

                        {/* Fallback/Empty State */}
                        {models.length === 0 && (
                            <div className="text-center py-10 col-span-2 text-gray-500">
                                لا توجد نماذج متاحة حالياً.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- PREMIUM COMPONENTS ---

const PremiumCourseCard = ({ event, type }: any) => {
    const navigate = useNavigate();
    const { toggleSave, isSaved } = useCommunity();
    const isFree = event.price === 0;
    const isItemSaved = isSaved(event.id);

    const isEventEnded = (dateString: string) => {
        try {
            return new Date(dateString) < new Date();
        } catch (e) { return false; }
    };

    const isEnded = isEventEnded(event.date);

    return (
        <div className={`group relative bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isEnded ? 'opacity-80' : ''}`}>
            {/* Clickable Image Area */}
            <div
                className="h-48 bg-gray-200 relative cursor-pointer"
                onClick={() => navigate(`/community/${type}/${event.id}`)}
            >
                <img
                    src={event.image || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800'}
                    alt={event.title}
                    className={`w-full h-full object-cover ${isEnded ? 'grayscale' : ''}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                {/* Status/Price Badge */}
                {isEnded ? (
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-gray-600 text-white">
                        منتهية
                    </div>
                ) : (
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${isFree ? 'bg-emerald-500 text-white' : 'bg-white text-gray-900'}`}>
                        {isFree ? 'مجاني' : `$${event.price}`}
                    </div>
                )}

                {/* Save Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleSave(event, type);
                    }}
                    className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-colors ${isItemSaved ? 'bg-orange-500 text-white' : 'bg-black/30 text-white hover:bg-black/50'}`}
                >
                    <Bookmark className={`w-4 h-4 ${isItemSaved ? 'fill-current' : ''}`} />
                </button>

                {/* Date Badge */}
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-white/90 text-xs font-medium bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className={isEnded ? 'line-through decoration-white/50' : ''}>{event.date}</span>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-5 cursor-pointer" onClick={() => navigate(`/community/${type}/${event.id}`)}>
                <h3 className={`text-xl font-bold mb-2 leading-tight transition-colors ${isEnded ? 'text-gray-500' : 'text-gray-900 group-hover:text-indigo-600'}`}>
                    {event.title}
                </h3>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-white ${isEnded ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-indigo-600'}`}>
                            {event.instructor?.[0] || '?'}
                        </div>
                        <span className="text-sm text-gray-600 font-medium">{event.instructor}</span>
                    </div>

                    <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isEnded ? 'bg-gray-100 text-gray-400' : 'bg-gray-50 text-gray-400 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                        {isEnded ? <CheckCircle className="w-4 h-4 ml-0.5" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

const PremiumResourceCard = ({ resource }: any) => {
    const navigate = useNavigate();
    const { toggleSave, isSaved } = useCommunity();
    const isItemSaved = isSaved(resource.id);

    return (
        <div className="group bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm transition-all hover:shadow-md flex items-start gap-4">
            <div
                className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0 cursor-pointer"
                onClick={() => navigate(`/community/resource/${resource.id}`)}
            >
                <Layers className="w-8 h-8" />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg mb-2 inline-block">
                        مصدر علمي
                    </span>
                    <button
                        onClick={() => toggleSave(resource, 'resource')}
                        className={`text-gray-300 hover:text-orange-500 transition-colors ${isItemSaved ? 'text-orange-500' : ''}`}
                    >
                        <Bookmark className={`w-5 h-5 ${isItemSaved ? 'fill-current' : ''}`} />
                    </button>
                </div>
                <h3
                    className="font-bold text-gray-900 text-lg leading-tight mb-1 group-hover:text-blue-600 transition-colors cursor-pointer"
                    onClick={() => navigate(`/community/resource/${resource.id}`)}
                >
                    {resource.title}
                </h3>
                <p className="text-xs text-gray-500 font-medium cursor-pointer" onClick={() => navigate(`/community/resource/${resource.id}`)}>
                    المصدر: {resource.source}
                </p>

                {resource.url && (
                    <a
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        زيارة الموقع
                    </a>
                )}
            </div>
        </div>
    );
};

const PremiumModelCard = ({ id, title, author, image }: any) => {
    const navigate = useNavigate();
    const { toggleSave, isSaved } = useCommunity();
    const isItemSaved = isSaved(id);

    // Mock model object for saving
    const modelObj = { id, title, author, image, type: 'model' };

    return (
        <div className="group relative aspect-square bg-gray-900 rounded-[2rem] overflow-hidden shadow-lg hover:shadow-xl transition-all">
            <img
                src={image}
                alt={title}
                className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity group-hover:scale-105 duration-500 cursor-pointer"
                onClick={() => navigate(`/community/model/${id}`)}
            />

            {/* Save Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    toggleSave(modelObj, 'model');
                }}
                className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-colors z-20 ${isItemSaved ? 'bg-orange-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
            >
                <Bookmark className={`w-4 h-4 ${isItemSaved ? 'fill-current' : ''}`} />
            </button>

            <div
                className="absolute inset-0 flex flex-col justify-end p-5 bg-gradient-to-t from-black/80 via-transparent to-transparent cursor-pointer"
                onClick={() => navigate(`/community/model/${id}`)}
            >
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-auto ml-auto">
                    <Box className="w-6 h-6" />
                </div>

                <h3 className="text-white font-bold text-lg leading-tight mb-1">{title}</h3>
                <p className="text-white/60 text-xs">by {author}</p>
            </div>
        </div>
    );
};
