import React, { useState, useEffect } from 'react';
import { Search, Send, Paperclip, MoreVertical, User, Building2, MessageCircle, Plus, ChevronLeft, Users } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useCommunity } from '../../hooks/useCommunity';
import { useAuth } from '../../contexts/AuthContext';
import { useStaff } from '../../hooks/useStaff';
import { useDoctorContext } from '../../contexts/DoctorContext';
import { useLocation } from 'react-router-dom';
import { useMessages } from '../../hooks/useMessages';
import { useClinicChat } from '../../hooks/useClinicChat';

export const DoctorMessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { selectedClinicId, clinics } = useDoctorContext();
  const { staff } = useStaff(selectedClinicId === 'all' ? '' : selectedClinicId || '');

  // Custom Hooks
  const { conversations, loading: messagesLoading, sendMessage: sendDirectMessage } = useMessages();
  const { messages: clinicMessages, loading: chatLoading, sendMessage: sendClinicMessage } = useClinicChat(selectedClinicId);

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>('clinic-team');
  const [messageText, setMessageText] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Hooks
  const { friends } = useCommunity();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.startConversationWith) {
      const targetUser = location.state.startConversationWith;
      setSelectedConversationId(targetUser.id);
    }
  }, [location.state]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    let success = false;
    if (selectedConversationId === 'clinic-team') {
      success = await sendClinicMessage(messageText);
    } else if (selectedConversationId) {
      success = await sendDirectMessage(selectedConversationId, messageText);
    }

    if (success) {
      setMessageText('');
    }
  };

  const startNewConversation = (contact: { id: string, name: string }) => {
    setSelectedConversationId(contact.id);
    setShowNewMessageModal(false);
    setSearchTerm('');
  };

  // Combine Clinic Chat with other conversations
  const currentClinicName = clinics.find(c => c.id === selectedClinicId)?.name || 'العيادة';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-200">
            <MessageCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">الرسائل</h1>
            <p className="text-gray-600 mt-1">تواصل مع الطاقم والإدارة</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => window.history.back()} variant="ghost" className="flex items-center gap-2">
            <ChevronLeft className="w-5 h-5" />
            رجوع
          </Button>
          <Button onClick={() => setShowNewMessageModal(true)} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            رسالة جديدة
          </Button>
        </div>
      </div>

      {/* Messages Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="md:col-span-1 h-[600px] flex flex-col border-gray-200 shadow-sm">
          <div className="p-4 flex-1 overflow-hidden flex flex-col">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="بحث..."
                className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Conversation Items */}
            <div className="space-y-2 overflow-y-auto flex-1 custom-scrollbar">
              {/* Clinic Team Fixed Item */}
              {selectedClinicId !== 'all' && (
                <button
                  onClick={() => setSelectedConversationId('clinic-team')}
                  className={`w-full p-3 rounded-lg text-right transition-all duration-200 ${selectedConversationId === 'clinic-team'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'hover:bg-gray-50 text-gray-700 bg-blue-50/50 border border-blue-100'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white/20 bg-blue-100 text-blue-600`}>
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`font-semibold text-sm truncate ${selectedConversationId === 'clinic-team' ? 'text-white' : 'text-gray-900'}`}>
                          فريق {currentClinicName}
                        </p>
                      </div>
                      <p className={`text-xs truncate ${selectedConversationId === 'clinic-team' ? 'text-white/80' : 'text-gray-500'}`}>
                        محادثة جماعية للطاقم
                      </p>
                    </div>
                  </div>
                </button>
              )}

              {conversations.length > 0 ? conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`w-full p-3 rounded-lg text-right transition-all duration-200 ${selectedConversationId === conv.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white/20 bg-gray-200 text-gray-600`}>
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`font-semibold text-sm truncate ${selectedConversationId === conv.id ? 'text-white' : 'text-gray-900'
                          }`}>
                          {conv.partnerName}
                        </p>
                        {conv.unreadCount > 0 && selectedConversationId !== conv.id && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 animate-pulse"></span>
                        )}
                      </div>
                      <p className={`text-xs truncate ${selectedConversationId === conv.id ? 'text-white/80' : 'text-gray-500'
                        }`}>
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>
                </button>
              )) : (
                conversations.length === 0 && selectedClinicId === 'all' && (
                  <div className="text-center py-10 text-gray-400">لا توجد محادثات</div>
                )
              )}
            </div>
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="md:col-span-2 border-gray-200 shadow-sm overflow-hidden">
          {selectedConversationId ? (
            <div className="flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gray-100`}>
                    {selectedConversationId === 'clinic-team' ? <Users className="w-6 h-6 text-blue-600" /> : <User className="w-6 h-6 text-gray-600" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {selectedConversationId === 'clinic-team' ? `فريق ${currentClinicName}` : conversations.find(c => c.id === selectedConversationId)?.partnerName || 'مستخدم'}
                    </h3>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
                {(selectedConversationId === 'clinic-team' ? clinicMessages : conversations.find(c => c.id === selectedConversationId)?.messages || []).map((msg: any, idx: number) => (
                  <div key={idx} className={`flex gap-3 ${msg.isMe ? 'justify-end' : ''}`}>
                    {!msg.isMe && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-200 text-xs font-bold text-gray-600`}>
                        {msg.senderName ? msg.senderName.charAt(0) : <User className="w-4 h-4" />}
                      </div>
                    )}
                    <div className="flex-1 max-w-md">
                      {!msg.isMe && selectedConversationId === 'clinic-team' && (
                        <p className="text-[10px] text-gray-500 mb-1 mr-1">{msg.senderName} ({msg.senderRole === 'owner' ? 'المالك' : 'طاقم'})</p>
                      )}
                      <div className={`${msg.isMe ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tl-none' : 'bg-white border border-gray-100 rounded-tr-none'} shadow-sm rounded-2xl p-4`}>
                        <p className={`${msg.isMe ? 'text-white' : 'text-gray-900'} leading-relaxed`}>{msg.content}</p>
                      </div>
                      <p className={`text-xs text-gray-500 mt-1 ${msg.isMe ? 'mr-2 text-left' : 'ml-2'}`}>
                        {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {(selectedConversationId === 'clinic-team' && clinicMessages.length === 0) && (
                  <div className="text-center py-10 text-gray-400">ابدأ المحادثة مع فريق العيادة</div>
                )}
              </div>

              {/* Message Input */}
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
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-200 p-3 h-auto rounded-xl"
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

      {/* New Message Modal */}
      <Modal
        isOpen={showNewMessageModal}
        onClose={() => {
          setShowNewMessageModal(false);
          setSearchTerm('');
        }}
        title="رسالة جديدة"
      >
        <div className="space-y-4 min-h-[400px]">
          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors"
            />
          </div>

          <div className="grid gap-3 max-h-[400px] overflow-y-auto">
            {/* Combine Staff and Friends */}
            {[...staff.map(s => ({ id: s.id, name: s.name, role: 'staff' })),
            ...friends.map(f => ({ id: f.id, name: f.name, role: f.role }))]
              .filter((c: any) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((contact: any) => (
                <button
                  key={contact.id}
                  onClick={() => startNewConversation(contact)}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-right group"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{contact.name}</h4>
                    <p className="text-sm text-gray-500">
                      {contact.role}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
