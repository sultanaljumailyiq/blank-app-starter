import React, { useState } from 'react';
import { MapPin, Phone, Star, Clock, Award, ChevronLeft, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Clinic } from '../../types';
import { Button } from '../common/Button';
import { useLanguage } from '../../contexts/LanguageContext';

import { formatLocation } from '../../utils/location';

interface ClinicCardProps {
  clinic: Clinic;
  expandable?: boolean;
  featured?: boolean;
  compact?: boolean;
}

export const ClinicCard: React.FC<ClinicCardProps> = ({ clinic, expandable = false, featured = false, compact = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div
      className={`group relative bg-white rounded-3xl overflow-hidden border border-gray-100 transition-all duration-300 ${featured
        ? 'shadow-xl shadow-purple-100/50 hover:shadow-2xl hover:shadow-purple-200/50 hover:-translate-y-1'
        : 'shadow-lg hover:shadow-xl hover:-translate-y-1'
        } ${expandable ? 'cursor-pointer' : ''} min-w-[280px] sm:min-w-[320px] h-full flex flex-col`}
      onClick={() => expandable && setIsExpanded(!isExpanded)}
    >
      {/* Gradient Background Decoration */}
      <div className={`absolute top-0 right-0 w-full h-32 bg-gradient-to-br opacity-50 transition-opacity duration-300 ${featured
        ? 'from-purple-50 via-indigo-50/50 to-transparent group-hover:opacity-80'
        : 'from-blue-50 via-cyan-50/50 to-transparent group-hover:opacity-80'
        }`} />

      {/* Featured Badge */}
      {featured && (
        <div className="absolute top-4 left-4 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-xs font-bold text-purple-700 shadow-sm border border-purple-100">
            <Award className="w-3.5 h-3.5 fill-purple-700/20" />
            عيادة مميزة
          </span>
        </div>
      )}

      {/* Card Content */}
      <div className="relative p-5 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-sm transition-transform duration-300 group-hover:scale-105 ${featured
            ? 'bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600'
            : 'bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600'
            }`}>
            {clinic.image ? (
              <img src={clinic.image} alt={clinic.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              clinic.name.charAt(0)
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {/* Rating removed as per request */}
            </div>
            <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
              {clinic.name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5" />
              <span className="line-clamp-1">
                {formatLocation(clinic.governorate, clinic.address)}
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid - Hidden in compact mode (Map View) */}
        {/* Info Grid removed as per request */}

        {/* Specialties */}
        <div className="flex flex-wrap gap-2 mb-4 flex-1 content-start">
          {clinic.specialties?.slice(0, 3).map((specialty, index) => (
            <span
              key={`spec-${index}`}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-colors ${featured
                ? 'bg-purple-50 text-purple-700 border-purple-100 group-hover:border-purple-200'
                : 'bg-white text-gray-600 border-gray-100 group-hover:border-blue-200 group-hover:text-blue-600'
                }`}
            >
              {specialty}
            </span>
          ))}
        </div>

        {/* Services - New Row */}
        {clinic.services && clinic.services.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {clinic.services.slice(0, 3).map((service, index) => (
              <span
                key={`serv-${index}`}
                className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded border border-green-100 flex items-center gap-1"
              >
                {service}
              </span>
            ))}
            {clinic.services.length > 3 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-50 text-gray-500 border border-gray-100">
                +{clinic.services.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Actions Footer */}
        <div className={`mt-auto pt-4 flex gap-3 ${isExpanded ? 'border-t border-gray-100' : ''}`}>
          {/* Primary Action Button (Always Visible) */}
          <Button
            className={`flex-1 shadow-md hover:shadow-lg transition-all ${featured
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0'
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0'}`}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/booking?clinic=${clinic.id}`);
            }}
          >
            <Calendar className="w-4 h-4 ml-2" />
            {t('bookNow')}
          </Button>

          {/* Secondary Action - Call (Conditional Expansion for Compact View, or Always Visible on Mobile if needed) */}
          {(isExpanded || expandable) && (
            <Button
              variant="outline"
              size="sm"
              className="px-3 border-gray-200 hover:border-blue-200 hover:bg-blue-50 text-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `tel:${clinic.phone}`;
              }}>
              <Phone className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Expansion Indicator (Optional) */}
        {!isExpanded && expandable && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300">
            <div className="w-8 h-1 bg-gray-200 rounded-full"></div>
          </div>
        )}

      </div>
    </div>
  );
};
