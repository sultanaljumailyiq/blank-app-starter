import React, { useState, useEffect } from 'react';
import { Search, Send, Paperclip, MoreVertical, Building2, Shield } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { supabase } from '../../lib/supabase';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'clinic' | 'admin';
  content: string;
  timestamp: string;
  read: boolean;
}

import { useAuth } from '../../contexts/AuthContext';

export const LaboratoryMessages: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'clinic' | 'admin'>('all');
  const [loading, setLoading] = useState(true);

  // Fetch Messages on Mount
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        // 1. Fetch messages addressed to this lab (lab-1)
        if (!user) {
          setLoading(false);
          return;
        }

        // 1. Fetch messages addressed to this lab
        const { data: msgsData, error } = await supabase
          .from('messages')
          .select('*')
          .eq('receiver_id', user.id) // Use Real ID
          .order('created_at', { ascending: false });

        if (error) throw error;

        // 2. Resolve Sender Names
        const enrichedMessages = await Promise.all((msgsData || []).map(async (msg: any) => {
          let senderName = 'Unknown';

          if (msg.sender_role === 'clinic') {
            const { data: clinic } = await supabase
              .from('clinics')
              .select('name')
              .eq('id', msg.sender_id)
              .single();
            senderName = clinic?.name || 'Unknown Clinic';
          } else if (msg.sender_role === 'admin') {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', msg.sender_id)
              .single();
            senderName = profile?.full_name || 'System Admin';
          }

          return {
            id: msg.id,
            senderId: msg.sender_id,
            senderName,
            senderRole: msg.sender_role,
            content: msg.content,
            timestamp: msg.created_at,
            read: msg.read
          };
        }));

        setMessages(enrichedMessages);
        if (enrichedMessages.length > 0) {
          setSelectedConversation(enrichedMessages[0].id);
        }

      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user]);

  const filteredMessages = messages.filter(msg =>
    filterType === 'all' || msg.senderRole === filterType
  );

  const selectedMessage = messages.find(msg => msg.id === selectedConversation);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Logic to send reply would go here
      // For now just clear input
      setMessageText('');
    }
  };

  const getRoleIcon = (role: 'clinic' | 'admin') => {
    switch (role) {
      case 'clinic':
        return <Building2 className="w-4 h-4" />;
      case 'admin':
        return <Shield className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: 'clinic' | 'admin') => {
    switch (role) {
      case 'clinic':
        return 'bg-blue-100 text-blue-800';
      case 'admin':
        return 'bg-gray-800 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: 'clinic' | 'admin') => {
    switch (role) {
      case 'clinic': return 'عيادة';
      case 'admin': return 'إدارة';
      default: return role;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">جاري تحميل الرسائل...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">الرسائل (المختبر)</h1>
        <p className="text-gray-600 mt-1">تواصل مع العيادات، الموردين، وإدارة المنصة</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${filterType === 'all'
            ? 'bg-rose-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          الكل
        </button>
        <button
          onClick={() => setFilterType('clinic')}
          className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${filterType === 'clinic'
            ? 'bg-rose-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          العيادات
        </button>
        <button
          onClick={() => setFilterType('admin')}
          className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${filterType === 'admin'
            ? 'bg-rose-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          الإدارة
        </button>
      </div>

      {/* Messages Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="md:col-span-1">
          <div className="p-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="بحث في الرسائل..."
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Conversation Items */}
            <div className="space-y-2">
              {filteredMessages.length > 0 ? (
                filteredMessages.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => setSelectedConversation(msg.id)}
                    className={`w-full p-3 rounded-lg text-right transition-all ${selectedConversation === msg.id
                      ? 'bg-rose-600 text-white'
                      : 'hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${selectedConversation === msg.id
                        ? 'bg-white text-rose-600'
                        : getRoleColor(msg.senderRole)
                        }`}>
                        {getRoleIcon(msg.senderRole)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`font-semibold text-sm truncate ${selectedConversation === msg.id ? 'text-white' : 'text-gray-900'
                            }`}>
                            {msg.senderName}
                          </p>
                          {!msg.read && selectedConversation !== msg.id && (
                            <span className="w-2 h-2 bg-rose-600 rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                        <p className={`text-xs truncate ${selectedConversation === msg.id ? 'text-white/80' : 'text-gray-600'
                          }`}>
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  لا توجد رسائل
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="md:col-span-2">
          {selectedMessage ? (
            <div className="flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRoleColor(selectedMessage.senderRole)}`}>
                    {getRoleIcon(selectedMessage.senderRole)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedMessage.senderName}</h3>
                    <p className="text-xs text-gray-500">
                      {getRoleLabel(selectedMessage.senderRole)}
                    </p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {/* Received Message */}
                  <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getRoleColor(selectedMessage.senderRole)}`}>
                      {getRoleIcon(selectedMessage.senderRole)}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3 max-w-md">
                        <p className="text-gray-900">{selectedMessage.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(selectedMessage.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Sent Message Example */}
                  <div className="flex gap-3 justify-end">
                    <div className="flex-1 flex flex-col items-end">
                      <div className="bg-rose-600 rounded-lg p-3 max-w-md">
                        <p className="text-white">تم استلام الطلب، جاري العمل عليه.</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date().toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Paperclip className="w-5 h-5 text-gray-600" />
                  </button>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="اكتب رسالتك..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="p-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                    disabled={!messageText.trim()}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[600px] flex items-center justify-center text-gray-500">
              اختر محادثة للبدء
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
