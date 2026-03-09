import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { useActivityLogs } from '../../../hooks/useActivityLogs';
import { formatDate } from '../../../lib/utils';
import { RefreshCw, RotateCcw, Search, Filter } from 'lucide-react';
import { Button } from '../../../components/common/Button';

interface ActivityLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    clinicId: string;
}

export const ActivityLogModal: React.FC<ActivityLogModalProps> = ({ isOpen, onClose, clinicId }) => {
    const { logs, loading, fetchLogs, restoreEntity } = useActivityLogs(clinicId);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = filterType === 'all' || log.entity_type === filterType;

        return matchesSearch && matchesType;
    });

    const getActionLabel = (action: string) => {
        if (action.includes('create')) return <span className="text-green-600 font-bold">إضافة</span>;
        if (action.includes('update')) return <span className="text-blue-600 font-bold">تعديل</span>;
        if (action.includes('delete')) return <span className="text-red-600 font-bold">حذف</span>;
        if (action.includes('restore')) return <span className="text-purple-600 font-bold">استعادة</span>;
        return action;
    };

    const getEntityLabel = (type: string) => {
        if (type === 'staff') return 'موظف';
        if (type === 'patient') return 'مريض';
        if (type === 'appointment') return 'موعد';
        return type;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="سجل النشاطات"
            size="xl"
        >
            <div className="flex flex-col h-[600px]">
                {/* Toolbar */}
                <div className="flex flex-wrap gap-4 mb-4 justify-between items-center">
                    <div className="flex gap-2 text-sm">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute right-3 top-2.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="بحث في السجل..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pr-9 pl-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                            />
                        </div>
                        <select
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">كل السجلات</option>
                            <option value="staff">الموظفين</option>
                            <option value="patient">المرضى</option>
                            <option value="appointment">المواعيد</option>
                        </select>
                    </div>
                    <Button variant="secondary" onClick={fetchLogs} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                {/* Logs Table */}
                <div className="flex-1 overflow-y-auto border rounded-xl">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="p-3 font-semibold text-gray-600">الوقت</th>
                                <th className="p-3 font-semibold text-gray-600">المستخدم</th>
                                <th className="p-3 font-semibold text-gray-600">الحدث</th>
                                <th className="p-3 font-semibold text-gray-600">العنصر</th>
                                <th className="p-3 font-semibold text-gray-600">التفاصيل</th>
                                <th className="p-3 font-semibold text-gray-600">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredLogs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="p-3 text-gray-500 whitespace-nowrap" dir="ltr">
                                        {formatDate(log.created_at)}
                                    </td>
                                    <td className="p-3 font-medium">
                                        {log.user?.email || 'System'}
                                    </td>
                                    <td className="p-3">
                                        {getActionLabel(log.action_type)}
                                    </td>
                                    <td className="p-3">
                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                            {getEntityLabel(log.entity_type)}
                                        </span>
                                    </td>
                                    <td className="p-3 text-gray-600 max-w-xs truncate">
                                        {JSON.stringify(log.details)}
                                    </td>
                                    <td className="p-3">
                                        {(log.action_type === 'delete_staff' || log.action_type === 'delete_patient') && (
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('هل أنت متأكد من استعادة هذا العنصر؟')) {
                                                        restoreEntity(log);
                                                    }
                                                }}
                                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs font-bold"
                                            >
                                                <RotateCcw className="w-3 h-3" />
                                                استعادة
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        لا توجد سجلات مطابقة
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Modal>
    );
};
