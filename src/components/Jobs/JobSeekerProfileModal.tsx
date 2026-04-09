import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, Mail, Briefcase, GraduationCap, Award, Send, CheckCircle2, ChevronLeft } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { toast } from 'sonner';
import { useJobs } from '../../hooks/useJobs';

interface JobSeekerProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: any;
}

export const JobSeekerProfileModal: React.FC<JobSeekerProfileModalProps> = ({ isOpen, onClose, profile }) => {
    const { sendOffer, fetchMyPostedJobs } = useJobs();
    const [isSending, setIsSending] = useState(false);
    const [showOfferForm, setShowOfferForm] = useState(false);
    const [offerMessage, setOfferMessage] = useState('');
    const [myJobs, setMyJobs] = useState<any[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string>('');

    useEffect(() => {
        if (showOfferForm) {
            loadJobs();
        }
    }, [showOfferForm]);

    const loadJobs = async () => {
        const jobs = await fetchMyPostedJobs();
        setMyJobs(jobs || []);
    };

    if (!isOpen || !profile) return null;

    const handleSendOffer = async () => {
        if (!offerMessage.trim()) {
            toast.error('يرجى كتابة رسالة العرض');
            return;
        }

        setIsSending(true);
        try {
            await sendOffer(profile.id, selectedJobId || null, offerMessage);
            toast.success(`تم إرسال عرض العمل إلى ${profile.title} بنجاح!`);
            handleClose();
        } catch (error) {
            toast.error('حدث خطأ أثناء إرسال العرض');
        } finally {
            setIsSending(false);
        }
    };

    const handleClose = () => {
        setShowOfferForm(false);
        setOfferMessage('');
        setSelectedJobId('');
        onClose();
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'doctor':
                return { label: 'طبيب', classes: 'bg-blue-100 text-blue-700 border-blue-200 icon-blue-500' };
            case 'assistant':
                return { label: 'مساعد/طاقم', classes: 'bg-green-100 text-green-700 border-green-200 icon-green-500' };
            case 'technician':
                return { label: 'تقني مختبر', classes: 'bg-amber-100 text-amber-700 border-amber-200 icon-amber-500' };
            case 'supplier':
                return { label: 'مورد', classes: 'bg-purple-100 text-purple-700 border-purple-200 icon-purple-500' };
            case 'admin':
                return { label: 'إدارة المنصة', classes: 'bg-gray-800 text-white border-gray-700 icon-gray-400' };
            default:
                return { label: 'عام', classes: 'bg-gray-100 text-gray-700 border-gray-200 icon-gray-500' };
        }
    };

    const roleBadge = getRoleBadge(profile.role);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">

                {/* Header Background */}
                <div className={`h-32 w-full bg-gradient-to-r ${profile.role === 'doctor' ? 'from-blue-500 to-indigo-600' :
                    profile.role === 'technician' ? 'from-amber-500 to-orange-600' :
                        profile.role === 'supplier' ? 'from-purple-500 to-pink-600' :
                            'from-gray-500 to-gray-700'
                    }`}></div>

                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors backdrop-blur-sm z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                {showOfferForm ? (
                    <div className="p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <button onClick={() => setShowOfferForm(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <ChevronLeft className="w-6 h-6 rotate-180" />
                            </button>
                            <h2 className="text-2xl font-bold text-gray-900">تقديم عرض عمل</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                                    {profile.title?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{profile.title}</p>
                                    <p className="text-sm text-gray-500">{roleBadge.label}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">ربط بوظيفة (اختياري)</label>
                                <select
                                    value={selectedJobId}
                                    onChange={(e) => setSelectedJobId(e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                >
                                    <option value="">-- اختر وظيفة منشورة --</option>
                                    {myJobs.map(job => (
                                        <option key={job.id} value={job.id}>{job.title}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">يمكنك ربط العرض بوظيفة قمت بنشرها مسبقاً.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">رسالة العرض <span className="text-red-500">*</span></label>
                                <textarea
                                    value={offerMessage}
                                    onChange={(e) => setOfferMessage(e.target.value)}
                                    placeholder="اكتب تفاصيل العرض، الراتب المقترح، ومواعيد العمل..."
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px] resize-y transition-all"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    onClick={handleSendOffer}
                                    disabled={isSending}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                >
                                    {isSending ? 'جاري الإرسال...' : 'إرسال العرض'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowOfferForm(false)}
                                    className="flex-1"
                                >
                                    إلغاء
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="px-8 pb-8">
                        {/* Profile Image & Basic Info */}
                        <div className="relative -mt-16 mb-6 flex flex-col items-center md:items-start md:flex-row gap-6">
                            <div className={`w-32 h-32 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-4xl font-bold text-white relative bg-gradient-to-br ${profile.role === 'doctor' ? 'from-blue-400 to-blue-600' :
                                profile.role === 'technician' ? 'from-amber-400 to-amber-600' :
                                    profile.role === 'supplier' ? 'from-purple-400 to-purple-600' :
                                        'from-gray-400 to-gray-600'
                                }`}>
                                {profile.title ? profile.title.charAt(0) : '?'}
                                {profile.is_looking_for_work && (
                                    <div className="absolute bottom-2 left-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full" title="متاح للعمل"></div>
                                )}
                            </div>

                            <div className="flex-1 text-center md:text-right pt-4 md:pt-16">
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.title}</h2>
                                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${roleBadge.classes}`}>
                                        {roleBadge.label}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {profile.location || 'الموقع غير محدد'}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 md:pt-16">
                                <Button
                                    onClick={() => setShowOfferForm(true)}
                                    className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-200"
                                >
                                    <Send className="w-4 h-4 ml-2" />
                                    تقديم فرصة عمل
                                </Button>
                            </div>
                        </div>

                        {/* Role Specific Badge/Banner if needed */}
                        {profile.role === 'doctor' && (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-6 flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg"><CheckCircle2 className="w-5 h-5 text-blue-600" /></div>
                                <p className="text-sm text-blue-800">هذا المستخدم موثق كطبيب أسنان مرخص.</p>
                            </div>
                        )}
                        {profile.role === 'supplier' && (
                            <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 mb-6 flex items-center gap-3">
                                <div className="bg-purple-100 p-2 rounded-lg"><Award className="w-5 h-5 text-purple-600" /></div>
                                <p className="text-sm text-purple-800">هذا المستخدم مورد معتمد للمواد الطبية.</p>
                            </div>
                        )}

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* About & Contact */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-gray-500" />
                                        نبذة تعريفية
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        {profile.bio || 'لا تتوفر نبذة تعريفية.'}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <Award className="w-5 h-5 text-gray-500" />
                                        المهارات
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.skills && profile.skills.length > 0 ? (
                                            profile.skills.map((skill: string, idx: number) => (
                                                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg border border-gray-200">
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-400 text-sm">لا توجد مهارات مضافة</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Experience & Education */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-gray-500" />
                                        الخبرات
                                    </h3>
                                    <div className="space-y-3">
                                        {profile.experience && profile.experience.length > 0 ? (
                                            profile.experience.map((exp: any, idx: number) => (
                                                <div key={idx} className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                                                    <div className="font-bold text-gray-900 text-sm">{exp.title}</div>
                                                    <div className="text-xs text-blue-600 mb-1">{exp.company}</div>
                                                    <div className="text-xs text-gray-400">{exp.startDate} - {exp.current ? 'الآن' : exp.endDate}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-sm">لا توجد خبرات مسجلة</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-gray-500" />
                                        التعليم
                                    </h3>
                                    <div className="space-y-3">
                                        {profile.education && profile.education.length > 0 ? (
                                            profile.education.map((edu: any, idx: number) => (
                                                <div key={idx} className="flex items-center gap-3 bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                                                    <div className="bg-green-50 p-2 rounded-lg text-green-600 block">
                                                        <GraduationCap className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-sm">{edu.degree}</div>
                                                        <div className="text-xs text-gray-500">{edu.institution} ({edu.year})</div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-sm">لا يوجد تعليم مسجل</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Footer / Contact Actions */}
                        <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4">
                            <Button variant="outline" className="flex-1 border-gray-200 hover:bg-gray-50 text-gray-700">
                                <Mail className="w-4 h-4 ml-2" />
                                مراسلة
                            </Button>
                            {profile.phone && (
                                <Button variant="outline" className="flex-1 border-gray-200 hover:bg-gray-50 text-gray-700">
                                    <Phone className="w-4 h-4 ml-2" />
                                    اتصال ({profile.phone})
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
