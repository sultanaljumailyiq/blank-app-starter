import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Send, Search, ArrowRight, User, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { BottomNavigation } from '../../components/layout/BottomNavigation';
import { useMessages } from '../../hooks/useMessages';

export default function MessagesPage() {
  const { conversations, sendMessage, loading } = useMessages();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Local helper for fetching current user ID - handled in hook but useful here for UI check? 
  // Hook handles "isMe" on messages so we don't strictly need it unless we want to filter manually.

  const filteredConversations = conversations.filter(c =>
    c.partnerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find(c => c.partnerId === selectedConversationId);

  const handleSendMessage = async () => {
    if (messageText.trim() && selectedConversationId) {
      const success = await sendMessage(selectedConversationId, messageText);
      if (success) {
        setMessageText('');
      }
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'اليوم';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'أمس';
    } else {
      return d.toLocaleDateString('ar-IQ', { day: 'numeric', month: 'short' });
    }
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-slate-500">جاري تحميل الرسائل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 pb-20" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {selectedConversationId ? (
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => setSelectedConversationId(null)}
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            ) : (
              <Link to="/store">
                <Button variant="ghost" className="text-white hover:bg-white/20">
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            )}

            <h1 className="text-xl font-bold flex items-center gap-2">
              {selectedConversationId ? (
                <>
                  <User className="w-6 h-6" />
                  {selectedConv?.partnerName}
                </>
              ) : (
                <>
                  <MessageCircle className="w-6 h-6" />
                  الرسائل
                </>
              )}
            </h1>
            <div className="w-10" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {!selectedConversationId ? (
          /* Conversations List */
          <>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="البحث في المحادثات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Conversations */}
            {filteredConversations.length === 0 ? (
              <Card className="text-center py-16">
                <MessageCircle className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  لا توجد محادثات
                </h3>
                <p className="text-gray-500 mb-6">
                  {loading ? 'جاري التحميل...' : 'لم تقم بإجراء أي محادثات بعد'}
                </p>
                <Link to="/store">
                  <Button>تصفح المنتجات</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredConversations.map((conv) => (
                  <Card
                    key={conv.partnerId}
                    className="cursor-pointer hover:shadow-lg transition-all duration-300"
                    onClick={() => setSelectedConversationId(conv.partnerId)}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {conv.partnerName.charAt(0)}
                          </div>
                        </div>

                        {/* Message Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-gray-800 truncate">
                              {conv.partnerName}
                            </h3>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatDate(conv.timestamp)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-gray-800 font-semibold' : 'text-gray-600'
                              }`}>
                              {conv.lastMessage}
                            </p>

                            {conv.unreadCount > 0 && (
                              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Chat View */
          selectedConv ? (
            <>
              {/* Partner Info Card */}
              <Link to={`/store/supplier/${selectedConv.partnerId}`} onClick={(e) => {
                // Only confirm navigation if it's surely a supplier. For now, allow it or prevent default if user.
                // e.preventDefault();
              }}>
                <Card className="mb-4 hover:shadow-lg transition-all">
                  <div className="p-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      {selectedConv.partnerName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">
                        {selectedConv.partnerName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedConv.partnerRole === 'supplier' ? 'مورد' : 'مستخدم'}
                      </p>
                    </div>
                    {/* Only show arrow if it is a supplier link */}
                    <ArrowRight className="w-5 h-5 text-gray-400 transform rotate-180" />
                  </div>
                </Card>
              </Link>

              {/* Messages */}
              <Card className="mb-4 h-[500px] overflow-y-auto">
                <div className="p-4 space-y-4">
                  {selectedConv.messages.map((msg) => {
                    const isOwn = msg.isMe;

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? 'justify-start' : 'justify-end'}`} // RTL: isOwn -> Right (Start in LTR logic but wait.. RTL: Start is Right. Yes. Wait.
                      // Standard chat: Me is on Rights side? No, usually Me is Right, Other is Left.
                      // In RTL, Right is "Start". So Me -> Start.
                      >
                        <div className={`max-w-[75%] ${isOwn ? 'order-1' : 'order-2'}`}>
                          {/* Logic Flip Check:
                           Default Flex: Row.
                           RTL: Start = Right. End = Left.
                           I want ME to be on LEFT or RIGHT?
                           Usually Me on Right (Start in RTL).
                           So isOwn -> justify-start? Yes.
                           Non-own -> justify-end (Left in RTL).
                           */}

                          <div className={`rounded-2xl px-4 py-3 shadow-md ${isOwn
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-none'
                            : 'bg-white border border-gray-200 rounded-bl-none'
                            }`}>
                            <p className={`text-sm ${isOwn ? 'text-white' : 'text-gray-800'}`}>
                              {msg.content}
                            </p>
                          </div>

                          <div className={`flex items-center gap-2 mt-1 px-2 ${isOwn ? 'justify-start' : 'justify-end'
                            }`}>
                            <span className="text-xs text-gray-500">
                              {formatTime(msg.timestamp)}
                            </span>
                            {isOwn && msg.read && (
                              <CheckCheck className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Message Input */}
              <Card>
                <div className="p-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="اكتب رسالتك..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-6"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <div className="text-center py-20">
              <p>لم يتم العثور على المحادثة</p>
            </div>
          )
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
