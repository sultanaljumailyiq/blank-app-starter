import { useState, useEffect } from 'react';

export interface Location {
    lat: number;
    lng: number;
}

export interface GeolocationState {
    location: Location | null;
    error: string | null;
    loading: boolean;
}

export const useGeolocation = () => {
    const [state, setState] = useState<GeolocationState>({
        location: null,
        error: null,
        loading: false,
    });

    const getLocation = () => {
        if (!navigator.geolocation) {
            setState(prev => ({ ...prev, error: 'المنصفح لا يدعم تحديد الموقع الجغرافي' }));
            return;
        }

        setState(prev => ({ ...prev, loading: true, error: null }));

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setState({
                    location: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    },
                    error: null,
                    loading: false,
                });
            },
            (error) => {
                let errorMessage = 'حدث خطأ أثناء تحديد الموقع';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'تم رفض إذن الوصول للموقع';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'معلومات الموقع غير متوفرة';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'انتهت مهلة طلب الموقع';
                        break;
                }
                setState({
                    location: null,
                    error: errorMessage,
                    loading: false,
                });
            }
        );
    };

    // Haversine formula to calculate distance between two points in km
    const calculateDistance = (loc1: Location, loc2: Location): number => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(loc2.lat - loc1.lat);
        const dLng = deg2rad(loc2.lng - loc1.lng);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(loc1.lat)) * Math.cos(deg2rad(loc2.lat)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return Math.round(d * 10) / 10; // Round to 1 decimal place
    };

    const deg2rad = (deg: number): number => {
        return deg * (Math.PI / 180);
    };

    return {
        ...state,
        getLocation,
        calculateDistance,
    };
};
