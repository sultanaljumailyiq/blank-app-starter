import React from 'react';
import { X, MapPin, DollarSign, Briefcase, Calendar, Building, Clock } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Job } from '../../hooks/useJobs';

interface JobDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    job: Job | null;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ isOpen, onClose, job }) => {
    if (!isOpen || !job) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-500 p-2 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8">
                    <div className="flex items-start gap-6 mb-8">
                        <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-3xl">
                            {job.companyName ? job.companyName.charAt(0) : 'J'}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
                            <div className="flex items-center gap-2 text-gray-600 font-medium">
                                <Building className="w-4 h-4" />
                                {job.companyName}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> الموقع
                            </div>
                            <div className="font-semibold text-gray-900 text-sm">{job.location}</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                            <div className="text-xs text-green-600 mb-1 flex items-center gap-1">
                                <DollarSign className="w-3 h-3" /> الراتب
                            </div>
                            <div className="font-semibold text-green-700 text-sm">{job.salary}</div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                            <div className="text-xs text-blue-600 mb-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> الدوام
                            </div>
                            <div className="font-semibold text-blue-700 text-sm">{job.type}</div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                            <div className="text-xs text-purple-600 mb-1 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> نشر
                            </div>
                            <div className="font-semibold text-purple-700 text-sm">{job.postedDate}</div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-gray-500" />
                                الوصف الوظيفي
                            </h3>
                            <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">
                                {job.description}
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-900 mb-3">المتطلبات</h3>
                            <ul className="space-y-2">
                                {job.requirements && job.requirements.map((req, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                                        <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                                        {req}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                        <Button onClick={onClose} variant="outline" className="min-w-[100px]">إغلاق</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
