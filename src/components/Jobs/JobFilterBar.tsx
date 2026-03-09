import React from 'react';
import { Search, Filter, MapPin, Briefcase, Clock, DollarSign } from 'lucide-react';
import { iraqGovernorates, getDistrictsByGovernorate, jobCategories, jobTypes, experienceLevels } from '../../data/mock/jobs';

interface JobFilters {
  searchTerm: string;
  governorate: string;
  district: string;
  category: string;
  type: string;
  experience: string;
}

interface JobFilterBarProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
}

export const JobFilterBar: React.FC<JobFilterBarProps> = ({ filters, onFiltersChange }) => {
  const availableDistricts = filters.governorate ? getDistrictsByGovernorate(filters.governorate) : [];

  const handleFilterChange = (key: keyof JobFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    
    // إعادة تعيين القضاء عند تغيير المحافظة
    if (key === 'governorate') {
      newFilters.district = '';
    }
    
    onFiltersChange(newFilters);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      {/* شريط البحث الرئيسي */}
      <div className="relative mb-6">
        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="ابحث عن الوظائف..."
          value={filters.searchTerm}
          onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          className="w-full pr-12 pl-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* فلاتر متقدمة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* المحافظة */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4" />
            المحافظة
          </label>
          <select
            value={filters.governorate}
            onChange={(e) => handleFilterChange('governorate', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 bg-white"
          >
            <option value="">جميع المحافظات</option>
            {iraqGovernorates.map((gov) => (
              <option key={gov} value={gov}>{gov}</option>
            ))}
          </select>
        </div>

        {/* القضاء */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4" />
            القضاء
          </label>
          <select
            value={filters.district}
            onChange={(e) => handleFilterChange('district', e.target.value)}
            disabled={!filters.governorate}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 bg-white disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">جميع الأقضية</option>
            {availableDistricts.map((district) => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>

        {/* الفئة */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Briefcase className="w-4 h-4" />
            الفئة
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 bg-white"
          >
            {jobCategories.map((category) => (
              <option key={category} value={category === 'جميع الفئات' ? '' : category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* نوع العمل */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Clock className="w-4 h-4" />
            نوع العمل
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 bg-white"
          >
            <option value="">جميع الأنواع</option>
            <option value="full-time">دوام كامل</option>
            <option value="part-time">دوام جزئي</option>
            <option value="contract">عقد مؤقت</option>
            <option value="temporary">مؤقت</option>
          </select>
        </div>

        {/* مستوى الخبرة */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <DollarSign className="w-4 h-4" />
            مستوى الخبرة
          </label>
          <select
            value={filters.experience}
            onChange={(e) => handleFilterChange('experience', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 bg-white"
          >
            <option value="">جميع المستويات</option>
            <option value="entry-level">مبتدئ</option>
            <option value="mid-level">متوسط</option>
            <option value="senior-level">خبير</option>
          </select>
        </div>
      </div>

      {/* معلومات النتائج */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>الفلاتر النشطة:</span>
            {Object.values(filters).filter(value => value !== '').length === 0 ? (
              <span className="text-gray-400">لا توجد فلاتر</span>
            ) : (
              <span className="font-medium text-blue-600">
                {Object.values(filters).filter(value => value !== '').length} فلتر نشط
              </span>
            )}
          </div>
          
          {/* زر إعادة تعيين */}
          <button
            onClick={() => onFiltersChange({
              searchTerm: '',
              governorate: '',
              district: '',
              category: '',
              type: '',
              experience: ''
            })}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            إعادة تعيين الكل
          </button>
        </div>
      </div>
    </div>
  );
};