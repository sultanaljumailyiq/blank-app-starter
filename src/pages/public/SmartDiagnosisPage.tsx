import React, { useState, useRef } from 'react';
import {
  Brain,
  MessageCircle,
  User,
  Image as ImageIcon,
  X,
  Zap
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { aiService } from '../../services/ai/AIService';

export const SmartDiagnosisPage: React.FC = () => {
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; content: string; image?: string | null }[]>([
    {
      role: 'ai',
      content: 'مرحباً! أنا مساعدك الذكي للتشخيص. يرجى إخباري بما تشعر به في أسنانك، أو أرفق صورة للتحليل.'
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSendMessage = async () => {
    if (currentMessage.trim() || selectedImage) {
      const userMsg = {
        role: 'user' as const,
        content: currentMessage,
        image: imagePreview
      };

      setChatMessages(prev => [...prev, userMsg]);
      setCurrentMessage('');
      const currentImage = imagePreview;
      removeImage();

      try {
        let response: string;
        if (currentImage) {
          const result = await aiService.analyzeImage(currentImage, userMsg.content, sessionId);

          let analysisText = `**نتائج تحليل الصورة:**\n\n`;
          analysisText += `**التشخيص:** ${result.diagnosis || result.summary}\n`;
          analysisText += `**الخطورة:** ${result.severity === 'high' ? 'عالية 🔴' : result.severity === 'medium' ? 'متوسطة 🟡' : 'منخفضة 🟢'}\n`;
          if (result.findings && result.findings.length > 0) {
            analysisText += `\n**الملاحظات:**\n${result.findings.map(f => `- ${f}`).join('\n')}\n`;
          }
          if (result.recommendation) {
            analysisText += `\n**التوصية:**\n${result.recommendation}`;
          }
          response = analysisText;
        } else {
          // Chat Request
          const responseText = await aiService.chat('patient_assistant', userMsg.content, undefined, undefined, undefined, sessionId); // Pass sessionId
          response = responseText;
        }

        setChatMessages(prev => [...prev, {
          role: 'ai',
          content: response
        }]);
      } catch (error) {
        console.error('AI Chat Error:', error);
        setChatMessages(prev => [...prev, {
          role: 'ai',
          content: 'عذراً، حدث خطأ أثناء المعالجة. يرجى المحاولة مرة أخرى.'
        }]);
      }
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
                  </div>
                </div>
              ))}
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
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() && !selectedImage}
                className="px-4"
              >
                إرسال
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};