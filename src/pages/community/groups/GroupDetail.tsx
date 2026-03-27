import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Users, ArrowLeft, MessageSquare, Heart, Share2, MoreHorizontal, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { mockGroups, mockCommunityPosts } from '../../../data/mock';

interface GroupDetailProps {
    groupId: string;
    onBack?: () => void;
}

export const GroupDetail: React.FC<GroupDetailProps> = ({ groupId, onBack }) => {
    const group = mockGroups.find(g => g.id === groupId) || mockGroups[0];
    const [isJoined, setIsJoined] = useState(group.isJoined);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Header / Cover */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                <div className="h-48 bg-gradient-to-r from-purple-600 to-indigo-600 relative">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition-all"
                        >
                            <ArrowLeft className="w-6 h-6 rotate-180" /> {/* RTL Back Icon */}
                        </button>
                    )}
                    <div className="absolute -bottom-10 right-8">
                        <div className="w-24 h-24 bg-white p-1 rounded-2xl shadow-lg">
                            <div className="w-full h-full bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                                <Users className="w-10 h-10" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-12 pb-6 px-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">{group.name}</h1>
                        <p className="text-gray-500 mb-4 max-w-2xl">{group.description}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                            <span className="flex items-center gap-1.5">
                                <Users className="w-4 h-4" />
                                {group.members} عضو
                            </span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span>{group.category}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="text-green-600">نشط الآن</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" className="gap-2">
                            <Share2 className="w-4 h-4" />
                            مشاركة
                        </Button>
                        <Button
                            className={`gap-2 ${isJoined ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                            onClick={() => setIsJoined(!isJoined)}
                        >
                            {isJoined ? 'مغادرة' : 'انضمام'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Create Post */}
                    {isJoined && (
                        <Card className="p-4 flex gap-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="اكتب شيئاً للمجموعة..."
                                    className="w-full bg-gray-50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-200 transition-all text-sm mb-3"
                                />
                                <div className="flex gap-2">
                                    <button className="p-1.5 hover:bg-purple-50 rounded-lg text-purple-600 transition-colors">
                                        <ImageIcon className="w-5 h-5" />
                                    </button>
                                    <button className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                                        <LinkIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Posts */}
                    {mockCommunityPosts.map(post => (
                        <Card key={post.id} className="p-5">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">
                                        {post.authorName[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{post.authorName}</h4>
                                        <p className="text-xs text-gray-500">{post.date}</p>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:bg-gray-50 p-1 rounded-full">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-gray-700 leading-relaxed mb-4">
                                {post.content}
                            </p>

                            <div className="flex items-center gap-6 border-t border-gray-100 pt-3">
                                <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
                                    <Heart className="w-5 h-5" />
                                    <span className="text-sm">{post.likes}</span>
                                </button>
                                <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                                    <MessageSquare className="w-5 h-5" />
                                    <span className="text-sm">{post.comments}</span>
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-4">

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">قوانين المجموعة</h3>
                        <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                            <li>احترام آراء جميع الأعضاء</li>
                            <li>عدم نشر محتوى إعلاني</li>
                            <li>النقاشات العلمية فقط</li>
                        </ul>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">المشرفون</h3>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">د</div>
                            <div>
                                <div className="font-bold text-sm">د. أحمد محمد</div>
                                <div className="text-xs text-gray-500">مسؤول المجموعة</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
