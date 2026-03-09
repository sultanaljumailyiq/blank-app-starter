import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Users, MapPin, Calendar, MoreVertical, Share2, MessageCircle, Heart, Send, ImageIcon, X, CheckCircle, Shield, UserMinus, UserCheck } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useCommunity } from '../../hooks/useCommunity';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

export const GroupDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        groups, joinGroup, leaveGroup, createPost, posts,
        groupRequests, approveGroupRequest, rejectGroupRequest,
        promoteGroupMember, kickGroupMember, users
    } = useCommunity();
    const { user: currentUser } = useAuth();

    // Group & Admin Check
    const group = groups.find(g => g.id === id);
    const isAdmin = group?.createdBy === currentUser?.id || currentUser?.role === 'admin'; // Simplified

    // State
    const [activeTab, setActiveTab] = useState<'feed' | 'members' | 'requests'>('feed');
    const [postContent, setPostContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    // Mock Members for Demo (since we don't fetch them yet per group in context)
    const [membersList, setMembersList] = useState(users.slice(0, 5)); // Just show some users as members

    if (!group) {
        return <div className="p-10 text-center">Group not found</div>;
    }

    // Filter posts for this group
    // In a real app backend, we would fetch posts by groupId.
    // Here we can filter if posts have groupId, OR fallback to mock data for demo if not using real backend
    const groupPosts = posts.filter(p => p.groupId === id);

    const handleCreatePost = async () => {
        if (!postContent.trim()) return;
        setIsPosting(true);
        await createPost(postContent, undefined, id); // Pass groupId
        setPostContent('');
        setIsPosting(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Cover Image */}
            <div className="h-64 md:h-80 bg-gradient-to-r from-purple-900 to-indigo-900 relative">
                <img
                    src={group.image || `https://ui-avatars.com/api/?name=${group.name}&background=random`}
                    alt={group.name}
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80"></div>

                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-6 right-6 bg-white/10 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/20 transition-colors z-20"
                >
                    <ArrowRight className="w-6 h-6" />
                </button>

                <div className="absolute bottom-0 left-0 w-full p-6">
                    <div className="container mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                            <div>
                                <h1 className="text-3xl font-black text-white mb-2 shadow-sm">{group.name}</h1>
                                <p className="text-white/90 max-w-2xl mb-4 line-clamp-2 md:text-lg">{group.description || 'مجموعة طبية متخصصة لمناقشة أحدث المستجدات.'}</p>
                                <div className="flex items-center gap-6 text-sm text-white/80 font-medium">
                                    <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm"><Users className="w-4 h-4" /> {group.members} عضو</span>
                                    {isAdmin && <span className="flex items-center gap-2 bg-purple-500/20 px-3 py-1 rounded-lg backdrop-blur-sm text-purple-200 border border-purple-500/30"><Shield className="w-4 h-4" /> وضع المسؤول</span>}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => group.isJoined ? leaveGroup(group.id) : joinGroup(group.id)}
                                    className={`
                                        ${group.isJoined
                                            ? 'bg-red-500/20 text-red-100 border border-red-500/30 hover:bg-red-500/30'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700 border-none shadow-lg shadow-indigo-900/20'
                                        }
                                    `}
                                >
                                    {group.isJoined ? 'مغادرة' : 'انضمام'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-8 relative z-10">
                {/* TABS */}
                <div className="flex items-center gap-4 border-b border-gray-200 mb-6 overflow-x-auto pb-1">
                    <button
                        onClick={() => setActiveTab('feed')}
                        className={`px-4 py-2 font-bold text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'feed' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        المناقشات
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`px-4 py-2 font-bold text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'members' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        الأعضاء ({membersList.length})
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`px-4 py-2 font-bold text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'requests' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            الطلبات ({groupRequests.filter(r => r.groupId === id).length})
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Feed Tab */}
                        {activeTab === 'feed' && (
                            <>
                                {group.isJoined && (
                                    <Card className="p-4 border-0 shadow-sm relative overflow-hidden">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center font-bold text-indigo-600 flex-shrink-0">
                                                You
                                            </div>
                                            <div className="flex-1">
                                                <textarea
                                                    value={postContent}
                                                    onChange={(e) => setPostContent(e.target.value)}
                                                    placeholder={`اكتب مشاركة في ${group.name}...`}
                                                    className="w-full bg-gray-50 border-0 rounded-xl p-3 min-h-[100px] focus:ring-2 focus:ring-indigo-100 resize-none transition-all placeholder:text-gray-400 text-gray-900"
                                                />
                                                <div className="flex justify-between items-center mt-3">
                                                    <div className="flex gap-2">
                                                        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
                                                            <ImageIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                    <Button
                                                        onClick={handleCreatePost}
                                                        disabled={isPosting || !postContent.trim()}
                                                        className="bg-indigo-600 text-white rounded-xl px-6 py-2"
                                                    >
                                                        {isPosting ? 'جاري النشر...' : 'نشر'}
                                                        <Send className="w-4 h-4 mr-2" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                )}

                                <h2 className="font-bold text-xl text-gray-900 px-1">المناقشات الأخيرة</h2>

                                {groupPosts.length > 0 ? (
                                    groupPosts.map((post) => (
                                        <Card key={post.id} className="overflow-hidden border border-gray-100 shadow-sm rounded-[2rem] hover:shadow-md transition-shadow">
                                            <div className="p-5">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                                            {post.authorName[0]}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-gray-900 text-sm">{post.authorName}</h3>
                                                            <p className="text-xs text-gray-500">{post.date}</p>
                                                        </div>
                                                    </div>
                                                    <MoreVertical className="w-5 h-5 text-gray-400 cursor-pointer" />
                                                </div>

                                                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap mb-4">{post.content}</p>

                                                {post.image && (
                                                    <div className="rounded-2xl overflow-hidden mb-4 bg-gray-100">
                                                        <img src={post.image} alt="Post" className="w-full max-h-96 object-cover" />
                                                    </div>
                                                )}

                                                <div className="pt-4 border-t border-gray-50 flex gap-6">
                                                    <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 text-sm transition-colors group">
                                                        <div className="p-1.5 rounded-full group-hover:bg-red-50 transition-colors">
                                                            <Heart className={`w-5 h-5 ${post.likedByMe ? 'fill-red-500 text-red-500' : ''}`} />
                                                        </div>
                                                        <span>{post.likes}</span>
                                                    </button>
                                                    <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 text-sm transition-colors group">
                                                        <div className="p-1.5 rounded-full group-hover:bg-blue-50 transition-colors">
                                                            <MessageCircle className="w-5 h-5" />
                                                        </div>
                                                        <span>{post.comments?.length || 0}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="text-center py-10 bg-white rounded-[2rem] border border-gray-100">
                                        <p className="text-gray-400 font-medium">لا توجد مناقشات في هذه المجموعة بعد.</p>
                                        {group.isJoined && <p className="text-indigo-500 text-sm mt-1 cursor-pointer" onClick={() => (document.querySelector('textarea') as HTMLTextAreaElement)?.focus()}>كن أول من ينشر!</p>}
                                    </div>
                                )}

                            </>
                        )}
                        {/* Members Tab */}
                        {activeTab === 'members' && (
                            <div className="bg-white rounded-3xl border border-gray-100 p-6">
                                <h3 className="font-bold text-lg mb-6 text-gray-900 border-b border-gray-50 pb-4">أعضاء المجموعة</h3>
                                <div className="space-y-4">
                                    {membersList.map(member => (
                                        <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <img src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}&background=random`} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-sm">{member.name}</h4>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span>{member.specialty}</span>
                                                        {member.role === 'admin' && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px]">مشرف</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            {isAdmin && currentUser.id !== member.id && (
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 border-red-100" onClick={() => kickGroupMember(id!, member.id)}>
                                                        <UserMinus className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-indigo-600 hover:bg-indigo-50 border-indigo-100" onClick={() => promoteGroupMember(id!, member.id, 'admin')}>
                                                        <Shield className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Requests Tab */}
                        {activeTab === 'requests' && isAdmin && (
                            <div className="bg-white rounded-3xl border border-gray-100 p-6">
                                <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                                    <h3 className="font-bold text-lg text-gray-900">طلبات الانضمام</h3>
                                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
                                        {groupRequests.filter(r => r.groupId === id).length} قيد الانتظار
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {groupRequests.filter(r => r.groupId === id).length > 0 ? (
                                        groupRequests.filter(r => r.groupId === id).map(req => (
                                            <div key={req.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <img src={req.userAvatar || `https://ui-avatars.com/api/?name=${req.userName}&background=random`} alt={req.userName} className="w-12 h-12 rounded-full object-cover" />
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{req.userName}</h4>
                                                        <p className="text-xs text-gray-500">منذ {new Date(req.createdAt).toLocaleDateString('ar-EG')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => approveGroupRequest(req.id)}
                                                        className="bg-green-600 text-white hover:bg-green-700 rounded-xl px-4"
                                                    >
                                                        <CheckCircle className="w-4 h-4 ml-1" />
                                                        قبول
                                                    </Button>
                                                    <Button
                                                        onClick={() => rejectGroupRequest(req.id)}
                                                        className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 rounded-xl px-4"
                                                    >
                                                        <X className="w-4 h-4 ml-1" />
                                                        رفض
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 text-gray-400">
                                            <Users className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                            <p>لا توجد طلبات انضمام حالياً</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card className="p-5 border-0 shadow-sm rounded-3xl">
                            <h3 className="font-bold text-gray-900 mb-4 text-lg">قوانين المجموعة</h3>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li className="flex gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>كن محترماً مع جميع الأعضاء</span>
                                </li>
                                <li className="flex gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>ناقش المواضيع العلمية والمهنية فقط</span>
                                </li>
                                <li className="flex gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>يمنع نشر الإعلانات التجارية دون إذن</span>
                                </li>
                            </ul>
                        </Card>
                    </div>
                </div>
            </div>
        </div >
    );
};
