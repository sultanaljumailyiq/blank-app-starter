import React, { useState, useRef } from 'react';
import { useCommunity } from '../../../hooks/useCommunity';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Heart, MessageCircle, Share2, MoreVertical,
    Image as ImageIcon, Link as LinkIcon, Send,
    Filter, Award, Shield, Users, Bookmark, Star, X, Loader2
} from 'lucide-react';
import { Button } from '../../../components/common/Button';

import { PremiumPostCard } from '../components/PremiumPostCard';
import { PostDetailModal } from '../components/PostDetailModal';


import { useAuth } from '../../../contexts/AuthContext';

import { PromotionalCarousel } from '../components/PromotionalCarousel';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

const OverviewTab: React.FC = () => {
    const { posts, likePost, addPost: createPost, toggleSave, isSaved, reportPost, deletePost, updatePost } = useCommunity();
    const { user: currentUser } = useAuth();
    const [filter, setFilter] = useState<'all' | 'elite' | 'syndicate' | 'friends'>('all');
    const [newPostContent, setNewPostContent] = useState('');
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // URL Params for Modal
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Check URL for open post
    const postId = searchParams.get('postId');
    const selectedPost = postId ? posts.find(p => p.id === postId) : null;

    const handlePostClick = (post: any) => {
        setSearchParams({ postId: post.id });
    };

    const handleCloseModal = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('postId');
        setSearchParams(newParams);
    };

    // Filter Logic
    const filteredPosts = posts.filter(post => {
        if (filter === 'all') return true;
        if (filter === 'elite') return post.isElite;
        if (filter === 'syndicate') return post.isSyndicate;
        if (filter === 'friends') return false; // Mock
        return true;
    });

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setSelectedImages(prev => [...prev, ...files]);

            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreviews(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handlePost = async () => {
        if (!newPostContent.trim() && selectedImages.length === 0) return;

        setIsUploading(true);
        let imageUrls: string[] = [];

        try {
            // Upload images if selected
            if (selectedImages.length > 0) {
                for (const file of selectedImages) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${currentUser?.id || 'anon'}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

                    const { error } = await supabase.storage
                        .from('community-posts')
                        .upload(fileName, file);

                    if (error) throw error;

                    const { data: urlData } = supabase.storage
                        .from('community-posts')
                        .getPublicUrl(fileName);

                    imageUrls.push(urlData.publicUrl);
                }
            }

            await createPost(newPostContent, imageUrls);

            // Reset state
            setNewPostContent('');
            setSelectedImages([]);
            setImagePreviews([]);
            if (fileInputRef.current) fileInputRef.current.value = '';

            toast.success('تم نشر المنشور بنجاح');
        } catch (error) {
            console.error('Error posting:', error);
            toast.error('حدث خطأ أثناء النشر');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="pb-20 space-y-6">

            {/* 1. HERO CAROUSEL (Dynamic Bento Widget) */}
            <PromotionalCarousel />

            {/* 2. CREATE POST (Floating aesthetics with image upload) */}
            <div className="px-4">
                <div className="bg-white rounded-[2rem] p-4 shadow-lg shadow-gray-100/50 border border-gray-50">
                    <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl">
                            {currentUser?.name?.[0] || 'A'}
                        </div>
                        <input
                            type="text"
                            placeholder="ماذا يدور في ذهنك يا دكتور؟"
                            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-gray-400"
                            value={newPostContent}
                            onChange={e => setNewPostContent(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handlePost()}
                        />
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="إرفاق صور"
                        >
                            <ImageIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handlePost}
                            disabled={(!newPostContent.trim() && selectedImages.length === 0) || isUploading}
                            className="p-3 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all"
                        >
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                        </button>
                    </div>

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={preview}
                                        alt={`Preview ${index}`}
                                        className="w-full h-24 object-cover rounded-xl border border-gray-100"
                                    />
                                    <button
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 3. FILTERS (Pill Design) */}
            <div className="sticky top-[72px] z-30 bg-gray-50/95 backdrop-blur-sm py-2">
                <div className="px-4 flex gap-3 overflow-x-auto no-scrollbar">
                    <FilterPill active={filter === 'all'} onClick={() => setFilter('all')} label="الكل" />
                    <FilterPill active={filter === 'elite'} onClick={() => setFilter('elite')} label="النخبة" icon={<Award className="w-3 h-3 text-amber-400" />} />
                    <FilterPill active={filter === 'syndicate'} onClick={() => setFilter('syndicate')} label="النقابة" icon={<Shield className="w-3 h-3 text-blue-400" />} />
                    <FilterPill active={filter === 'friends'} onClick={() => setFilter('friends')} label="أصدقائي" icon={<Users className="w-3 h-3 text-emerald-400" />} />
                </div>
            </div>

            {/* 4. PREMIUM FEED */}
            <div className="px-4 space-y-5">
                {filteredPosts.map(post => (
                    <PremiumPostCard
                        key={post.id}
                        post={post}
                        onLike={() => likePost(post.id)}
                        onSave={() => toggleSave(post, 'post')}
                        isSaved={isSaved(post.id)}
                        onProfileClick={() => navigate(`/community/user/${post.authorId}`)}
                        onReport={(reason: string) => reportPost(post.id, reason)}
                        onCommentClick={() => handlePostClick(post)}
                        onBodyClick={() => handlePostClick(post)}
                        isMe={currentUser?.id === post.authorId || post.authorId === 'me'}
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
                    />
                ))}
            </div>

            {/* POST DETAIL MODAL */}
            <PostDetailModal
                isOpen={!!selectedPost}
                onClose={handleCloseModal}
                post={selectedPost}
            />
        </div>
    );
};

const FilterPill = ({ active, onClick, label, icon }: any) => (
    <button
        onClick={onClick}
        className={`
            flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all
            ${active
                ? 'bg-gray-900 text-white shadow-lg shadow-gray-200 scale-105'
                : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-200'
            }
        `}
    >
        {icon}
        {label}
    </button>
);

export { OverviewTab };
