import React, { useState, useEffect } from 'react';
import { ChevronLeft, MessageCircle, Search, Clock, CheckCircle2, User, Phone, Store, Paperclip, Send, MoreVertical, ArrowRight, Building2, Stethoscope, FlaskConical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useClinics } from '../../hooks/useClinics';
import { supabase } from '../../lib/supabase';

// Mock Data
const mockThreads = [
    {
        id: '1',
        sender: 'خدمة العملاء',
        senderRole: 'support',
        lastMessage: 'تم شحن طلبك رقم #18392 بنجاح، سيصلك خلال يومين.',
        time: 'منذ ساعتين',
        unread: true,
        avatarBg: 'bg-blue-100',
        avatarColor: 'text-blue-600',
        online: true
    },
    {
        id: '2',
        sender: 'تجهيزات بغداد الطبية',
        senderRole: 'supplier',
        lastMessage: 'مرحباً دكتور، المنتج الذي طلبته توفر حالياً.',
        time: 'الأمس',
        unread: true,
        avatarBg: 'bg-emerald-100',
        avatarColor: 'text-emerald-600',
        online: false
    },
    {
        id: '3',
        sender: 'النظام',
        senderRole: 'system',
        lastMessage: 'تم تأكيد استلام الدفعة المالية الخاصة بالفاتورة #9921',
        time: '20 ديسمبر',
        unread: false,
        avatarBg: 'bg-slate-100',
        avatarColor: 'text-slate-600',
        online: false
    }
];

const mockMessages = [
    { id: 1, text: 'مرحباً، هل يمكنني الاستفسار عن الطلب #18392؟', sender: 'me', time: '10:30 ص' },
    { id: 2, text: 'أهلاً بك دكتور علي. دعني أتحقق لك من الحالة.', sender: 'other', time: '10:32 ص' },
    { id: 3, text: 'تم شحن طلبك رقم #18392 بنجاح، سيصلك خلال يومين.', sender: 'other', time: '10:35 ص' },
];

export default function StoreMessagesPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { clinics } = useClinics();

    const [selectedThread, setSelectedThread] = useState<string | null>(null);
    const [messageInput, setMessageInput] = useState('');

    // Identity State
    const [actingAs, setActingAs] = useState<{ id: string, type: 'clinic' | 'lab', name: string } | null>(null);
    const [userLab, setUserLab] = useState<any>(null);

    // Fetch User Lab
    useEffect(() => {
        const fetchUserLab = async () => {
            if (user?.role === 'laboratory') {
                const { data } = await supabase.from('dental_laboratories').select('*').eq('owner_id', user.id).single();
                if (data) setUserLab(data);
            }
        }
        fetchUserLab();
    }, [user]);

    // Set Initial Identity
    useEffect(() => {
        if (!actingAs) {
            if (user?.role === 'laboratory' && userLab) {
                setActingAs({ id: userLab.id, type: 'lab', name: userLab.name });
            } else if (user?.role === 'doctor' && clinics.length > 0) {
                // Default to first clinic
                const defaultClinic = clinics.find(c => c.owner_id === user.id) || clinics[0];
                if (defaultClinic) setActingAs({ id: defaultClinic.id, type: 'clinic', name: defaultClinic.name });
            }
        }
    }, [user, clinics, userLab, actingAs]);

    const activeThread = mockThreads.find(t => t.id === selectedThread);
    const myClinics = clinics.filter(c => c.owner_id === user?.id);

    return (
        <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 h-screen flex flex-col" dir="rtl">
            <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 h-full overflow-hidden">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 h-full flex overflow-hidden">

                    {/* Threads Sidebar */}
                    <div className={`w-full md:w-80 lg:w-96 border-l border-slate-100 flex flex-col ${selectedThread ? 'hidden md:flex' : 'flex'}`}>
                        {/* Sidebar Header */}
                        <div className="p-4 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">الرسائل</h2>

                            {/* Identity Switcher */}
                            {user?.role === 'doctor' && myClinics.length > 1 && (
                                <div className="mb-4">
                                    <label className="text-xs text-slate-500 block mb-1">التحدث باسم:</label>
                                    <select
                                        className="w-full text-sm border-slate-200 rounded-lg bg-slate-50"
                                        value={actingAs?.id || ''}
                                        onChange={(e) => {
                                            const selected = clinics.find(c => c.id === e.target.value);
                                            if (selected) setActingAs({ id: selected.id, type: 'clinic', name: selected.name });
                                        }}
                                    >
                                        {myClinics.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Single Identity Display */}
                            {actingAs && (
                                <div className="mb-4 flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                                    {actingAs.type === 'clinic' ? <Stethoscope className="w-4 h-4 text-blue-600" /> : <FlaskConical className="w-4 h-4 text-rose-600" />}
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-500">تتحدث الآن باسم</p>
                                        <p className="text-sm font-bold text-slate-900">{actingAs.name}</p>
                                    </div>
                                </div>
                            )}


                            <div className="relative">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="بحث في المحادثات..."
                                    className="w-full bg-slate-50 border-none rounded-xl pr-10 py-2.5 text-sm focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        {/* Thread List */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {mockThreads.map(thread => (
                                <div
                                    key={thread.id}
                                    onClick={() => setSelectedThread(thread.id)}
                                    className={`p-3 rounded-xl cursor-pointer transition-all ${selectedThread === thread.id ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50 border border-transparent'}`}
                                >
                                    <div className="flex gap-3">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 relative ${thread.avatarBg} ${thread.avatarColor}`}>
                                            {thread.senderRole === 'support' && <User className="w-5 h-5" />}
                                            {thread.senderRole === 'supplier' && <Store className="w-5 h-5" />}
                                            {thread.senderRole === 'system' && <MessageCircle className="w-5 h-5" />}
                                            {thread.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <h3 className={`font-bold text-sm truncate ${thread.unread ? 'text-slate-900' : 'text-slate-700'}`}>
                                                    {thread.sender}
                                                </h3>
                                                <span className="text-[10px] text-slate-400">{thread.time}</span>
                                            </div>
                                            <p className={`text-xs truncate ${thread.unread ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                                                {thread.lastMessage}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={`flex-1 flex flex-col bg-slate-50/50 ${!selectedThread ? 'hidden md:flex' : 'flex'}`}>
                        {selectedThread ? (
                            <>
                                {/* Chat Header */}
                                <div className="bg-white p-4 border-b border-slate-100 flex items-center justify-between shadow-sm z-10">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setSelectedThread(null)} className="md:hidden p-2 hover:bg-slate-100 rounded-lg">
                                            <ArrowRight className="w-5 h-5 text-slate-600" />
                                        </button>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeThread?.avatarBg} ${activeThread?.avatarColor}`}>
                                            {activeThread?.senderRole === 'support' && <User className="w-5 h-5" />}
                                            {activeThread?.senderRole === 'supplier' && <Store className="w-5 h-5" />}
                                            {activeThread?.senderRole === 'system' && <MessageCircle className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{activeThread?.sender}</h3>
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-2 h-2 rounded-full ${activeThread?.online ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                                <span className="text-xs text-slate-500">{activeThread?.online ? 'متصل الآن' : 'غير متصل'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                                            <Phone className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Messages List */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {mockMessages.map(msg => (
                                        <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-start' : 'justify-end'}`}>
                                            <div className={`max-w-[75%] rounded-2xl p-4 ${msg.sender === 'me'
                                                ? 'bg-blue-600 text-white rounded-tr-none'
                                                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none shadow-sm'
                                                }`}>
                                                <p className="text-sm leading-relaxed">{msg.text}</p>
                                                <span className={`text-[10px] mt-2 block ${msg.sender === 'me' ? 'text-blue-200' : 'text-slate-400'
                                                    }`}>
                                                    {msg.time}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Input Area */}
                                <div className="bg-white p-4 border-t border-slate-100">
                                    <div className="flex items-end gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-200 transition-all">
                                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-colors">
                                            <Paperclip className="w-5 h-5" />
                                        </button>
                                        <textarea
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            placeholder="اكتب رسالتك هنا..."
                                            className="flex-1 bg-transparent border-none resize-none max-h-32 min-h-[44px] py-3 text-sm focus:ring-0"
                                            rows={1}
                                        />
                                        <button
                                            className={`p-2 rounded-xl transition-all ${messageInput.trim()
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                }`}
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                    <MessageCircle className="w-16 h-16 text-blue-200" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">اختر محادثة للبدء</h3>
                                <p className="text-slate-500 max-w-xs">تواصل مع الموردين، خدمة العملاء، وتابع طلباتك بكل سهولة من هنا.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
