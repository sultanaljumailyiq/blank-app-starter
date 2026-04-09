import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageCircle,
  Send,
  Phone,
  Calendar,
  Search,
  DollarSign,
  FileText,
  Image,
  Paperclip,
  MessageSquare,
  Users,
  Building2,
  Shield,
  Truck
} from 'lucide-react';
import { BentoStatCard } from '../dashboard/BentoStatCard';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

type Conversation = {
  conversation_id: number;
  doctor_id: string;
  lab_id: string;
  order_id: string;
  last_message_date: string;
  created_at: string;
  doctor_name: string;
  lab_name: string;
  order_number: string;
  clinic_name: string; // Added Clinic Name
  clinic_logo?: string;
  last_message_content?: string;
  clinic_phone?: string;
  unread_count: number;
  type?: 'clinic' | 'admin' | 'supplier'; // Added Type for filtering
};

interface Message {
  message_id: number;
  sender_id: string;
  message_type: 'text' | 'price' | 'image' | 'file' | 'order_link';
  message_content: string;
  file_url?: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
};

export default function LabConversations() {
  const { user } = useAuth();
  const supabaseClient = supabase;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('clinics');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // جلب المحادثات
  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase.rpc('get_lab_conversations', {
        p_user_id: user?.id
      });

      if (error) throw error;

      // Map data and add mock types for demonstration if not from DB yet
      // In production, the RPC should return the type
      const mappedData = (data || []).map((conv: any) => ({
        ...conv,
        type: conv.type || (conv.doctor_id ? 'clinic' : 'admin') // Preserve RPC type if exists
      }));

      setConversations(mappedData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  // فلترة المحادثات
  useEffect(() => {
    let result = conversations;

    // Filter by Tab (Type)
    if (activeTab === 'clinics') {
      result = result.filter(c => c.type === 'clinic' || !c.type); // Default to clinic
    } else if (activeTab === 'admin') {
      result = result.filter(c => c.type === 'admin');
    } else if (activeTab === 'suppliers') {
      result = result.filter(c => c.type === 'supplier');
    }

    // Filter by Search
    if (searchTerm) {
      const lowerInfos = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.clinic_name?.toLowerCase().includes(lowerInfos) ||
        c.doctor_name.toLowerCase().includes(lowerInfos) ||
        c.order_number?.toLowerCase().includes(lowerInfos)
      );
    }

    setFilteredConversations(result);
  }, [conversations, activeTab, searchTerm]);

  // جلب رسائل المحادثة
  const fetchMessages = async (conversationId: number) => {
    try {
      const { data, error } = await supabase
        .from('lab_chat_messages')
        .select(`
            id,
            sender_id,
            content,
            is_read,
            created_at,
            profiles:sender_id(full_name),
            staff:staff_record_id(full_name)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: Message[] = (data || []).map((m: any) => {
        let parsedContent = { text: m.content as string, type: 'text', file_url: '' };
        try {
          const parsed = JSON.parse(m.content);
          parsedContent = {
            text: parsed.text || parsed.message_content || m.content,
            type: parsed.type || parsed.message_type || 'text',
            file_url: parsed.file_url || ''
          };
        } catch (e) {
          // It's just a regular text string
        }

        return {
          message_id: m.id,
          sender_id: m.sender_id,
          message_type: parsedContent.type as "text" | "price" | "image" | "file" | "order_link",
          message_content: parsedContent.text,
          file_url: parsedContent.file_url,
          is_read: m.is_read,
          created_at: m.created_at,
          sender_name: m.staff?.full_name || m.profiles?.full_name || 'System'
        };
      });
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // إرسال رسالة
  const sendMessage = async (type: 'text' | 'price' | 'order_link' | 'image' | 'file' = 'text', customContent?: string, fileUrl?: string) => {
    if (!selectedConversation) return;
    if (type === 'text' && !newMessage.trim()) return;

    setSendingMessage(true);
    try {
      let content = newMessage;
      let messageType = type;

      if (type === 'order_link') {
        content = customContent || '';
      } else if (type === 'image' || type === 'file') {
        content = customContent || 'مرفق';
      }

      const payloadContent: any = {
        type: messageType,
        text: content
      };
      if (fileUrl) payloadContent.file_url = fileUrl;

      const { error } = await supabase.from('lab_chat_messages').insert({
        conversation_id: selectedConversation.conversation_id,
        sender_id: user?.id,
        content: JSON.stringify(payloadContent)
      });

      if (error) throw error;

      // Update conversation last message
      await supabase.from('lab_chat_conversations').update({
        last_message: type === 'image' ? 'صورة مرفقة' : type === 'file' ? 'ملف مرفق' : content.substring(0, 50),
        last_message_date: new Date().toISOString()
      }).eq('id', selectedConversation.conversation_id);

      // تحديث الرسائل
      await fetchMessages(selectedConversation.conversation_id);

      // مسح الرسالة
      setNewMessage('');

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !selectedConversation || !user) return;
    const file = e.target.files[0];

    try {
      setSendingMessage(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedConversation.conversation_id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(fileName);

      const msgType = file.type.startsWith('image/') ? 'image' : 'file';
      await sendMessage(msgType, file.name, publicUrl);

    } catch (err) {
      console.error('Upload Error:', err);
    } finally {
      setSendingMessage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // تحديد المحادثة
  const selectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    await fetchMessages(conversation.conversation_id);

    // تحديد الرسائل كمقروءة
    if (conversation.unread_count > 0 && user) {
      await supabase
        .from('lab_chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversation.conversation_id)
        .neq('sender_id', user.id);

      // تحديث عدد الرسائل غير المقروءة
      setConversations(prev =>
        prev.map(conv =>
          conv.conversation_id === conversation.conversation_id
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );
    }
  };

  // تحميل المحادثات عند تحميل المكون
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // استماع للتحديثات الحية للرسائل
  useEffect(() => {
    if (!selectedConversation) return;

    const conversationId = selectedConversation.conversation_id;

    // Fetch initial to make sure it's up to date
    fetchMessages(conversationId);

    const channel = supabase
      .channel(`lab_chat_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lab_chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          fetchMessages(conversationId);
          fetchConversations(); // Update unread count and latest message on the side panel
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  // إحصائيات للمحادثات
  const totalConversations = conversations.length;
  const unreadMessages = conversations.reduce((sum, c) => sum + c.unread_count, 0);
  const connectedClinics = new Set(conversations.map(c => c.clinic_name)).size;
  // Account for files in the currently active thread, or 0 if none.
  const sharedFiles = messages.filter(m => m.file_url).length;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* إحصائيات المحادثات - Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        <BentoStatCard
          title="المحادثات النشطة"
          value={totalConversations}
          icon={MessageSquare}
          color="blue"
          delay={0}
        />
        <BentoStatCard
          title="رسائل غير مقروءة"
          value={unreadMessages}
          icon={MessageCircle}
          color="red"
          delay={100}
          trend={unreadMessages > 0 ? "down" : "neutral"}
          trendValue={unreadMessages > 0 ? "يتطلب رد" : "الكل مقروء"}
        />
        <BentoStatCard
          title="العيادات المتصلة"
          value={connectedClinics}
          icon={Building2}
          color="green"
          delay={200}
          trend={connectedClinics > 0 ? "up" : "neutral"}
          trendValue="نشط"
        />
        <BentoStatCard
          title="الملفات المتبادلة"
          value={sharedFiles}
          icon={Paperclip}
          color="purple"
          delay={300}
          trendValue="في هذه المحادثة"
        />
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* قائمة المحادثات - Bento Style */}
        <div className="w-1/3 min-w-[320px] bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              المحادثات
            </h3>

            {/* Tabs for filtering - only clinics and admin */}
            <Tabs defaultValue="clinics" value={activeTab} onValueChange={setActiveTab} className="w-full mb-3">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="clinics">العيادات</TabsTrigger>
                <TabsTrigger value="admin">إدارة المنصة</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في المحادثات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 bg-white/50 border-white/20 focus:bg-white transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              {filteredConversations.length === 0 ? (
                <div className="text-center text-muted-foreground p-8 flex flex-col items-center">
                  <MessageCircle className="h-10 w-10 opacity-20 mb-2" />
                  <p>لا توجد محادثات هنا</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.conversation_id}
                      onClick={() => selectConversation(conversation)}
                      className={`p - 3 cursor - pointer rounded - xl transition - all border border - transparent ${selectedConversation?.conversation_id === conversation.conversation_id
                        ? 'bg-white shadow-sm border-white/20'
                        : 'hover:bg-white/40'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12 border border-white/20 bg-blue-50">
                          {activeTab === 'admin' ? (
                            <div className="w-full h-full flex items-center justify-center text-blue-600">
                              <Shield className="h-6 w-6" />
                            </div>
                          ) : (
                            <>
                              <AvatarImage src={conversation.clinic_logo || "/avatars/clinic-default.png"} alt={conversation.clinic_name} className="object-cover" />
                              <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                                {conversation.clinic_name?.[0] || 'C'}
                              </AvatarFallback>
                            </>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-bold truncate text-gray-900 text-sm">
                              {activeTab === 'admin' ? 'إدارة المنصة' : conversation.clinic_name || 'عيادة غير معروفة'}
                            </p>
                            {conversation.unread_count > 0 && (
                              <Badge variant="destructive" className="text-[10px] h-5 min-w-5 flex items-center justify-center px-1">
                                {conversation.unread_count}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-1 pt-1 opacity-70">
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {conversation.last_message_content || 'لا توجد رسائل'}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {format(new Date(conversation.last_message_date), 'HH:mm')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* منطقة الرسائل - Bento Style */}
        <div className="flex-1 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/30">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-white/20 bg-white">
                    {activeTab === 'admin' ? (
                      <div className="w-full h-full flex items-center justify-center text-blue-600">
                        <Shield className="h-5 w-5" />
                      </div>
                    ) : (
                      <>
                        <AvatarImage src={selectedConversation.clinic_logo || "/avatars/clinic-default.png"} alt={selectedConversation.clinic_name} className="object-cover" />
                        <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                          {selectedConversation.clinic_name?.[0] || 'C'}
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      {activeTab === 'admin' ? 'إدارة المنصة' : selectedConversation.clinic_name}
                      {activeTab === 'clinics' && <Badge variant="outline" className="text-[10px] font-normal border-blue-200 text-blue-600 bg-blue-50/50">عيادة</Badge>}
                    </h3>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="bg-white/50 border-white/20 hover:bg-white text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    اتصال
                  </Button>

                </div>
              </div>

              {/* الرسائل */}
              <div className="flex-1 overflow-hidden relative bg-white/20">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isMe = message.sender_id === user?.id;
                      return (
                        <div
                          key={message.message_id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'} `}
                        >
                          <div
                            className={`max-w-[70%] md:max-w-[60%] flex flex-col gap-1 p-3.5 shadow-sm transition-all text-[14px] leading-relaxed ${isMe
                                ? 'bg-blue-600 text-white rounded-[20px] rounded-br-[4px]'
                                : 'bg-white text-gray-800 border border-black/[0.04] rounded-[20px] rounded-bl-[4px]'
                              } `}
                          >
                            {message.message_type === 'price' ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4" />
                                  <span className="font-medium">عرض سعر</span>
                                </div>
                                {(() => {
                                  try {
                                    const priceData = JSON.parse(message.message_content);
                                    return (
                                      <div className="space-y-1">
                                        <p>الخدمة: {priceData.service_type}</p>
                                        <p>السعر: {priceData.amount} د.ع</p>
                                        {priceData.notes && (
                                          <p className="text-sm opacity-80">
                                            {priceData.notes}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  } catch {
                                    return <p>{message.message_content}</p>;
                                  }
                                })()}
                              </div>
                            ) : message.message_type === 'order_link' ? (
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                  <FileText className={`h-4 w-4 ${message.sender_id === user?.id ? 'text-blue-100' : 'text-blue-600'}`} />
                                  {message.message_content}
                                </div>
                              </div>
                            ) : (
                              <p>{message.message_content}</p>
                            )}
                            <div className={`flex items-center justify-between gap-3 mt-1 text-[10px] ${message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-400'}`}>
                              <span>{format(new Date(message.created_at), 'HH:mm')}</span>
                              {message.sender_name && !isMe && (
                                <span className="opacity-80 truncate max-w-[130px] font-medium" title={message.sender_name}>
                                  {message.sender_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>

              {/* منطقة إرسال الرسالة */}
              <div className="border-t border-white/10 p-4 bg-white/30 flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors"
                  disabled={sendingMessage}
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <Input
                  placeholder="اكتب رسالتك..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage('text');
                    }
                  }}
                  className="flex-1 bg-white/50 border-white/20 focus:bg-white transition-all rounded-full px-4"
                />
                <Button
                  onClick={() => sendMessage('text')}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="rounded-full px-4"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground p-8 bg-white/20 rounded-3xl backdrop-blur-sm">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-30 text-blue-500" />
                <p className="text-lg font-medium text-gray-600">اختر {activeTab === 'clinics' ? 'عيادة' : 'إدارة المنصة'} للتواصل</p>
                <p className="text-sm opacity-60">يمكنك التواصل ومتابعة الطلبات مباشرة</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}