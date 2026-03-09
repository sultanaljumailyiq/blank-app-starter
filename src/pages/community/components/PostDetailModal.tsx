import React, { useState, useEffect, useRef } from 'react';
import { useCommunity } from '../../../hooks/useCommunity';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import {
    Heart, MessageCircle, Share2, Bookmark,
    MoreVertical, Send, CheckCircle, Edit, Trash2, AlertCircle, X
} from 'lucide-react';
import { toast } from 'sonner';

interface PostDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: any;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({ isOpen, onClose, post }) => {
    const { likePost, addComment, updateComment, deleteComment, updatePost, deletePost, reportPost, toggleSave, isSaved } = useCommunity();
    const { user: currentUser } = useAuth();
    const [commentText, setCommentText] = useState('');
    const [localComments, setLocalComments] = useState<any[]>([]);

    // UI States
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [isEditingPost, setIsEditingPost] = useState(false);
    const [editedPostContent, setEditedPostContent] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editedCommentText, setEditedCommentText] = useState('');

    const menuRef = useRef<HTMLDivElement>(null);

    // Sync comments when post changes or opens
    useEffect(() => {
        if (post?.comments) {
            setLocalComments(post.comments);
        }
        if (post?.content) {
            setEditedPostContent(post.content);
        }
    }, [post]);

    // Handle click outside to close menus
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!post) return null;

    const postSaved = isSaved(post.id);
    const isPostAuthor = currentUser?.id === post.authorId;

    const handleComment = async () => {
        if (!commentText.trim()) return;

        // Optimistic UI Update
        const newComment = {
            id: `temp-${Date.now()}`,
            authorId: currentUser?.id,
            author: currentUser?.name || 'Me',
            text: commentText,
            time: 'الآن'
        };

        setLocalComments(prev => [...prev, newComment]);
        const textToSend = commentText;
        setCommentText('');

        // Actual API Call
        await addComment(post.id, textToSend);
    };

    const handleSavePostEdit = async () => {
        if (!editedPostContent.trim()) return;
        try {
            await updatePost(post.id, editedPostContent);
            setIsEditingPost(false);
        } catch (e) {
            toast.error('فشل تحديث المنشور');
        }
    };

    const handleDeletePost = async () => {
        if (window.confirm('هل أنت متأكد من حذف هذا المنشور؟')) {
            try {
                await deletePost(post.id);
                onClose();
            } catch (e) {
                toast.error('فشل حذف المنشور');
            }
        }
    };

    const handleReportPost = async () => {
        const reason = window.prompt('سبب الإبلاغ عن هذا المنشور:');
        if (reason) {
            await reportPost(post.id, reason);
        }
    };

    const handleSaveCommentEdit = async (commentId: string) => {
        if (!editedCommentText.trim()) return;
        await updateComment(commentId, post.id, editedCommentText);
        setEditingCommentId(null);
    };

    const handleDeleteComment = async (commentId: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا التعليق؟')) {
            await deleteComment(commentId, post.id);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="المنشور"
            size="2xl"
        >
            <div className="space-y-6">
                {/* POST CONTENT */}
                <div className="bg-white rounded-[2rem] p-4 md:p-6 shadow-sm border border-gray-100 relative">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center font-bold text-gray-700 shadow-inner overflow-hidden">
                                {post.authorAvatar ? (
                                    <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
                                ) : (
                                    post.authorName?.[0] || '?'
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5 align-middle">
                                    <h3 className="font-bold text-gray-900">{post.authorName}</h3>
                                    {post.isElite && <CheckCircle className="w-4 h-4 text-amber-500 fill-amber-500" />}
                                </div>
                                <p className="text-xs font-medium text-gray-400">{post.authorRole} • {post.date}</p>
                            </div>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setActiveMenu(activeMenu === 'post' ? null : 'post')}
                                className="text-gray-400 hover:text-gray-600 p-2"
                            >
                                <MoreVertical className="w-5 h-5" />
                            </button>

                            {activeMenu === 'post' && (
                                <div ref={menuRef} className="absolute right-0 top-10 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                                    {isPostAuthor ? (
                                        <>
                                            <button
                                                onClick={() => { setIsEditingPost(true); setActiveMenu(null); }}
                                                className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <Edit className="w-4 h-4" /> تعديل المنشور
                                            </button>
                                            <button
                                                onClick={() => { handleDeletePost(); setActiveMenu(null); }}
                                                className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" /> حذف المنشور
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => { handleReportPost(); setActiveMenu(null); }}
                                            className="w-full text-right px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                                        >
                                            <AlertCircle className="w-4 h-4" /> إبلاغ عن المنشور
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Text / Edit Mode */}
                    {isEditingPost ? (
                        <div className="mb-4">
                            <textarea
                                className="w-full bg-gray-50 border-0 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 transition-all text-gray-800 text-lg leading-relaxed min-h-[150px]"
                                value={editedPostContent}
                                onChange={(e) => setEditedPostContent(e.target.value)}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <Button variant="ghost" size="sm" onClick={() => setIsEditingPost(false)}>إلغاء</Button>
                                <Button size="sm" onClick={handleSavePostEdit}>حفظ التغييرات</Button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-800 text-lg leading-relaxed mb-4 whitespace-pre-line">
                            {post.content}
                        </p>
                    )}

                    {/* Image */}
                    {post.image && !isEditingPost && (
                        <div className="rounded-3xl overflow-hidden mb-5 border border-gray-100 shadow-sm">
                            <img src={post.image} alt="Post content" className="w-full h-auto object-cover max-h-[400px]" />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex gap-2">
                            <button
                                onClick={() => likePost(post.id)}
                                className={`rounded-xl px-4 py-2 flex items-center gap-2 transition-colors ${post.likedByMe ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                            >
                                <Heart className={`w-5 h-5 ${post.likedByMe ? 'fill-current' : ''}`} />
                                <span className="font-medium">{post.likes}</span>
                            </button>
                            <button className="rounded-xl px-4 py-2 flex items-center gap-2 bg-blue-50 text-blue-600">
                                <MessageCircle className="w-5 h-5" />
                                <span className="font-medium">{localComments.length}</span>
                            </button>
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

                {/* COMMENTS SECTION */}
                <div className="bg-white rounded-[2rem] p-4 md:p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        التعليقات
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg text-xs">
                            {localComments.length}
                        </span>
                    </h3>

                    {/* Input Area */}
                    <div className="flex gap-4 mb-6">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold flex-shrink-0">
                            {currentUser?.name?.[0] || 'ME'}
                        </div>
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="اكتب تعليقاً..."
                                className="w-full bg-gray-50 border-0 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 transition-all pl-12"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                            />
                            <button
                                onClick={handleComment}
                                disabled={!commentText.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl shadow-md disabled:opacity-50 disabled:shadow-none hover:bg-indigo-700 transition-all z-10"
                            >
                                <Send className="w-4 h-4 rtl:rotate-180" />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {localComments.length > 0 ? (
                            localComments.map((comment: any, idx: number) => {
                                const isCommentAuthor = currentUser?.id === comment.authorId;
                                const isEditing = editingCommentId === comment.id;

                                return (
                                    <div key={comment.id || idx} className="flex gap-3 items-start group">
                                        <div className="w-8 h-8 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-600 font-bold text-xs flex-shrink-0 overflow-hidden">
                                            {comment.avatar ? (
                                                <img src={comment.avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                comment.author?.[0]
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="bg-gray-50 rounded-2xl p-3 rounded-tr-none relative">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-gray-900 text-xs">{comment.author}</h4>
                                                    <span className="text-[10px] text-gray-400">{comment.time}</span>
                                                </div>

                                                {isEditing ? (
                                                    <div className="mt-2">
                                                        <textarea
                                                            className="w-full bg-white border-gray-200 rounded-xl py-2 px-3 text-xs focus:ring-indigo-500 focus:border-indigo-500"
                                                            value={editedCommentText}
                                                            onChange={(e) => setEditedCommentText(e.target.value)}
                                                            autoFocus
                                                        />
                                                        <div className="flex justify-end gap-2 mt-1">
                                                            <button
                                                                onClick={() => setEditingCommentId(null)}
                                                                className="text-[10px] text-gray-500 hover:text-gray-700"
                                                            >
                                                                إلغاء
                                                            </button>
                                                            <button
                                                                onClick={() => handleSaveCommentEdit(comment.id)}
                                                                className="text-[10px] text-indigo-600 font-bold hover:text-indigo-700"
                                                            >
                                                                حفظ
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-700 text-xs leading-relaxed">{comment.text}</p>
                                                )}

                                                {/* Comment Actions Menu Toggle */}
                                                {!isEditing && isCommentAuthor && (
                                                    <div className="absolute -right-2 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => setActiveMenu(activeMenu === `comment-${comment.id}` ? null : `comment-${comment.id}`)}
                                                            className="text-gray-400 hover:text-gray-600 bg-white shadow-sm rounded-lg p-1"
                                                        >
                                                            <MoreVertical className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Comment Dropdown Menu */}
                                                {activeMenu === `comment-${comment.id}` && (
                                                    <div ref={menuRef} className="absolute -right-2 top-8 w-24 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                                                        <button
                                                            onClick={() => {
                                                                setEditingCommentId(comment.id);
                                                                setEditedCommentText(comment.text);
                                                                setActiveMenu(null);
                                                            }}
                                                            className="w-full text-right px-3 py-1.5 text-[10px] text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
                                                        >
                                                            <Edit className="w-3 h-3" /> تعديل
                                                        </button>
                                                        <button
                                                            onClick={() => { handleDeleteComment(comment.id); setActiveMenu(null); }}
                                                            className="w-full text-right px-3 py-1.5 text-[10px] text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                                                        >
                                                            <Trash2 className="w-3 h-3" /> حذف
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-6 text-gray-400 text-xs">
                                كن أول من يعلق على هذا المنشور
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};
