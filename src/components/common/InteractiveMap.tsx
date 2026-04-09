import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Clinic } from '../../types';
import { ClinicCard } from '../cards/ClinicCard';
import { MapPin, Navigation, CheckCircle, RefreshCw } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { Button } from './Button';

interface InteractiveMapProps {
  clinics: Clinic[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onLocationFound?: (location: { lat: number; lng: number }) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 33.3152,
  lng: 44.3661,
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  clinics,
  center: initialCenter = defaultCenter,
  zoom: initialZoom = 6,
  height = '400px',
  onLocationFound
}) => {
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const { location, getLocation, clearLocation, loading: geoLoading, error: geoError } = useGeolocation();
  
  // Local map state to handle "Locate Me" if not controlled by parent
  const [internalCenter, setInternalCenter] = useState(initialCenter);
  const [internalZoom, setInternalZoom] = useState(initialZoom);

  // Sync internal state with props
  useEffect(() => {
    setInternalCenter(initialCenter);
  }, [initialCenter]);

  useEffect(() => {
    setInternalZoom(initialZoom);
  }, [initialZoom]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk',
    language: 'ar',
    libraries: ['places'],
  });

  const onMapClick = useCallback(() => {
    setSelectedClinic(null);
  }, []);

  const onMarkerClick = useCallback((clinic: Clinic) => {
    setSelectedClinic(clinic);
  }, []);

  const handleLocateMe = () => {
    getLocation();
  };

  useEffect(() => {
    if (location) {
      setInternalCenter(location);
      setInternalZoom(12);
      if (onLocationFound) onLocationFound(location);
    }
  }, [location, onLocationFound]);

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
        <p className="text-red-600">خطأ في تحميل الخريطة</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div style={{ height }} className="relative group">
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

      {/* Floating Locate Me Button - Positioned TOP-LEFT */}
      <div className="absolute top-4 left-4 z-10 flex flex-col items-start gap-2">
        <Button
          variant={location ? 'primary' : 'outline'}
          size="sm"
          onClick={() => {
            if (location) {
              // Toggle off: clear location and reset map
              clearLocation();
              setInternalCenter(initialCenter);
              setInternalZoom(initialZoom);
            } else {
              handleLocateMe();
            }
          }}
          disabled={geoLoading}
          className={`rounded-xl w-10 h-10 p-0 flex items-center justify-center transition-all bg-white/90 backdrop-blur-md border-gray-200 shadow-lg group hover:scale-110 ${
            location ? 'ring-2 ring-blue-400 border-blue-400 bg-blue-50' : ''
          }`}
          title="تحديد موقعي"
        >
          {geoLoading ? (
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          ) : location ? (
            <MapPin className="w-5 h-5 text-blue-600 fill-blue-50" />
          ) : (
            <Navigation className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
          )}
        </Button>
        {geoError && (
          <div className="bg-red-50 text-red-500 text-[10px] p-2 rounded-lg border border-red-100 font-bold shadow-sm max-w-[150px] text-center">
            {geoError}
          </div>
        )}
      </div>

      {/* @ts-ignore */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={internalCenter}
        zoom={internalZoom}
        onClick={onMapClick}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {/* User Location Marker */}
        {location && (
          <Marker
            position={location}
            icon={{
              path: (window as any).google?.maps?.SymbolPath?.CIRCLE || 0,
              scale: 7,
              fillColor: '#22c55e', // Green for user
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
            zIndex={1000}
          />
        )}
        {clinics.map((clinic) => (
          // @ts-ignore
          <Marker
            key={clinic.id}
            position={{
              lat: clinic.location.lat,
              lng: clinic.location.lng,
            }}
            onClick={() => onMarkerClick(clinic)}
            icon={{
              url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzNCODJGNiIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjgiIGZpbGw9IndoaXRlIi8+PC9zdmc+',
              scaledSize: (window as any).google?.maps ? new (window as any).google.maps.Size(32, 32) : undefined,
            }}
          />
        ))}

        {selectedClinic && (
          // @ts-ignore
          <InfoWindow
            position={{
              lat: selectedClinic.location.lat,
              lng: selectedClinic.location.lng,
            }}
            onCloseClick={() => setSelectedClinic(null)}
          >
            <div className="w-[300px] sm:w-[340px] p-2" dir="rtl">
              <ClinicCard clinic={selectedClinic} expandable={true} compact={true} />
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};
