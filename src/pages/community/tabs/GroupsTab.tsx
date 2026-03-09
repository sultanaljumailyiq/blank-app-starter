import React from 'react';
import { useCommunity } from '../../../hooks/useCommunity';
import { Users, Plus, ArrowLeft, Search, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PremiumGroupCard = ({ group, isJoined, onAction }: any) => {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate(`/community/group/${group.id}`)}
            className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
        >
            {/* Cover Image Area */}
            <div className="h-32 bg-gray-200 relative">
                <img
                    src={group.image || `https://ui-avatars.com/api/?name=${group.name}&background=random`}
                    alt={group.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-3 right-3 text-white">
                    <h3 className="font-bold text-lg leading-tight">{group.name}</h3>
                    <p className="text-xs text-white/80">{group.members} عضو</p>
                </div>
            </div>

            {/* Action Area */}
            <div className="p-4 flex items-center justify-between mt-auto">
                <div className="flex -space-x-2 space-x-reverse overflow-hidden">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-6 h-6 rounded-full border border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                            U{i}
                        </div>
                    ))}
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAction(group.id);
                    }}
                    className={`
                        px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1
                        ${isJoined
                            ? 'bg-green-50 text-green-600 border border-green-100'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                        }
                    `}
                >
                    {isJoined ? (
                        <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            مشترك
                        </>
                    ) : (
                        <>
                            <Plus className="w-3.5 h-3.5" />
                            انضمام
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default function GroupsTab() {
    const { groups, joinGroup, leaveGroup, createGroup } = useCommunity();
    const navigate = useNavigate();
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
    const [newGroupData, setNewGroupData] = React.useState({ name: '', description: '', category: 'عام', privacy: 'public' as 'public' | 'private' });

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroupData.name) return;

        await createGroup(newGroupData.name, newGroupData.description, newGroupData.category, newGroupData.privacy);
        setIsCreateModalOpen(false);
        setNewGroupData({ name: '', description: '', category: 'عام', privacy: 'public' });
    };

    const myGroups = groups.filter(g => g.isJoined);
    const suggestedGroups = groups.filter(g => !g.isJoined);

    return (
        <div className="pb-24 space-y-8 px-4 pt-2">

            {/* 1. My Groups Section */}
            {myGroups.length > 0 && (
                <section>
                    <div className="flex justify-between items-end mb-4 px-1">
                        <h2 className="text-xl font-black text-gray-900">مجموعاتي</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="text-xs font-bold text-white bg-indigo-600 px-3 py-1.5 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-1 transition-all"
                            >
                                <Plus className="w-3 h-3" /> إنشاء مجموعة
                            </button>
                            <button className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">عرض الكل</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myGroups.map(group => (
                            <PremiumGroupCard key={group.id} group={group} isJoined={true} onAction={leaveGroup} />
                        ))}
                    </div>
                </section>
            )}

            {/* 2. Suggested Groups Section */}
            <section>
                <div className="flex justify-between items-end mb-4 px-1">
                    <h2 className="text-xl font-black text-gray-900">مجموعات مقترحة</h2>
                    <button className="text-xs font-bold text-gray-500">استكشف المزيد</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {suggestedGroups.map(group => (
                        <PremiumGroupCard key={group.id} group={group} isJoined={false} onAction={joinGroup} />
                    ))}
                </div>
            </section>

            {/* Empty State if no groups at all */}
            {groups.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>لا توجد مجموعات متاحة حالياً</p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
                    >
                        إنشاء أول مجموعة
                    </button>
                </div>
            )}

            {/* Create Group Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-900">إنشاء مجموعة جديدة</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <form onSubmit={handleCreateGroup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">اسم المجموعة</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-100 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                    placeholder="مثال: أطباء أسنان بغداد"
                                    value={newGroupData.name}
                                    onChange={e => setNewGroupData({ ...newGroupData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">وصف المجموعة</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-100 focus:ring-2 focus:ring-indigo-100 outline-none transition-all h-24 resize-none"
                                    placeholder="اكتب نبذة عن أهداف هذه المجموعة..."
                                    value={newGroupData.description}
                                    onChange={e => setNewGroupData({ ...newGroupData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">التصنيف</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-100 focus:ring-2 focus:ring-indigo-100 outline-none"
                                        value={newGroupData.category}
                                        onChange={e => setNewGroupData({ ...newGroupData, category: e.target.value })}
                                    >
                                        <option value="عام">عام</option>
                                        <option value="علمي">علمي</option>
                                        <option value="اجتماعي">اجتماعي</option>
                                        <option value="وظيفي">وظيفي</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">الخصوصية</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-100 focus:ring-2 focus:ring-indigo-100 outline-none"
                                        value={newGroupData.privacy}
                                        onChange={e => setNewGroupData({ ...newGroupData, privacy: e.target.value as 'public' | 'private' })}
                                    >
                                        <option value="public">عامة</option>
                                        <option value="private">خاصة</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all mt-4"
                            >
                                إنشاء المجموعة
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
