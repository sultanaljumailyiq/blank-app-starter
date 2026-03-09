import React, { useState } from 'react';
import { MapPin, Star, Phone, Navigation, Calendar, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { formatLocation } from '../../utils/location';

interface ClinicCardProps {
  clinic: {
    id: number;
    name: string;
    location: string;
    rating: number;
    specialties: string[];
    phone: string;
    address: string;
    lat: number;
    lng: number;
    image?: string;
    governorate?: string;
    city?: string;
  };
}

export const ClinicCard: React.FC<ClinicCardProps> = ({ clinic }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Collapsed Card */}
      <div
        onClick={() => setIsExpanded(true)}
        className="group min-w-[320px] bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 border border-gray-100"
      >
        {/* Clinic Image/Placeholder */}
        <div className="relative h-40 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-t-2xl overflow-hidden">
          {clinic.image ? (
            <img src={clinic.image} alt={clinic.name} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="w-20 h-20 bg-white/80 rounded-full flex items-center justify-center">
                <MapPin className="w-10 h-10 text-blue-600" />
              </div>
            </div>
          )}

        </div>

        {/* Card Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
            {clinic.name}
          </h3>
          <div className="flex items-center gap-2 text-gray-600 mb-3">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-sm">
              {formatLocation(clinic.governorate, clinic.address)}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {clinic.specialties.slice(0, 2).map((specialty, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
              >
                {specialty}
              </span>
            ))}
            {clinic.specialties.length > 2 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                +{clinic.specialties.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-in">
            {/* Modal Header */}
            <div className="relative h-64 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-t-3xl overflow-hidden">
              {clinic.image ? (
                <img src={clinic.image} alt={clinic.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="w-32 h-32 bg-white/80 rounded-full flex items-center justify-center">
                    <MapPin className="w-16 h-16 text-blue-600" />
                  </div>
                </div>
              )}
              <button
                onClick={() => setIsExpanded(false)}
                className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
              >
                <X className="w-6 h-6 text-gray-800" />
              </button>

            </div>

            {/* Modal Content */}
            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{clinic.name}</h2>

              {/* Location */}
              <div className="flex items-start gap-3 mb-6">
                <MapPin className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 mb-1">الموقع</p>
                  <p className="text-gray-600">
                    {formatLocation(clinic.governorate, clinic.address)}
                  </p>
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-6">
                <p className="font-semibold text-gray-900 mb-3">التخصصات</p>
                <div className="flex flex-wrap gap-2">
                  {clinic.specialties.map((specialty, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 font-medium rounded-full border border-blue-200"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/booking" className="w-full">
                  <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full">
                    <Calendar className="w-5 h-5" />
                    حجز موعد
                  </button>
                </Link>

                <a
                  href={`tel:${clinic.phone}`}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all duration-300 hover:scale-105"
                >
                  <Phone className="w-5 h-5" />
                  {clinic.phone}
                </a>
              </div>

              {/* Directions Link */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${clinic.lat},${clinic.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 mt-4 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
              >
                <Navigation className="w-5 h-5" />
                الحصول على الاتجاهات
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
