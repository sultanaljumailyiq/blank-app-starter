import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, CheckCheck, Check, Paperclip, FileText } from 'lucide-react';
import { Button } from '../common/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Message {
    id: number;
    sender_id: string;
    message_type: 'text' | 'price' | 'image' | 'file' | 'order_link';
    message_content: string;
    file_url?: string;
    is_read: boolean;
    created_at: string;
    sender_name?: string;
}

interface DoctorLabChatProps {
    orderId?: string;
    labId?: string;
    clinicId?: string;
    labName: string;
    labLogo?: string;
    onClose?: () => void;
}

export const DoctorLabChat: React.FC<DoctorLabChatProps> = ({ orderId, labId, labName, labLogo, onClose, clinicId }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [conversationId, setConversationId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [staffRecordId, setStaffRecordId] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user && user.role !== 'laboratory') {
            supabase.from('staff').select('id').eq('auth_user_id', user.id).maybeSingle()
                .then(({ data }) => {
                    if (data?.id) setStaffRecordId(data.id);
                });
        }
    }, [user]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize Chat
    useEffect(() => {
        const initChat = async () => {
            if (!user) return;
            if (!orderId && !labId) return;
            if (labId && !clinicId) return; // Wait for clinicId for isolation

            try {
                setLoading(true);
                let convId = null;

                if (labId) {
                    // Resolve lab.id to user_id to satisfy Foreign Key constraint
                    const { data: labData, error: labErr } = await supabase
                        .from('dental_laboratories')
                        .select('user_id')
                        .eq('id', labId)
                        .maybeSingle();

                    if (labErr || !labData?.user_id) {
                        throw new Error("لم يتم العثور على مستخدم لهذا المعمل");
                    }
                    const labUserId = labData.user_id;

                    if (clinicId) {
                        // Client-side lookup using clinicId for strict isolation
                        const { data: conv, error } = await supabase
                            .from('lab_chat_conversations')
                            .select('id')
                            .eq('clinic_id', Number(clinicId))
                            .eq('lab_id', labUserId)
                            .maybeSingle();

                        if (conv) {
                            convId = conv.id;
                        } else {
                            // Create isolated conversation client-side
                            const { data: newConv, error: insertError } = await supabase
                                .from('lab_chat_conversations')
                                .insert({
                                    clinic_id: Number(clinicId),
                                    lab_id: labUserId,
                                    staff_id: staffRecordId, // Replaced doctor_id with staff_id
                                    created_at: new Date().toISOString()
                                })
                                .select('id')
                                .single();
                            if (insertError) throw insertError;
                            convId = newConv.id;
                        }
                    } else {
                        // Fallback to existing RPC if clinicId is missing
                        const { data, error } = await supabase.rpc('get_clinic_lab_conversation', {
                            p_dental_lab_id: labId,
                            p_user_id: user.id
                        });
                        if (error) throw error;
                        convId = data;
                    }
                } else if (orderId) {
                    // Start generic chat inferred from order (used by lab side)
                    const { data, error } = await supabase.rpc('create_conversation_for_order', {
                        p_order_id: orderId,
                        p_staff_id: staffRecordId
                    });
                    if (error) throw error;
                    convId = data;
                }

                setConversationId(convId);

                // 2. Fetch Messages
                if (convId) {
                    fetchMessages(convId);
                }
            } catch (err) {
                console.error('Error initializing chat:', err);
            } finally {
                setLoading(false);
            }
        };

        initChat();
    }, [user, orderId, labId, clinicId]);

    // Fetch Messages Function
    const fetchMessages = async (convId: number) => {
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
                .eq('conversation_id', convId)
                .order('created_at', { ascending: true });

            if (error) throw error;


            // Map data to Message interface
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
                    id: m.id,
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

            // Mark as read immediately when viewing
            if (user) {
                await supabase
                    .from('lab_chat_messages')
                    .update({ is_read: true })
                    .eq('conversation_id', convId)
                    .neq('sender_id', user.id);
            }
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    };

    // Real-time Subscription
    useEffect(() => {
        if (!conversationId) return;

        // Fetch initial
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
                    const newMsg = payload.new as any;
                    fetchMessages(conversationId);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !conversationId || !user) return;
        const file = e.target.files[0];

        try {
            setSending(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${conversationId}/${Date.now()}.${fileExt}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('chat-attachments') // Needs to exist
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('chat-attachments')
                .getPublicUrl(fileName);

            // Determine Type
            const msgType = file.type.startsWith('image/') ? 'image' : 'file';

            // Insert Message directly
            const payload: any = {
                conversation_id: conversationId,
                sender_id: user.id,
                content: JSON.stringify({
                    type: msgType,
                    text: msgType === 'image' ? 'Image Attachment' : file.name,
                    file_url: publicUrl
                })
            };
            if (staffRecordId) payload.staff_record_id = staffRecordId;

            const { error: sendError } = await supabase.from('lab_chat_messages').insert(payload);

            if (sendError) {
                throw sendError;
            }

            // Update conversation last message
            await supabase.from('lab_chat_conversations').update({
                last_message_content: msgType === 'image' ? 'Image Attachment' : file.name,
                last_message_date: new Date().toISOString()
            }).eq('id', conversationId);

            // fetchMessages(conversationId); // Realtime should handle it
        } catch (err: any) {
            console.error('Upload/Send Error:', err);
            // toast.error('Fails to send file');
        } finally {
            setSending(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };


    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if ((!newMessage.trim() && !sending) || !conversationId || !user) return;

        try {
            setSending(true);
            const payload: any = {
                conversation_id: conversationId,
                sender_id: user.id,
                content: JSON.stringify({
                    type: 'text',
                    text: newMessage
                })
            };
            if (staffRecordId) payload.staff_record_id = staffRecordId;

            const { error } = await supabase.from('lab_chat_messages').insert(payload);

            if (error) throw error;

            // Update conversation last message
            await supabase.from('lab_chat_conversations').update({
                last_message: newMessage,
                last_message_date: new Date().toISOString()
            }).eq('id', conversationId);

            setNewMessage('');
            fetchMessages(conversationId); // Refresh immediately
        } catch (err) {
            console.error('Error sending message:', err);
        } finally {
            setSending(false);
        }
    };

    const handleSendOrderDetails = async () => {
        if (sending || !conversationId || !user || !orderId) return;

        try {
            setSending(true);
            const contentString = `تفاصيل الحالة للطلب رقم: #${orderId.substring(0, 8)}`;
            const payload: any = {
                conversation_id: conversationId,
                sender_id: user.id,
                content: JSON.stringify({
                    type: 'order_link',
                    text: contentString,
                    order_id: orderId
                })
            };
            if (staffRecordId) payload.staff_record_id = staffRecordId;

            const { error } = await supabase.from('lab_chat_messages').insert(payload);

            if (error) throw error;

            await supabase.from('lab_chat_conversations').update({
                last_message_content: contentString,
                last_message_date: new Date().toISOString()
            }).eq('id', conversationId);

            fetchMessages(conversationId);
        } catch (err) {
            console.error('Error sending order details:', err);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-[500px] bg-gray-50 rounded-xl overflow-hidden border border-gray-200">

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                            <Send className="w-8 h-8" />
                        </div>
                        <p>لا توجد رسائل سابقة. ابدأ المحادثة الآن</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === user?.id; // Or compare closer if needed
                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`p-3 md:p-4 text-[14px] leading-relaxed shadow-sm flex flex-col gap-1 transition-all ${isMe
                                    ? 'bg-blue-600 text-white rounded-[20px] rounded-br-[4px]'
                                    : 'bg-white text-gray-800 border border-black/[0.04] rounded-[20px] rounded-bl-[4px]'
                                    }`}>
                                    <div className="flex flex-col gap-2">
                                        {msg.message_type === 'text' && (
                                            <p className="text-sm whitespace-pre-wrap">{msg.message_content}</p>
                                        )}

                                        {/* Image Display */}
                                        {msg.message_type === 'image' && (
                                            <div className="rounded-lg overflow-hidden border border-gray-200 mt-1">
                                                <a href={msg.file_url || msg.message_content} target="_blank" rel="noopener noreferrer">
                                                    <img
                                                        src={msg.file_url || msg.message_content}
                                                        alt="attachment"
                                                        className="max-w-[200px] h-auto object-cover hover:opacity-90 transition-opacity"
                                                        loading="lazy"
                                                    />
                                                </a>
                                            </div>
                                        )}

                                        {/* Order Link Display */}
                                        {msg.message_type === 'order_link' && (
                                            <div className={`p-3 rounded-lg mt-1 flex flex-col gap-2 ${isMe ? 'bg-blue-500/20' : 'bg-gray-50 border border-gray-200'}`}>
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <FileText className="w-4 h-4 text-blue-600" />
                                                    {msg.message_content}
                                                </div>
                                            </div>
                                        )}

                                        {/* File Display */}
                                        {msg.message_type === 'file' && (
                                            <a
                                                href={msg.file_url || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`flex items-center gap-2 p-2 rounded-lg mt-1 ${isMe ? 'bg-blue-500/20 text-white hover:bg-blue-500/30' : 'bg-gray-100 text-blue-600 hover:bg-gray-200'} transition-colors`}
                                            >
                                                <Paperclip className="w-4 h-4" />
                                                <span className="text-xs underline truncate max-w-[150px]">{msg.message_content || 'ملف مرفق'}</span>
                                            </a>
                                        )}

                                        <div className={`flex items-center gap-2 mt-1 text-[10px] ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                            <span>{format(new Date(msg.created_at), 'p', { locale: ar })}</span>
                                            {!isMe && msg.sender_name && (
                                                <span className="opacity-80 font-medium truncate max-w-[100px]" title={msg.sender_name}>
                                                    {msg.sender_name}
                                                </span>
                                            )}
                                            {isMe && (
                                                <span>
                                                    {msg.is_read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    disabled={sending}
                >
                    <Paperclip className="w-5 h-5" />
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,.pdf,.doc,.docx"
                />

                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="اكتب رسالتك هنا..."
                    className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                />

                <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className={`p-2.5 rounded-full text-white shadow-md transition-all ${!newMessage.trim() || sending
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-95'
                        }`}
                >
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
            </form>
        </div >
    );
};
