import React from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Users, Search, PlusCircle, ArrowRight } from 'lucide-react';
import { mockGroups } from '../../../data/mock';

import { CreateGroupModal } from '../components/CreateGroupModal';
import { useState } from 'react';

interface GroupsDirectoryProps {
    onGroupClick?: (id: string) => void;
}

export const GroupsDirectory: React.FC<GroupsDirectoryProps> = ({ onGroupClick }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <CreateGroupModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">المجموعات الطبية</h2>
                    <p className="text-gray-500">تصفح وانضم للمجموعات العلمية المتخصصة</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-purple-600 text-white rounded-xl">
                    <PlusCircle className="w-5 h-5 ml-2" />
                    إنشاء مجموعة
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="ابحث عن مجموعة..."
                    className="w-full px-5 py-3 rounded-2xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            {/* Featured / My Groups Section */}
            <div>
                <h3 className="font-bold text-lg mb-4 text-gray-800">مجموعاتي النشطة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockGroups.slice(0, 2).map((group) => (
                        <div
                            key={group.id}
                            onClick={() => onGroupClick?.(group.id)}
                            className="bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                    <Users className="w-6 h-6" />
                                </div>
                                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-lg">{group.members} عضو</span>
                            </div>
                            <h4 className="font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">{group.name}</h4>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">وصف قصير للمجموعة يظهر هنا...</p>
                            <div className="flex items-center text-xs text-gray-400 gap-2">
                                <span>{group.posts} منشور جديد</span>
                                <span>•</span>
                                <span>نشط اليوم</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* All Groups */}
            <div>
                <h3 className="font-bold text-lg mb-4 mt-8 text-gray-800">اكتشف المزيد</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockGroups.map((group) => (
                        <Card
                            key={group.id}
                            onClick={() => onGroupClick?.(group.id)}
                            className="p-4 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer"
                        >
                            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900">{group.name}</h4>
                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                    <span>{group.members} عضو</span>
                                    <span>•</span>
                                    <span className="text-purple-600">{group.category}</span>
                                </div>
                            </div>
                            <Button variant="outline" className="rounded-xl">انضمام</Button>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};
