import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, Marker, useJsApiLoader, StandaloneSearchBox } from '@react-google-maps/api';
import { MapPin, Loader2, Search, Navigation } from 'lucide-react';
import { Button } from './Button';
import { toast } from 'sonner';

interface ClinicLocationPickerProps {
    initialLat?: number;
    initialLng?: number;
    onLocationSelect: (lat: number, lng: number, governorate?: string, city?: string, address?: string) => void;
    readOnly?: boolean;
}

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '0.75rem'
};

const DEFAULT_CENTER = {
    lat: 33.3152, // Baghdad
    lng: 44.3661
};

const LIBRARIES: ("places")[] = ["places"];

export const ClinicLocationPicker: React.FC<ClinicLocationPickerProps> = ({
    initialLat,
    initialLng,
    onLocationSelect,
    readOnly = false
}) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: 'AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk',
        libraries: LIBRARIES,
        language: 'ar'
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(
        initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
    );
    const geocoderRef = useRef<google.maps.Geocoder | null>(null);

    // Initialize Geocoder
    useEffect(() => {
        if (isLoaded && !geocoderRef.current) {
            geocoderRef.current = new google.maps.Geocoder();
        }
    }, [isLoaded]);

    // Sync state with props when clinic changes
    useEffect(() => {
        if (initialLat && initialLng) {
            const newPos = { lat: initialLat, lng: initialLng };
            setMarkerPosition(newPos);
            map?.panTo(newPos);
        }
    }, [initialLat, initialLng, map]);

    const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map: google.maps.Map) {
        setMap(null);
    }, []);

    const extractAddressComponents = (results: google.maps.GeocoderResult[]) => {
        if (!results || results.length === 0) return { governorate: '', city: '', address: '' };

        const result = results[0];
        let governorate = '';
        let city = '';
        let address = result.formatted_address;

        result.address_components.forEach(component => {
            const types = component.types;
            if (types.includes('administrative_area_level_1')) {
                governorate = component.long_name;
            }
            if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                // Prefer locality, fallback to admin area 2 (often district in some maps)
                if (!city || types.includes('locality')) {
                    city = component.long_name;
                }
            }
        });

        // Clean up Governorate (Remove 'Governorate' or 'Muhafazat')
        governorate = governorate.replace(/Governorate|Muhafazat/gi, '').trim();

        return { governorate, city, address };
    };

    const handleLocationSelect = useCallback((lat: number, lng: number) => {
        const newPos = { lat, lng };
        setMarkerPosition(newPos);

        // Reverse Geocoding
        if (geocoderRef.current) {
            geocoderRef.current.geocode({ location: newPos }, (results, status) => {
                if (status === 'OK' && results) {
                    const { governorate, city, address } = extractAddressComponents(results);
                    onLocationSelect(lat, lng, governorate, city, address);
                    console.log('Geocoded:', { governorate, city, address });
                } else {
                    console.error('Geocoder failed due to: ' + status);
                    onLocationSelect(lat, lng); // Fallback without address details
                }
            });
        } else {
            onLocationSelect(lat, lng);
        }
    }, [onLocationSelect]);

    const onPlacesChanged = () => {
        const places = searchBoxRef.current?.getPlaces();
        if (!places || places.length === 0) return;

        const place = places[0];
        if (!place.geometry || !place.geometry.location) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        map?.panTo({ lat, lng });
        map?.setZoom(15);
        handleLocationSelect(lat, lng);
        toast.success('تم تحديد الموقع من البحث');
    };

    const onLoadSearchBox = (ref: google.maps.places.SearchBox) => {
        searchBoxRef.current = ref;
    };

    const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (readOnly || !e.latLng) return;
        handleLocationSelect(e.latLng.lat(), e.latLng.lng());
    }, [readOnly, handleLocationSelect]);

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    map?.panTo({ lat, lng });
                    map?.setZoom(15);
                    handleLocationSelect(lat, lng);
                    toast.success('تم تحديد موقعك الحالي');
                },
                () => {
                    toast.error('تعذر تحديد موقعك الحالي');
                }
            );
        } else {
            toast.error('المتصفح لا يدعم تحديد الموقع');
        }
    };

    if (!isLoaded) {
        return (
            <div className="w-full h-[400px] bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">جاري تحميل الخريطة...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={markerPosition || DEFAULT_CENTER}
                    zoom={13}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    onClick={handleMapClick}
                    onDragEnd={() => {
                        if (map && !readOnly) {
                            const center = map.getCenter();
                            if (center) {
                                handleLocationSelect(center.lat(), center.lng());
                            }
                        }
                    }}
                    options={{
                        disableDefaultUI: false,
                        zoomControl: true,
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: true,
                    }}
                >
                    {!readOnly && (
                        <StandaloneSearchBox
                            onLoad={onLoadSearchBox}
                            onPlacesChanged={onPlacesChanged}
                        >
                            <div className="absolute top-4 left-4 right-4 sm:left-auto sm:right-auto sm:w-80 z-10">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="ابحث عن منطقة أو معلم..."
                                        className="w-full px-4 py-3 pr-10 rounded-xl border-0 shadow-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                    />
                                    <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                        </StandaloneSearchBox>
                    )}

                    {/* Read-only marker for viewing mode (Fixed position, not center-locked) */}
                    {readOnly && markerPosition && (
                        <Marker position={markerPosition} />
                    )}
                </GoogleMap>

                {/* Fixed Center Pin Overlay - Only in Edit Mode */}
                {!readOnly && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
                        <div className="relative flex items-center justify-center">
                            {/* Outer Halo */}
                            <div className="w-12 h-12 bg-blue-500/20 rounded-full animate-pulse absolute"></div>
                            {/* Inner Circle (White Stroke) */}
                            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg z-10"></div>
                            {/* Crosshair lines for precision */}
                            <div className="absolute w-8 h-0.5 bg-blue-600/30"></div>
                            <div className="absolute h-8 w-0.5 bg-blue-600/30"></div>
                        </div>
                    </div>
                )}

                {!readOnly && (
                    <div className="absolute bottom-6 left-4 z-10 flex flex-col gap-2">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={getUserLocation}
                            className="shadow-lg bg-white text-gray-700 hover:bg-gray-50 border-0 flex items-center gap-2"
                        >
                            <Navigation className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-semibold">موقعي الحالي</span>
                        </Button>
                    </div>
                )}
            </div>

            {markerPosition && !readOnly && (
                <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 rounded-xl text-sm flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-blue-900">الموقع المحدد بدقة</p>
                        <p className="text-xs opacity-80 font-mono mt-0.5" dir="ltr">{markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
