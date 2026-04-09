import React from 'react';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Building2, 
  Users, 
  Calendar,
  Star,
  Zap
} from 'lucide-react';
import { Job } from '../../types';

interface JobCardProps {
  job: Job;
  onClick: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onClick }) => {
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

  return (
    <div 
      onClick={onClick}
      className="relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200 group"
    >
      {/* شارات مميزة */}
      <div className="absolute top-3 right-3 flex gap-2">
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

      {/* شعار الشركة والمعلومات الأساسية */}
      <div className="flex items-start gap-4 mb-4 mt-6">
        {job.companyLogo ? (
          <img 
            src={job.companyLogo} 
            alt={job.companyName}
            className="w-12 h-12 rounded-xl object-cover border-2 border-gray-100"
          />
        ) : (
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {job.title}
          </h3>
          <p className="text-blue-600 font-medium text-sm mb-1">{job.companyName}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {daysSincePosted === 0 ? 'اليوم' : 
               daysSincePosted === 1 ? 'أمس' : 
               `${daysSincePosted} أيام`}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {job.applicants} متقدم
            </span>
          </div>
        </div>
      </div>

      {/* الوصف المختصر */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {job.description}
      </p>

      {/* المعلومات الرئيسية */}
      <div className="space-y-3 mb-5">
        {/* الموقع */}
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{job.location} - {job.governorate}, {job.district}</span>
        </div>

        {/* الراتب */}
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span>{formatSalary(job.salary)}</span>
        </div>

        {/* ساعات العمل */}
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="line-clamp-1">{job.workingHours}</span>
        </div>
      </div>

      {/* الشارات السفلية */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
            {formatJobType(job.type)}
          </span>
          <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
            {formatExperience(job.experience)}
          </span>
        </div>
        
        <div className="text-xs text-gray-500">
          {job.category}
        </div>
      </div>

      {/* تأثير الhover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};