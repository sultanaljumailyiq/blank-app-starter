import React, { useState, useRef, useEffect } from 'react';
import {
  Brain,
  MessageCircle,
  User,
  Image as ImageIcon,
  X,
  Send,
  Loader2,
  Sparkles
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { toast } from 'sonner';

const AI_AGENT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-agent`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  image?: string | null;
  isLoading?: boolean;
}

export const SmartDiagnosisPage: React.FC = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      content: 'مرحباً! أنا مساعدك الذكي للتشخيص. يرجى إخباري بما تشعر به في أسنانك، أو أرفق صورة لتحليلها.'
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [sessionId] = useState(() => {
    let sid = localStorage.getItem('smart_diagnosis_session_id');
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem('smart_diagnosis_session_id', sid);
    }
    return sid;
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async () => {
    if ((!currentMessage.trim() && !selectedImage) || isSending) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: currentMessage,
      image: imagePreview
    };

    setChatMessages(prev => [...prev, userMsg, { role: 'ai', content: '', isLoading: true }]);
    const msgText = currentMessage;
    const imgPreview = imagePreview;
    setCurrentMessage('');
    removeImage();
    setIsSending(true);

    try {
      const body: any = {
        session_id: sessionId,
      };

      if (imgPreview) {
        body.agent_type = 'image_analysis';
        body.message = msgText || 'حلل هذه الصورة السنية.';
        body.image_url = imgPreview;
      } else {
        body.agent_type = 'patient_assistant';
        body.message = msgText;
        // Pass conversation history (last 6 messages for context)
        const history = chatMessages
          .filter(m => !m.isLoading)
          .slice(-6)
          .map(m => ({
            role: m.role === 'ai' ? 'assistant' : 'user',
            content: m.content
          }));
        body.history = history;
      }

      const response = await fetch(AI_AGENT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ANON_KEY}`,
          'apikey': ANON_KEY,
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errData = await response.json();
        if (response.status === 429) toast.error('تم تجاوز الحد. حاول لاحقاً.');
        if (response.status === 402) toast.error('رصيد الذكاء الاصطناعي غير كافٍ.');
        throw new Error(errData.error || 'خطأ في الخادم');
      }

      const data = await response.json();
      let aiResponse = '';

      if (data.type === 'analysis') {
        if (data.result) {
          const r = data.result;
          aiResponse = `**نتائج تحليل الصورة:**\n\n`;
          if (r.diagnosis) aiResponse += `**التشخيص:** ${r.diagnosis}\n`;
          if (r.severity) aiResponse += `**الخطورة:** ${r.severity === 'high' ? 'عالية 🔴' : r.severity === 'medium' ? 'متوسطة 🟡' : 'منخفضة 🟢'}\n`;
          if (r.findings?.length) aiResponse += `\n**الملاحظات:**\n${r.findings.map((f: string) => `• ${f}`).join('\n')}\n`;
          if (r.recommendation) aiResponse += `\n**التوصية:**\n${r.recommendation}`;
          if (r.recommendations?.length && !r.recommendation) aiResponse += `\n**التوصيات:**\n${r.recommendations.map((rec: string) => `• ${rec}`).join('\n')}`;
        } else {
          aiResponse = data.raw || 'تم تحليل الصورة.';
        }
      } else {
        aiResponse = data.response || 'لا يوجد رد.';
      }

      setChatMessages(prev => {
        const updated = [...prev];
        const loadingIdx = updated.findLastIndex(m => m.isLoading);
        if (loadingIdx !== -1) {
          updated[loadingIdx] = { role: 'ai', content: aiResponse };
        }
        return updated;
      });
    } catch (error: any) {
      console.error('AI Chat Error:', error);
      setChatMessages(prev => {
        const updated = [...prev];
        const loadingIdx = updated.findLastIndex(m => m.isLoading);
        if (loadingIdx !== -1) {
          updated[loadingIdx] = { role: 'ai', content: 'عذراً، حدث خطأ أثناء المعالجة. يرجى المحاولة مرة أخرى.' };
        }
        return updated;
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="p-0 overflow-hidden shadow-xl border-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white text-center">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-1">التشخيص الذكي</h2>
              <p className="text-purple-100 text-sm">
                تحدث مع المساعد الذكي أو أرفق صورة لتحليلها
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-purple-100">مشغّل بـ Lovable AI</span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-[420px] overflow-y-auto p-5 space-y-4 bg-gray-50/50">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                    message.role === 'ai'
                      ? 'bg-white border border-purple-100 text-purple-600'
                      : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                  }`}>
                    {message.role === 'ai'
                      ? <Sparkles className="w-4 h-4" />
                      : <User className="w-4 h-4" />
                    }
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    message.role === 'ai'
                      ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                      : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none'
                  }`}>
                    {message.image && (
                      <div className="mb-2">
                        <img src={message.image} alt="User Upload" className="w-40 h-auto rounded-lg border border-white/20" />
                      </div>
                    )}
                    {message.isLoading ? (
                      <div className="flex gap-1 items-center h-5">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                    ) : (
                      <span className="whitespace-pre-wrap leading-relaxed">{message.content}</span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="flex items-center gap-2 mx-5 mb-1 p-2 bg-indigo-50 rounded-xl border border-indigo-100 w-fit">
                <img src={imagePreview} alt="Preview" className="w-14 h-14 object-cover rounded-lg" />
                <div className="text-xs text-indigo-700 font-medium">{selectedImage?.name}</div>
                <button onClick={removeImage} className="text-red-400 hover:bg-red-50 p-1 rounded-full ml-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />

              <div className="flex gap-2 items-end bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100 transition-all p-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                  title="رفع صورة"
                  disabled={isSending}
                >
                  <ImageIcon className="w-5 h-5" />
                </button>

                <textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={selectedImage ? 'صف الصورة أو اضغط إرسال...' : 'اكتب رسالتك هنا...'}
                  className="flex-1 bg-transparent border-0 focus:ring-0 resize-none max-h-28 min-h-[40px] py-2 text-gray-700 placeholder:text-gray-400 text-sm"
                  rows={1}
                  disabled={isSending}
                  style={{ height: 'auto' }}
                  onInput={(e) => {
                    const t = e.target as HTMLTextAreaElement;
                    t.style.height = 'auto';
                    t.style.height = t.scrollHeight + 'px';
                  }}
                />

                <button
                  onClick={handleSendMessage}
                  disabled={(!currentMessage.trim() && !selectedImage) || isSending}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    (currentMessage.trim() || selectedImage) && !isSending
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isSending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />
                  }
                </button>
              </div>
              <p className="text-center text-[10px] text-gray-400 mt-2">
                المساعد الذكي يقدم معلومات عامة فقط. يرجى مراجعة طبيب للتشخيص الدقيق.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
