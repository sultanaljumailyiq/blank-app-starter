import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobs, Job } from '../../hooks/useJobs';
import { Button } from '../../components/common/Button';
import {
    Briefcase, MapPin, DollarSign, Clock, Building,
    CheckCircle, ArrowRight, Share2, Calendar
} from 'lucide-react';

export const JobDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { jobs, loading, applyToJob, hasApplied, refresh } = useJobs();
    const [job, setJob] = useState<Job | undefined>(undefined);
    const [isApplying, setIsApplying] = useState(false);

    useEffect(() => {
        if (jobs.length > 0 && id) {
            const found = jobs.find(j => j.id === id);
            setJob(found);
        } else if (!loading && jobs.length === 0) {
            // Try refresh if empty (e.g. direct load)
            refresh();
        }
    }, [jobs, id, loading]);

    const handleApply = async () => {
        if (!id) return;
        setIsApplying(true);
        const success = await applyToJob(id);
        setIsApplying(false);
        if (success) {
            // Toast or notification could go here
        }
    };

    if (loading && !job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">جاري تحميل تفاصيل الوظيفة...</p>
                </div>
            </div>
        );
    }

    if (!job && !loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <Briefcase className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">الوظيفة غير موجودة</h2>
                <p className="text-gray-500 mb-6">عذراً، لم نتمكن من العثور على الوظيفة المطلوبة.</p>
                <Button onClick={() => navigate('/jobs')}>العودة للوظائف</Button>
            </div>
        );
    }

    if (!job) return null; // Should not happen

    const alreadyApplied = id ? hasApplied(id) : false;

    return (
        <div className="min-h-screen bg-gray-50 pb-12" dir="rtl">
            {/* Header / Hero */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-8">
                    <Button
                        variant="ghost"
                        className="mb-6 text-gray-500 hover:text-gray-900"
                        onClick={() => navigate('/jobs')}
                    >
                        <ArrowRight className="w-4 h-4 ml-2" />
                        العودة للقائمة
                    </Button>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex items-start gap-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
                                <Building className="w-10 h-10 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                                    <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                                        <Building className="w-4 h-4" />
                                        {job.companyName}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                                        <MapPin className="w-4 h-4" />
                                        {job.location}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                        <Clock className="w-4 h-4" />
                                        {job.type}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button variant="outline" onClick={() => { /* Share logic */ }}>
                                <Share2 className="w-4 h-4" />
                            </Button>
                            {alreadyApplied ? (
                                <Button disabled className="bg-green-100 text-green-700 border-green-200 cursor-not-allowed">
                                    <CheckCircle className="w-4 h-4 ml-2" />
                                    تم التقديم
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleApply}
                                    disabled={isApplying}
                                    className="bg-blue-600 hover:bg-blue-700 text-white min-w-[200px]"
                                >
                                    {isApplying ? 'جاري التقديم...' : 'تقديم الآن'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">الوصف الوظيفي</h2>
                            </div>
                            <div className="p-8 prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                                {job.description}
                            </div>
                        </section>

                        {/* Requirements */}
                        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-purple-600" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">المتطلبات والمؤهلات</h2>
                            </div>
                            <div className="p-8">
                                <ul className="space-y-4">
                                    {job.requirements && job.requirements.length > 0 ? (
                                        job.requirements.map((req, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-gray-600">
                                                <div className="mt-1 w-5 h-5 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                                                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                                </div>
                                                {req}
                                            </li>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 italic">لا توجد متطلبات محددة</p>
                                    )}
                                </ul>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4">معلومات إضافية</h3>

                            <div className="space-y-4 divide-y divide-gray-50">
                                <div className="pt-4 first:pt-0">
                                    <span className="block text-sm text-gray-500 mb-1">الراتب المتوقع</span>
                                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                                        <DollarSign className="w-4 h-4 text-green-600" />
                                        {job.salary}
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <span className="block text-sm text-gray-500 mb-1">الخبرة المطلوبة</span>
                                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                                        <Briefcase className="w-4 h-4 text-orange-500" />
                                        {job.experience || 'غير محدد'}
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <span className="block text-sm text-gray-500 mb-1">تاريخ النشر</span>
                                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        {job.postedDate}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <h4 className="font-bold text-sm text-gray-900 mb-3">شارك الوظيفة</h4>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="flex-1">Facebook</Button>
                                    <Button size="sm" variant="outline" className="flex-1">LinkedIn</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
