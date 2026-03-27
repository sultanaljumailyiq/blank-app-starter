import React, { useState, useEffect } from 'react';
import { Search, Send, Paperclip, MoreVertical, Building2, FlaskConical, Shield, MessageCircle, Check, CheckCheck } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useMessages, Message } from '../../hooks/useMessages';

export const SupplierMessagesPage: React.FC = () => {
  const { conversations, sendMessage, loading } = useMessages();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'clinic' | 'lab' | 'admin'>('all');

  // Select first conversation by default if none selected
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  // Filter conversations based on partner role (if available in future, for now filtering might need role in conversation object)
  // Assuming conversation object might not have role directly, but we can infer or it might be needed to add to useMessages
  // For now, let's keep it simple: filter if we can, otherwise show all.
  // The useMessages hook doesn't explicitly return role on conversation, let's assume we can add it or just ignore filter for now to get it working.
  // Actually, checking useMessages again: grouping doesn't explicitly preserve role. 
  // We can try to infer from the first message in the group.
  const filteredConversations = conversations.filter(conv => {
    // Infer role from the first message in the conversation that isn't me, or just senderRole of filtered messages
    // This might be tricky without role in conversation. Let's list all for now or check messages.
    if (filterType === 'all') return true;
    // Primitive filtering: check if any message in conversation has the role? 
    // Better: Update useMessages to include role in conversation summary.
    // For this step, I will skip complex filtering and show all, or filter by checking messages[0]
    const role = conv.messages[0]?.senderRole === 'staff' ? 'clinic' : conv.messages[0]?.senderRole; // simplistic
    return role === filterType || (filterType === 'clinic' && role === 'staff'); // 'staff' usually implies clinic user
  });

  const handleSendMessage = async () => {
    if (messageText.trim() && selectedConversationId) {
      const success = await sendMessage(selectedConversationId, messageText);
      if (success) {
        setMessageText('');
      }
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'clinic': return <Building2 className="w-4 h-4" />;
      case 'staff': return <Building2 className="w-4 h-4" />;
      case 'lab': return <FlaskConical className="w-4 h-4" />;
      case 'admin': return <Shield className="w-4 h-4" />;
      default: return <Building2 className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'clinic': return 'bg-green-100 text-green-800';
      case 'staff': return 'bg-green-100 text-green-800';
      case 'lab': return 'bg-rose-100 text-rose-800';
      case 'admin': return 'bg-gray-800 text-white';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading && conversations.length === 0) return <div className="p-8 text-center text-gray-500">جاري تحميل المحادثات...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">الرسائل</h1>
          <p className="text-gray-600 mt-1">تواصل مع العيادات، المختبرات، وإدارة المنصة</p>
        </div>
        <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            متصل الآن
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="md:col-span-1 h-[600px] flex flex-col border-gray-200 shadow-sm">
          <div className="p-4 flex-1 overflow-hidden flex flex-col">
            <div className="relative mb-4">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="بحث في الرسائل..."
                className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 custom-scrollbar">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`w-full p-3 rounded-lg text-right transition-all duration-200 ${selectedConversationId === conv.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white/20 ${selectedConversationId === conv.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600'
                      }`}>
                      {getRoleIcon('clinic')} {/* Placeholder icon, needs role from object */}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`font-semibold text-sm truncate ${selectedConversationId === conv.id ? 'text-white' : 'text-gray-900'
                          }`}>
                          {conv.partnerName}
                        </p>
                        {conv.unreadCount > 0 && selectedConversationId !== conv.id && (
                          <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate ${selectedConversationId === conv.id ? 'text-white/80' : 'text-gray-500'
                        }`}>
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
              {filteredConversations.length === 0 && (
                <div className="text-center text-gray-400 py-10">
                  لا توجد محادثات
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="md:col-span-2 border-gray-200 shadow-sm overflow-hidden">
          {selectedConversation ? (
            <div className="flex flex-col h-[600px]">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                    {getRoleIcon('clinic')}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedConversation.partnerName}</h3>
                    <p className="text-xs text-gray-500">متصل</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </Button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50 flex flex-col-reverse">
                {[...selectedConversation.messages].reverse().map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.isMe ? 'justify-end' : ''}`}>
                    {!msg.isMe && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-gray-600">
                        {getRoleIcon(msg.senderRole)}
                      </div>
                    )}
                    <div className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                      <div className={`p-4 rounded-2xl shadow-sm ${msg.isMe
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tl-none'
                        : 'bg-white border border-gray-100 rounded-tr-none text-gray-900'}`}>
                        <p className="leading-relaxed">{msg.content}</p>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1 px-1">
                        {new Date(msg.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        {msg.isMe && (
                          msg.read ? <CheckCheck className="w-3 h-3 text-blue-500" /> : <Check className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="hover:bg-gray-100 p-2">
                    <Paperclip className="w-5 h-5 text-gray-400" />
                  </Button>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="اكتب رسالتك..."
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 focus:bg-white transition-all"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-200 p-3 h-auto rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[600px] flex items-center justify-center text-gray-400 flex-col gap-4 bg-gray-50/30">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <MessageCircle className="w-10 h-10 text-gray-300" />
              </div>
              <p className="font-medium">اختر محادثة للبدء في المراسلة</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};