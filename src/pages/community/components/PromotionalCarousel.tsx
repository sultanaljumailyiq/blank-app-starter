
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunity } from '../../../hooks/useCommunity';
import { Calendar, ArrowRight, Video, Users, Clock, PlayCircle } from 'lucide-react';

export const PromotionalCarousel: React.FC = () => {
    const { events } = useCommunity();
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);

    // Mock data if no events are available, or combine real events with mocks for demo
    // Filter to get 2 Courses and 2 Webinars
    const webinars = events.filter(e => e.category === 'ندوة' && new Date(e.date) >= new Date()).slice(0, 2);
    const courses = events.filter(e => e.category === 'دورة' && new Date(e.date) >= new Date()).slice(0, 2);

    // Combine and shuffle or just concat
    const promoItems = [...webinars, ...courses];

    // Fallback if no real data
    if (promoItems.length === 0) {
        promoItems.push(
            {
                id: 'mock-1',
                title: 'التقنيات الحديثة في زراعة الأسنان الفورية',
                category: 'ندوة',
                date: 'الجمعة، 10 مساءً',
                instructor: 'د. محمد علي',
                image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070',
                price: 0,
                description: '',
                duration: '',
                level: 'مبتدئ',
                rating: 5,
                students: 100
            },
            {
                id: 'mock-2',
                title: 'كورس التجميل الشامل',
                category: 'دورة',
                date: 'يبدأ 15 نوفمبر',
                instructor: 'د. سارة احمد',
                image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=2070',
                price: 0,
                description: '',
                duration: '',
                level: 'مبتدئ',
                rating: 5,
                students: 100
            }
        );
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % promoItems.length);
        }, 5000); // 5 Seconds Rotation

        return () => clearInterval(interval);
    }, [promoItems.length]);

    const currentItem = promoItems[currentIndex];

    // Placeholder image if real item has no image (Matches EducationTab fallback but High Res)
    const displayImage = currentItem.image || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070';

    // Determine gradient based on category if not provided
    const getGradient = (item: any) => {
        if (item.gradient) return item.gradient;
        if (item.category === 'ندوة') return 'bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600';
        if (item.category === 'دورة') return 'bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600';
        return 'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600';
    };

    const handleNavigate = (item: any) => {
        if (item.category === 'ندوة') navigate(`/community/webinar/${item.id}`);
        else if (item.category === 'دورة') navigate(`/community/course/${item.id}`);
        else navigate(`/community/event/${item.id}`); // Fallback
    };

    return (
        <div className="pt-2 px-4 pb-4">
            <div
                className="w-full h-[13.5rem] md:h-[15.5rem] rounded-[2.5rem] overflow-hidden shadow-xl shadow-indigo-900/20 cursor-pointer group relative bg-gray-900 border border-gray-800 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-900/40"
                onClick={() => handleNavigate(currentItem)}
            >
                {/* BACKGROUND SECTION: Image + Dark Gradients */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                    {/* 1. Base Image */}
                    <img
                        src={displayImage}
                        alt={currentItem.title}
                        className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-[2s]"
                    />

                    {/* 2. Color Wash Overlay (Doctor Welcome Style) */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-80 mix-blend-multiply"></div>

                    {/* 3. Bottom Fade Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                    {/* Badge & Indicators */}
                    <div className="absolute top-5 right-6 flex justify-between items-center w-[calc(100%-3rem)] z-20">
                        <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-bold text-white border border-white/20 flex items-center gap-2 shadow-sm">
                            {currentItem.category === 'ندوة' ? <Video className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                            {currentItem.category || 'حدث مميز'}
                        </span>

                        {/* Pagination Dots */}
                        <div className="flex gap-1.5 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10">
                            {promoItems.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-5 bg-white' : 'w-1 bg-white/40'}`}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* BOTTOM CONTENT */}
                <div className="absolute bottom-0 w-full p-6 flex flex-col justify-end z-20">

                    {/* Text Content - Aligned Left */}
                    <div className="pr-[4.5rem] relative z-10 w-full text-left">
                        <h2 key={currentItem.title} className="text-xl md:text-2xl font-black text-white mb-2 leading-tight animate-in fade-in slide-in-from-bottom-2 duration-500 line-clamp-1 drop-shadow-lg">
                            {currentItem.title}
                        </h2>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-blue-100/90 justify-start">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{currentItem.date}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                <span>{currentItem.instructor || 'نخبة من الأطباء'}</span>
                            </div>
                        </div>
                    </div>

                    {/* CTA Button - Bottom Right */}
                    <div className="absolute bottom-6 right-6 z-30">
                        <button className={`
                            w-12 h-12 rounded-full flex items-center justify-center
                            bg-white/10 backdrop-blur-md text-white border border-white/30
                            hover:bg-white hover:text-indigo-900 hover:border-white
                            shadow-lg shadow-black/20
                            group-hover:scale-110 group-hover:-rotate-45
                            transition-all duration-300 ease-out
                         `}>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
