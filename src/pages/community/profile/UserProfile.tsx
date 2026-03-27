import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { User, MessageCircle, MapPin, Award, Shield, UserPlus, Grid, Image, Users, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { useParams } from 'react-router-dom';

interface UserProfileProps {
    userId?: string;
    onBack?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId: propUserId, onBack }) => {
    const { id } = useParams<{ id: string }>();
    const targetUserId = propUserId || id;
    const { user: currentUser } = useAuth();

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ followers: 0, following: 0, posts: 0 });
    const [isFollowing, setIsFollowing] = useState(false);

    const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'photos' | 'friends'>('posts');

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!targetUserId) return;

            try {
                setLoading(true);

                // 1. Fetch Profile
                const { data: profileData, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', targetUserId)
                    .single();

                if (error) throw error;
                setProfile(profileData);

                // 2. Fetch Stats (Mock logic for followers as table might vary, but assuming friendships)
                // Assuming friendships table structure: user_id_1 (follower), user_id_2 (following) ?? 
                // Actually based on my migration: user_id_1 and user_id_2 are friends (bi-directional or request based).
                // Let's count friends for now.

                const { count: friendsCount } = await supabase
                    .from('friendships')
                    .select('*', { count: 'exact', head: true })
                    .or(`user_id_1.eq.${targetUserId},user_id_2.eq.${targetUserId}`);

                const { count: postsCount } = await supabase
                    .from('posts')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', targetUserId);

                setStats({
                    followers: friendsCount || 0, // Using friends count as followers for now
                    following: friendsCount || 0,
                    posts: postsCount || 0
                });

                // 3. Check if following (friendship exists)
                if (currentUser) {
                    const { data: friendship } = await supabase
                        .from('friendships')
                        .select('*')
                        .or(`and(user_id_1.eq.${currentUser.id},user_id_2.eq.${targetUserId}),and(user_id_1.eq.${targetUserId},user_id_2.eq.${currentUser.id})`)
                        .single();

                    setIsFollowing(!!friendship);
                }

            } catch (error) {
                console.error('Error fetching user profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [targetUserId, currentUser]);

    const handleFollow = async () => {
        if (!currentUser || !targetUserId) return;
        try {
            if (isFollowing) {
                // Unfollow logic would go here (delete friendship)
                // For safety, let's implement toggle later.
            } else {
                // Send Friend Request
                const { error } = await supabase
                    .from('friendships')
                    .insert([{
                        user_id_1: currentUser.id,
                        user_id_2: targetUserId,
                        status: 'pending' // Assuming status column exists
                    }]);

                if (error) throw error;
                setIsFollowing(true); // Optimistic update
            }
        } catch (error) {
            console.error('Error updating friendship:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-20 text-gray-500">
                مستخدم غير موجود
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Cover & Profile Info */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 relative">
                <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                    )}
                </div>
                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="relative">
                            <div className="w-32 h-32 bg-white p-1 rounded-3xl shadow-lg">
                                <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center text-4xl font-bold text-gray-400 overflow-hidden">
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                        profile.full_name?.[0] || '?'
                                    )}
                                </div>
                            </div>
                            {/* Badges - Placeholder logic based on role */}
                            <div className="absolute -bottom-2 -right-2 flex gap-1">
                                {profile.role === 'doctor' && (
                                    <div className="bg-white p-1.5 rounded-full shadow-md tooltip" title="طبيب">
                                        <Award className="w-5 h-5 text-amber-500 fill-amber-500" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3 mb-2">
                            <Button variant="outline" className="rounded-xl gap-2">
                                <MessageCircle className="w-4 h-4" />
                                مراسلة
                            </Button>
                            {currentUser?.id !== targetUserId && (
                                <Button
                                    onClick={handleFollow}
                                    className={`rounded-xl gap-2 ${isFollowing ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                                >
                                    {isFollowing ? <User className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                                    {isFollowing ? 'صديق' : 'متابعة'}
                                </Button>
                            )}
                        </div>
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            {profile.full_name}
                            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {profile.role === 'doctor' ? 'طبيب أسنان' : profile.role}
                            </span>
                        </h1>
                        <p className="text-gray-500 mt-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {profile.governorate || 'العراق'}
                        </p>

                        <div className="flex gap-6 mt-6 border-t border-gray-100 pt-6">
                            <div className="text-center">
                                <span className="block font-bold text-xl text-gray-900">{stats.followers}</span>
                                <span className="text-sm text-gray-500">صديق</span>
                            </div>
                            <div className="text-center">
                                <span className="block font-bold text-xl text-gray-900">{stats.posts}</span>
                                <span className="text-sm text-gray-500">منشور</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="flex gap-2">
                {[
                    { id: 'posts', label: 'المنشورات', icon: Grid },
                    { id: 'about', label: 'حول', icon: User },
                    { id: 'photos', label: 'الصور', icon: Image },
                    { id: 'friends', label: 'الأصدقاء', icon: Users },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all flex-1 justify-center ${activeTab === tab.id ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'posts' && (
                <div className="text-center py-12 text-gray-500 bg-white rounded-3xl border border-gray-100">
                    <Grid className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    لا توجد منشورات لعرضها حالياً
                </div>
            )}
            {activeTab === 'about' && (
                <Card className="p-8">
                    <h3 className="font-bold text-lg mb-4">نبذة تعريفية</h3>
                    <p className="text-gray-600 leading-relaxed">
                        {profile.bio || 'لا توجد نبذة تعريفية.'}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500 block">رقم الهاتف</span>
                            <span className="font-medium">{profile.phone || '-'}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block">البريد الإلكتروني</span>
                            <span className="font-medium">{profile.email || '-'}</span>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};
