import React, { useEffect, useRef, useState } from 'react';
import { AIAnalysisResult } from '../../types/ai';
import {
    CheckCircle, AlertTriangle, Info, ZoomIn, X, Server, Activity,
    ShieldCheck, CloudOff, FileText, Sparkles, Target, Crosshair
} from 'lucide-react';
import { Button } from '../common/Button';

interface AnalysisResultCardProps {
    imageUrl: string;
    result: AIAnalysisResult;
    date: string;
}

const SEVERITY_CONFIG = {
    high: { color: 'red', label: 'عالية', icon: '🔴', bgClass: 'bg-red-50', borderClass: 'border-red-200', textClass: 'text-red-700' },
    medium: { color: 'amber', label: 'متوسطة', icon: '🟡', bgClass: 'bg-amber-50', borderClass: 'border-amber-200', textClass: 'text-amber-700' },
    low: { color: 'green', label: 'منخفضة', icon: '🟢', bgClass: 'bg-green-50', borderClass: 'border-green-200', textClass: 'text-green-700' },
};

const CATEGORY_LABELS: Record<string, string> = {
    caries: 'تسوس',
    bone_loss: 'فقدان عظمي',
    periapical: 'آفة حول ذروية',
    fracture: 'كسر',
    impaction: 'انحشار',
    calculus: 'تكلسات',
    resorption: 'ارتشاف',
    other: 'أخرى',
};

const BOX_COLORS = [
    { border: 'border-red-500', bg: 'bg-red-500/10', hover: 'hover:bg-red-500/20', text: 'text-red-500', shadow: 'shadow-red-500/30' },
    { border: 'border-blue-500', bg: 'bg-blue-500/10', hover: 'hover:bg-blue-500/20', text: 'text-blue-500', shadow: 'shadow-blue-500/30' },
    { border: 'border-amber-500', bg: 'bg-amber-500/10', hover: 'hover:bg-amber-500/20', text: 'text-amber-500', shadow: 'shadow-amber-500/30' },
    { border: 'border-purple-500', bg: 'bg-purple-500/10', hover: 'hover:bg-purple-500/20', text: 'text-purple-500', shadow: 'shadow-purple-500/30' },
    { border: 'border-teal-500', bg: 'bg-teal-500/10', hover: 'hover:bg-teal-500/20', text: 'text-teal-500', shadow: 'shadow-teal-500/30' },
    { border: 'border-pink-500', bg: 'bg-pink-500/10', hover: 'hover:bg-pink-500/20', text: 'text-pink-500', shadow: 'shadow-pink-500/30' },
];

const IMAGE_TYPE_LABELS: Record<string, string> = {
    panoramic_xray: 'أشعة بانورامية',
    periapical_xray: 'أشعة حول ذروية',
    bitewing_xray: 'Bitewing',
    cbct_slice: 'مقطع CBCT',
    intraoral_phone_photo: 'صورة هاتف داخل الفم',
    extraoral_face_photo: 'صورة خارجية',
    unknown: 'نوع غير محدد',
};

const QUALITY_LABELS: Record<string, string> = {
    excellent: 'ممتازة',
    good: 'جيدة',
    fair: 'متوسطة',
    poor: 'ضعيفة',
};

const AccurateImageOverlay: React.FC<{
    imageUrl: string;
    alt: string;
    className?: string;
    onClick?: () => void;
    children: React.ReactNode;
}> = ({ imageUrl, alt, className = 'w-full h-full object-contain', onClick, children }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const node = containerRef.current;
        if (!node) return;
        const update = () => setContainerSize({ width: node.clientWidth, height: node.clientHeight });
        update();
        const observer = new ResizeObserver(update);
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    const imageAspect = naturalSize.width && naturalSize.height ? naturalSize.width / naturalSize.height : 1;
    const containerAspect = containerSize.width && containerSize.height ? containerSize.width / containerSize.height : imageAspect;
    const renderedWidth = containerAspect > imageAspect ? containerSize.height * imageAspect : containerSize.width;
    const renderedHeight = containerAspect > imageAspect ? containerSize.height : containerSize.width / imageAspect;
    const overlayStyle = {
        width: `${renderedWidth || containerSize.width}px`,
        height: `${renderedHeight || containerSize.height}px`,
        left: `${Math.max(0, (containerSize.width - renderedWidth) / 2)}px`,
        top: `${Math.max(0, (containerSize.height - renderedHeight) / 2)}px`,
    };

    return (
        <div ref={containerRef} className="relative w-full h-full" onClick={onClick}>
            <img
                src={imageUrl}
                alt={alt}
                className={className}
                onLoad={(event) => {
                    const img = event.currentTarget;
                    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
                }}
            />
            <div className="absolute pointer-events-none" style={overlayStyle}>
                <div className="relative w-full h-full pointer-events-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({ imageUrl, result, date }) => {
    const [isZoomOpen, setIsZoomOpen] = useState(false);
    const [showBoxes, setShowBoxes] = useState(true);
    const [hoveredIssue, setHoveredIssue] = useState<number | null>(null);

    const isMock = result.metadata?.isMock ?? true;
    const provider = result.metadata?.provider || 'Unknown';
    const model = result.metadata?.model || 'Demo';
    const overallSeverity = result.severity || 'low';
    const severityConfig = SEVERITY_CONFIG[overallSeverity];
    const imageQuality = typeof result.image_quality === 'string'
        ? { rating: result.image_quality, problems: [], retake_recommended: false }
        : result.image_quality;

    const getBoxColor = (idx: number) => BOX_COLORS[idx % BOX_COLORS.length];
    const isReliableBox = (issue: AIAnalysisResult['issues'][number]) => {
        if (!issue.box || issue.box.length !== 4) return false;
        const [x, y, width, height] = issue.box;
        return [x, y, width, height].every(Number.isFinite)
            && x >= 0 && y >= 0 && width > 0 && height > 0
            && x + width <= 1 && y + height <= 1
            && issue.confidence >= 0.7;
    };

    const renderBoundingBoxes = (isZoom = false) => (
        showBoxes && result.issues.map((issue, idx) => {
            if (!isReliableBox(issue)) return null;
            const color = getBoxColor(idx);
            const isHovered = hoveredIssue === idx;
            const baseOpacity = isHovered ? 'opacity-100' : 'opacity-70';

            return (
                <div
                    key={idx}
                    className={`absolute border-2 ${color.border} ${color.bg} ${color.hover} transition-all duration-200 cursor-pointer group ${baseOpacity} ${isHovered ? 'z-20 scale-105' : 'z-10'}`}
                    style={{
                        left: `${issue.box[0] * 100}%`,
                        top: `${issue.box[1] * 100}%`,
                        width: `${issue.box[2] * 100}%`,
                        height: `${issue.box[3] * 100}%`,
                        boxShadow: isHovered ? `0 0 20px rgba(0,0,0,0.3)` : 'none',
                    }}
                    onMouseEnter={() => setHoveredIssue(idx)}
                    onMouseLeave={() => setHoveredIssue(null)}
                >
                    {/* Issue number badge */}
                    <div className={`absolute -top-5 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${color.border.replace('border', 'bg')} shadow-md`}>
                        {idx + 1}
                    </div>

                    {/* Tooltip */}
                    <div className={`absolute ${isZoom ? '-top-16' : '-top-12'} right-0 ${isHovered ? 'block' : 'hidden'} bg-gray-900/95 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap z-50 backdrop-blur-sm`}>
                        <div className="font-bold text-sm">{issue.label}</div>
                        {issue.description && <div className="text-gray-300 mt-0.5 text-[10px] max-w-[200px] whitespace-normal">{issue.description}</div>}
                        <div className="flex items-center gap-2 mt-1 text-[10px]">
                            <span className={`${SEVERITY_CONFIG[issue.severity || 'low']?.textClass || 'text-gray-400'}`}>
                                {SEVERITY_CONFIG[issue.severity || 'low']?.icon} {SEVERITY_CONFIG[issue.severity || 'low']?.label}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-blue-300">{(issue.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <div className="absolute bottom-0 right-3 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/95" />
                    </div>
                </div>
            );
        })
    );

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md">
                {/* Header */}
                <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${isMock ? 'bg-orange-500' : 'bg-green-500'}`} />
                        <div>
                            <h3 className="font-bold text-gray-900 text-sm">تقرير التشخيص بالذكاء الاصطناعي</h3>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                                <span>{new Date(date).toLocaleString('ar-IQ')}</span>
                                <span>•</span>
                                <span className={`uppercase font-bold ${isMock ? 'text-orange-600' : 'text-green-700'}`}>
                                    {isMock ? 'DEMO' : 'LIVE'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Overall severity badge */}
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 ${severityConfig.bgClass} ${severityConfig.textClass} rounded-full text-xs font-bold ${severityConfig.borderClass} border`}>
                            {severityConfig.icon} {severityConfig.label}
                        </div>
                        {!isMock && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                                <Server className="w-3.5 h-3.5" />
                                <span>AI</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-0 grid md:grid-cols-12 gap-0 divide-x divide-x-reverse divide-gray-100">
                    {/* Image Column */}
                    <div className="md:col-span-5 bg-gray-50 p-4 flex flex-col justify-center">
                        <div
                            className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-black cursor-zoom-in"
                            onClick={() => setIsZoomOpen(true)}
                        >
                            <div className="aspect-[4/3] relative">
                                <AccurateImageOverlay imageUrl={imageUrl} alt="صورة الأشعة" onClick={() => setIsZoomOpen(true)}>
                                {renderBoundingBoxes(false)}
                                </AccurateImageOverlay>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <span className="bg-white/90 text-gray-800 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 backdrop-blur-sm">
                                        <ZoomIn className="w-4 h-4" />
                                        تكبير وعرض التفاصيل
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="bg-white p-2 rounded-lg border border-gray-100 text-center">
                                <span className="block text-[10px] text-gray-400">نوع الصورة</span>
                                <span className="block font-bold text-gray-800 text-xs">{IMAGE_TYPE_LABELS[result.image_type || 'unknown'] || 'غير محدد'}</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-gray-100 text-center">
                                <span className="block text-[10px] text-gray-400">جودة الصورة</span>
                                <span className="block font-bold text-gray-800 text-xs">
                                    {QUALITY_LABELS[imageQuality?.rating || ''] || imageQuality?.rating || 'غير محددة'}
                                    {imageQuality?.retake_recommended ? ' • يفضّل الإعادة' : ''}
                                </span>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-2 mt-3">
                            <div className="bg-white p-2 rounded-lg border border-gray-100 text-center">
                                <span className="block text-[10px] text-gray-400">الدقة</span>
                                <span className="block font-bold text-indigo-600 text-sm">{((result.confidence || 0.92) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-gray-100 text-center">
                                <span className="block text-[10px] text-gray-400">المشاكل</span>
                                <span className="block font-bold text-red-500 text-sm">{result.issues.length}</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-gray-100 text-center">
                                <span className="block text-[10px] text-gray-400">الأسنان</span>
                                <span className="block font-bold text-blue-600 text-sm">
                                    {(result as any).affected_teeth?.length || result.issues.filter(i => (i as any).tooth_number).length || '-'}
                                </span>
                            </div>
                        </div>

                        {/* Legend: Issue colors */}
                        {result.issues.length > 0 && (
                            <div className="mt-3 bg-white rounded-lg border border-gray-100 p-2 space-y-1">
                                <div className="text-[10px] font-bold text-gray-500 mb-1 flex items-center gap-1">
                                    <Target className="w-3 h-3" /> دليل الألوان
                                </div>
                                {result.issues.filter(isReliableBox).map((issue, idx) => {
                                    const color = getBoxColor(idx);
                                    return (
                                        <div
                                            key={idx}
                                            className={`flex items-center gap-2 text-[10px] py-0.5 px-1 rounded cursor-pointer transition-colors ${hoveredIssue === idx ? 'bg-gray-100' : ''}`}
                                            onMouseEnter={() => setHoveredIssue(idx)}
                                            onMouseLeave={() => setHoveredIssue(null)}
                                        >
                                            <div className={`w-3 h-3 rounded-sm border-2 ${color.border} ${color.bg} flex items-center justify-center text-[7px] font-bold`}>
                                                {idx + 1}
                                            </div>
                                            <span className="text-gray-700 truncate">{issue.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Content Column */}
                    <div className="md:col-span-7 p-5 space-y-5 overflow-y-auto max-h-[600px]">
                        {/* Diagnosis */}
                        <div className="space-y-2">
                            <h4 className="flex items-center gap-2 font-bold text-gray-900 text-sm border-b pb-2">
                                <Activity className="w-4 h-4 text-blue-600" />
                                التشخيص
                            </h4>
                            {result.diagnosis && (
                                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-blue-900 text-sm font-semibold">
                                    {result.diagnosis}
                                </div>
                            )}
                            <p className="text-gray-600 text-xs leading-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                {result.summary}
                            </p>
                        </div>

                        {/* Issues List with interactive highlighting */}
                        {result.issues.length > 0 ? (
                            <div className="space-y-2">
                                <h4 className="flex items-center gap-2 font-bold text-gray-900 text-sm border-b pb-2">
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                    المشاكل المكتشفة ({result.issues.length})
                                </h4>
                                <ul className="space-y-2">
                                    {result.issues.map((issue, idx) => {
                                        const color = getBoxColor(idx);
                                        const issueSeverity = SEVERITY_CONFIG[issue.severity || 'low'];
                                        return (
                                            <li
                                                key={idx}
                                                className={`bg-white p-3 rounded-lg border transition-all cursor-pointer ${hoveredIssue === idx ? `${color.border} shadow-md` : 'border-gray-100 hover:border-gray-200'}`}
                                                onMouseEnter={() => setHoveredIssue(idx)}
                                                onMouseLeave={() => setHoveredIssue(null)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-start gap-2">
                                                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${color.border.replace('border', 'bg')}`}>
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-gray-800 text-sm block">{issue.label}</span>
                                                            {(issue as any).tooth_number && (
                                                                <span className="text-[10px] text-gray-400 font-mono">سن #{(issue as any).tooth_number}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        {(issue as any).category && (
                                                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                                                {CATEGORY_LABELS[(issue as any).category] || (issue as any).category}
                                                            </span>
                                                        )}
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${issueSeverity.bgClass} ${issueSeverity.textClass}`}>
                                                            {issueSeverity.icon} {issueSeverity.label}
                                                        </span>
                                                        <span className="text-[10px] font-mono bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                                                            {(issue.confidence * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </div>
                                                {issue.description && (
                                                    <p className="text-xs text-gray-500 mt-1.5 pr-7 leading-5">{issue.description}</p>
                                                )}
                                                {((issue as any).clinical_description || (issue as any).evidence_visible || (issue as any).risk_if_untreated) && (
                                                    <div className="mt-2 pr-7 grid gap-1.5 text-[11px] leading-5">
                                                        {(issue as any).clinical_description && <p className="bg-gray-50 rounded-md px-2 py-1 text-gray-700"><b>الوصف السريري:</b> {(issue as any).clinical_description}</p>}
                                                        {(issue as any).evidence_visible && <p className="bg-blue-50 rounded-md px-2 py-1 text-blue-800"><b>الدليل المرئي:</b> {(issue as any).evidence_visible}</p>}
                                                        {(issue as any).risk_if_untreated && <p className="bg-red-50 rounded-md px-2 py-1 text-red-800"><b>الخطر عند الإهمال:</b> {(issue as any).risk_if_untreated}</p>}
                                                    </div>
                                                )}
                                                {(issue as any).treatment_suggestion && (
                                                    <p className="text-xs text-purple-600 mt-1 pr-7 leading-5 flex items-start gap-1">
                                                        <Sparkles className="w-3 h-3 mt-0.5 shrink-0" />
                                                        {(issue as any).treatment_suggestion}
                                                    </p>
                                                )}
                                                {Array.isArray((issue as any).treatment_steps) && (issue as any).treatment_steps.length > 0 && (
                                                    <ol className="mt-1 pr-10 text-[11px] text-gray-600 leading-5 list-decimal">
                                                        {(issue as any).treatment_steps.map((step: string, stepIdx: number) => <li key={stepIdx}>{step}</li>)}
                                                    </ol>
                                                )}
                                                {/* Matched treatment from clinic catalog */}
                                                {(issue as any).matched_treatment_name && (issue as any).treatment_match_status === 'matched' ? (
                                                    <div className="mt-2 pr-7 flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
                                                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-800">
                                                            <CheckCircle className="w-3.5 h-3.5" />
                                                            <span className="font-bold">{(issue as any).matched_treatment_name}</span>
                                                            <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded">سعر معتمد</span>
                                                        </div>
                                                        <span className="text-xs font-bold text-emerald-700 font-mono">
                                                            {Number((issue as any).matched_treatment_price || 0).toLocaleString('en-US')} د.ع
                                                        </span>
                                                    </div>
                                                ) : ((issue as any).treatment_match_status === 'manual_pricing_needed' && result.has_clinic_catalog) ? (
                                                    <div className="mt-2 pr-7 flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 text-[11px] text-amber-800">
                                                        <AlertTriangle className="w-3.5 h-3.5" />
                                                        <span>يحتاج تسعير يدوي — لا يوجد علاج مطابق في قائمة العيادة</span>
                                                    </div>
                                                ) : null}
                                            </li>
                                        );
                                    })}
                                </ul>
                                {/* Total cost summary */}
                                {result.has_clinic_catalog && typeof result.total_estimated_cost === 'number' && result.total_estimated_cost > 0 && (
                                    <div className="mt-2 flex items-center justify-between bg-gradient-to-l from-emerald-50 to-emerald-100/40 border border-emerald-200 rounded-xl p-3">
                                        <span className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            إجمالي التكلفة التقديرية (من قائمة علاجات العيادة)
                                        </span>
                                        <span className="text-base font-extrabold text-emerald-700 font-mono">
                                            {result.total_estimated_cost.toLocaleString('en-US')} د.ع
                                        </span>
                                    </div>
                                )}
                                {result.has_clinic_catalog === false && (
                                    <div className="mt-2 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="font-bold">لم تُعرَّف قائمة علاجات لهذه العيادة.</p>
                                            <p className="opacity-80">التكاليف غير متاحة. يُرجى إضافة العلاجات من قسم "إدارة العلاجات" لعرض الأسعار تلقائياً.</p>
                                        </div>
                                    </div>
                                )}
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

                        {/* Findings */}
                        {result.findings && result.findings.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="flex items-center gap-2 font-bold text-gray-900 text-sm border-b pb-2">
                                    <FileText className="w-4 h-4 text-gray-600" />
                                    الملاحظات السريرية
                                </h4>
                                <ul className="space-y-1 text-xs text-gray-600">
                                    {result.findings.map((f, i) => (
                                        <li key={i} className="flex items-start gap-2 bg-gray-50 p-2 rounded-lg">
                                            <span className="text-gray-400 mt-0.5">•</span>
                                            <span className="leading-5">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Recommendation */}
                        {result.recommendation && (
                            <div className="space-y-2">
                                <h4 className="flex items-center gap-2 font-bold text-gray-900 text-sm border-b pb-2">
                                    <Sparkles className="w-4 h-4 text-purple-600" />
                                    التوصيات العلاجية
                                </h4>
                                <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 text-purple-900 text-xs flex items-start gap-2 leading-6">
                                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-purple-600" />
                                    <p>{result.recommendation}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-100 px-5 py-2 text-[10px] text-gray-400 flex justify-between items-center font-mono">
                    <span>Model: {model}</span>
                    <span>Tokens: {(result as any).metadata?.tokensUsed || 'N/A'}</span>
                </div>
            </div>

            {/* Zoom Modal */}
            {isZoomOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setIsZoomOpen(false)}
                >
                    <div
                        className="bg-transparent w-full max-w-7xl max-h-[95vh] relative flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Toolbar */}
                        <div className="absolute top-4 right-4 z-50 flex gap-2">
                            <Button
                                onClick={() => setShowBoxes(!showBoxes)}
                                className={`${showBoxes ? 'bg-green-600/80 hover:bg-green-600' : 'bg-black/50 hover:bg-black/70'} text-white border-white/20 backdrop-blur-md`}
                                size="sm"
                            >
                                <Crosshair className="w-4 h-4 ml-1" />
                                {showBoxes ? 'إخفاء العلامات' : 'عرض العلامات'}
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
                                    alt="تحليل الصورة الكامل"
                                    className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl"
                                />
                                {renderBoundingBoxes(true)}
                            </div>
                        </div>

                        {/* Bottom issue bar */}
                        {result.issues.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2 justify-center">
                                {result.issues.map((issue, idx) => {
                                    const color = getBoxColor(idx);
                                    const issueSeverity = SEVERITY_CONFIG[issue.severity || 'low'];
                                    return (
                                        <div
                                            key={idx}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${color.border} bg-black/60 backdrop-blur-md text-white text-xs cursor-pointer transition-all ${hoveredIssue === idx ? 'scale-110 shadow-lg' : ''}`}
                                            onMouseEnter={() => setHoveredIssue(idx)}
                                            onMouseLeave={() => setHoveredIssue(null)}
                                        >
                                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${color.border.replace('border', 'bg')}`}>
                                                {idx + 1}
                                            </span>
                                            <span>{issue.label}</span>
                                            <span className="text-gray-400">{issueSeverity.icon}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="text-center mt-3 text-white/40 text-xs">
                            مرر الماوس فوق العلامات لعرض التفاصيل • اضغط خارج الصورة للإغلاق
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
