import React from 'react';
import { Card } from '../common/Card';
import { Bell, FileText, MessageSquare, AlertTriangle, Zap, CheckCircle, Clock } from 'lucide-react';
import { useNotifications, Notification } from '../../hooks/useNotifications';
import { formatDate } from '../../lib/utils';
import { Button } from './Button';

export const NotificationsList: React.FC = () => {
    const { notifications, loading, markAsRead, deleteNotification, refresh } = useNotifications();

    const getIcon = (type: string) => {
        switch (type) {
            case 'appointment': return <Clock className="w-5 h-5 text-blue-600" />;
            case 'order': return <FileText className="w-5 h-5 text-purple-600" />;
            case 'message': return <MessageSquare className="w-5 h-5 text-green-600" />;
            case 'alert': return <AlertTriangle className="w-5 h-5 text-red-600" />;
            case 'system': return <Zap className="w-5 h-5 text-yellow-600" />;
            case 'payment': return <CheckCircle className="w-5 h-5 text-green-600" />;
            default: return <Bell className="w-5 h-5 text-gray-600" />;
        }
    };

    const getColorClass = (type: string) => {
        switch (type) {
            case 'alert': return 'bg-red-50 border-red-100';
            case 'system': return 'bg-yellow-50 border-yellow-100';
            case 'message': return 'bg-green-50 border-green-100';
            case 'order': return 'bg-purple-50 border-purple-100';
            case 'appointment': return 'bg-blue-50 border-blue-100';
            default: return 'bg-gray-50 border-gray-100';
        }
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Bell className="w-6 h-6 text-purple-600" />
                    الإشعارات والتنبيهات
                </h2>
                <Button variant="ghost" onClick={refresh} className="text-sm">
                    تحديث
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
            ) : notifications.length > 0 ? (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-md ${getColorClass(notification.type)} ${!notification.isRead ? 'ring-1 ring-purple-200' : ''}`}
                        >
                            <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm`}>
                                {getIcon(notification.type)}
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className={`font-bold text-gray-900 ${!notification.isRead ? 'text-purple-900' : ''}`}>
                                        {notification.title}
                                    </h4>
                                    <span className="text-xs text-gray-500 whitespace-nowrap mr-2">
                                        {notification.time}
                                    </span>
                                </div>

                                <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                                    {notification.description}
                                </p>

                                {notification.clinicName && (
                                    <p className="text-xs text-purple-600 mt-2 font-medium">
                                        من: {notification.clinicName}
                                    </p>
                                )}

                                <div className="flex justify-end gap-2 mt-3">
                                    {!notification.isRead && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1"
                                        >
                                            تحديد كمقروء
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(notification.id)}
                                        className="text-xs text-red-500 hover:text-red-600 px-2 py-1"
                                    >
                                        حذف
                                    </button>
                                </div>
                            </div>

                            {!notification.isRead && (
                                <div className="absolute top-4 left-4 w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p>لا توجد إشعارات جديدة</p>
                </div>
            )}
        </Card>
    );
};
