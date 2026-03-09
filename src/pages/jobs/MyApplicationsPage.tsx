import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { useJobs } from '../../hooks/useJobs';
import { Link } from 'react-router-dom';
import { Briefcase, CheckCircle, Clock, XCircle, FileText, Calendar, Eye } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const MyApplicationsPage: React.FC = () => {
    const { fetchMyApplications } = useJobs();
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyApplications().then(data => {
            setApplications(data);
            setLoading(false);
        });
    }, []);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'accepted': return { label: 'مقبول', color: 'green', icon: CheckCircle };
            case 'rejected': return { label: 'مرفوض', color: 'red', icon: XCircle };
            case 'viewed': return { label: 'تمت المشاهدة', color: 'blue', icon: Eye };
            default: return { label: 'قيد المراجعة', color: 'amber', icon: Clock };
        }
    };

    if (loading) return <div className="p-8 text-center" dir="rtl">جاري التحميل...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="w-7 h-7 text-blue-600" />
                        طلبات التوظيف الخاصة بي
                    </h1>
                    <Link to="/jobs">
                        <Button variant="outline" size="sm">تصفح المزيد</Button>
                    </Link>
                </div>

                <div className="space-y-4">
                    {applications.length > 0 ? applications.map(app => {
                        const job = app.job;
                        const status = getStatusConfig(app.status);
                        const StatusIcon = status.icon;

                        if (!job) return null; // Handle deleted jobs

                        return (
                            <Card key={app.id} className="p-0 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center font-bold text-xl text-blue-600 border border-blue-100 shadow-sm">
                                            {job.companyName.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 mb-1">
                                                <Link to={`/jobs/${job.id}`} className="hover:text-blue-600 transition-colors">
                                                    {job.title}
                                                </Link>
                                            </h3>
                                            <p className="text-sm text-gray-500 font-medium">{job.companyName}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            <span>تم التقديم: {new Date(app.appliedDate).toLocaleDateString('en-GB')}</span>
                                        </div>

                                        <div className={`
                                            px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2
                                            ${status.color === 'red' ? 'bg-red-50 text-red-600' :
                                                status.color === 'green' ? 'bg-green-50 text-green-600' :
                                                    status.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                                        'bg-amber-50 text-amber-600'}
                                        `}>
                                            <StatusIcon className="w-4 h-4" />
                                            {status.label}
                                        </div>

                                        <Link to={`/jobs/${job.id}`}>
                                            <Button variant="ghost" size="sm">التفاصيل</Button>
                                        </Link>
                                    </div>
                                </div>
                                {/* Footer / Next Steps Hint */}
                                {(status.color === 'blue' || status.color === 'amber') && (
                                    <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500 border-t border-gray-100 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                                        {status.color === 'blue'
                                            ? 'قام صاحب العمل بمشاهدة ملفك الشخصي. قد يتم التواصل معك قريباً.'
                                            : 'طلبك قيد المراجعة من قبل فريق التوظيف.'}
                                    </div>
                                )}
                            </Card>
                        );
                    }) : (
                        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900">لا توجد طلبات</h3>
                            <p className="text-gray-500 mb-6">لم تقدم على أي وظيفة بعد</p>
                            <Link to="/jobs">
                                <Button>تصفح الوظائف المتاحة</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
