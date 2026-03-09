import React, { useState } from 'react';
import { AIAnalysisResult } from '../../types/ai';
import {
    CheckCircle, AlertTriangle, Info, ZoomIn, X, Server, Activity,
    ShieldCheck, CloudOff, FileText, Sparkles
} from 'lucide-react';
import { Button } from '../common/Button';

interface AnalysisResultCardProps {
    imageUrl: string;
    result: AIAnalysisResult;
    date: string;
}

export const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({ imageUrl, result, date }) => {
    const [isZoomOpen, setIsZoomOpen] = useState(false);
    const [showBoxes, setShowBoxes] = useState(true);

    // Determine Service State
    const isMock = result.metadata?.isMock ?? true; // Default to true if metadata missing (safe fallback)
    const provider = result.metadata?.provider || 'Unknown';
    const model = result.metadata?.model || 'Demo';

    return (
        <>
            {/* Main Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden transition-all duration-300 hover:shadow-md">

                {/* Header Status Bar */}
                <div className="px-5 py-3 border-b border-indigo-50 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${isMock ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-sm">تقرير الذكاء الاصطناعي</h3>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                                <span>{new Date(date).toLocaleString('ar-IQ')}</span>
                                <span>•</span>
                                <span className={`uppercase font-bold ${isMock ? 'text-orange-600' : 'text-green-700'}`}>
                                    {isMock ? 'DEMO MODE' : 'LIVE SERVER'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isMock ? (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-bold border border-orange-100" title="بيانات تجريبية - الخدمة غير متصلة">
                                <CloudOff className="w-3.5 h-3.5" />
                                <span>تجريبي</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100" title="تم التحليل بواسطة خادم AI">
                                <Server className="w-3.5 h-3.5" />
                                <span>{provider === 'openai' ? 'OpenAI' : provider}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-0 grid md:grid-cols-12 gap-0 divide-x divide-x-reverse divide-gray-100">

                    {/* Image Column (Left on RTL) is actually Right visually in RTL layout, let's keep logic simple */}
                    {/* MD: Col Span 5 */}
                    <div className="md:col-span-5 bg-gray-50 p-5 flex flex-col justify-center">
                        <div
                            className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white cursor-zoom-in"
                            onClick={() => setIsZoomOpen(true)}
                        >
                            <div className="aspect-[4/3] relative">
                                <img
                                    src={imageUrl}
                                    alt="Analysis Source"
                                    className="w-full h-full object-contain"
                                />
                                {/* Bounding Boxes Mini View */}
                                {result.issues.map((issue, idx) => (
                                    issue.box && (
                                        <div
                                            key={idx}
                                            className="absolute border-2 border-red-500/60 bg-red-500/5 transition-opacity"
                                            style={{
                                                left: `${issue.box[0] * 100}%`,
                                                top: `${issue.box[1] * 100}%`,
                                                width: `${issue.box[2] * 100}%`,
                                                height: `${issue.box[3] * 100}%`
                                            }}
                                        />
                                    )
                                ))}

                                {/* Overlay Hover */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <span className="bg-white/90 text-gray-800 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 backdrop-blur-sm">
                                        <ZoomIn className="w-4 h-4" />
                                        تكبير الصورة
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Row under image */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="bg-white p-2.5 rounded-lg border border-gray-100 text-center">
                                <span className="block text-xs text-gray-400 mb-0.5">الدقة (Confidence)</span>
                                <span className="block font-bold text-indigo-600">{(result.confidence || 0.92) * 100}%</span>
                            </div>
                            <div className="bg-white p-2.5 rounded-lg border border-gray-100 text-center">
                                <span className="block text-xs text-gray-400 mb-0.5">عدد الملاحظات</span>
                                <span className="block font-bold text-red-500">{result.issues.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Column */}
                    {/* MD: Col Span 7 */}
                    <div className="md:col-span-7 p-6 space-y-6">
                        {/* Summary Section */}
                        <div className="space-y-3">
                            <h4 className="flex items-center gap-2 font-bold text-gray-900 border-b pb-2">
                                <Activity className="w-5 h-5 text-blue-600" />
                                التشخيص والملخص
                            </h4>
                            <p className="text-gray-600 text-sm leading-7 bg-blue-50/50 p-4 rounded-xl border border-blue-50 text-justify">
                                {result.summary}
                            </p>
                        </div>

                        {/* Findings List */}
                        {result.issues.length > 0 ? (
                            <div className="space-y-3">
                                <h4 className="flex items-center gap-2 font-bold text-gray-900 border-b pb-2">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                    الملاحظات المكتشفة
                                </h4>
                                <ul className="space-y-2">
                                    {result.issues.map((issue, idx) => (
                                        <li key={idx} className="flex justify-between items-start bg-gray-50 p-3 rounded-lg border hover:border-red-200 transition-colors group">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                                                <div>
                                                    <span className="font-bold text-gray-800 text-sm block">{issue.label}</span>
                                                    {issue.description && <span className="text-xs text-gray-500 block mt-0.5">{issue.description}</span>}
                                                </div>
                                            </div>
                                            <span className="text-xs font-mono bg-white border px-1.5 py-0.5 rounded text-gray-500">
                                                {(issue.confidence * 100).toFixed(0)}%
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-3 text-green-700">
                                <ShieldCheck className="w-6 h-6" />
                                <div>
                                    <p className="font-bold">تحليل سليم</p>
                                    <p className="text-xs opacity-80">لم يتم اكتشاف مشاكل واضحة في الصورة</p>
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        <div className="space-y-3">
                            <h4 className="flex items-center gap-2 font-bold text-gray-900 border-b pb-2">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                                التوصيات المقترحة
                            </h4>
                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-purple-900 text-sm flex items-start gap-3 shadow-sm">
                                <Info className="w-5 h-5 shrink-0 mt-0.5 text-purple-600" />
                                <p className="leading-6 font-medium">{result.recommendation}</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer Metadata */}
                <div className="bg-gray-50 border-t border-gray-100 px-5 py-2 text-[10px] text-gray-400 flex justify-between items-center font-mono">
                    <span>Model: {model}</span>
                    <span>Proc. Time: {result.metadata?.processingTime ? `${result.metadata.processingTime}ms` : 'N/A'}</span>
                </div>
            </div>

            {/* --- Zoom Modal --- */}
            {isZoomOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setIsZoomOpen(false)}
                >
                    <div
                        className="bg-transparent w-full max-w-6xl max-h-[95vh] relative flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Toolbar */}
                        <div className="absolute top-4 right-4 z-50 flex gap-2">
                            <Button
                                onClick={() => setShowBoxes(!showBoxes)}
                                className="bg-black/50 hover:bg-black/70 text-white border-white/20 backdrop-blur-md"
                                size="sm"
                            >
                                {showBoxes ? 'إخفاء التحديد' : 'عرض التحديد'}
                            </Button>
                            <button
                                onClick={() => setIsZoomOpen(false)}
                                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 flex items-center justify-center overflow-auto relative rounded-lg">
                            <div className="relative inline-block max-w-full max-h-full">
                                <img
                                    src={imageUrl}
                                    alt="Full Analysis"
                                    className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl"
                                />
                                {/* Scaled Bounding Boxes */}
                                {showBoxes && result.issues.map((issue, idx) => (
                                    issue.box && (
                                        <div
                                            key={idx}
                                            className="absolute border-2 border-green-400/80 bg-green-400/10 hover:bg-green-400/20 shadow-[0_0_15px_rgba(74,222,128,0.3)] transition-all cursor-crosshair group"
                                            style={{
                                                left: `${issue.box[0] * 100}%`,
                                                top: `${issue.box[1] * 100}%`,
                                                width: `${issue.box[2] * 100}%`,
                                                height: `${issue.box[3] * 100}%`
                                            }}
                                        >
                                            <div className="absolute -top-8 left-0 hidden group-hover:block bg-black/80 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-50 animate-in fade-in slide-in-from-bottom-2">
                                                <span className="font-bold text-green-400 block">{issue.label}</span>
                                                <span className="text-gray-300 text-[10px]">{issue.description || 'لا يوجد وصف'}</span>
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>

                        <div className="text-center mt-4 text-white/50 text-sm font-light">
                            اضغط خارج الصورة للإغلاق
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
