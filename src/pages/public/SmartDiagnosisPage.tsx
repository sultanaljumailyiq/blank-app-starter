import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  MessageCircle,
  User,
  Image as ImageIcon,
  X,
  MapPin,
  Calendar,
  Mic,
  Square,
  Volume2
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { aiService } from '../../services/ai/AIService';
import { usePublicClinics } from '../../hooks/usePublicClinics';
import { Clinic } from '../../types';

type PatientChatMessage = { role: 'user' | 'ai'; content: string; image?: string | null; clinics?: Clinic[] };

export const SmartDiagnosisPage: React.FC = () => {
  const { clinics } = usePublicClinics();
  const [chatMessages, setChatMessages] = useState<PatientChatMessage[]>([
    {
      role: 'ai',
      content: 'مرحباً! أنا مساعدك الذكي للتشخيص. يرجى إخباري بما تشعر به في أسنانك، أو أرفق صورة للتحليل.'
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const [sessionId, setSessionId] = useState<string>('');

  React.useEffect(() => {
    let sid = localStorage.getItem('smart_diagnosis_session_id');
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem('smart_diagnosis_session_id', sid);
    }
    setSessionId(sid);
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getRecommendedClinics = (text: string) => {
    const q = text.toLowerCase();
    const specialtyHints = [
      { keys: ['تقويم', 'اعوجاج'], specialty: 'تقويم' },
      { keys: ['طفل', 'اطفال', 'أطفال'], specialty: 'أطفال' },
      { keys: ['جراحة', 'خلع', 'ضرس عقل'], specialty: 'جراحة' },
      { keys: ['ألم', 'الم', 'طوارئ', 'تسوس'], specialty: 'عام' },
    ];
    const matched = specialtyHints.find(h => h.keys.some(k => q.includes(k)))?.specialty;
    const source = matched
      ? clinics.filter(c => c.specialties?.some(s => s.includes(matched)) || c.services?.some(s => s.includes(matched)))
      : clinics;
    return source.slice(0, 3);
  };

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-IQ';
    recognition.interimResults = true;
    recognition.onresult = (event: any) => setCurrentMessage(Array.from(event.results).map((r: any) => r[0]?.transcript).join(' '));
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-IQ';
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() && !selectedImage) return;
    if (isLoading) return;

    const userMsg = {
      role: 'user' as const,
      content: currentMessage,
      image: imagePreview
    };

    setChatMessages(prev => [...prev, userMsg]);
    setCurrentMessage('');
    const currentImage = imagePreview;
    removeImage();
    setIsLoading(true);

    try {
      // Always route through patient_assistant — it now supports images natively
      let base64Data: string | undefined;
      let mimeType: string | undefined;
      if (currentImage) {
        const match = currentImage.match(/^data:(image\/[^;]+);base64,(.+)$/);
        base64Data = match ? match[2] : undefined;
        mimeType = match ? match[1] : undefined;
      }

      const promptText = userMsg.content?.trim()
        || (currentImage ? 'افحص هذه الصورة بدقة وأخبرني بما تراه من مشاكل مع نصائح مناسبة.' : '');
      const recommendations = getRecommendedClinics(promptText);
      const clinicContext = recommendations.map(c => ({
        id: c.id,
        name: c.name,
        governorate: (c as any).governorate,
        address: c.address,
        specialties: c.specialties,
        booking: (c as any).isDigitalBookingEnabled
      }));

      const response = await aiService.chat(
        'patient_assistant',
        promptText,
        { registeredClinics: clinicContext, shouldRecommendClinics: recommendations.length > 0 },
        undefined,
        undefined,
        sessionId,
        base64Data,
        mimeType,
        chatMessages.map(m => ({ role: m.role === 'user' ? 'user' as const : 'assistant' as const, content: m.content })).slice(-10)
      );

      setChatMessages(prev => [...prev, {
        role: 'ai',
        content: response,
        clinics: recommendations
      }]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      setChatMessages(prev => [...prev, {
        role: 'ai',
        content: 'عذراً، حدث خطأ أثناء المعالجة. يرجى المحاولة مرة أخرى.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                المحادثة مع الوكيل الذكي
              </h2>
              <p className="text-gray-600">
                تحدث مع الوكيل للحصول على تشخيص دقيق ومفصل، أو أرفق صورة لتحليلها
              </p>
            </div>

            {/* Chat Messages */}
            <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto mb-6">
              {chatMessages.map((message, index) => (
                <div key={index} className={`mb-4 ${message.role === 'ai' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 rounded-lg ${message.role === 'ai'
                    ? 'bg-blue-100 text-blue-900'
                    : 'bg-purple-100 text-purple-900'
                    } max-w-[80%]`}>
                    {message.role === 'ai' && <Brain className="w-4 h-4 inline ml-2" />}
                    {message.role === 'user' && <User className="w-4 h-4 inline ml-2" />}

                    {message.image && (
                      <div className="mb-2 mt-1">
                        <img src={message.image} alt="User Upload" className="w-48 h-auto rounded-lg border border-purple-200" />
                      </div>
                    )}

                    <span className="mr-2 whitespace-pre-wrap">{message.content}</span>
                    {message.role === 'ai' && (
                      <button onClick={() => speakText(message.content)} className="block mt-2 text-[11px] text-blue-700 hover:text-blue-900">
                        <Volume2 className="w-3 h-3 inline ml-1" /> قراءة الرد
                      </button>
                    )}
                    {message.clinics && message.clinics.length > 0 && (
                      <div className="mt-3 grid gap-2 text-right">
                        {message.clinics.map((clinic) => (
                          <div key={clinic.id} className="bg-white/80 border border-blue-200 rounded-lg p-2 text-xs text-gray-800">
                            <div className="font-bold text-gray-900">{clinic.name}</div>
                            <div className="flex items-center gap-1 text-gray-500 mt-1"><MapPin className="w-3 h-3" />{(clinic as any).governorate || clinic.address || 'العراق'}</div>
                            <div className="text-gray-600 mt-1">{clinic.specialties?.slice(0, 2).join('، ')}</div>
                            <div className="flex gap-2 mt-2">
                              <Link to={`/clinic/${clinic.id}`} className="text-blue-700 font-bold hover:underline">عرض العيادة</Link>
                              <Link to={`/booking?clinic=${clinic.id}`} className="text-emerald-700 font-bold hover:underline"><Calendar className="w-3 h-3 inline ml-1" />حجز موعد</Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="mb-4 text-right">
                  <div className="inline-block p-3 rounded-lg bg-blue-100 text-blue-900">
                    <Brain className="w-4 h-4 inline ml-2 animate-pulse" />
                    <span className="mr-2 inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-700 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-blue-700 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-blue-700 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="mr-2 text-xs opacity-70">يحلل الصورة ويكتب الرد...</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="flex items-center gap-2 mb-4 p-2 bg-gray-100 rounded-lg w-fit">
                <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded" />
                <button onClick={removeImage} className="text-red-500 hover:bg-red-100 p-1 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Input Area */}
            <div className="flex gap-2 items-end">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />

              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                className="px-3"
                title="رفع صورة"
              >
                <ImageIcon className="w-5 h-5 text-gray-600" />
              </Button>

              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={selectedImage ? "صف الصورة أو اضغط إرسال..." : "اكتب رسالتك هنا..."}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right"
              />

              <Button
                variant="secondary"
                onClick={toggleListening}
                className="px-3"
                title={isListening ? 'إيقاف الاستماع' : 'تحدث صوتياً'}
              >
                {isListening ? <Square className="w-5 h-5 text-red-600" /> : <Mic className="w-5 h-5 text-gray-600" />}
              </Button>

              <Button
                onClick={handleSendMessage}
                disabled={(!currentMessage.trim() && !selectedImage) || isLoading}
                className="px-4"
              >
                {isLoading ? '...' : 'إرسال'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};