import React, { useState, useEffect } from 'react';
import { X, User, Check, XCircle, Eye, Calendar, Award } from 'lucide-react';
import { Button } from '../common/Button';
import { useJobs } from '../../hooks/useJobs';
import { JobSeekerProfileModal } from './JobSeekerProfileModal';
import { toast } from 'sonner';

interface JobApplicantsModalProps {
    isOpen: boolean;
    onClose: () => void;
    job: any;
}

export const JobApplicantsModal: React.FC<JobApplicantsModalProps> = ({ isOpen, onClose, job }) => {
    const { fetchJobApplications, updateApplicationStatus } = useJobs();
    const [applicants, setApplicants] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<any | null>(null);

    useEffect(() => {
        if (isOpen && job?.id) {
            loadApplicants();
        }
    }, [isOpen, job]);

    const loadApplicants = async () => {
        setLoading(true);
        const data = await fetchJobApplications(job.id);
        setApplicants(data || []);
        setLoading(false);
    };

    const handleStatusUpdate = async (appId: string, status: 'accepted' | 'rejected') => {
        const success = await updateApplicationStatus(appId, status);
        if (success) {
            // Update local state
            setApplicants(prev => prev.map(app =>
                app.id === appId ? { ...app, status } : app
            ));
        }
    };

    if (!isOpen || !job) return null;

    return (
        <>
            <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
                <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">

                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">المتقدمين للوظيفة</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {job.title} • {applicants.length} متقدم
                            </p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {loading ? (
                            <div className="text-center py-12 text-gray-500">جاري تحميل المتقدمين...</div>
                        ) : applicants.length > 0 ? (
                            <div className="space-y-4">
                                {applicants.map(app => {
                                    const seeker = app.applicant;
                                    return (
                                        <div key={app.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-4 items-start md:items-center">
                                            {/* Avatar */}
                                            <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center border border-blue-100 flex-shrink-0">
                                                {seeker?.title ? (
                                                    <span className="font-bold text-xl text-blue-600">{seeker.title.charAt(0)}</span>
                                                ) : (
                                                    <User className="w-6 h-6 text-blue-400" />
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-gray-900">{seeker?.title || 'متقدم غير معروف'}</h3>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${app.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                            app.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                    'bg-gray-50 text-gray-600 border-gray-200'
                                                        }`}>
                                                        {app.status === 'pending' ? 'قيد المراجعة' :
                                                            app.status === 'accepted' ? 'مقبول' :
                                                                app.status === 'rejected' ? 'مرفوض' : app.status}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(app.created_at).toLocaleDateString('ar-EG')}
                                                    </span>
                                                    {seeker?.skills && seeker.skills.length > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <Award className="w-3 h-3" />
                                                            {seeker.skills.length} مهارات
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                                                <Button size="sm" variant="outline" onClick={() => setSelectedProfile(seeker)} className="flex-1 md:flex-none">
                                                    <Eye className="w-4 h-4 ml-1" />
                                                    عرض الملف
                                                </Button>

                                                {app.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(app.id, 'accepted')}
                                                            className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
                                                            title="قبول"
                                                        >
                                                            <Check className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(app.id, 'rejected')}
                                                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
                                                            title="رفض"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <User className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500">لا يوجد متقدمين لهذه الوظيفة حتى الآن</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Nested Profile Modal */}
            <JobSeekerProfileModal
                isOpen={!!selectedProfile}
                onClose={() => setSelectedProfile(null)}
                profile={selectedProfile}
            />
        </>
    );
};
