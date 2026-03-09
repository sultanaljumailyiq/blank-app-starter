
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    ArrowRight, MapPin, Phone,
    UserPlus, Edit, CheckCircle, GraduationCap,
    Grid, Calendar, Shield, Users, User, X, MessageCircle, Loader2,
    Camera, Save, Building2, Briefcase, Stethoscope, Star, UserMinus
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useCommunity } from '../../hooks/useCommunity';
import { useAuth } from '../../contexts/AuthContext';
import { PremiumPostCard } from './components/PremiumPostCard';
import { Modal } from '../../components/common/Modal';
import { NotificationPopover } from './components/NotificationPopover';
import { PostDetailModal } from './components/PostDetailModal';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { IRAQI_GOVERNORATES, formatLocation } from '../../utils/location';

export const UserProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { posts, banUser, likePost, toggleSave, isSaved, reportPost, updatePost, deletePost, users, followUser, unfollowUser, amIFollowing, toggleCloseFriend, isCloseFriend } = useCommunity();
    const { user: currentUser } = useAuth();

    // State
    const [activeTab, setActiveTab] = useState<'posts'>('posts');
    const [showConnectionsModal, setShowConnectionsModal] = useState<'followers' | 'following' | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const postId = searchParams.get('postId');
    const selectedPost = postId ? posts.find(p => p.id === postId) : null;

    // Real Profile State
    const [profileData, setProfileData] = useState<any>(null);
    const [stats, setStats] = useState({ followers: 0, following: 0, posts: 0 });
    const [loading, setLoading] = useState(true);
    const [isFollowHover, setIsFollowHover] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        full_name: '',
        bio: '',
        specialty: '',
        specialties: [] as string[],
        phone: '',
        address: '',
        governorate: 'بغداد',
        university: '',
        graduation_year: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const isMe = currentUser?.id === id || id === 'me';
    const targetUserId = isMe ? currentUser?.id : id;
    const isFollowing = targetUserId ? amIFollowing(targetUserId) : false;

    // Connections State
    const [connections, setConnections] = useState<any[]>([]);
    const [loadingConnections, setLoadingConnections] = useState(false);

    // Fetch Connections when Modal Opens
    useEffect(() => {
        if (!showConnectionsModal || !targetUserId) return;

        const fetchConnections = async () => {
            setLoadingConnections(true);
            try {
                // Determine query based on mode
                const isFollowers = showConnectionsModal === 'followers';
                const columnToMatch = isFollowers ? 'following_id' : 'follower_id';
                const columnToFetch = isFollowers ? 'follower_id' : 'following_id';

                // 1. Get IDs from follows table
                const { data: relations, error: relError } = await supabase
                    .from('follows')
                    .select(columnToFetch)
                    .eq(columnToMatch, targetUserId);

                if (relError) throw relError;

                const userIds = relations.map((r: any) => r[columnToFetch]);

                if (userIds.length === 0) {
                    setConnections([]);
                    return;
                }

                // 2. Get Profiles
                const { data: profiles, error: profError } = await supabase
                    .from('profiles')
                    .select('*')
                    .in('id', userIds);

                if (profError) throw profError;

                setConnections(profiles || []);

            } catch (error) {
                console.error('Error fetching connections:', error);
                toast.error('حدث خطأ أثناء تحميل القائمة');
            } finally {
                setLoadingConnections(false);
            }
        };

        fetchConnections();
    }, [showConnectionsModal, targetUserId]);

    // Fetch Profile from Supabase
    useEffect(() => {
        const fetchProfile = async () => {
            if (!targetUserId) return;
            try {
                setLoading(true);

                // 1. Fetch Profile
                console.log('Fetching profile for:', targetUserId);
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', targetUserId)
                    .single();

                if (error) {
                    console.error('Error fetching profile detail:', error);
                }

                if (error && error.code !== 'PGRST116') throw error;
                console.log('Fetched profile data:', profile);
                setProfileData(profile);


                // 2. Fetch Stats
                const { count: followersCount } = await supabase
                    .from('follows')
                    .select('*', { count: 'exact', head: true })
                    .eq('following_id', targetUserId);

                const { count: followingCount } = await supabase
                    .from('follows')
                    .select('*', { count: 'exact', head: true })
                    .eq('follower_id', targetUserId);

                const { count: postsCount } = await supabase
                    .from('community_posts')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', targetUserId);

                setStats({
                    followers: followersCount || 0,
                    following: followingCount || 0,
                    posts: postsCount || 0
                });

            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [targetUserId]);

    // Display fallback
    const displayUser = profileData || {
        full_name: 'مستخدم غير موجود',
        role: 'غير معروف',
        avatar_url: undefined,
        governorate: 'غير معروف',
        specialty: 'عام'
    };

    const userPosts = posts.filter(p => p.authorId === targetUserId);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }


    // --- Role Based Theme Helper ---
    const getRoleTheme = (role: string) => {
        switch (role) {
            case 'doctor':
                return {
                    primary: 'blue',
                    bg: 'bg-blue-50',
                    text: 'text-blue-700',
                    border: 'border-blue-100',
                    ring: 'ring-blue-50',
                    accent: 'bg-blue-600',
                    gradient: 'from-blue-500 to-blue-600'
                };
            case 'lab':
                return {
                    primary: 'orange',
                    bg: 'bg-orange-50',
                    text: 'text-orange-700',
                    border: 'border-orange-100',
                    ring: 'ring-orange-50',
                    accent: 'bg-orange-500',
                    gradient: 'from-orange-500 to-orange-600'
                };
            case 'supplier':
                return {
                    primary: 'green',
                    bg: 'bg-green-50',
                    text: 'text-green-700',
                    border: 'border-green-100',
                    ring: 'ring-green-50',
                    accent: 'bg-green-600',
                    gradient: 'from-green-500 to-green-600'
                };
            case 'admin':
                return {
                    primary: 'purple',
                    bg: 'bg-purple-50',
                    text: 'text-purple-700',
                    border: 'border-purple-100',
                    ring: 'ring-purple-50',
                    accent: 'bg-purple-600',
                    gradient: 'from-purple-500 to-purple-600'
                };
            default:
                return {
                    primary: 'gray',
                    bg: 'bg-gray-50',
                    text: 'text-gray-700',
                    border: 'border-gray-200',
                    ring: 'ring-gray-50',
                    accent: 'bg-gray-600',
                    gradient: 'from-gray-500 to-gray-600'
                };
        }
    };

    const theme = getRoleTheme(displayUser.role || 'user');

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8 pb-24">

            {/* Nav Back */}
            {/* Nav Back & Notifications */}
            <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm"
                >
                    <ArrowRight className="w-5 h-5" />
                    <span className="font-bold text-sm">رجوع</span>
                </button>

                <NotificationPopover />
            </div>

            {/* MASONRY GRID CONTAINER */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-min">

                {/* Suspension Badge — Visible ONLY to account owner when banned */}
                {isMe && displayUser.banned && (
                    <div className="md:col-span-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xl">🚫</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-red-700 text-sm mb-1">حسابك معلق حالياً</h3>
                            <p className="text-red-600 text-xs leading-relaxed">
                                تم تعليق حسابك من قِبل إدارة المنصة. لا يظهر حسابك للمستخدمين الآخرين في المجتمع أو المتجر أو قائمة معامل الأسنان.
                                للاستفسار تواصل مع الدعم: <span className="font-bold">support@smartdental.com</span>
                            </p>
                        </div>
                    </div>
                )}

                {/* 1. IDENTITY CARD (Large - 2x2) */}
                <div className="md:col-span-2 md:row-span-2 bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                    {/* Decor */}
                    <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60 ${theme.bg}`}></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="relative">
                                <img
                                    src={displayUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUser.full_name || 'User')}&background=random`}
                                    alt={displayUser.full_name}
                                    className={`w-24 h-24 rounded-full border-4 border-white shadow-md object-cover ${theme.bg}`}
                                />
                                {displayUser.role !== 'admin' && ( // Optional: Hide check for admin or keep it
                                    <div className={`absolute bottom-1 right-1 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white ${theme.accent}`} title="Verified">
                                        <CheckCircle className="w-3.5 h-3.5 fill-current" />
                                    </div>
                                )}
                            </div>
                            <span className={`${theme.bg} ${theme.text} text-xs px-3 py-1.5 rounded-full border ${theme.border} font-bold uppercase tracking-wide`}>
                                {displayUser.isSyndicate ? 'عضو نقابة' : getRoleLabel(displayUser.role)}
                            </span>
                        </div>

                        <h1 className="text-3xl font-black text-gray-900 mb-2">{displayUser.full_name}</h1>
                        <p className="text-gray-500 font-medium text-lg mb-4 flex items-center gap-2">
                            {displayUser.specialty || getRoleLabel(displayUser.role)}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {(profileData?.specialties || []).map((tag: string) => (
                                <span key={tag} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${theme.bg} ${theme.text}`}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 pt-6 border-t border-gray-100 flex gap-3">
                        {isMe ? (
                            <Button
                                onClick={() => {
                                    setEditForm({
                                        full_name: profileData?.full_name || '',
                                        bio: profileData?.bio || '',
                                        specialty: profileData?.specialty || '',
                                        specialties: profileData?.specialties || [],
                                        phone: profileData?.phone || '',
                                        address: profileData?.address || '',
                                        governorate: profileData?.governorate || 'بغداد',
                                        university: profileData?.university || '',
                                        graduation_year: profileData?.graduation_year?.toString() || ''
                                    });
                                    setAvatarPreview(null);
                                    setSelectedAvatar(null);
                                    setIsEditModalOpen(true);
                                }}
                                className={`flex-1 text-white rounded-xl py-3 shadow-lg shadow-gray-200 ${theme.accent}`}
                            >
                                <Edit className="w-4 h-4 ml-2" />
                                تعديل الملف
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={() => navigate('/community/messages', { state: { startConversationWith: profileData } })}
                                    className={`flex-1 text-white rounded-xl py-3 shadow-lg ${theme.accent} shadow-blue-200`}
                                >
                                    <MessageCircle className="w-4 h-4 ml-2" />
                                    مراسلة
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (!targetUserId) return;
                                        if (isFollowing) {
                                            unfollowUser(targetUserId);
                                            setStats(prev => ({ ...prev, followers: Math.max(0, prev.followers - 1) }));
                                        } else {
                                            followUser(targetUserId);
                                            setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
                                        }
                                    }}
                                    onMouseEnter={() => setIsFollowHover(true)}
                                    onMouseLeave={() => setIsFollowHover(false)}
                                    variant={isFollowing ? "outline" : "primary"}
                                    className={`px-4 rounded-xl transition-all ${isFollowing
                                        ? isFollowHover
                                            ? 'bg-red-50 border-red-200 text-red-600'
                                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                                        : 'text-white ' + theme.accent
                                        }`}
                                >
                                    {isFollowing ? (
                                        isFollowHover ? (
                                            <div className="flex items-center gap-2">
                                                <UserMinus className="w-5 h-5" />
                                                <span className="text-xs font-bold">إلغاء المتابعة</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                <span className="text-xs font-bold">متابع</span>
                                            </div>
                                        )
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <UserPlus className="w-5 h-5" />
                                            <span className="text-xs font-bold">متابعة</span>
                                        </div>
                                    )}
                                </Button>
                                {currentUser?.role === 'admin' && (
                                    <Button
                                        onClick={() => {
                                            if (id && window.confirm('هل أنت متأكد من حظر هذا المستخدم؟ سيتم إخفاء جميع محتوياته.')) {
                                                banUser(id);
                                            }
                                        }}
                                        className="px-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl border border-red-100"
                                    >
                                        <Shield className="w-5 h-5" />
                                    </Button>
                                )}
                            </>
                        )}
                        {!isMe && isFollowing && (
                            <Button
                                onClick={() => targetUserId && toggleCloseFriend(targetUserId)}
                                className={`px-3 rounded-xl border-2 ${isCloseFriend(targetUserId!) ? 'bg-yellow-50 border-yellow-400 text-yellow-500' : 'bg-white border-gray-100 text-gray-300 hover:text-yellow-400 hover:border-yellow-200'}`}
                                title={isCloseFriend(targetUserId!) ? "صديق مقرب" : "إضافة للأصدقاء المقربين"}
                            >
                                <Star className={`w-6 h-6 ${isCloseFriend(targetUserId!) ? 'fill-current' : ''}`} />
                            </Button>
                        )}
                    </div>
                </div>

                {/* STATS ROW (3 items side-by-side) */}
                <div className="md:col-span-2 grid grid-cols-3 gap-3 h-fit">
                    {/* 2. STATS CARD 1 (Followers) */}
                    <button
                        onClick={() => setShowConnectionsModal('followers')}
                        className="bg-white rounded-2xl p-3 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow group h-full"
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${theme.bg} ${theme.text}`}>
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="text-xl font-black text-gray-900 mb-0.5">{stats.followers}</div>
                        <div className="text-xs text-gray-500 font-bold">متابع</div>
                    </button>

                    {/* 3. STATS CARD 2 (Following) */}
                    <button
                        onClick={() => setShowConnectionsModal('following')}
                        className="bg-white rounded-2xl p-3 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow group h-full"
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${theme.bg} ${theme.text}`}>
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <div className="text-xl font-black text-gray-900 mb-0.5">{stats.following}</div>
                        <div className="text-xs text-gray-500 font-bold">يتابع</div>
                    </button>

                    {/* 4. STATS CARD 3 (Posts Count) */}
                    <button
                        onClick={() => { }}
                        className="bg-white rounded-2xl p-3 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow group h-full"
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${theme.bg} ${theme.text}`}>
                            <Grid className="w-5 h-5" />
                        </div>
                        <div className="text-xl font-black text-gray-900 mb-0.5">{stats.posts}</div>
                        <div className="text-xs text-gray-500 font-bold">منشور</div>
                    </button>
                </div>

                {/* 5. USER INFO (Wide - 2x1) - Spanning remaining space if needed or just 2 cols */}
                <div className="md:col-span-2 bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-center">
                    <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-400" />
                        تفاصيل المستخدم
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-500 shadow-sm"><MapPin className="w-4 h-4" /></div>
                                <span className="text-sm font-bold text-gray-700">
                                    {formatLocation(profileData?.governorate, profileData?.address) || 'غير محدد'}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-500 shadow-sm"><Phone className="w-4 h-4" /></div>
                                <span className="text-sm font-bold text-gray-700">{profileData?.phone || 'غير محدد'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. BIO / ABOUT (Full Width or 2x1 based on content) */}
                <div className="md:col-span-4 bg-white rounded-3xl p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-3 text-lg">نبذة تعريفية</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {profileData?.bio || `${getRoleLabel(profileData?.role)} متخصص في مجال طب الأسنان. مهتم بأحدث التقنيات والتطورات في المجال.`}
                            </p>
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="px-4 py-3 bg-gray-50 rounded-2xl flex items-center gap-3">
                                <GraduationCap className="w-5 h-5 text-gray-400" />
                                <div>
                                    <div className="text-xs text-gray-500 font-bold">{profileData?.university || 'سنة التخرج'}</div>
                                    <div className="text-sm font-black text-gray-900">{profileData?.graduation_year || '-'}</div>
                                </div>
                            </div>
                            <div className="px-4 py-3 bg-gray-50 rounded-2xl flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <div>
                                    <div className="text-xs text-gray-500 font-bold">عضو منذ</div>
                                    <div className="text-sm font-black text-gray-900">{profileData?.created_at ? new Date(profileData.created_at).getFullYear() : '-'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 6. CONTENT FEED (Single Tab) */}
                <div className="md:col-span-4 mt-4">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Grid className="w-5 h-5" />
                            المنشورات ({userPosts.length})
                        </h2>
                    </div>

                    {/* Feed Content */}
                    <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
                        {userPosts.length > 0 ? (
                            userPosts.map(post => (
                                <PremiumPostCard
                                    key={post.id}
                                    post={post}
                                    onLike={() => likePost(post.id)}
                                    onSave={() => toggleSave(post, 'post')}
                                    isSaved={isSaved(post.id)}
                                    onProfileClick={() => { }} // Already on profile
                                    onReport={(reason: string) => reportPost(post.id, reason)}
                                    isMe={isMe}
                                    onEdit={() => {
                                        const newContent = window.prompt('تعديل المنشور:', post.content);
                                        if (newContent && newContent !== post.content) {
                                            updatePost(post.id, newContent);
                                        }
                                    }}
                                    onDelete={() => {
                                        if (window.confirm('هل أنت متأكد من حذف هذا المنشور؟')) {
                                            deletePost(post.id);
                                        }
                                    }}
                                    onCommentClick={() => setSearchParams({ postId: post.id })}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 border-dashed">
                                <p className="text-gray-400 font-bold">لا يوجد منشورات لعرضها</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* POST DETAIL MODAL */}
            <PostDetailModal
                isOpen={!!selectedPost}
                onClose={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('postId');
                    setSearchParams(newParams);
                }}
                post={selectedPost}
            />


            {/* CONNECTIONS MODAL (Followers/Following) */}
            <Modal
                isOpen={!!showConnectionsModal}
                onClose={() => setShowConnectionsModal(null)}
                title={showConnectionsModal === 'followers' ? 'المتابعون' : 'يتابع'}
            >
                <div className="min-h-[400px] max-h-[60vh] overflow-y-auto pr-2">
                    {loadingConnections ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : connections.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {connections.map(user => {
                                const isFollowingUser = amIFollowing(user.id);
                                const isMeInList = user.id === currentUser?.id;

                                return (
                                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                        <button
                                            onClick={() => {
                                                setShowConnectionsModal(null);
                                                navigate(`/community/user/${user.id}`);
                                            }}
                                            className="flex items-center gap-3 flex-1"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                                                <img
                                                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'User')}&background=random`}
                                                    alt={user.full_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="text-right">
                                                <h4 className="font-bold text-gray-900 text-sm">{user.full_name}</h4>
                                                <p className="text-xs text-gray-500">{getRoleLabel(user.role)}</p>
                                            </div>
                                        </button>

                                        {!isMeInList && (
                                            <Button
                                                size="sm"
                                                variant={isFollowingUser ? 'outline' : 'primary'}
                                                className={isFollowingUser ? 'border-gray-300 text-gray-600' : 'bg-blue-600 text-white'}
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (isFollowingUser) {
                                                        await unfollowUser(user.id);
                                                    } else {
                                                        await followUser(user.id);
                                                    }
                                                }}
                                            >
                                                {isFollowingUser ? 'إلغاء المتابعة' : 'متابعة'}
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400 font-bold">
                            {showConnectionsModal === 'followers' ? 'لا يوجد متابعون بعد' : 'لا يتابع أحد بعد'}
                        </div>
                    )}
                </div>
            </Modal>

            {/* PROFILE EDIT MODAL */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="تعديل الملف الشخصي"
            >
                <div className="space-y-4">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <img
                                src={avatarPreview || profileData?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData?.full_name || 'User')}&background=random`}
                                alt="Avatar"
                                className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                            />
                            <button
                                onClick={() => avatarInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                            <input
                                type="file"
                                ref={avatarInputRef}
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setSelectedAvatar(file);
                                        const reader = new FileReader();
                                        reader.onloadend = () => setAvatarPreview(reader.result as string);
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className="hidden"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">انقر لتغيير الصورة</p>
                    </div>


                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">الاسم الكامل</label>
                        <input
                            type="text"
                            value={editForm.full_name}
                            onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-${theme.primary}-100 focus:border-${theme.primary}-500`}
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">نبذة تعريفية</label>
                        <textarea
                            value={editForm.bio}
                            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                            rows={3}
                            className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-${theme.primary}-100 focus:border-${theme.primary}-500`}
                            placeholder="اكتب نبذة عنك..."
                        />
                    </div>

                    {/* Specialty - Dynamic Label based on Role */}
                    {(profileData?.role !== 'admin') && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                {profileData?.role === 'supplier' || profileData?.role === 'lab' ? 'التصنيف الرئيسي' : 'التخصص الرئيسي'}
                            </label>
                            <input
                                type="text"
                                value={editForm.specialty}
                                onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
                                className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-${theme.primary}-100 focus:border-${theme.primary}-500`}
                                placeholder={profileData?.role === 'doctor' ? "مثال: طبيب أسنان" : "مثال: مواد طبية / سيراميك"}
                            />
                        </div>
                    )}

                    {/* Specialties Tags - Only for Doctor/Lab */}
                    {['doctor', 'lab'].includes(profileData?.role) && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                {profileData?.role === 'lab' ? 'الخدمات المتوفرة' : 'التخصصات الفرعية'}
                            </label>
                            <input
                                type="text"
                                placeholder="اكتب واضغط Enter..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const input = e.target as HTMLInputElement;
                                        const value = input.value.trim();
                                        if (value && !editForm.specialties.includes(value)) {
                                            setEditForm({ ...editForm, specialties: [...editForm.specialties, value] });
                                            input.value = '';
                                        }
                                    }
                                }}
                                className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-${theme.primary}-100 focus:border-${theme.primary}-500`}
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {editForm.specialties.map((tag, idx) => (
                                    <span key={idx} className={`${theme.bg} ${theme.text} px-3 py-1 rounded-full text-xs flex items-center gap-1`}>
                                        {tag}
                                        <button onClick={() => setEditForm({ ...editForm, specialties: editForm.specialties.filter((_, i) => i !== idx) })}>
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Governorate & Address */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">المحافظة</label>
                            <select
                                value={editForm.governorate}
                                onChange={(e) => setEditForm({ ...editForm, governorate: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white"
                            >
                                {IRAQI_GOVERNORATES.map(gov => (
                                    <option key={gov} value={gov}>{gov}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">العنوان</label>
                            <input
                                type="text"
                                value={editForm.address}
                                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                                placeholder="حي، شارع..."
                            />
                        </div>
                    </div>

                    {/* University & Graduation - Only for Doctor */}
                    {profileData?.role === 'doctor' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">الجامعة</label>
                                <input
                                    type="text"
                                    value={editForm.university}
                                    onChange={(e) => setEditForm({ ...editForm, university: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                                    placeholder="جامعة بغداد"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">سنة التخرج</label>
                                <input
                                    type="text"
                                    value={editForm.graduation_year}
                                    onChange={(e) => setEditForm({ ...editForm, graduation_year: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                                    placeholder="2020"
                                />
                            </div>
                        </div>
                    )}

                    {/* Save Button */}
                    <Button
                        onClick={async () => {
                            setIsSaving(true);
                            try {
                                let avatarUrl = profileData?.avatar_url;

                                // Upload new avatar if selected
                                if (selectedAvatar) {
                                    const fileExt = selectedAvatar.name.split('.').pop();
                                    const fileName = `${targetUserId}/${Date.now()}.${fileExt}`;

                                    const { error: uploadError } = await supabase.storage
                                        .from('avatars')
                                        .upload(fileName, selectedAvatar, { upsert: true });

                                    if (!uploadError) {
                                        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
                                        avatarUrl = urlData.publicUrl;
                                    }
                                }

                                // Update profile
                                const { error } = await supabase.from('profiles').update({
                                    full_name: editForm.full_name,
                                    bio: editForm.bio,
                                    specialty: editForm.specialty,
                                    specialties: editForm.specialties,
                                    phone: editForm.phone,
                                    address: editForm.address,
                                    governorate: editForm.governorate,
                                    university: editForm.university,
                                    graduation_year: editForm.graduation_year ? parseInt(editForm.graduation_year) : null,
                                    avatar_url: avatarUrl
                                }).eq('id', targetUserId);

                                if (error) throw error;

                                // Sync to role-specific table
                                if (profileData?.role === 'supplier') {
                                    await supabase.from('suppliers').update({
                                        logo: avatarUrl || undefined,
                                        logo_url: avatarUrl || undefined, // keep both for compat
                                        governorate: editForm.governorate,
                                        address: editForm.address,
                                        phone: editForm.phone,
                                    }).eq('user_id', targetUserId);
                                } else if (profileData?.role === 'lab' || profileData?.role === 'laboratory') {
                                    await supabase.from('dental_laboratories').update({
                                        logo_url: avatarUrl || undefined,
                                        governorate: editForm.governorate,
                                        address: editForm.address,
                                        phone: editForm.phone,
                                    }).eq('user_id', targetUserId);
                                }

                                // Refresh profile data
                                const { data: updated } = await supabase.from('profiles').select('*').eq('id', targetUserId).single();
                                setProfileData(updated);
                                setIsEditModalOpen(false);
                                toast.success('تم تحديث الملف الشخصي بنجاح');
                            } catch (error) {
                                console.error('Error updating profile:', error);
                                toast.error('حدث خطأ أثناء الحفظ');
                            } finally {
                                setIsSaving(false);
                            }
                        }}
                        disabled={isSaving}
                        className={`w-full text-white py-3 ${theme.accent} hover:opacity-90`}
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (
                            <>
                                <Save className="w-4 h-4 ml-2" />
                                حفظ التغييرات
                            </>
                        )}
                    </Button>
                </div>
            </Modal>
        </div >
    );
};

// Helper function to get role label
const getRoleLabel = (role: string): string => {
    const roles: Record<string, string> = {
        doctor: 'طبيب أسنان',
        supplier: 'مورد',
        lab: 'معمل أسنان',
        admin: 'مدير المنصة',
        staff: 'طاقم العيادة'
    };
    return roles[role] || 'مستخدم';
};

