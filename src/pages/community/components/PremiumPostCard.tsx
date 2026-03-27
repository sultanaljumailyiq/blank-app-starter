import React, { useState } from 'react';
import { MoreVertical, Shield, Edit, Heart, MessageCircle, Share2, Bookmark, Star, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PremiumPostCard = ({
    post,
    onLike,
    onSave,
    isSaved,
    onProfileClick,
    onReport,
    isMe,
    onEdit,
    onDelete,
    onCommentClick
}: any) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-50/50 hover:shadow-md transition-shadow relative">

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={onProfileClick}
                >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center font-bold text-gray-700 shadow-inner group-hover:scale-105 transition-transform overflow-hidden">
                        {post.authorAvatar ? (
                            <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
                        ) : (
                            post.authorName?.[0] || '?'
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 align-middle">
                            <h3 className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">{post.authorName}</h3>
                            {post.isElite && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                            {post.isSyndicate && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                        </div>
                        <p className="text-[10px] font-medium text-gray-400">{post.authorRole} • {post.date}</p>
                    </div>
                </div>

                {/* Menu Action */}
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="text-gray-300 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition-colors"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>

                    {showMenu && (
                        <div className="absolute top-8 left-0 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-10 overflow-hidden py-1">
                            {isMe && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMenu(false);
                                            onEdit?.();
                                        }}
                                        className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                        تعديل المنشور
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMenu(false);
                                            onDelete?.();
                                        }}
                                        className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        حذف المنشور
                                    </button>
                                </>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(false);
                                    const reason = window.prompt('سبب الإبلاغ:');
                                    if (reason) onReport(reason);
                                }}
                                className="w-full text-right px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                            >
                                <Shield className="w-4 h-4" />
                                إبلاغ عن المنشور
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Clickable Body to open Detail Modal */}
            <div className="cursor-pointer" onClick={onCommentClick}>
                {/* Text */}
                <p className="text-gray-600 text-sm leading-7 mb-4 font-normal">
                    {post.content}
                </p>

                {/* Image(s) */}
                {post.images && post.images.length > 0 ? (
                    <div className={`grid gap-1 mb-5 rounded-3xl overflow-hidden border border-gray-100 shadow-sm ${post.images.length === 1 ? 'grid-cols-1' :
                        post.images.length === 2 ? 'grid-cols-2' :
                            'grid-cols-2'
                        }`}>
                        {post.images.slice(0, 3).map((img: string, idx: number) => (
                            <div key={idx} className={`relative h-48 ${post.images && post.images.length === 3 && idx === 0 ? 'col-span-2' : ''}`}>
                                <img
                                    src={img}
                                    alt={`Post content ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                {idx === 2 && post.images.length > 3 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl">
                                        +{post.images.length - 3}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : post.image && (
                    <div className="rounded-3xl overflow-hidden mb-5 border border-gray-100 shadow-sm">
                        <img src={post.image} alt="Post content" className="w-full h-auto object-cover max-h-[400px]" />
                    </div>
                )}
            </div>

            {/* Action Bar */}
            <div className="bg-gray-50/80 rounded-2xl p-2 flex items-center justify-between">
                <div className="flex gap-1">
                    <ActionButton
                        active={post.likedByMe}
                        onClick={onLike}
                        icon={Heart}
                        count={post.likes}
                        color="text-red-500"
                        fill="fill-red-500"
                    />
                    <ActionButton
                        onClick={onCommentClick}
                        icon={MessageCircle}
                        count={post.comments?.length || 0}
                        color="text-blue-500"
                    />
                </div>

                <div className="flex gap-1">
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Share2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onSave}
                        className={`p-2 transition-colors ${isSaved ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                </div>
            </div>
        </div >
    );
};

const ActionButton = ({ active, onClick, icon: Icon, count, color, fill }: any) => (
    <button
        onClick={(e) => {
            e.stopPropagation();
            onClick?.();
        }}
        className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all
            ${active ? 'bg-white shadow-sm ' + color : 'text-gray-500 hover:bg-white hover:text-gray-700'}
        `}
    >
        <Icon className={`w-4 h-4 ${active ? fill : ''}`} />
        <span className="text-xs font-bold">{count}</span>
    </button>
);
