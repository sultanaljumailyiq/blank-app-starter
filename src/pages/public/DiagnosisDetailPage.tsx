import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowRight, Brain, User, Send, Zap, MessageSquare,
    Stethoscope, Smile, Activity, AlertCircle, RefreshCw,
    Calendar as CalendarIcon, CheckCircle, Star, Clock,
    Shield, Heart, ChevronLeft, MapPin, Thermometer, Eye,
    AlertTriangle, Award, TrendingUp, FileText
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ClinicCard } from '../../components/cards/ClinicCard';
import { usePublicClinics } from '../../hooks/usePublicClinics';
import { commonConditions, questionSets, ageGroups, sexOptions, medicalConditions } from './diagnosisData';
import { getDynamicResult, getScorePercentage } from './diagnosisScoring';

export const DiagnosisDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { clinics } = usePublicClinics();

    const [step, setStep] = useState(1); // 1: Selection, 2: Patient Info, 3: Questions, 4: Medical History, 5: Results
    const [selectedCondition, setSelectedCondition] = useState('');
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [userResponses, setUserResponses] = useState<Record<number, string>>({});
    const [animating, setAnimating] = useState(false);
    const [patientAge, setPatientAge] = useState('');
    const [patientSex, setPatientSex] = useState('');
    const [selectedMedical, setSelectedMedical] = useState<string[]>([]);

    const mode = id === 'ai' ? 'ai' : 'smart';
    const isAI = mode === 'ai';

    const currentQuestions = selectedCondition ? questionSets[selectedCondition] || [] : [];
    const totalQuestions = currentQuestions.length;
    const progress = totalQuestions > 0 ? ((currentQuestionIdx + 1) / totalQuestions) * 100 : 0;

    const featuredClinics = clinics.filter(c => c.settings?.articleSuggestions === true).slice(0, 4);

    const handleConditionSelect = (conditionId: string) => {
        setSelectedCondition(conditionId);
        setCurrentQuestionIdx(0);
        setUserResponses({});
        setStep(2);
    };

    const handlePatientInfoNext = () => {
        if (patientAge && patientSex) setStep(3);
    };

    const handleAnswerSelect = (optionId: string) => {
        if (animating) return;
        setAnimating(true);
        setUserResponses(prev => ({ ...prev, [currentQuestionIdx]: optionId }));

        setTimeout(() => {
            if (currentQuestionIdx < totalQuestions - 1) {
                setCurrentQuestionIdx(prev => prev + 1);
            } else {
                setStep(4);
            }
            setAnimating(false);
        }, 400);
    };

    const handleGoBack = () => {
        if (step === 3 && currentQuestionIdx > 0) {
            setCurrentQuestionIdx(prev => prev - 1);
        } else if (step === 3 && currentQuestionIdx === 0) {
            setStep(2);
        } else if (step === 2) {
            setStep(1);
            setSelectedCondition('');
        } else if (step === 4) {
            setStep(3);
            setCurrentQuestionIdx(totalQuestions - 1);
        } else if (step === 5) {
            setStep(4);
        }
    };

    const toggleMedicalCondition = (id: string) => {
        setSelectedMedical(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const filteredMedicalConditions = medicalConditions.filter(mc => {
        if (mc.id === 'pregnancy' && patientSex !== 'female') return false;
        return true;
    });

    const resetDiagnosis = () => {
        setStep(1);
        setSelectedCondition('');
        setCurrentQuestionIdx(0);
        setUserResponses({});
        setPatientAge('');
        setPatientSex('');
        setSelectedMedical([]);
    };

    const questionOptions = currentQuestions.map(q => q.options);
    const result = selectedCondition && step === 5 ? getDynamicResult(selectedCondition, userResponses, questionOptions, selectedMedical, patientAge) : null;
    const scorePercentage = selectedCondition && step === 5 ? getScorePercentage(selectedCondition, userResponses, questionOptions, selectedMedical, patientAge) : 0;
    const conditionInfo = commonConditions.find(c => c.id === selectedCondition);

    // AI mode redirect
    if (isAI) {
        return (
            <div className="min-h-screen bg-gray-50 pb-20">
                <div className="bg-white border-b sticky top-0 z-30">
                    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                        <button onClick={() => navigate('/services#tab-diagnosis')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                            <ArrowRight className="w-5 h-5" /><span className="font-medium">عودة للخدمات</span>
                        </button>
                        <h1 className="text-lg font-bold text-gray-900">المساعد الذكي (AI)</h1>
                        <div className="w-8" />
                    </div>
                </div>
                <div className="container mx-auto px-4 py-8 max-w-3xl text-center">
                    <p className="text-gray-500">يرجى استخدام صفحة المساعد الذكي</p>
                    <Button onClick={() => navigate('/diagnosis/ai')} className="mt-4">الذهاب للمساعد الذكي</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-30">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => step === 1 ? navigate('/services#tab-diagnosis') : handleGoBack()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowRight className="w-5 h-5" />
                        <span className="font-medium">{step === 1 ? 'عودة للخدمات' : 'رجوع'}</span>
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">التشخيص الذكي</h1>
                    {step === 2 ? (
                        <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                            {currentQuestionIdx + 1}/{totalQuestions}
                        </span>
                    ) : <div className="w-8" />}
                </div>
                {step === 2 && (
                    <div className="h-1.5 bg-gray-100">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>

            <div className="container mx-auto px-4 py-8 max-w-3xl">

                {/* Step 1: Condition Selection */}
                {step === 1 && (
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                        <div className="text-center mb-10">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-100/50 transform rotate-3">
                                <Stethoscope className="w-10 h-10 text-purple-600" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-3">ما هي شكواك الرئيسية؟</h2>
                            <p className="text-gray-500 max-w-md mx-auto">اختر الحالة الأقرب لما تشعر به وسنطرح عليك أسئلة دقيقة للوصول إلى تشخيص مبدئي احترافي</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {commonConditions.map((condition) => (
                                <button
                                    key={condition.id}
                                    className="group relative p-6 rounded-3xl border-2 border-gray-100 bg-white hover:border-purple-200 hover:shadow-xl transition-all duration-300 flex flex-col items-center gap-4 overflow-hidden"
                                    onClick={() => handleConditionSelect(condition.id)}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${condition.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-purple-100 group-hover:text-purple-600 flex items-center justify-center transition-all duration-300 relative z-10">
                                        <condition.icon className="w-7 h-7" />
                                    </div>
                                    <span className="font-bold text-sm text-gray-700 group-hover:text-purple-900 relative z-10">
                                        {condition.title}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 bg-blue-50/50 rounded-2xl p-5 border border-blue-100 flex items-start gap-3">
                            <Shield className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm text-blue-900 font-bold mb-1">ملاحظة مهمة</p>
                                <p className="text-xs text-blue-700 leading-relaxed">هذا التشخيص مبدئي ولا يغني عن زيارة طبيب الأسنان. يهدف لمساعدتك في فهم حالتك وتحديد التخصص المناسب.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Patient Info */}
                {step === 2 && (
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <User className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">بياناتك الأساسية</h3>
                                <p className="text-gray-500 text-sm">تساعدنا في تقديم تشخيص أدق حسب فئتك العمرية وجنسك</p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <p className="font-bold text-gray-700 mb-3">الفئة العمرية</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {ageGroups.map(ag => (
                                            <button key={ag.id} onClick={() => setPatientAge(ag.id)}
                                                className={`p-3 rounded-2xl border-2 text-center transition-all duration-200 ${patientAge === ag.id ? 'border-purple-400 bg-purple-50 shadow-md' : 'border-gray-100 hover:border-purple-200'}`}>
                                                <span className="text-2xl block mb-1">{ag.icon}</span>
                                                <span className="text-xs font-semibold text-gray-700">{ag.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="font-bold text-gray-700 mb-3">الجنس</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        {sexOptions.map(s => (
                                            <button key={s.id} onClick={() => setPatientSex(s.id)}
                                                className={`p-4 rounded-2xl border-2 text-center transition-all duration-200 ${patientSex === s.id ? 'border-purple-400 bg-purple-50 shadow-md' : 'border-gray-100 hover:border-purple-200'}`}>
                                                <span className="text-3xl block mb-1">{s.icon}</span>
                                                <span className="text-sm font-semibold text-gray-700">{s.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button onClick={handlePatientInfoNext} disabled={!patientAge || !patientSex}
                                    className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-lg">
                                    التالي ←
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Questions */}
                {step === 3 && currentQuestions[currentQuestionIdx] && (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-300" key={currentQuestionIdx}>
                        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-50 to-transparent rounded-bl-full opacity-60" />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${conditionInfo?.color || 'from-purple-500 to-indigo-500'} flex items-center justify-center text-white shadow-md`}>
                                            <MessageSquare className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">سؤال {currentQuestionIdx + 1} من {totalQuestions}</p>
                                            <p className="text-xs text-gray-400">{conditionInfo?.title}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {Array.from({ length: totalQuestions }, (_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 rounded-full transition-all duration-500 ${i <= currentQuestionIdx ? 'w-3 bg-purple-500' : 'w-1.5 bg-gray-200'}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-8 leading-relaxed text-center">
                                    {currentQuestions[currentQuestionIdx].question}
                                </h3>

                                <div className="grid grid-cols-1 gap-3">
                                    {currentQuestions[currentQuestionIdx].options.map((option, idx) => (
                                        <button
                                            key={option.id}
                                            disabled={animating}
                                            className={`w-full p-4 rounded-2xl border-2 text-right transition-all duration-300 flex items-center justify-between group ${userResponses[currentQuestionIdx] === option.id
                                                ? 'border-purple-400 bg-purple-50 shadow-md'
                                                : 'border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 hover:shadow-md'
                                                }`}
                                            onClick={() => handleAnswerSelect(option.id)}
                                            style={{ animationDelay: `${idx * 80}ms` }}
                                        >
                                            <span className={`font-semibold ${userResponses[currentQuestionIdx] === option.id ? 'text-purple-900' : 'text-gray-700 group-hover:text-purple-800'}`}>
                                                {option.text}
                                            </span>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${userResponses[currentQuestionIdx] === option.id
                                                ? 'border-purple-500 bg-purple-500'
                                                : 'border-gray-300 group-hover:border-purple-300'
                                                }`}>
                                                {userResponses[currentQuestionIdx] === option.id && <CheckCircle className="w-4 h-4 text-white" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Medical History */}
                {step === 4 && (
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Heart className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">التاريخ المرضي</h3>
                                <p className="text-gray-500 text-sm">هل لديك أي من هذه الحالات؟ اختر ما ينطبق (اختياري)</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                                {filteredMedicalConditions.map(mc => (
                                    <button key={mc.id} onClick={() => toggleMedicalCondition(mc.id)}
                                        className={`p-4 rounded-2xl border-2 text-right flex items-center gap-3 transition-all duration-200 ${selectedMedical.includes(mc.id) ? 'border-red-300 bg-red-50 shadow-md' : 'border-gray-100 hover:border-red-200 hover:bg-red-50/30'}`}>
                                        <span className="text-2xl">{mc.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-bold text-sm ${selectedMedical.includes(mc.id) ? 'text-red-800' : 'text-gray-700'}`}>{mc.label}</p>
                                            <p className="text-xs text-gray-500 truncate">{mc.impactDescription}</p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${selectedMedical.includes(mc.id) ? 'border-red-500 bg-red-500' : 'border-gray-300'}`}>
                                            {selectedMedical.includes(mc.id) && <CheckCircle className="w-4 h-4 text-white" />}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {selectedMedical.length > 0 && (
                                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 mb-6">
                                    <p className="text-sm font-bold text-amber-800 mb-1">⚠️ ملاحظة مهمة</p>
                                    <p className="text-xs text-amber-700">سيتم تعديل التشخيص ليأخذ بعين الاعتبار حالاتك المرضية ويقدم تحذيرات مخصصة</p>
                                </div>
                            )}

                            <button onClick={() => setStep(5)}
                                className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg">
                                {selectedMedical.length > 0 ? `عرض النتيجة (${selectedMedical.length} حالة مختارة) ←` : 'لا توجد حالات - عرض النتيجة ←'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 5: Results */}
                {step === 5 && result && (
                    <div className="animate-in zoom-in-95 duration-500 space-y-6">
                        {/* Result Header */}
                        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                            <div className={`bg-gradient-to-r ${result.severityColor} p-8 text-center text-white relative overflow-hidden`}>
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full" />
                                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full" />
                                </div>
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl border border-white/20">
                                        <CheckCircle className="w-8 h-8 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-black mb-1">اكتمل التشخيص</h2>
                                    <p className="text-white/80 text-sm">إليك التقرير الطبي المبدئي المفصل</p>
                                    <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold border border-white/20">
                                        <AlertTriangle className="w-4 h-4" />
                                        مستوى الخطورة: {result.severityLabel} ({scorePercentage}%)
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                {/* Title & Summary */}
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-purple-500" />
                                        {result.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">{result.summary}</p>
                                </div>

                                {/* Possible Diagnoses */}
                                <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-100">
                                    <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                                        <div className="w-1.5 h-5 bg-blue-500 rounded-full" />
                                        التشخيصات المحتملة
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {result.possibleDiagnosis.map((d, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-white text-blue-800 text-xs font-bold rounded-lg border border-blue-200 shadow-sm">
                                                {d}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Recommendations */}
                                <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100">
                                    <h4 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                                        <div className="w-1.5 h-5 bg-emerald-500 rounded-full" />
                                        التوصيات الطبية
                                    </h4>
                                    <ul className="space-y-2.5">
                                        {result.recommendations.map((r, i) => (
                                            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                                                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                                <span className="leading-relaxed">{r}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Immediate Tips */}
                                <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-100">
                                    <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                                        <div className="w-1.5 h-5 bg-amber-500 rounded-full" />
                                        نصائح فورية للراحة
                                    </h4>
                                    <ul className="space-y-2.5">
                                        {result.immediateTips.map((t, i) => (
                                            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                                                <Zap className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                                <span className="leading-relaxed">{t}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Specialty & Urgency */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-100 text-center">
                                        <Award className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                                        <p className="text-xs text-gray-500 mb-1">التخصص المطلوب</p>
                                        <p className="text-sm font-bold text-purple-900">{result.specialty}</p>
                                    </div>
                                    <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-100 text-center">
                                        <Clock className="w-6 h-6 text-rose-500 mx-auto mb-2" />
                                        <p className="text-xs text-gray-500 mb-1">مدى الاستعجال</p>
                                        <p className="text-sm font-bold text-rose-900">{result.urgency}</p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-3 pt-2">
                                    <Button
                                        size="lg"
                                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl py-4 shadow-lg shadow-purple-200 border-0"
                                        onClick={() => navigate('/booking')}
                                    >
                                        <CalendarIcon className="w-5 h-5 ml-2" />
                                        حجز موعد مع طبيب
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="w-full rounded-xl py-4"
                                        onClick={resetDiagnosis}
                                    >
                                        <RefreshCw className="w-5 h-5 ml-2" />
                                        إجراء فحص جديد
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Suggested Clinics */}
                        {featuredClinics.length > 0 && (
                            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-blue-500" />
                                        عيادات مقترحة لحالتك
                                    </h3>
                                    <Link to="/services" className="text-sm font-medium text-blue-600 hover:text-blue-700">عرض الكل</Link>
                                </div>
                                <div className="flex gap-6 overflow-x-auto pb-4 -mx-2 px-2" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                                    <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
                                    {featuredClinics.map(clinic => (
                                        <div key={clinic.id} className="min-w-[300px]">
                                            <ClinicCard clinic={clinic} expandable={true} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Disclaimer */}
                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 flex items-start gap-3">
                            <Shield className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-gray-500 leading-relaxed">
                                <strong>إخلاء مسؤولية:</strong> هذا التقرير هو تقييم مبدئي يعتمد على إجاباتك ولا يُعد بديلاً عن الفحص السريري المباشر من قبل طبيب أسنان مرخّص.
                                يُنصح بزيارة طبيب أسنان للحصول على تشخيص نهائي دقيق وخطة علاج مناسبة.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
