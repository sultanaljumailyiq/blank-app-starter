import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, ExternalLink, Heart, MessageCircle, UserPlus, Info, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCommunityContext } from '../../../contexts/CommunityContext';

export const NotificationPopover: React.FC = () => {
    const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useCommunityContext();
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Defensive check
    const safeNotifications = Array.isArray(notifications) ? notifications : [];
    const unreadCount = safeNotifications.filter(n => !n.isRead).length;

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (e: React.MouseEvent, notification: any) => {
        e.stopPropagation();
        try {
            markNotificationAsRead(notification.id);
            setIsOpen(false);
            if (notification.link) {
                navigate(notification.link);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        markAllNotificationsAsRead();
    };

    const handleViewAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(false);
        navigate('/community/notifications');
    };

    const getIcon = (type: string) => {
        try {
            switch (type) {
                case 'like': return <Heart className="w-4 h-4 text-red-500 fill-current" />;
                case 'comment': return <MessageCircle className="w-4 h-4 text-blue-500" />;
                case 'follow': return <UserPlus className="w-4 h-4 text-purple-500" />;
                case 'course_new':
                case 'webinar_new': return <Calendar className="w-4 h-4 text-orange-500" />;
                case 'group_request':
                case 'group_approve': return <Info className="w-4 h-4 text-indigo-500" />;
                default: return <Bell className="w-4 h-4 text-gray-500" />;
            }
        } catch {
            return <Bell className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div className="relative" ref={popoverRef}>
            {/* Bell Icon Trigger */}
            <button
                type="button"
                onClick={(e) => {
                    // Critical: Prevent any parent links/handlers from firing
                    e.preventDefault();
                    e.stopPropagation();

                    setIsOpen(prev => !prev);
                }}
                className="relative p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors z-[60]"
                aria-label="Notifications"
                aria-expanded={isOpen}
            >
                <Bell className="w-6 h-6 text-gray-600 pointer-events-none" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white pointer-events-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Popover Content */}
            {isOpen && (
                <div className="absolute top-12 left-0 md:left-auto md:right-0 w-80 md:w-96 bg-white rounded-3xl shadow-xl border border-gray-100 z-50 overflow-hidden transform transition-all duration-200 origin-top-right">
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 backdrop-blur-sm">
                        <h3 className="font-bold text-gray-900">الإشعارات</h3>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAll}
                                className="text-xs text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1"
                            >
                                <Check className="w-3 h-3" />
                                تحديد الكل كمقروء
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {safeNotifications.length > 0 ? (
                            safeNotifications.map(notification => (
                                <div
                                    key={notification.id}
                                    onClick={(e) => handleNotificationClick(e, notification)}
                                    className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3 ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                                >
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center relative">
                                            {notification.actorAvatar && (
                                                <img src={notification.actorAvatar} alt="" className="absolute inset-0 w-full h-full rounded-full object-cover" />
                                            )}
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm text-xs z-10">
                                                {getIcon(notification.type)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900 leading-snug">
                                            <span className="font-bold">{notification.actorName || 'النظام'}</span>{' '}
                                            {notification.content}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-400">
                                                {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString('ar-EG') : ''}
                                            </span>
                                            {!notification.isRead && (
                                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-400">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">لا توجد إشعارات جديدة</p>
                            </div>
                        )}
                    </div>

                    <div className="p-2 border-t border-gray-50 bg-gray-50">
                        <button
                            type="button"
                            className="w-full py-2 text-blue-600 text-sm font-bold hover:bg-blue-50 rounded-xl flex items-center justify-center"
                            onClick={handleViewAll}
                        >
                            <ExternalLink className="w-4 h-4 ml-2" />
                            عرض كل الإشعارات
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
