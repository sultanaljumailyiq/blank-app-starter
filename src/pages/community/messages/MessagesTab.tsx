
import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { Search, Send, Paperclip, MoreVertical, CheckCheck, Smile, User } from 'lucide-react';
import { useMessages } from '../../../hooks/useMessages';
import { useAuth } from '../../../contexts/AuthContext';

export const MessagesTab: React.FC = () => {
    const { conversations, sendMessage, loading } = useMessages();
    const { user } = useAuth();

    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [messageInput, setMessageInput] = useState('');

    useEffect(() => {
        if (!selectedChatId && conversations.length > 0) {
            setSelectedChatId(conversations[0]?.id);
        }
    }, [conversations, selectedChatId]);

    const selectedConversation = conversations.find(c => c.id === selectedChatId);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedChatId) return;

        await sendMessage(selectedChatId, messageInput);
        setMessageInput('');
    };

    if (loading && conversations.length === 0) {
        return <div className="p-8 text-center text-gray-500">جاري تحميل الرسائل...</div>;
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-[600px] flex animate-in fade-in slide-in-from-bottom-4">
            {/* Sidebar - Conversations */}
            <div className="w-80 border-l border-gray-100 flex flex-col bg-gray-50/50">
                <div className="p-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-lg mb-4">الرسائل</h3>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="بحث..."
                            className="w-full pl-4 pr-10 py-2.5 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-purple-500 bg-white transition-all text-sm"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {conversations.length > 0 ? conversations.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChatId(chat.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${selectedChatId === chat.id ? 'bg-white shadow-sm ring-1 ring-purple-100' : 'hover:bg-gray-100'
                                }`}
                        >
                            <div className="relative">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold overflow-hidden border border-gray-200">
                                    <User className="w-6 h-6" />
                                </div>
                                {/* Online status placeholder */}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <h4 className={`font-bold text-sm truncate ${selectedChatId === chat.id ? 'text-purple-900' : 'text-gray-900'}`}>{chat.partnerName || 'مستخدم'}</h4>
                                    <span className="text-[10px] text-gray-400">
                                        {new Date(chat.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className={`text-xs truncate ${chat.unreadCount > 0 ? 'font-bold text-gray-800' : 'text-gray-500'}`}>
                                    {chat.lastMessage}
                                </p>
                            </div>
                            {chat.unreadCount > 0 && (
                                <span className="min-w-[18px] h-[18px] bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                                    {chat.unreadCount}
                                </span>
                            )}
                        </div>
                    )) : (
                        <div className="text-center py-10 text-gray-400 text-sm">لا توجد محادثات</div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedChatId && selectedConversation ? (
                    <>
                        {/* Header */}
                        <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur-sm z-10 w-full">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 font-bold border border-purple-100">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{selectedConversation.partnerName}</h3>
                                    <span className="text-xs text-gray-500">
                                        {selectedConversation.partnerRole}
                                    </span>
                                </div>
                            </div>
                            <button className="p-2 hover:bg-gray-50 rounded-full text-gray-400 transition-colors">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Feed */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8f9fa]">
                            {/* Messages */}
                            {selectedConversation.messages.map((msg: any) => (
                                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] ${msg.isMe
                                        ? 'bg-purple-600 text-white rounded-2xl rounded-tl-none shadow-sm'
                                        : 'bg-white text-gray-800 rounded-2xl rounded-tr-none shadow-sm border border-gray-100'
                                        } p-4 relative group`}>
                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                        <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${msg.isMe ? 'text-purple-200' : 'text-gray-400'}`}>
                                            <span>{new Date(msg.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                                            {msg.isMe && <CheckCheck className="w-3 h-3" />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100 focus-within:ring-2 focus-within:ring-purple-100 focus-within:border-purple-200 transition-all">
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                                    <Smile className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <input
                                    type="text"
                                    placeholder="اكتب رسالتك..."
                                    className="flex-1 bg-transparent border-none outline-none text-gray-700 px-2 font-medium"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <button
                                    className={`p-2 rounded-xl transition-all ${messageInput.trim()
                                        ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                    onClick={handleSendMessage}
                                    disabled={!messageInput.trim()}
                                >
                                    <Send className={`w-5 h-5 ${messageInput.trim() ? '-ml-0.5' : ''} ${!messageInput.trim() ? 'rotate-0' : '-rotate-45'}`} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Send className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="font-medium">اختر محادثة للبدء</p>
                    </div>
                )}
            </div>
        </div>
    );
};
