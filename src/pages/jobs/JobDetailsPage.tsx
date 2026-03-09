import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Building2, MapPin, Clock, DollarSign, Calendar,
    CheckCircle, Share2, Flag, ArrowRight
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useJobs } from '../../hooks/useJobs';

export const JobDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { getJobById, loading, applyToJob, hasApplied } = useJobs();
    const job = getJobById(id || 'JOB-001') || getJobById('JOB-001'); // Mock fallback

    if (loading || !job) {
        return <div className="p-12 text-center text-gray-500">جاري تحميل تفاصيل الوظيفة...</div>;
    }

    const isApplied = hasApplied(job.id);

    const handleApply = () => {
        applyToJob(job.id);
        alert('تم إرسال طلب التقديم بنجاح!');
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12" dir="rtl">
            {/* Header / Breadcrumb */}
            <div className="bg-white border-b py-4">
                <div className="container mx-auto px-4">
                    <Link to="/jobs" className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4 transition-colors">
                        <ArrowRight className="w-4 h-4 ml-1" />
                        العودة للوظائف
                    </Link>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-2xl font-bold">
                                {job.companyName.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                                <div className="flex items-center gap-2 text-gray-500 mt-1">
                                    <Building2 className="w-4 h-4" />
                                    {job.companyName}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" className="gap-2">
                                <Share2 className="w-4 h-4" />
                                مشاركة
                            </Button>
                            <Button
                                onClick={handleApply}
                                disabled={isApplied}
                                className={isApplied ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
                            >
                                {isApplied ? 'تم التقديم' : 'قدم الآن'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">تفاصيل الوظيفة</h2>
                        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                                <MapPin className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-gray-500">الموقع</p>
                                    <p className="font-medium">{job.location}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                                <Clock className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-gray-500">نوع الدوام</p>
                                    <p className="font-medium">{job.type}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                                <DollarSign className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-gray-500">الراتب</p>
                                    <p className="font-medium">{job.salary}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-gray-500">تاريخ النشر</p>
                                    <p className="font-medium">{job.postedDate}</p>
                                </div>
                            </div>
                        </div>

                        <hr className="my-6 border-gray-100" />

                        <div className="mb-6">
                            <h3 className="font-bold text-gray-900 mb-2">الوصف الوظيفي</h3>
                            <p className="text-gray-600 leading-relaxed text-justify">
                                {job.description}
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">المتطلبات</h3>
                            <ul className="space-y-2">
                                {job.requirements.map((req, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-6 bg-blue-50 border-blue-100">
                        <h3 className="font-bold text-blue-900 mb-2">نصائح للتقديم</h3>
                        <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                            <li>تأكد من تحديث سيرتك الذاتية</li>
                            <li>أكتب رسالة تعريفية مخصصة</li>
                            <li>راجع متطلبات الوظيفة جيداً</li>
                        </ul>
                    </Card>

                    <div className="text-center">
                        <button className="text-gray-400 hover:text-red-500 text-sm flex items-center justify-center gap-1 mx-auto transition-colors">
                            <Flag className="w-4 h-4" />
                            الإبلاغ عن هذه الوظيفة
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};
