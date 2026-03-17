import React, { useState } from 'react';
import { Trash2, Edit, Plus, Search, Shield, User, Clock, Key, Edit2 } from 'lucide-react';
import { StaffFormModal } from './StaffFormModal';
import { useStaff, StaffMember } from '../../../hooks/useStaff';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { toast } from 'sonner';

interface StaffManagementProps {
    clinicId: string;
    clinicOwnerId?: string;
}

export const StaffManagement: React.FC<StaffManagementProps> = ({ clinicId, clinicOwnerId }) => {
    const { staff, loading, addStaff, updateStaff, deleteStaff, sendInvitation, cancelInvitation, unlinkStaff } = useStaff(clinicId);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
    const [editingMember, setEditingMember] = useState<StaffMember | null>(null);


    const handleEdit = (member: StaffMember) => {
        setEditingMember(member);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
            await deleteStaff(id);
        }
    };

    const filteredStaff = staff.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-between items-center">
                <div className="relative w-64">
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="بحث عن موظف..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <Button onClick={() => { setEditingMember(null); setShowModal(true); }}>
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة موظف
                </Button>
            </div>

            {/* Staff List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-3">الموظف</th>
                            <th className="px-6 py-3">الدور</th>
                            <th className="px-6 py-3">الحالة</th>
                            <th className="px-6 py-3">آخر تواجد</th>
                            <th className="px-6 py-3">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-8">جاري التحميل...</td></tr>
                        ) : filteredStaff.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-8 text-gray-500">لا يوجد موظفين</td></tr>
                        ) : (
                            filteredStaff.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {member.avatar ? (
                                                <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                    {member.name.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-gray-900">{member.name}</div>
                                                <div className="text-xs text-gray-500">{member.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900">
                                                {member.position === 'doctor' ? 'طبيب' :
                                                    member.position === 'nurse' ? 'ممرض' :
                                                        member.position === 'receptionist' ? 'إستقبال' : member.position}
                                            </span>
                                            <span className="text-xs text-gray-500">{member.department}</span>
                                        </div>
                                    </td>
                                     <td className="px-6 py-4">
                                         <div className="flex flex-col gap-0.5">
                                         <span className={`px-2 py-1 text-xs rounded-full w-fit ${member.status === 'active' ? 'bg-green-100 text-green-700' :
                                                 member.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 border-dashed' :
                                                     'bg-red-100 text-red-700'
                                             }`}>
                                             {member.status === 'active' ? 'نشط' :
                                                 member.status === 'pending' ? '‏⏳ في الانتظار' : 'غير نشط'}
                                         </span>
                                         {member.isLinkedAccount && (
                                             <span className="text-xs text-blue-600 font-medium">🔗 مربوط</span>
                                         )}
                                         </div>
                                     </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        -
                                    </td>
                                    <td className="px-6 py-4">
                                        {member.status === 'pending' ? (
                                             <div className="flex items-center gap-2">
                                                 <button
                                                     onClick={() => handleEdit(member)}
                                                     className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                 >
                                                     <Edit2 className="w-4 h-4" />
                                                 </button>
                                                 <button
                                                     onClick={async () => {
                                                         if (confirm('هل أنت متأكد من إلغاء الدعوة؟')) {
                                                             if (cancelInvitation) await cancelInvitation(member.invitationId || member.id);
                                                         }
                                                     }}
                                                     className="flex items-center gap-1.5 px-3 py-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors text-xs font-medium border border-amber-200 bg-white"
                                                 >
                                                     <Trash2 className="w-3.5 h-3.5" />
                                                     إلغاء الدعوة
                                                 </button>
                                             </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(member)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                {member.authUserId !== clinicOwnerId && member.userId !== clinicOwnerId && (
                                                    <button
                                                        onClick={() => handleDelete(member.id)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Staff Modal */}
            <StaffFormModal
                isOpen={showModal || !!editingMember}
                onClose={() => {
                    setShowModal(false);
                    setEditingMember(null);
                }}
                initialData={editingMember}
                clinicId={clinicId}
                onSave={async (data) => {
                    if (editingMember) {
                        await updateStaff(editingMember.id, data);
                    } else {
                        await addStaff(data as Omit<StaffMember, 'id' | 'clinic_id' | 'role'>);
                    }
                }}
                onInvite={async (email, role, staffId) => {
                    const result = await sendInvitation(email, role, staffId);
                    return !!result;
                }}
                onCancelInvitation={async (invId) => {
                    await cancelInvitation(invId);
                }}
                onUnlink={async (staffId) => {
                    await unlinkStaff(staffId);
                }}
            />
        </div>
    );
};
