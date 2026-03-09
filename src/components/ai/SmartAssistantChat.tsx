import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Paperclip, X, FileText, Image as ImageIcon, FileSpreadsheet, Save } from 'lucide-react';
import { Button } from '../common/Button';
import { aiService } from '../../services/ai/AIService';

interface SmartAssistantChatProps {
    patientId?: string;
    patientName?: string;
    onSave?: (messages: Message[]) => void;
}

interface Message {
    id: string;
    sender: 'bot' | 'user';
    text: string;
    attachment?: {
        name: string;
        type: 'image' | 'file';
        url?: string; // For preview if image
        size?: string;
    };
    timestamp: Date;
    isSystem?: boolean; // For context injection messages
}

export const SmartAssistantChat: React.FC<SmartAssistantChatProps> = ({ patientId, patientName, onSave }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            sender: 'bot',
            text: `مرحباً دكتور، أنا مساعدك الذكي.${patientName ? ` أرى أنك تتصفح ملف المريض **${patientName}**.` : ''} يمكنني تحليل التقارير، الإجابة عن الأسئلة الطبية، أو المساعدة في خطط العلاج.\n\nيمكنك إرفاق ملفات أو صور للمناقشة.`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAttachedFile(file);
        }
        e.target.value = '';
    };

    const handleInjectContext = async () => {
        if (!patientName) return;

        const contextMsg: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: `قم بتحليل سجل المريض: ${patientName} (ID: ${patientId}) واعطني ملخصاً للحالة.`,
            timestamp: new Date(),
            isSystem: true
        };
        setMessages(prev => [...prev, contextMsg]);
        setIsTyping(true);

        try {
            // Using aiService for Doctor Assistant
            const responseText = await aiService.chat(
                'doctor_assistant',
                'Analyze Patient Record',
                { patientId, patientName, action: 'analyze_record' }
            );

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: responseText,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error(error);
            // Fallback error message (optional)
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'bot',
                text: 'عذراً، حدث خطأ أثناء الاتصال بخدمة الذكاء الاصطناعي.',
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() && !attachedFile) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: input,
            timestamp: new Date(),
            attachment: attachedFile ? {
                name: attachedFile.name,
                type: attachedFile.type.startsWith('image/') ? 'image' : 'file',
                url: attachedFile.type.startsWith('image/') ? URL.createObjectURL(attachedFile) : undefined,
                size: (attachedFile.size / 1024).toFixed(1) + ' KB'
            } : undefined
        };

        setMessages(prev => [...prev, newMessage]);
        setInput('');
        setAttachedFile(null);
        setIsTyping(true);

        try {
            // Construct Context
            const context = {
                patientId,
                patientName,
                attachment: newMessage.attachment
            };

            const responseText = await aiService.chat(
                'doctor_assistant',
                newMessage.text,
                context
            );

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: responseText, // The service handles the "intelligence" now
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);

        } catch (error) {
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: 'عذراً، لا يمكنني الرد حالياً. يرجى التأكد من الإعدادات.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-full min-h-0 bg-gray-50/50" style={{ height: '100%' }}>
            {/* Context Header */}
            <div className="bg-white border-b border-gray-100 p-3 px-4 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-3">
                    {patientName ? (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <User className="w-4 h-4 text-blue-500" />
                            <span>ملف المريض: <b className="text-gray-900">{patientName}</b></span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Bot className="w-4 h-4 text-purple-500" />
                            <span className="font-bold">المساعد الطبي الذكي</span>
                        </div>
                    )}

                    {/* Status Indicator */}
                    <div className="h-4 w-px bg-gray-200 mx-1"></div>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${aiService.getConfig('doctor_assistant').provider === 'mock' || !aiService.getConfig('doctor_assistant').apiKey ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                        <span className="text-[10px] font-medium text-gray-500">
                            {aiService.getConfig('doctor_assistant').provider === 'mock' || !aiService.getConfig('doctor_assistant').apiKey ? 'Demo Mode' : 'Online'}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2">
                    {onSave && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onSave(messages)}
                            className="text-xs h-8"
                        >
                            <Save className="w-3 h-3 ml-1" />
                            حفظ المحادثة
                        </Button>
                    )}
                    {patientName && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleInjectContext}
                            className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 h-8"
                        >
                            <FileSpreadsheet className="w-3 h-3 ml-1" />
                            إرسال بيانات المريض
                        </Button>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 h-0 overflow-y-auto p-4 space-y-6">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 group ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>

                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-1 ${msg.sender === 'user' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' : 'bg-white border text-purple-600'}`}>
                            {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Sparkles className="w-4 h-4" />}
                        </div>

                        {/* Bubble */}
                        <div className={`max-w-[80%] space-y-1`}>
                            {/* Attachment Bubble */}
                            {msg.attachment && (
                                <div className={`mb-2 p-3 rounded-xl border flex items-center gap-3 ${msg.sender === 'user' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white border-gray-200'
                                    }`}>
                                    <div className={`p-2 rounded-lg ${msg.sender === 'user' ? 'bg-white/20' : 'bg-gray-100'}`}>
                                        {msg.attachment.type === 'image' ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-sm truncate">{msg.attachment.name}</p>
                                        <p className={`text-xs ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>{msg.attachment.size}</p>
                                    </div>
                                    {msg.attachment.type === 'image' && msg.attachment.url && (
                                        <div className="w-10 h-10 rounded bg-black/20 overflow-hidden ml-auto">
                                            <img src={msg.attachment.url} className="w-full h-full object-cover" alt="preview" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Text Bubble */}
                            {msg.text && (
                                <div className={`p-3.5 px-5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-line ${msg.sender === 'user'
                                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                    }`}>
                                    {msg.text}
                                </div>
                            )}

                            {/* Timestamp */}
                            <p className={`text-[10px] text-gray-400 px-1 ${msg.sender === 'user' ? 'text-left' : 'text-right'}`}>
                                {msg.timestamp.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-white border text-purple-600 flex items-center justify-center shrink-0 shadow-sm mt-1">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center h-12 w-20 justify-center">
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 relative z-20">
                {attachedFile && (
                    <div className="flex items-center gap-2 mb-3 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100 w-fit animate-in fade-in slide-in-from-bottom-2">
                        <div className="bg-white p-1.5 rounded shadow-sm text-indigo-600">
                            {attachedFile.type.startsWith('image/') ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <span className="text-sm font-medium text-indigo-900 truncate max-w-[200px]">{attachedFile.name}</span>
                        <button onClick={() => setAttachedFile(null)} className="hover:bg-indigo-100 p-1 rounded-full transition-colors ml-2">
                            <X className="w-4 h-4 text-indigo-500" />
                        </button>
                    </div>
                )}

                <div className="flex items-end gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors h-10 w-10 p-0 flex items-center justify-center"
                        title="إرفاق ملف"
                    >
                        <Paperclip className="w-5 h-5" />
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                    />

                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="اكتب استفسارك هنا..."
                        className="flex-1 bg-transparent border-0 focus:ring-0 resize-none max-h-32 min-h-[44px] py-2.5 text-gray-700 placeholder:text-gray-400"
                        rows={1}
                        style={{ height: 'auto', overflow: 'hidden' }}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = target.scrollHeight + 'px';
                        }}
                    />

                    <Button
                        onClick={handleSend}
                        disabled={(!input.trim() && !attachedFile) || isTyping}
                        className={`rounded-xl aspect-square p-0 w-11 h-11 flex items-center justify-center transition-all ${(input.trim() || attachedFile) ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200' : 'bg-gray-200 text-gray-400'
                            }`}
                    >
                        <Send className="w-5 h-5 ltr:ml-0.5 rtl:mr-0.5" />
                    </Button>
                </div>
                <p className="text-center text-[10px] text-gray-400 mt-2">
                    المساعد الذكي قد يرتكب أخطاء. يرجى مراجعة المعلومات الطبية الهامة.
                </p>
            </div>
        </div>
    );
};
