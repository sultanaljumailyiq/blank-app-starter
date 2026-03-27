import React from 'react';
import { useAIAnalysis } from '../../../hooks/useAIAnalysis';
import { ImageUploadZone } from '../../../components/ai/ImageUploadZone';
import { AnalysisResultCard } from '../../../components/ai/AnalysisResultCard';
import { Brain, History, RefreshCcw } from 'lucide-react';

const AIAnalysisPage = () => {
    const { history, uploading, analyzing, analyzeImage, deleteAnalysis, refresh, credits } = useAIAnalysis();

    const handleFileSelect = async (file: File) => {
        await analyzeImage(file);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Brain className="w-8 h-8 text-primary" />
                        التشخيص الذكي (AI)
                    </h1>
                    <p className="text-gray-500 mt-1">
                        تحليل صور الأشعة باستخدام الذكاء الاصطناعي للكشف عن التسوس ومشاكل العظام
                    </p>
                </div>
            </div>

            {/* Upload Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">تحليل جديد</h2>
                    <div className="text-sm px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                        الرصيد المتاح: {credits}
                    </div>
                </div>
                <ImageUploadZone
                    onFileSelect={handleFileSelect}
                    isUploading={uploading || analyzing}
                />
            </div>

            {/* History Section */}
            <div className="space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <History className="w-5 h-5 text-gray-500" />
                        سجل التحليلات
                    </h2>
                    <button
                        onClick={() => refresh()}
                        className="text-gray-500 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-100"
                        title="تحديث"
                    >
                        <RefreshCcw className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {history.length > 0 ? (
                        history.map(item => (
                            <div key={item.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {item.status === 'processing' ? (
                                    <div className="bg-white p-8 rounded-xl border border-gray-100 text-center space-y-4">
                                        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                                        <p className="text-gray-600 font-medium">جاري معالجة الصورة...</p>
                                    </div>
                                ) : item.analysis_result ? (
                                    <AnalysisResultCard
                                        imageUrl={item.image_url}
                                        result={item.analysis_result}
                                        date={item.created_at}
                                    />
                                ) : (
                                    <div className="bg-white p-4 rounded-xl border border-red-100 text-red-500">
                                        فشل في تحليل الصورة
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                            لا توجد تحليلات سابقة
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIAnalysisPage;
