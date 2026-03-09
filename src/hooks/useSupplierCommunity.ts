import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface CommunityPost {
    id: string;
    author: {
        name: string;
        avatar: string;
        role: string;
    };
    content: string;
    image?: string;
    likes: number;
    comments: number;
    timestamp: string;
    isLiked: boolean;
}

const MOCK_POSTS: CommunityPost[] = [
    {
        id: 'POST001',
        author: {
            name: 'د. أحمد علي',
            avatar: '👨‍⚕️',
            role: 'طبيب أسنان'
        },
        content: 'ما هو أفضل نوع من الحشوات التجميلية المتوفرة حالياً في السوق؟ أبحث عن نوعية تمتاز بالمتانة والجمالية العالية.',
        likes: 15,
        comments: 4,
        timestamp: '2025-11-08T10:00:00',
        isLiked: false
    },
    {
        id: 'POST002',
        author: {
            name: 'شركة الرافدين للتجهيزات',
            avatar: '🏢',
            role: 'مورد'
        },
        content: 'يسرنا الإعلان عن وصول دفعة جديدة من كراسي الأسنان الإيطالية بأسعار تنافسية. زوروا متجرنا للتفاصيل!',
        image: '🪑',
        likes: 24,
        comments: 8,
        timestamp: '2025-11-07T15:30:00',
        isLiked: true
    }
];

export const useSupplierCommunity = () => {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 800));
            setPosts(MOCK_POSTS);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const likePost = (postId: string) => {
        setPosts(prev => prev.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                    isLiked: !post.isLiked
                };
            }
            return post;
        }));
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return {
        posts,
        loading,
        likePost,
        refresh: fetchPosts
    };
};
