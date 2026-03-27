import React, { useState, useEffect } from 'react';
import { Search, User, Plus, Phone, Calendar } from 'lucide-react';
import { Patient, PatientSearchResult } from '../../types/patients';


interface PatientSearchProps {
  onSelectPatient: (patient: Patient) => void;
  onAddNewPatient?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  selectedPatient?: Patient | null;
  patients?: Patient[]; // New prop for real data
}

export const PatientSearch: React.FC<PatientSearchProps> = ({
  onSelectPatient,
  onAddNewPatient,
  placeholder = "ابحث عن مريض بالاسم أو رقم الهاتف...",
  autoFocus = false,
  selectedPatient = null,
  patients = [] // Default to empty
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Patient[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // البحث في قاعدة بيانات المرضى
  const searchPatients = (term: string): Patient[] => {
    if (term.length < 1) return [];

    const lowerTerm = term.toLowerCase();

    // Use passed patients list or fallback to empty (removed mock allPatients)
    // Note: Parent component must pass 'patients' prop now.
    // However, the interface definition above doesn't have 'patients' yet.
    // I need to update the interface first? 
    // Wait, I can't easily change the prop signature here without updating usage.
    // BUT, I can import the hook here? No, better to pass data.
    // Let's assume for this step I will update the Props interface too.
    return (patients || []).filter(patient =>
      (patient.fullName || '').toLowerCase().includes(lowerTerm) ||
      (patient.phone || '').includes(term) ||
      (patient.nationalId && patient.nationalId.includes(term))
    ).slice(0, 50);
  };

  useEffect(() => {
    if (searchTerm.length >= 1) {
      const searchResults = searchPatients(searchTerm);
      setResults(searchResults);
      setIsOpen(true);
      setSelectedIndex(-1);
    } else if (isOpen) {
      // If open but empty, show all defaults (limited to 50 for performance, or all if reasonable)
      setResults(patients || []); // Show all real patients
    } else {
      setResults([]);
    }
  }, [searchTerm, isOpen, patients]);

  const handleFocus = () => {
    setIsOpen(true);
    if (searchTerm.length === 0) {
      setResults(patients || []); // Show all real patients
    }
  };

  // التحكم بالكيبورد
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelectPatient(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    onSelectPatient(patient);
    setSearchTerm(patient.fullName);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (selectedPatient && e.target.value !== selectedPatient.fullName) {
      onSelectPatient(null as any); // مسح الاختيار إذا تغير النص
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelectPatient(null as any);
  };

  return (
    <div className="relative">
      {/* حقل البحث */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onFocus={handleFocus}
          className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
        />
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <Plus className="w-4 h-4 rotate-45" />
          </button>
        )}
      </div>

      {/* نتائج البحث */}
      {isOpen && (
        <div className="mt-3 bg-white border border-gray-200 rounded-xl shadow-sm max-h-[400px] overflow-y-auto divide-y divide-gray-100">
          {results.length > 0 ? (
            <>
              {results.map((patient, index) => (
                <div
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  className={`
                    p-4 cursor-pointer border-b border-gray-100 last:border-b-0
                    ${index === selectedIndex ? 'bg-purple-50' : 'hover:bg-gray-50'}
                    transition-colors
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {patient.firstName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">{patient.fullName}</h4>
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${patient.status === 'active' ? 'bg-green-100 text-green-800' :
                            patient.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'}
                        `}>
                          {patient.status === 'active' ? 'نشط' :
                            patient.status === 'inactive' ? 'غير نشط' : 'أرشيف'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{patient.phone}</span>
                        </div>

                        {patient.lastVisit && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>آخر زيارة: {patient.lastVisit}</span>
                          </div>
                        )}

                        <span>الزيارات: {patient.totalVisits}</span>
                      </div>

                      {patient.address && (
                        <div className="text-xs text-gray-500 mt-1">
                          {patient.address}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* زر إضافة مريض جديد */}
              {onAddNewPatient && (
                <div className="border-t border-gray-200">
                  <button
                    onClick={onAddNewPatient}
                    className="w-full p-4 text-right hover:bg-gray-50 transition-colors flex items-center gap-3 text-purple-600"
                  >
                    <div className="w-10 h-10 border-2 border-dashed border-purple-300 rounded-full flex items-center justify-center">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold">إضافة مريض جديد</div>
                      <div className="text-sm text-gray-500">إذا لم تجد المريض في النتائج</div>
                    </div>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 text-center">
              <div className="text-gray-500 mb-2">لم يتم العثور على مرضى</div>
              {onAddNewPatient && (
                <button
                  onClick={onAddNewPatient}
                  className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  إضافة مريض جديد
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Removed backdrop overlay to allow footer clicks inline */}
    </div>
  );
};

// مكون مبسط لعرض المريض المحدد
export const SelectedPatientCard: React.FC<{ patient: Patient; onClear: () => void }> = ({
  patient,
  onClear
}) => (
  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {patient.firstName.charAt(0)}
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{patient.fullName}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{patient.phone}</span>
            <span>الزيارات: {patient.totalVisits}</span>
            {patient.lastVisit && <span>آخر زيارة: {patient.lastVisit}</span>}
          </div>
        </div>
      </div>

      <button
        onClick={onClear}
        className="p-2 text-gray-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4 rotate-45" />
      </button>
    </div>

    {/* تحذيرات طبية */}
    {patient.medicalHistory?.allergies && patient.medicalHistory.allergies.length > 0 && (
      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-700">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="font-medium text-sm">حساسية:</span>
          <span className="text-sm">{patient.medicalHistory.allergies.join('، ')}</span>
        </div>
      </div>
    )}
  </div>
);