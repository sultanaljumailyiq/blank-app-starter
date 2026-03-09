
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCommunity } from '../../hooks/useCommunity';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import {
    ArrowRight, Heart, MessageCircle, Share2, Bookmark,
    MoreVertical, Send, Shield, Edit, Trash2, CheckCircle
} from 'lucide-react';

export const PostDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { posts, likePost, addComment, toggleSave, isSaved, reportPost, deletePost } = useCommunity();
    const { user: currentUser } = useAuth();
    const [commentText, setCommentText] = useState('');

    const post = posts.find(p => p.id === id);

    if (!post) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <h2 className="text-xl font-bold text-gray-900 mb-2">المنشور غير موجود</h2>
                <Button onClick={() => navigate(-1)} variant="outline">
                    <ArrowRight className="w-4 h-4 ml-2" />
                    رجوع
                </Button>
            </div>
        );
    }

    const isMe = currentUser?.id === post.authorId || post.authorId === 'me';
    const postSaved = isSaved(post.id);

    const handleComment = () => {
        if (!commentText.trim()) return;
        addComment(post.id, commentText);
        setCommentText('');
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8 pb-24">
            {/* Nav Back */}
            <div className="max-w-3xl mx-auto mb-6 flex items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm"
                >
                    <ArrowRight className="w-5 h-5" />
                    <span className="font-bold text-sm">رجوع</span>
                </button>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
                {/* POST CARD - FULL */}
                <Card className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div
                                className="flex items-center gap-3 cursor-pointer"
                                onClick={() => navigate(`/community/user/${post.authorId}`)}
                            >
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center font-bold text-gray-700 shadow-inner">
                                    {post.authorName?.[0] || '?'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 align-middle">
                                        <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{post.authorName}</h3>
                                        {post.isElite && <CheckCircle className="w-4 h-4 text-amber-500 fill-amber-500" />}
                                    </div>
                                    <p className="text-xs font-medium text-gray-400">{post.authorRole} • {post.date}</p>
                                </div>
                            </div>

                            {/* Options */}
                            <button className="text-gray-400 hover:text-gray-600">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <p className="text-gray-800 text-lg leading-relaxed mb-6 whitespace-pre-line">
                            {post.content}
                        </p>

                        {/* Image */}
                        {/* Image(s) */}
                        {post.images && post.images.length > 0 ? (
                            <div className={`grid gap-2 mb-6 rounded-3xl overflow-hidden border border-gray-100 shadow-sm ${post.images.length === 1 ? 'grid-cols-1' :
                                    post.images.length === 2 ? 'grid-cols-2' :
                                        'grid-cols-2'
                                }`}>
                                {post.images.map((img, idx) => (
                                    <div key={idx} className={`relative ${post.images && post.images.length > 2 && idx === 0 ? 'col-span-2' : ''}`}>
                                        <img
                                            src={img}
                                            alt={`Post content ${idx + 1}`}
                                            className="w-full h-auto object-cover max-h-[500px]"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : post.image && (
                            <div className="rounded-3xl overflow-hidden mb-6 border border-gray-100 shadow-sm">
                                <img src={post.image} alt="Post content" className="w-full h-auto object-cover" />
                            </div>
                        )}

                        {/* Stats & Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => likePost(post.id)}
                                    className={`rounded-xl px-4 py-2 flex items-center gap-2 ${post.likedByMe ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                >
                                    <Heart className={`w-5 h-5 ${post.likedByMe ? 'fill-current' : ''}`} />
                                    <span>{post.likes}</span>
                                </Button>
                                <Button className="rounded-xl px-4 py-2 flex items-center gap-2 bg-blue-50 text-blue-600">
                                    <MessageCircle className="w-5 h-5" />
                                    <span>{post.comments?.length || 0}</span>
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" className="rounded-xl">
                                    <Share2 className="w-5 h-5 text-gray-400" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="rounded-xl"
                                    onClick={() => toggleSave(post, 'post')}
                                >
                                    <Bookmark className={`w-5 h-5 ${postSaved ? 'text-orange-500 fill-current' : 'text-gray-400'}`} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* COMMENTS SECTION */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        التعليقات
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg text-xs">
                            {post.comments?.length || 0}
                        </span>
                    </h3>

                    {/* Comment Input */}
                    <div className="flex gap-4 mb-8">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold flex-shrink-0">
                            {currentUser?.name?.[0] || 'ME'}
                        </div>
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="اكتب تعليقاً..."
                                className="w-full bg-gray-50 border-0 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 transition-all pr-12"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                            />
                            <button
                                onClick={handleComment}
                                disabled={!commentText.trim()}
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-xl shadow-md disabled:opacity-50 disabled:shadow-none hover:bg-indigo-700 transition-all"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-6">
                        {post.comments && post.comments.length > 0 ? (
                            post.comments.map((comment: any) => (
                                <div key={comment.id} className="flex gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-600 font-bold text-sm flex-shrink-0">
                                        {comment.authorName[0]}
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-4 rounded-tr-none flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-gray-900 text-sm">{comment.authorName}</h4>
                                            <span className="text-[10px] text-gray-400">{comment.date}</span>
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                كن أول من يعلق على هذا المنشور
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
