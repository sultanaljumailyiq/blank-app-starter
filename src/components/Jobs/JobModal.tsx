import React from 'react';
import {
  X,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Users,
  Calendar,
  Mail,
  Phone,
  Briefcase,
  CheckCircle2,
  Gift,
  AlertCircle,
  Star,
  Zap
} from 'lucide-react';
import { Job } from '../../types';
import { Button } from '../common/Button';
import { formatNumericDate } from '../../lib/date';

interface JobModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export const JobModal: React.FC<JobModalProps> = ({ job, isOpen, onClose }) => {
  if (!isOpen || !job) return null;

  const formatSalary = (salary: Job['salary']) => {
    if (!salary) return 'حسب الاتفاق';

    const min = salary.min.toLocaleString();
    const max = salary.max.toLocaleString();
    const period = salary.period === 'monthly' ? 'شهرياً' :
      salary.period === 'weekly' ? 'أسبوعياً' :
        salary.period === 'daily' ? 'يومياً' : 'بالساعة';

    return `${min} - ${max} ${salary.currency} ${period}`;
  };

  const formatJobType = (type: string) => {
    switch (type) {
      case 'full-time': return 'دوام كامل';
      case 'part-time': return 'دوام جزئي';
      case 'contract': return 'عقد مؤقت';
      case 'temporary': return 'مؤقت';
      default: return type;
    }
  };

  const formatExperience = (exp: string) => {
    switch (exp) {
      case 'entry-level': return 'مبتدئ';
      case 'mid-level': return 'متوسط';
      case 'senior-level': return 'خبير';
      default: return exp;
    }
  };

  const daysSincePosted = Math.floor(
    (new Date().getTime() - new Date(job.postedDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  const deadline = job.deadline ? formatNumericDate(job.deadline) : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm rounded-t-3xl border-b border-gray-100 p-6 z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={job.companyName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-100"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
                  <div className="flex gap-1">
                    {job.featured && (
                      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        مميزة
                      </div>
                    )}
                    {job.urgent && (
                      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        عاجل
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-blue-600 font-semibold text-lg mb-2">{job.companyName}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    نُشر {daysSincePosted === 0 ? 'اليوم' :
                      daysSincePosted === 1 ? 'أمس' :
                        `قبل ${daysSincePosted} أيام`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {job.applicants} متقدم
                  </span>
                  {deadline && (
                    <span className="flex items-center gap-1 text-orange-600">
                      <AlertCircle className="w-4 h-4" />
                      ينتهي في {deadline}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* المعلومات الأساسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">الموقع</p>
                  <p className="font-semibold text-gray-900">{job.governorate}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{job.location}</p>
              <p className="text-xs text-gray-500">{job.district}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">الراتب</p>
                  <p className="font-semibold text-gray-900">{formatSalary(job.salary)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">نوع العمل</p>
                  <p className="font-semibold text-gray-900">{formatJobType(job.type)}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{formatExperience(job.experience)}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">الفئة</p>
                  <p className="font-semibold text-gray-900">{job.category}</p>
                </div>
              </div>
            </div>
          </div>

          {/* أوقات العمل */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              أوقات العمل
            </h3>
            <p className="text-gray-700">{job.workingHours}</p>
          </div>

          {/* الوصف */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">وصف الوظيفة</h3>
            <p className="text-gray-700 leading-relaxed">{job.description}</p>
          </div>

          {/* المتطلبات */}
          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                متطلبات الوظيفة
              </h3>
              <div className="space-y-2">
                {job.requirements.map((req, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{req}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* المزايا */}
          {job.benefits && job.benefits.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Gift className="w-5 h-5 text-blue-600" />
                المزايا والحوافز
              </h3>
              <div className="space-y-2">
                {job.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                    <Gift className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* معلومات التواصل */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">معلومات التواصل</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {job.contactEmail && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">البريد الإلكتروني</p>
                    <a href={`mailto:${job.contactEmail}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                      {job.contactEmail}
                    </a>
                  </div>
                </div>
              )}

              {job.contactPhone && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">رقم الهاتف</p>
                    <a href={`tel:${job.contactPhone}`} className="font-medium text-green-600 hover:text-green-800">
                      {job.contactPhone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              className="flex-1 py-3 text-lg font-semibold"
            >
              <Mail className="w-5 h-5 mr-2" />
              التقدم للوظيفة
            </Button>

            <Button
              variant="secondary"
              className="flex-1 py-3 text-lg font-semibold"
            >
              حفظ الوظيفة
            </Button>

            <Button
              variant="ghost"
              className="py-3 px-6"
            >
              مشاركة
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};