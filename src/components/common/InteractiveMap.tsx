import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Clinic } from '../../types';
import { ClinicCard } from '../cards/ClinicCard';

interface InteractiveMapProps {
  clinics: Clinic[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
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
  center = defaultCenter,
  zoom = 11,
  height = '400px',
}) => {
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

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
    <div style={{ height }}>
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

      {/* @ts-ignore */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onClick={onMapClick}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
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
