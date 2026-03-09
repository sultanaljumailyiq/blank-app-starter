import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import {
    CommunityPost,
    Course,
    Group,
    Friend,
    ScientificResource,
    User,
    UserRole
} from '../types';


export interface Notification {
    id: string;
    userId: string;
    actorId?: string;
    actorName?: string;
    actorAvatar?: string;
    type: 'like' | 'comment' | 'follow' | 'message' | 'reply' | 'course_new' | 'webinar_new' | 'group_approve' | 'group_request';
    title: string;
    content: string;
    link: string;
    isRead: boolean;
    createdAt: string;
}

export interface GroupMember {
    userId: string;
    groupId: string;
    role: 'admin' | 'moderator' | 'member';
    joinedAt: string;
    name: string;
    avatar?: string;
}

export interface GroupRequest {
    id: string;
    userId: string;
    groupId: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    userName: string;
    userAvatar?: string;
}

// Extended Interfaces for Context-specific logic
export interface Comment {
    id: string;
    postId: string;
    author: string; // ID? Name? Keeping name for display simplicity for now, but backing with ID
    authorId: string;
    text: string;
    time: string;
    avatar?: string;
}

export interface Post extends Omit<CommunityPost, 'comments'> {
    comments: Comment[]; // Override number with detailed array
    likedByMe?: boolean;
    isElite?: boolean;
    isSyndicate?: boolean;
    tags?: string[];
    category?: string;
    groupId?: string; // Link post to a group
}

export interface SavedItem {
    id: string;
    itemId: string;
    type: 'post' | 'course' | 'webinar' | 'resource' | 'model';
    savedAt: string;
    data: any; // Snapshot of the item
}

export interface Enrollment {
    id: string;
    itemId: string;
    itemType: 'course' | 'webinar';
    status: 'registered' | 'completed' | 'dropped';
    enrolledAt: string;
}

interface CommunityContextType {
    // Data
    posts: Post[];
    events: Course[];
    groups: Group[];
    friends: Friend[]; // Close Friends (Profiles)
    following: string[]; // List of user IDs I follow
    followers: string[]; // List of user IDs following me (or just count)
    resources: ScientificResource[];
    models: any[]; // Todo: Add Model interface
    users: any[]; // Mock database of all users
    savedItems: SavedItem[];
    myEnrollments: Enrollment[];
    notifications: Notification[];
    groupRequests: GroupRequest[]; // For admins to see
    suggestedUsers: any[]; // New field

    // Actions - Posts
    createPost: (content: string, image?: string | string[], groupId?: string) => Promise<void>;
    updatePost: (postId: string, content: string, images?: string[]) => Promise<void>;
    deletePost: (postId: string) => Promise<void>;
    likePost: (postId: string) => void;
    addComment: (postId: string, text: string, replyToUserId?: string) => void;
    updateComment: (commentId: string, postId: string, text: string) => Promise<void>;
    deleteComment: (commentId: string, postId: string) => Promise<void>;
    sendMessage: (recipientId: string, content: string) => void;

    // Actions - Social
    followUser: (userId: string) => Promise<void>;
    unfollowUser: (userId: string) => Promise<void>;
    amIFollowing: (userId: string) => boolean;
    toggleCloseFriend: (userId: string) => Promise<void>;
    isCloseFriend: (userId: string) => boolean;
    // Deprecated
    addFriend: (userId: string) => void;
    removeFriend: (userId: string) => void;
    joinGroup: (groupId: string) => void;
    leaveGroup: (groupId: string) => void;

    // Actions - Education
    registerForEvent: (eventId: string) => void;

    // Actions - General
    toggleSave: (item: any, type: SavedItem['type']) => void;
    isSaved: (itemId: string) => boolean;

    // Actions - Notifications
    markNotificationAsRead: (id: string) => void;
    markAllNotificationsAsRead: () => void;

    // Actions - Group Admin
    approveGroupRequest: (requestId: string) => Promise<void>;
    rejectGroupRequest: (requestId: string) => Promise<void>;
    promoteGroupMember: (groupId: string, userId: string, role: 'admin' | 'moderator') => Promise<void>;
    kickGroupMember: (groupId: string, userId: string) => Promise<void>;
    createGroup: (name: string, description: string, category: string, privacy: 'public' | 'private') => Promise<void>;

    // Admin Actions
    adminPromoteUser: (userId: string, type: 'elite' | 'syndicate') => void;
    adminAddEvent: (event: Course | Omit<Course, 'id'>) => Promise<void>;
    adminUpdateEvent: (event: Course) => Promise<void>;
    adminDeleteEvent: (eventId: string) => Promise<void>;
    reportPost: (postId: string, reason: string) => Promise<void>;
    banUser: (userId: string) => Promise<void>;
    adminDeleteGroup: (groupId: string) => Promise<void>;
    adminVerifyGroup: (groupId: string) => Promise<void>;

    loading: boolean;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export const CommunityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // State Initialization
    const [posts, setPosts] = useState<Post[]>([]);
    const [events, setEvents] = useState<Course[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]); // Deprecated
    const [following, setFollowing] = useState<string[]>([]);
    const [followers, setFollowers] = useState<string[]>([]);
    const [resources, setResources] = useState<ScientificResource[]>([]);
    const [models, setModels] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
    const [myEnrollments, setMyEnrollments] = useState<Enrollment[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [groupRequests, setGroupRequests] = useState<GroupRequest[]>([]);
    const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const mountedRef = useRef(true);

    // Initial Data Fetch
    useEffect(() => {
        mountedRef.current = true;
        let modelsChannelRef: any = null;
        let notificationsChannelRef: any = null;

        const loadData = async () => {
            setLoading(true);
            try {
                // Get Current User
                const { data: { session } } = await supabase.auth.getSession();
                if (!mountedRef.current) return;
                const userId = session?.user?.id || 'mock-user-id';
                setCurrentUser(session?.user);

                // Fetch Core Tables in Parallel
                const [
                    { data: postsData },
                    { data: profilesData },
                    { data: groupsData },
                    { data: eventsData },
                    { data: commentsData },
                    { data: savedData },
                    { data: friendshipsData },
                    { data: modelsData },
                    { data: enrollmentsData },
                    { data: notificationsData },
                    { data: groupRequestsData },
                    { data: myGroupMemberships }, // Added
                    { data: resourcesData }, // Added Resources
                    { data: myLikesData }, // Newly Added
                    { data: followsData } // Add follows data
                ] = await Promise.all([
                    supabase.from('community_posts').select('*').order('created_at', { ascending: false }),
                    supabase.from('profiles').select('*'),
                    supabase.from('groups').select('*'),
                    supabase.from('courses').select('*'),
                    supabase.from('community_comments').select('*'),
                    supabase.from('saved_items').select('*').eq('user_id', userId),
                    supabase.from('friendships').select('*'), // Deprecated
                    supabase.from('follows').select('*').or(`follower_id.eq.${userId},following_id.eq.${userId}`), // Fetch my follows/followers
                    supabase.from('models').select('*'),
                    supabase.from('enrollments').select('*').eq('user_id', userId),
                    supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
                    supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
                    supabase.from('group_requests').select('*, profiles:user_id(full_name, avatar_url)').eq('status', 'pending'),
                    supabase.from('group_members').select('group_id').eq('user_id', userId), // Fetch my group memberships
                    supabase.from('scientific_resources').select('*').order('created_at', { ascending: false }),
                    supabase.from('community_likes').select('post_id').eq('user_id', userId)
                ]);

                // Set Users/Profiles (Adapt to camelCase App Type)
                const adaptedUsers = (profilesData || []).map((p: any) => ({
                    id: p.id,
                    name: p.full_name,
                    email: p.email,
                    role: p.role,
                    avatar: p.avatar_url,
                    phone: p.phone,
                    specialty: p.specialty,
                    location: p.location,
                    bio: p.bio
                }));
                setUsers(adaptedUsers);

                setEvents(eventsData || []);
                setEvents(eventsData || []);

                const myGroupIds = new Set((myGroupMemberships || []).map((m: any) => m.group_id));
                const hydratedGroups = (groupsData || []).map((g: any) => ({
                    ...g,
                    isJoined: myGroupIds.has(g.id)
                }));
                setGroups(hydratedGroups);

                setModels(modelsData || []);
                setResources(resourcesData || []); // Set Resources
                setSavedItems(savedData || []);

                // Set Enrollments
                const adaptedEnrollments = (enrollmentsData || []).map((e: any) => ({
                    id: e.id,
                    itemId: e.item_id,
                    itemType: e.item_type,
                    status: e.status,
                    enrolledAt: e.enrolled_at
                }));
                setMyEnrollments(adaptedEnrollments);

                // Set Notifications
                const adaptedNotifications = (notificationsData || []).map((n: any) => {
                    const actor = (profilesData || []).find((p: any) => p.id === n.actor_id);
                    return {
                        id: n.id,
                        userId: n.user_id,
                        actorId: n.actor_id,
                        actorName: actor?.full_name || 'System',
                        actorAvatar: actor?.avatar_url,
                        type: n.type,
                        title: n.title,
                        content: n.message,
                        link: n.link,
                        isRead: n.is_read,
                        createdAt: n.created_at
                    } as Notification;
                });
                setNotifications(adaptedNotifications);

                // Set Group Requests
                const adaptedRequests = (groupRequestsData || []).map((r: any) => ({
                    id: r.id,
                    userId: r.user_id,
                    groupId: r.group_id,
                    status: r.status,
                    createdAt: r.created_at,
                    userName: r.profiles?.full_name || 'Unknown',
                    userAvatar: r.profiles?.avatar_url
                }));
                setGroupRequests(adaptedRequests);

                // Hydrate Posts with Author Info
                const myLikedPostIds = new Set(myLikesData?.map((l: any) => l.post_id) || []);

                const hydratedPosts = (postsData || []).map((p: any) => {
                    const author = (profilesData || []).find((u: any) => u.id === p.user_id);
                    // Filter comments for this post
                    const postComments = (commentsData || [])
                        .filter((c: any) => c.post_id === p.id)
                        .map((c: any) => {
                            const cAuthor = (profilesData || []).find((u: any) => u.id === c.user_id);
                            return {
                                id: c.id,
                                postId: c.post_id,
                                author: cAuthor?.full_name || 'Unknown',
                                authorId: c.user_id,
                                text: c.content,
                                time: new Date(c.created_at).toLocaleDateString(),
                                avatar: cAuthor?.avatar_url
                            } as Comment;
                        });

                    return {
                        id: p.id,
                        authorId: p.user_id,
                        authorName: author?.full_name || 'Unknown',
                        authorRole: author?.role || 'doctor',
                        authorAvatar: author?.avatar_url,
                        content: p.content,
                        // Support multiple images
                        images: p.images || (p.image_url ? [p.image_url] : []),
                        image: p.image_url || (p.images && p.images.length > 0 ? p.images[0] : null), // Fallback main image
                        likes: p.likes_count || 0, // Should be updated by trigger or separate count query if needed, relying on column for now
                        comments: postComments,
                        date: new Date(p.created_at).toLocaleDateString(),
                        groupId: null, // community_posts doesn't seem to have group_id yet in sql check, setting null or checking column
                        isElite: p.is_featured, // Mapping is_featured to elite for now
                        isSyndicate: false,
                        likedByMe: myLikedPostIds.has(p.id)
                    } as Post;
                });
                setPosts(hydratedPosts);

                // Hydrate Friends (Close Friends)
                const myFriends = (friendshipsData || [])
                    .filter((f: any) => f.user_id_1 === userId || f.user_id_2 === userId)
                    .map((f: any) => {
                        const friendId = f.user_id_1 === userId ? f.user_id_2 : f.user_id_1;
                        const friendProfile = (profilesData || []).find((p: any) => p.id === friendId);
                        if (!friendProfile) return null;
                        return {
                            id: friendProfile.id,
                            name: friendProfile.full_name,
                            role: friendProfile.role,
                            specialty: friendProfile.specialty,
                            location: friendProfile.location,
                            mutualFriends: 0,
                            isOnline: false,
                            avatar: friendProfile.avatar_url,
                            status: 'offline'
                        } as Friend;
                    })
                    .filter(Boolean) as Friend[];

                setFriends(myFriends);

                if (!mountedRef.current) return;

                // --- REALTIME SUBSCRIPTION FOR MODELS ---
                const modelsChannel = supabase
                    .channel('public:models')
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'models' }, (payload) => {
                        if (!mountedRef.current) return;
                        if (payload.eventType === 'INSERT') {
                            setModels((prev) => [payload.new, ...prev]);
                        } else if (payload.eventType === 'UPDATE') {
                            setModels((prev) => prev.map((m) => (m.id === payload.new.id ? payload.new : m)));
                        } else if (payload.eventType === 'DELETE') {
                            setModels((prev) => prev.filter((m) => m.id !== payload.old.id));
                        }
                    })
                    .subscribe();
                modelsChannelRef = modelsChannel;

                // --- REALTIME SUBSCRIPTION FOR NOTIFICATIONS ---
                const notificationsChannel = supabase
                    .channel('public:notifications')
                    .on('postgres_changes', {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${userId}`
                    }, async (payload) => {
                        if (!mountedRef.current) return;

                        // Fetch actor details
                        const { data: actor } = await supabase
                            .from('profiles')
                            .select('full_name, avatar_url')
                            .eq('id', payload.new.actor_id)
                            .single();

                        const newNotification: Notification = {
                            id: payload.new.id,
                            userId: payload.new.user_id,
                            actorId: payload.new.actor_id,
                            actorName: actor?.full_name || 'System',
                            actorAvatar: actor?.avatar_url,
                            type: payload.new.type,
                            title: payload.new.title,
                            content: payload.new.message,
                            link: payload.new.link,
                            isRead: payload.new.is_read,
                            createdAt: payload.new.created_at
                        };

                        setNotifications((prev) => [newNotification, ...prev]);
                        toast.info(`إشعار جديد: ${newNotification.title}`);
                    })
                    .subscribe();
                notificationsChannelRef = notificationsChannel;

                // Auto-Fetch Logic if empty
                if (!modelsData || modelsData.length === 0) {
                    await autoFetchModels();
                }

                // Set Follows
                const myFollows = (followsData || []).filter((f: any) => f.follower_id === userId).map((f: any) => f.following_id);
                setFollowing(myFollows);

                // Set Followers (optional, mostly need count per user usually, but here we keep list of who follows ME)
                const myFollowers = (followsData || []).filter((f: any) => f.following_id === userId).map((f: any) => f.follower_id);
                setFollowers(myFollowers);

                // --- SUGGESTIONS LOGIC ---
                // 1. Users who follow me but I don't follow back
                const followMeNotBack = adaptedUsers.filter(u => myFollowers.includes(u.id) && !myFollows.includes(u.id));

                // 2. Users who follow people I follow (2nd degree) (Mock logic for now as we need complex query or graph lookup)
                // For now, let's just take random users I don't follow to fill the list if needed
                const randomSuggestions = adaptedUsers.filter(u =>
                    u.id !== userId &&
                    !myFollows.includes(u.id) &&
                    !myFollowers.includes(u.id) // Exclude those already in priority 1
                ).slice(0, 10);

                setSuggestedUsers([...followMeNotBack, ...randomSuggestions]);

            } catch (error: any) {
                if (error?.name === 'AbortError' || error?.message?.includes('AbortError')) return;
                if (mountedRef.current) {
                    console.error('Failed to load community data', error);
                    toast.error('فشل تحميل بيانات المجتمع');
                }
            } finally {
                if (mountedRef.current) setLoading(false);
            }
        };

        const autoFetchModels = async () => {
            // Default Source ID (User's Collection)
            const collectionId = '4b03959643004743b85e67fae10e00f4';

            try {
                // Check if we have sources, if not add default
                const { data: sources } = await supabase.from('model_sources').select('*');
                if (!sources || sources.length === 0) {
                    await supabase.from('model_sources').insert({
                        name: 'مجموعة طب الأسنان (أساسي)',
                        url: `https://sketchfab.com/Sultan.Aljumaily/collections/dental-and-medical-${collectionId}`,
                        type: 'sketchfab_collection',
                        is_active: true,
                        model_count: 0,
                        created_at: new Date().toISOString()
                    });
                }

                // toast.loading('جاري جلب النماذج تلقائياً من المصدر...');

                let allModels: any[] = [];
                let nextUrl = `https://api.sketchfab.com/v3/collections/${collectionId}/models?sort_by=-createdAt`;

                // Fetch loop (Pagination)
                while (nextUrl) {
                    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(nextUrl)}`;
                    const res = await fetch(proxyUrl);
                    if (!res.ok) break;

                    const data = await res.json();
                    if (!data.results) break;

                    const pageItems = data.results.map((item: any) => {
                        const thumb = item.thumbnails.images.sort((a: any, b: any) => b.width - a.width)[0]?.url
                            || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400';
                        return {
                            id: item.uid, // Use UID as ID
                            title: item.name,
                            embed_url: `https://sketchfab.com/models/${item.uid}/embed`, // Correct Embed URL
                            category: 'General',
                            thumbnail_url: thumb,
                            author: item.user?.displayName || 'Sketchfab',
                            created_at: item.createdAt
                        };
                    });

                    allModels = [...allModels, ...pageItems];
                    nextUrl = data.next;
                    if (allModels.length > 200) break; // Safety break
                }

                if (allModels.length > 0) {
                    // Insert into DB
                    await supabase.from('models').insert(allModels);
                    setModels(allModels);
                    // toast.dismiss();
                    toast.success(`تم جلب ${allModels.length} نموذج تلقائياً`);
                } else {
                    // toast.dismiss();
                }

            } catch (e) {
                console.error('Auto-fetch failed', e);
                // toast.dismiss();
            }
        };

        loadData();

        return () => {
            mountedRef.current = false;
            if (modelsChannelRef) {
                supabase.removeChannel(modelsChannelRef);
            }
            if (notificationsChannelRef) {
                supabase.removeChannel(notificationsChannelRef);
            }
        };
    }, []);

    // --- ACTIONS ---

    // --- ACTIONS ---

    const createPost = async (content: string, image?: string | string[], groupId?: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id;

            if (!userId) {
                toast.error('يجب تسجيل الدخول أولاً');
                return;
            }

            // Handle images: normalize to array
            let imagesArray: string[] = [];
            if (Array.isArray(image)) {
                imagesArray = image;
            } else if (image) {
                imagesArray = [image];
            }

            const newPost = {
                user_id: userId, // community_posts uses user_id
                content,
                images: imagesArray,
                // keep legacy image_url for compatibility if needed, or just set it to first image
                image_url: imagesArray[0] || null,
                // category: 'general', // You might want to default this
                is_public: true,
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase.from('community_posts').insert(newPost).select().single();
            if (error) throw error;

            // Optimistic Update
            const author = users.find(u => u.id === userId);
            const createdPost: Post = {
                id: data.id,
                authorId: userId,
                authorName: author?.full_name || currentUser?.user_metadata?.full_name || 'Me',
                authorRole: author?.role || 'doctor',
                authorAvatar: author?.avatar_url || currentUser?.user_metadata?.avatar_url,
                content,
                image: imagesArray[0],
                images: imagesArray,
                groupId,
                likes: 0,
                comments: [],
                date: new Date().toLocaleDateString('en-US'), // Format consistent with others
                likedByMe: false
            };
            setPosts([createdPost, ...posts]);
            toast.success('تم نشر المشاركة بنجاح');

        } catch (e: any) {
            console.error('Create post error:', e);
            toast.error('فشل النشر: ' + e.message);
        }
    };

    const updatePost = async (postId: string, content: string, images?: string[]) => {
        try {
            const { data, error } = await supabase
                .from('community_posts')
                .update({ content, images })
                .eq('id', postId)
                .select()
                .single();

            if (error) throw error;

            setPosts(posts.map(p => p.id === postId ? { ...p, content, images: images || p.images, image: images && images.length > 0 ? images[0] : p.image } : p));
            toast.success('تم تحديث المنشور بنجاح');
        } catch (e: any) {
            console.error('Update post error:', e);
            toast.error('فشل تحديث المنشور');
        }
    };

    const deletePost = async (postId: string) => {
        try {
            const { error } = await supabase.from('community_posts').delete().eq('id', postId);
            if (error) throw error;
            setPosts(posts.filter(p => p.id !== postId));
            toast.success('تم حذف المنشور');
        } catch (e) {
            toast.error('فشل الحذف');
        }
    };

    const likePost = async (postId: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            toast.error('يجب تسجيل الدخول');
            return;
        }
        const userId = session.user.id;

        // 1. Optimistic Update
        const targetPost = posts.find(p => p.id === postId);
        if (!targetPost) return;

        const isLiked = targetPost.likedByMe;
        const newLikedState = !isLiked;

        setPosts(posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    likedByMe: newLikedState,
                    likes: newLikedState ? post.likes + 1 : Math.max(0, post.likes - 1)
                };
            }
            return post;
        }));

        // 2. DB Update
        try {
            if (newLikedState) {
                const { error } = await supabase.from('community_likes').insert({ post_id: postId, user_id: userId });
                if (error && error.code !== '23505') throw error; // Ignore duplicate key

                // Notify Author
                if (targetPost.authorId !== userId) {
                    sendNotification(targetPost.authorId, 'like', 'إعجاب جديد', `أعجب شخص ما بمنشورك`, `/community?postId=${postId}`, userId);
                }
            } else {
                const { error } = await supabase.from('community_likes').delete().eq('post_id', postId).eq('user_id', userId);
                if (error) throw error;
            }
        } catch (error) {
            console.error('Like toggle failed', error);
            // Revert on error
            setPosts(posts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        likedByMe: isLiked,
                        likes: targetPost.likes
                    };
                }
                return post;
            }));
        }
    };

    const addComment = async (postId: string, text: string, replyToUserId?: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id;

            if (!userId) {
                toast.error('يجب تسجيل الدخول للتعليق');
                return;
            }

            const newCommentPayload = {
                post_id: postId,
                user_id: userId,
                content: text,
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase.from('community_comments').insert(newCommentPayload).select().single();
            if (error) throw error;

            // Optimistic
            const author = users.find(u => u.id === userId);
            const myName = author?.full_name || currentUser?.user_metadata?.full_name || 'Me';
            const myAvatar = author?.avatar_url || currentUser?.user_metadata?.avatar_url;

            setPosts(posts.map(post => {
                if (post.id === postId) {
                    const commentObj: Comment = {
                        id: data?.id || Date.now().toString(),
                        postId,
                        author: myName,
                        authorId: userId,
                        text,
                        time: 'الآن',
                        avatar: myAvatar
                    };
                    return { ...post, comments: [...post.comments, commentObj] };
                }
                return post;
            }));

            // NOTIFICATIONS
            const post = posts.find(p => p.id === postId);

            // 1. Reply Notification
            if (replyToUserId && replyToUserId !== userId) {
                sendNotification(replyToUserId, 'reply', 'رد جديد', `رد ${myName} على تعليقك`, `/community?postId=${postId}`, userId);
            }

            // 2. Post Author Notification
            if (post && post.authorId !== userId && post.authorId !== replyToUserId) {
                sendNotification(post.authorId, 'comment', 'تعليق جديد', `علق ${myName} على منشورك`, `/community?postId=${postId}`, userId);
            }

        } catch (e) {
            console.error(e);
            toast.error('فشل إضافة التعليق');
        }
    };

    const updateComment = async (commentId: string, postId: string, text: string) => {
        try {
            const { error } = await supabase
                .from('community_comments')
                .update({ content: text })
                .eq('id', commentId);

            if (error) throw error;

            setPosts(posts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        comments: post.comments.map(c => c.id === commentId ? { ...c, text } : c)
                    };
                }
                return post;
            }));
            toast.success('تم تحديث التعليق');
        } catch (e) {
            console.error(e);
            toast.error('فشل تحديث التعليق');
        }
    };

    const deleteComment = async (commentId: string, postId: string) => {
        try {
            const { error } = await supabase
                .from('community_comments')
                .delete()
                .eq('id', commentId);

            if (error) throw error;

            setPosts(posts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        comments: post.comments.filter(c => c.id !== commentId)
                    };
                }
                return post;
            }));
            toast.success('تم حذف التعليق');
        } catch (e) {
            console.error(e);
            toast.error('فشل حذف التعليق');
        }
    };

    const sendMessage = async (recipientId: string, content: string) => {
        // Mock sending message logic
        toast.success('تم إرسال الرسالة');
        // Trigger Notification
        sendNotification(recipientId, 'message', 'رسالة جديدة', `أرسل لك شخص ما رسالة`, `/messages`, 'me');
    };

    const followUser = async (targetId: string) => {
        // Optimistic Update
        if (!following.includes(targetId)) {
            setFollowing([...following, targetId]);
            toast.success('تمت المتابعة');
        }

        try {
            const { error } = await supabase.from('follows').insert({ follower_id: currentUser?.id, following_id: targetId });
            if (error && error.code !== '23505') throw error;

            // Notify User
            sendNotification(targetId, 'follow', 'متابع جديد', 'بدأ شخص ما بمتابعتك', `/community`, currentUser?.id);

            // Check for Mutual Follow -> Auto-add to "Friends/Close Friends"
            if (followers.includes(targetId)) {
                const isAlreadyFriend = friends.some(f => f.id === targetId);

                if (!isAlreadyFriend) {
                    await supabase.from('friendships').insert({ user_id_1: currentUser?.id, user_id_2: targetId, status: 'accepted' });
                    toast.success('أصبحتما أصدقاء الآن!');

                    // Add to state
                    const { data: profile } = await supabase.from('profiles').select('*').eq('id', targetId).single();
                    if (profile) {
                        const newFriend: Friend = {
                            id: profile.id,
                            name: profile.full_name,
                            role: profile.role,
                            avatar: profile.avatar_url,
                            status: 'offline'
                        };
                        setFriends(prev => [...prev, newFriend]);
                    }
                }
            }
        } catch (error) {
            console.error('Follow error:', error);
            // Revert
            setFollowing(following.filter(id => id !== targetId));
            toast.error('فشل المتابعة');
        }
    };

    const toggleCloseFriend = async (targetId: string) => {
        try {
            // Check if already friend
            const isFriend = friends.some(f => f.id === targetId);

            if (isFriend) {
                // Remove
                const { error } = await supabase.from('friendships').delete().or(`and(user_id_1.eq.${currentUser?.id},user_id_2.eq.${targetId}),and(user_id_1.eq.${targetId},user_id_2.eq.${currentUser?.id})`);
                if (error) throw error;

                setFriends(friends.filter(f => f.id !== targetId));
                toast.success('تمت الإزالة من الأصدقاء المقربين');
            } else {
                // Add
                const { error } = await supabase.from('friendships').insert({ user_id_1: currentUser?.id, user_id_2: targetId, status: 'accepted' });
                if (error) throw error;

                // Fetch Profile to add to state
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', targetId).single();
                if (profile) {
                    const newFriend: Friend = {
                        id: profile.id,
                        name: profile.full_name,
                        role: profile.role,
                        avatar: profile.avatar_url,
                        status: 'offline'
                    };
                    setFriends([...friends, newFriend]);
                }
                toast.success('تمت الإضافة للأصدقاء المقربين');
            }
        } catch (error) {
            console.error('Toggle Close Friend Error:', error);
            toast.error('حدث خطأ أثناء التحديث');
        }
    }

    const isCloseFriend = (userId: string) => {
        return friends.some(f => f.id === userId);
    }

    const unfollowUser = async (targetId: string) => {
        // Optimistic Update
        if (following.includes(targetId)) {
            setFollowing(following.filter(id => id !== targetId));
            toast.success('تم إلغاء المتابعة');
        }

        try {
            const { error } = await supabase.from('follows').delete().match({ follower_id: currentUser?.id, following_id: targetId });
            if (error) throw error;
        } catch (error) {
            console.error('Unfollow error:', error);
            // Revert
            setFollowing([...following, targetId]);
            toast.error('فشل إلغاء المتابعة');
        }
    };

    const amIFollowing = (userId: string) => {
        return following.includes(userId);
    };

    // Deprecated
    const addFriend = (userId: string) => followUser(userId);
    const removeFriend = (userId: string) => unfollowUser(userId);

    const joinGroup = async (groupId: string) => {
        try {
            // Check privacy
            const group = groups.find(g => g.id === groupId);
            if (group?.privacy === 'private') {
                // Create Request
                const { error } = await supabase.from('group_requests').insert({
                    group_id: groupId,
                    user_id: currentUser?.id,
                    status: 'pending'
                });
                if (error) throw error;
                toast.success('تم إرسال طلب الانضمام');
                return;
            }

            const { error } = await supabase.from('group_members').insert({ group_id: groupId, user_id: currentUser?.id });
            if (error) throw error;

            setGroups(groups.map(g => g.id === groupId ? { ...g, isJoined: true, members: (g.members || 0) + 1 } : g));
            toast.success('تم الانضمام للمجموعة');

            // Notify Group Admins (Mock logic: finding implicit admin)
            // sendNotification(groupAdminId, 'group_request', 'طلب انضمام', ...)
        } catch (e) {
            console.error(e);
            toast.error('فشل الانضمام للمجموعة');
        }
    };

    const leaveGroup = async (groupId: string) => {
        try {
            const { error } = await supabase.from('group_members').delete().match({ group_id: groupId, user_id: currentUser?.id });
            if (error) throw error;

            setGroups(groups.map(g => g.id === groupId ? { ...g, isJoined: false, members: Math.max(0, (g.members || 0) - 1) } : g));
            toast.success('تم مغادرة المجموعة');
        } catch (e) {
            console.error(e);
            toast.error('فشل مغادرة المجموعة');
        }
    };

    const registerForEvent = async (eventId: string) => {
        // Check if already registered
        if (myEnrollments.some(e => e.itemId === eventId)) {
            toast.error('أنت مسجل بالفعل في هذا الحدث');
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id || 'mock-user-id';

            // Determine type (heuristic: assumption based on context usually passed or lookup)
            // For now, we will assume it's passed or lookup up from events.
            const event = events.find(e => e.id === eventId);
            const type = event?.category === 'ندوة' ? 'webinar' : 'course';

            const { data, error } = await supabase.from('enrollments').insert({
                item_id: eventId,
                item_type: type,
                user_id: userId,
                status: 'registered'
            }).select().single();

            if (error) throw error;

            const newEnrollment: Enrollment = {
                id: data.id,
                itemId: eventId,
                itemType: type,
                status: 'registered',
                enrolledAt: new Date().toISOString()
            };

            setMyEnrollments([...myEnrollments, newEnrollment]);

            // Update event stats locally
            setEvents(events.map(e => e.id === eventId ? { ...e, students: e.students + 1 } : e));
            toast.success('تم التسجيل بنجاح');
        } catch (e) {
            console.error(e);
            toast.error('فشل التسجيل');
        }
    };

    const toggleSave = async (item: any, type: SavedItem['type']) => {
        // Check local state for quick toggle
        const exists = savedItems.find(s => s.itemId === item.id && s.type === type);
        if (exists) {
            await supabase.from('saved_items').delete().eq('item_id', item.id).eq('item_type', type);
            setSavedItems(savedItems.filter(s => s.itemId !== item.id));
            toast.success('تم الحذف من المحفوظات');
        } else {
            const newItemData = { item_id: item.id, item_type: type, user_id: 'me', saved_at: new Date().toISOString() };
            await supabase.from('saved_items').insert(newItemData);

            const newItem: SavedItem = {
                id: Date.now().toString(),
                itemId: item.id,
                type,
                savedAt: new Date().toISOString(),
                data: item
            };
            setSavedItems([...savedItems, newItem]);
            toast.success('تم الحفظ في المحفوظات');
        }
    };

    const isSaved = (itemId: string) => {
        return savedItems.some(s => s.itemId === itemId);
    };

    // --- NOTIFICATION ACTIONS ---
    const sendNotification = async (userId: string, type: string, title: string, content: string, link: string, actorId?: string) => {
        try {
            const { data } = await supabase.from('notifications').insert({
                user_id: userId,
                actor_id: actorId,
                type,
                title,
                message: content,
                link,
                is_read: false
            }).select().single();

            // Local update if it's for me (edge case) or realtime subscription
            if (userId === currentUser?.id) {
                const actor = users.find(u => u.id === actorId);
                const newNotif: Notification = {
                    id: data.id,
                    userId,
                    actorId,
                    actorName: actor?.name || 'User',
                    actorAvatar: actor?.avatar,
                    type: type as any,
                    title,
                    content,
                    link,
                    isRead: false,
                    createdAt: new Date().toISOString()
                };
                setNotifications([newNotif, ...notifications]);
            }
        } catch (e) {
            console.error("Failed to send notification", e);
        }
    }

    const markNotificationAsRead = async (id: string) => {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
        setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const markAllNotificationsAsRead = async () => {
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', currentUser?.id);
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    };

    // --- GROUP ADMIN ACTIONS ---
    const createGroup = async (name: string, description: string, category: string, privacy: 'public' | 'private') => {
        const { data, error } = await supabase.from('groups').insert({
            name, description, category, privacy, created_by: currentUser?.id, image: null
        }).select().single();

        if (error) throw error;

        // Auto-join as admin
        await supabase.from('group_members').insert({
            group_id: data.id, user_id: currentUser?.id, role: 'admin'
        });

        setGroups([...groups, {
            ...data,
            members: 1,
            posts: 0,
            isJoined: true
        }]);
        toast.success('تم إنشاء المجموعة بنجاح');
    };

    const approveGroupRequest = async (requestId: string) => {
        // 1. Get request details
        const req = groupRequests.find(r => r.id === requestId);
        if (!req) return;

        // 2. Add to group members
        await supabase.from('group_members').insert({
            group_id: req.groupId,
            user_id: req.userId,
            role: 'member'
        });

        // 3. Update request status
        await supabase.from('group_requests').update({ status: 'approved' }).eq('id', requestId);

        // 4. Update local state
        setGroupRequests(groupRequests.filter(r => r.id !== requestId));

        // 5. Notify User
        sendNotification(req.userId, 'group_approve', 'تم قبول انضمامك', `تمت الموافقة على انضمامك للمجموعة`, `/community/groups/${req.groupId}`);
        toast.success('تم قبول العضو');
    };

    const rejectGroupRequest = async (requestId: string) => {
        await supabase.from('group_requests').update({ status: 'rejected' }).eq('id', requestId);
        setGroupRequests(groupRequests.filter(r => r.id !== requestId));
        toast.success('تم رفض الطلب');
    };

    const promoteGroupMember = async (groupId: string, userId: string, role: 'admin' | 'moderator') => {
        await supabase.from('group_members').update({ role }).match({ group_id: groupId, user_id: userId });
        toast.success(`تم ترقية العضو إلى ${role}`);
    };

    const kickGroupMember = async (groupId: string, userId: string) => {
        await supabase.from('group_members').delete().match({ group_id: groupId, user_id: userId });
        toast.success('تم طرد العضو من المجموعة');
    };


    // --- ADMIN ACTIONS ---
    const adminPromoteUser = async (userId: string, type: 'elite' | 'syndicate', data?: { hospital?: string; experience?: number }) => {
        // Update profile in DB
        const update: any = type === 'elite' ? { is_elite: true } : { is_syndicate: true };

        if (data) {
            if (data.hospital) update.hospital = data.hospital;
            if (data.experience) update.experience = data.experience;
        }

        await supabase.from('profiles').update(update).eq('id', userId);

        setUsers(users.map(u => u.id === userId ? { ...u, ...update, ...data } : u));
        toast.success(`User promoted to ${type} with details verified`);
    };

    const adminAddEvent = async (event: Course | Omit<Course, 'id'>) => {
        const newEvent = { ...event, id: (event as any).id || Math.random().toString(36).substr(2, 9) };
        await supabase.from('courses').insert(newEvent);
        setEvents([newEvent, ...events]);
        toast.success('تمت إضافة الحدث بنجاح');

        // Broadcast Notification (Mock: sending to current user to demonstrate)
        const type = newEvent.category === 'ندوة' ? 'webinar_new' : 'course_new';
        const link = type === 'webinar_new' ? '/community/webinars' : '/community/courses';
        const title = type === 'webinar_new' ? 'ندوة جديدة' : 'دورة جديدة';

        // Notify 'me' for demo purposes
        sendNotification(currentUser?.id, type, title, `تم إضافة ${newEvent.title} قد تهمك`, link, 'system');
    };

    const adminDeleteEvent = async (eventId: string) => {
        await supabase.from('courses').delete().eq('id', eventId);
        setEvents(events.filter(e => e.id !== eventId));
        toast.success('تم حذف الحدث');
    };

    const adminUpdateEvent = async (event: Course) => {
        await supabase.from('courses').update(event).eq('id', event.id);
        setEvents(events.map(e => e.id === event.id ? event : e));
        toast.success('تم تحديث الحدث');
    };

    const reportPost = async (postId: string, reason: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id;
            if (!userId) return;

            await supabase.from('reports').insert({
                reporter_id: userId,
                target_id: postId,
                target_type: 'post',
                reason
            });
            toast.success('تم استلام البلاغ، شكراً لمساعدتك');
        } catch (e) {
            toast.error('حدث خطأ أثناء الإبلاغ');
        }
    };

    const banUser = async (userId: string) => {
        try {
            await supabase.from('profiles').update({ banned: true }).eq('id', userId);
            // Optimistically remove posts from this user
            setUsers(users.map(u => u.id === userId ? { ...u, isBanned: true } : u));
            toast.error(`User ${userId} has been banned.`);
        } catch (e) {
            console.error(e);
            toast.error('فشل حظر المستخدم');
        }
    };

    const adminDeleteGroup = async (groupId: string) => {
        await supabase.from('groups').delete().eq('id', groupId);
        setGroups(groups.filter(g => g.id !== groupId));
        toast.success('تم حذف المجموعة');
    };

    const adminVerifyGroup = async (groupId: string) => {
        await supabase.from('groups').update({ is_verified: true }).eq('id', groupId);
        setGroups(groups.map(g => g.id === groupId ? { ...g, isVerified: true } : g));
        toast.success('تم توثيق المجموعة');
    };

    return (
        <CommunityContext.Provider value={{
            posts,
            events,
            groups,
            friends,
            following,
            followers,
            resources,
            models,
            users,
            suggestedUsers,
            savedItems,
            myEnrollments,
            createPost,
            updatePost,
            deletePost,
            likePost,
            addComment,
            updateComment,
            deleteComment,
            sendMessage,

            // Social
            followUser,
            unfollowUser,
            amIFollowing,
            toggleCloseFriend,
            isCloseFriend,
            addFriend, // Deprecated
            removeFriend, // Deprecated

            joinGroup,
            leaveGroup,
            registerForEvent,
            toggleSave,
            isSaved,
            adminPromoteUser,
            adminAddEvent,
            adminUpdateEvent,
            adminDeleteEvent,
            reportPost,
            markNotificationAsRead,
            markAllNotificationsAsRead,
            approveGroupRequest,
            rejectGroupRequest,
            promoteGroupMember,
            kickGroupMember,
            createGroup,
            groupRequests,
            notifications,
            banUser,
            adminDeleteGroup,
            adminVerifyGroup,
            loading
        }}>
            {children}
        </CommunityContext.Provider>
    );
};

export const useCommunityContext = () => {
    const context = useContext(CommunityContext);
    if (context === undefined) {
        throw new Error('useCommunityContext must be used within a CommunityProvider');
    }
    return context;
};
