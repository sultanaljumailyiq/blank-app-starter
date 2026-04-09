import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('البريد الإلكتروني مطلوب');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('البريد الإلكتروني غير صحيح');
      return;
    }

    setLoading(true);
    
    try {
      // محاكاة إرسال رسالة استعادة كلمة المرور
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSent(true);
    } catch (error) {
      console.error('Password reset error:', error);
      setError('حدث خطأ. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-blue-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-8 space-y-6">
          {/* Logo */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">نسيت كلمة المرور؟</h1>
            <p className="text-gray-600 mt-2">سنرسل لك رابط إعادة تعيين كلمة المرور</p>
          </div>

          {!sent ? (
            <>
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline ml-1" />
                    البريد الإلكتروني
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className={error ? 'border-red-500' : ''}
                  />
                  {error && (
                    <p className="text-red-500 text-xs mt-1">{error}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  <Mail className="w-5 h-5" />
                  {loading ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-accent-green" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">تم إرسال الرابط!</h3>
              <p className="text-gray-600">
                تحقق من بريدك الإلكتروني للحصول على رابط إعادة تعيين كلمة المرور
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
                <p>إذا لم تجد الرسالة، تحقق من مجلد البريد المزعج</p>
              </div>
            </div>
          )}

          {/* Back to Login */}
          <div className="pt-4 border-t">
            <Link 
              to="/login" 
              className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
            >
              <ArrowRight className="w-4 h-4" />
              العودة لتسجيل الدخول
            </Link>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <Link to="/" className="text-sm text-gray-600 hover:text-primary">
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};
