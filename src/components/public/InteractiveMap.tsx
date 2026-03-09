import React, { useRef, useState } from 'react';
import { MapPin, ChevronLeft, ChevronRight, Star, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { ClinicCard } from '../cards/ClinicCard';
import { usePublicClinics } from '../../hooks/usePublicClinics';
import { addOnlineRequest } from '../../data/mock/assets';
import { Clinic } from '../../types';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '24px',
};

const baghdadCenter = {
  lat: 33.3128,
  lng: 44.3615,
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

interface InteractiveMapProps {
  clinics: Clinic[];
  height?: string;
  userLocation?: { lat: number; lng: number } | null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ clinics, height = '400px', userLocation }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk',
    language: 'ar',
    libraries: ['places'],
  });

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === 'right' ? scrollAmount : -scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  if (loadError) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-600">
            حدث خطأ في تحميل الخريطة. يرجى المحاولة لاحقاً.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-700 font-semibold mb-4">
            <MapPin className="w-5 h-5 ml-2" />
            عيادات قريبة منك
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            اكتشف أفضل العيادات
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            عيادات معتمدة ومجهزة بأحدث التقنيات في منطقتك
          </p>
        </div>

        {/* Google Map */}
        <div className="relative mb-12 rounded-3xl overflow-hidden shadow-2xl">
          {!isLoaded ? (
            <div className="h-96 bg-gradient-to-br from-blue-200 via-cyan-100 to-teal-100 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-20 h-20 text-blue-600 mx-auto mb-4 animate-bounce" />
                <p className="text-2xl font-bold text-gray-800">جاري تحميل الخريطة...</p>
              </div>
            </div>
          ) : (
            // @ts-ignore
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={baghdadCenter}
              zoom={12}
              options={mapOptions}
              onClick={() => setSelectedClinic(null)}
            >
              {clinics.map((clinic) => (
                <Marker
                  key={clinic.id}
                  position={{ lat: clinic.location.lat, lng: clinic.location.lng }}
                  onClick={() => setSelectedClinic(clinic)}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    fillColor: '#3B82F6',
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 3,
                    scale: 10,
                  }}
                />
              ))}

              {selectedClinic && (
                <InfoWindow
                  position={{ lat: selectedClinic.location.lat, lng: selectedClinic.location.lng }}
                  onCloseClick={() => setSelectedClinic(null)}
                >
                  <div className="w-[300px] sm:w-[340px] p-2" dir="rtl">
                    <ClinicCard clinic={selectedClinic} expandable={true} compact={true} />
                  </div>
                </InfoWindow>
              )}
              {userLocation && (
                <Marker
                  position={userLocation}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 7,
                    fillColor: '#22c55e', // Green for user
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                  }}
                  zIndex={1000} // Keep on top
                />
              )}
            </GoogleMap>
          )}
        </div>

        {/* Clinics Carousel */}
        <div className="relative">
          {/* Scroll Buttons */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center hover:bg-blue-50 transition-colors duration-300 hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6 text-blue-600" />
            </button>
          )}

          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center hover:bg-blue-50 transition-colors duration-300 hover:scale-110"
            >
              <ChevronRight className="w-6 h-6 text-blue-600" />
            </button>
          )}

          {/* Custom Styles for Map to hide default close button and customize scroll */}
          <style>{`
        .gm-ui-hover-effect {
          display: none !important; /* Hide the default close button */
        }
        .gm-style-iw-c {
          padding: 0 !important;
          border-radius: 1.5rem !important; /* Match card radius */
        }
        .gm-style-iw-d {
           overflow: hidden !important;
        }
      `}</style>

          {/* Map Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {clinics.map((clinic) => (
              <ClinicCard key={clinic.id} clinic={clinic} expandable={true} />
            ))}
          </div>
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <Link to="/services#tab-clinics">
            <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              عرض جميع العيادات
            </button>
          </Link>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};
