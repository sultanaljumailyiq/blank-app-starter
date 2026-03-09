
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useClinics } from '../hooks/useClinics';
import { Clinic } from '../types';

interface DoctorContextType {
    clinics: Clinic[];
    loading: boolean;
    selectedClinicId: string; // 'all' or specific UUID
    selectedClinic: Clinic | null; // Derived from ID
    setSelectedClinicId: (id: string) => void;
    refreshClinics: () => Promise<void>;
}

const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

export const DoctorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { clinics, loading, refresh } = useClinics();
    const [selectedClinicId, setSelectedClinicId] = useState<string>('all');

    // Auto-select first clinic if only one exists? Or default to 'all'.
    // Persist choice? Can be nice.
    useEffect(() => {
        const saved = localStorage.getItem('doctor_selected_clinic');
        if (saved && (saved === 'all' || clinics.some(c => c.id === saved))) {
            setSelectedClinicId(saved);
        }
    }, [clinics]);

    const handleSetSelectedClinic = (id: string) => {
        setSelectedClinicId(id);
        localStorage.setItem('doctor_selected_clinic', id);
    };

    const selectedClinic = clinics.find(c => c.id === selectedClinicId) || null;

    return (
        <DoctorContext.Provider value={{
            clinics,
            loading,
            selectedClinicId,
            selectedClinic,
            setSelectedClinicId: handleSetSelectedClinic,
            refreshClinics: refresh
        }}>
            {children}
        </DoctorContext.Provider>
    );
};

export const useDoctorContext = () => {
    const context = useContext(DoctorContext);
    if (!context) {
        throw new Error('useDoctorContext must be used within a DoctorProvider');
    }
    return context;
};
