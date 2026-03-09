import React, { useState } from 'react';
import {
    Search,
    Plus,
    Users,
    Trash2,
    CheckCircle,
    MoreVertical,
    Shield,
    MessageCircle,
    Eye
} from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { useAdminCommunity } from '../../../hooks/useAdminCommunity';

export const GroupsManager: React.FC = () => {
    const { groups, deleteGroup, verifyGroup } = useAdminCommunity();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredGroups = groups.filter(g =>
        g.name.includes(searchTerm) || g.category.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">إدارة المجموعات (Groups)</h2>
                    <p className="text-gray-500">مراجعة وإدارة المجموعات الطبية والمجتمعية</p>
                </div>
                {/* Search */}
                <div className="relative w-64">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="بحث عن مجموعة..."
                        className="w-full pr-10 pl-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredGroups.map(group => (
                    <div key={group.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                                👥
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    {group.name}
                                    {!group.is_private && <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">عامة</span>}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" /> {group.member_count} عضو
                                    </span>
                                    {/* Posts count not available in minimal group data */}
                                </div>
                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                    {group.category}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50" onClick={() => verifyGroup(group.id)}>
                                <Shield className="w-4 h-4 ml-1" />
                                توثيق
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => deleteGroup(group.id)}>
                                <Trash2 className="w-4 h-4 ml-1" />
                                حذف
                            </Button>
                        </div>
                    </div>
                ))}

                {filteredGroups.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        لا توجد مجموعات مطابقة للبحث
                    </div>
                )}
            </div>
        </div>
    );
};
