import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Box, Share2, Maximize, Bookmark } from 'lucide-react';
import { mockModels } from '../../data/mock';
import { useCommunity } from '../../hooks/useCommunity'; // Added import

export const ModelDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { models, toggleSave, isSaved } = useCommunity();
    const model = models.find(m => m.id === id) || mockModels.find(m => m.id === id) || mockModels[0];
    const isItemSaved = model ? isSaved(model.id) : false;

    return (
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
            {/* 1. 3D VIEWER HEADER (Mobile-First Curved) */}
            <div className="relative h-[60vh] md:h-[70vh] w-full bg-gray-900 rounded-b-[3rem] overflow-hidden shadow-2xl shadow-gray-900/40">
                {/* 3D Viewer Iframe or Fallback Image */}
                {model.embed_url ? (
                    <iframe
                        title={model.title}
                        src={model.embed_url.endsWith('/embed') ? model.embed_url : `${model.embed_url}/embed`}
                        className="w-full h-full border-none"
                        allow="autoplay; fullscreen; vr; execution-while-out-of-viewport; execution-while-not-rendered; web-share"
                        allowFullScreen
                    ></iframe>
                ) : (
                    <>
                        <img
                            src={model.image || model.thumbnail || model.thumbnail_url}
                            alt={model.title}
                            className="w-full h-full object-cover opacity-50"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 rounded-full border-4 border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center animate-pulse">
                                <Box className="w-10 h-10 text-white" />
                            </div>
                        </div>
                    </>
                )}

                {/* Navbar Overlay */}
                <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10 pointer-events-none">
                    {/* Pointer events none to let clicks pass to iframe, but buttons need pointer-events-auto */}
                    <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all pointer-events-auto">
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <div className="flex gap-2 pointer-events-auto">
                        <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all">
                            <Maximize className="w-5 h-5" />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => toggleSave(model, 'model')}
                            className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${isItemSaved ? 'bg-orange-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            <Bookmark className={`w-5 h-5 ${isItemSaved ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Title & Info Overlay - Only show if NO iframe, or auto-hide? 
                    Actually, we might want it below or overlaying at bottom. 
                    If iframe is active, we probably don't want a huge overlay blocking interaction.
                    Let's make it smaller or relative.
                */}
                {!model.embed_url && (
                    <div className="absolute bottom-0 w-full p-8 bg-gradient-to-t from-gray-900/90 to-transparent pt-24 text-center pointer-events-none">
                        <h1 className="text-3xl font-black text-white leading-tight mb-2 drop-shadow-lg">{model.title}</h1>
                        <p className="text-white/60 text-sm font-medium">{model.category}</p>
                    </div>
                )}
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10 space-y-4">

                {/* 2. Description Card (Bento Style) */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-lg shadow-gray-200/50 border border-gray-100 text-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <Box className="w-6 h-6" />
                    </div>
                    {/* Render Title here if iframe is active so we still see it */}
                    {model.embed_url && (
                        <h1 className="text-2xl font-black text-gray-900 mb-2">{model.title}</h1>
                    )}

                    <h3 className="font-bold text-gray-900 text-lg mb-3">تفاصيل النموذج</h3>
                    <p className="text-gray-500 leading-relaxed text-sm">
                        هذا النموذج ثلاثي الأبعاد تفاعلي بالكامل. يمكنك تدويره وتقريبه لفحص التفاصيل التشريحية الدقيقة. يتم استضافة النماذج عبر Sketchfab لضمان أفضل جودة عرض.
                    </p>
                </div>

                {/* Disclaimer Card */}
                <div className="bg-blue-50 rounded-[2.5rem] p-6 text-center border border-blue-100">
                    <p className="text-blue-600 text-xs font-bold">
                        يتم إدارة هذا المحتوى بواسطة إدارة المنصة لضمان الدقة العلمية.
                    </p>
                </div>
            </div>
        </div>
    );
};
