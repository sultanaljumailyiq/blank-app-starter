import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Search, Award, Shield, Filter, Check, X } from 'lucide-react';
import { useAdminCommunity } from '../../../hooks/useAdminCommunity';

import { VerificationModal } from './VerificationModal';

export const UsersManager: React.FC = () => {
    const { users, updateUserStatus } = useAdminCommunity();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProvince, setFilterProvince] = useState('all');

    // Modal State
    const [verificationModal, setVerificationModal] = useState<{
        isOpen: boolean;
        type: 'elite' | 'syndicate';
        userId: string;
        userName: string;
    }>({
        isOpen: false,
        type: 'elite',
        userId: '',
        userName: ''
    });

    const handleOpenVerification = (user: any, type: 'elite' | 'syndicate') => {
        // Only open modal if not already verified (or if we want to update details)
        // For now, always open to allow editing/verifying
        setVerificationModal({
            isOpen: true,
            type,
            userId: user.id,
            userName: user.full_name
        });
    };

    const handleConfirmVerification = (data: { hospital: string; experience: number }) => {
        const updates: any = {};
        if (verificationModal.type === 'elite') updates.is_elite = true;
        if (verificationModal.type === 'syndicate') updates.is_syndicate = true;
        // Also update other data if needed
        updates.hospital = data.hospital; // Example

        updateUserStatus(verificationModal.userId, updates);
        setVerificationModal(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">إدارة النخبة والنقابة</h2>
                    <p className="text-gray-500">ترقية الأطباء وتحديد النخبة حسب المحافظة</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="بحث عن طبيب..."
                        className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-100"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <select
                        className="px-4 py-2 border border-gray-200 rounded-lg outline-none bg-white min-w-[150px]"
                        value={filterProvince}
                        onChange={(e) => setFilterProvince(e.target.value)}
                    >
                        <option value="all">كل المحافظات</option>
                        <option value="baghdad">بغداد</option>
                        <option value="basra">البصرة</option>
                        <option value="najib">النجف</option>
                        <option value="erbil">أربيل</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-right text-sm font-bold text-gray-600">الطبيب</th>
                            <th className="px-6 py-4 text-right text-sm font-bold text-gray-600">التخصص</th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-gray-600">الحالة</th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-gray-600">نقابة الأسنان</th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-gray-600">النخبة الطبية</th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-gray-600">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {users.map((doctor) => (
                            <tr key={doctor.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                                            {doctor.avatar_url ? (
                                                <img src={doctor.avatar_url} alt={doctor.full_name} className="w-full h-full object-cover" />
                                            ) : (
                                                doctor.full_name?.[0]
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm">{doctor.full_name}</h4>
                                            <p className="text-xs text-gray-500">{doctor.hospital || 'غير محدد'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{doctor.specialty}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">نشط</span>
                                </td>

                                {/* Syndicate Status */}
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center">
                                        <button
                                            onClick={() => handleOpenVerification(doctor, 'syndicate')}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${doctor.is_syndicate ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}
                                            title="توثيق نقابة"
                                        >
                                            <Shield className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>

                                {/* Elite Status */}
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center">
                                        <button
                                            onClick={() => handleOpenVerification(doctor, 'elite')}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${doctor.is_elite ? 'bg-amber-100 text-amber-600 shadow-md' : 'bg-gray-100 text-gray-400'}`}
                                            title="توثيق نخبة"
                                        >
                                            <Award className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>

                                <td className="px-6 py-4 text-center">
                                    <Button size="sm" variant="ghost" className="text-gray-500 hover:text-blue-600">
                                        التفاصيل
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <VerificationModal
                isOpen={verificationModal.isOpen}
                onClose={() => setVerificationModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={handleConfirmVerification}
                type={verificationModal.type}
                name={verificationModal.userName}
            />
        </div>
    );
};
