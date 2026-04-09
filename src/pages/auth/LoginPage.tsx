import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, Zap, Mail, Lock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePlatform } from '../../contexts/PlatformContext';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/layout/Header';
import { supabase } from '../../lib/supabase';

export const LoginPage: React.FC = () => {
  const { t } = useLanguage();
  const { login, register } = useAuth();
  const { settings } = usePlatform();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'doctor' | 'supplier' | 'laboratory' | 'admin'>('doctor');
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [loginMode, setLoginMode] = useState<'normal' | 'quick'>('normal');

  // Handle URL parameters to set role automatically
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'doctor' || roleParam === 'supplier' || roleParam === 'laboratory') {
      setRole(roleParam);
    }
  }, [searchParams]);

  // Auto-redirect if authenticated
  const { isAuthenticated, user: authUser } = useAuth(); // Destructure properly
  useEffect(() => {
    if (isAuthenticated && authUser) {
      const targetRole = authUser.role || 'newuser';
      if (targetRole === 'admin') navigate('/admin');
      else if (targetRole === 'supplier') navigate('/supplier');
      else if (targetRole === 'laboratory') navigate('/laboratory');
      else if (targetRole === 'doctor') navigate('/doctor');
      // If targetRole is 'newuser' or missing, we stay so the CompleteRegistrationModal shows
    }
  }, [isAuthenticated, authUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password, role);
      // Auto-redirection is handled by the useAuth useEffect hook above
    } catch (error) {
      console.error('Login error:', error);
      alert('فشل تسجيل الدخول. الرجاء التحقق من البيانات.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    setLoading(true);
    // Use distinct demo emails (Original to keep DB links)
    const demoEmail = role === 'doctor' ? 'doctor.demo@smartdental.com' : role === 'supplier' ? 'supplier.demo@smartdental.com' : role === 'laboratory' ? 'lab.demo@smartdental.com' : 'admin.demo@smartdental.com';
    const demoPassword = 'Password123!';
    const legacyPassword = 'password123';
    const simplePassword = '123456';

    try {
      // 1. Try to login with main password
      await login(demoEmail, demoPassword, role);

      // Force check and navigate
      console.log('Login promised resolved. Checking navigation...');
      const targetRole = role; // Use strict role from state
      if (targetRole === 'admin') navigate('/admin');
      else if (targetRole === 'supplier') navigate('/supplier');
      else if (targetRole === 'laboratory') navigate('/laboratory');
      else navigate('/doctor');

    } catch (error1) {
      console.error('Login attempt 1 failed:', error1);
      try {
        // 2. Try legacy password
        await login(demoEmail, legacyPassword, role);
        setTimeout(() => navigateBasedOnRole(role), 100);
      } catch (error2) {
        console.error('Login attempt 2 failed:', error2);
        try {
          // 3. Try simple password
          await login(demoEmail, simplePassword, role);
          setTimeout(() => navigateBasedOnRole(role), 100);
        } catch (error3) {
          console.error('Login attempt 3 failed:', error3);
          // 4. Try registration
          try {
            const demoName = role === 'doctor' ? 'د. أحمد علي (تجريبي)' : role === 'supplier' ? 'شركة المورد (تجريبي)' : role === 'laboratory' ? 'مختبر بابل (تجريبي)' : 'مدير النظام (تجريبي)';
            const demoPhone = '+9647700000000';
            await register(demoEmail, demoPassword, demoName, role, demoPhone);
            setTimeout(() => navigateBasedOnRole(role), 1000);
          } catch (regError: any) {
            console.error('Auto-registration failed:', regError);
            if (regError?.message?.includes('already registered') || regError?.message?.includes('duplicate')) {
              alert(`فشل الدخول: كلمة المرور للحساب ${demoEmail} غير صحيحة ولا يمكن استعادتها تلقائياً.\n\nيرجى محاولة الدخول يدوياً إذا كنت تعرف كلمة المرور، أو استخدام تسجيل دخول جديد.`);
            } else {
              alert(`فشل الدخول السريع: ${regError?.message || 'خطأ غير معروف'}`);
            }
          }
        }
      }
    } finally {
      if (loading) setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    try {
      setLoadingProvider(provider);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
      alert('فشل الدخول بحساب التواصل الاجتماعي');
    } finally {
      setLoadingProvider(null);
    }
  };

  const navigateBasedOnRole = (r: string) => {
    if (r === 'admin') {
      navigate('/admin');
    } else {
      navigate(r === 'doctor' ? '/doctor' : r === 'supplier' ? '/supplier' : '/laboratory');
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-primary via-primary-dark to-blue-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="p-4 sm:p-8 space-y-6">
            {/* Logo */}
            <div className="text-center">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt="Logo" className="w-24 h-24 mx-auto mb-4 object-contain rounded-3xl" />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">S</span>
                </div>
              )}
              <h1 className="text-2xl font-bold text-gray-900">{t('login')}</h1>
            </div>

            {/* Login Mode Selector */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setLoginMode('normal')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${loginMode === 'normal'
                  ? 'bg-white text-primary shadow-md'
                  : 'text-gray-600'
                  }`}
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل دخول عادي</span>
              </button>
              <button
                type="button"
                onClick={() => setLoginMode('quick')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${loginMode === 'quick'
                  ? 'bg-white text-accent-green shadow-md'
                  : 'text-gray-600'
                  }`}
              >
                <Zap className="w-4 h-4" />
                <span>دخول سريع تجريبي</span>
              </button>
            </div>

            {/* Role Selector for Quick Login */}
            {loginMode === 'quick' && (
              <div className="space-y-2 p-3 bg-gray-50 border border-gray-100 rounded-xl animate-fade-in mb-4">
                <p className="text-center text-xs font-bold text-gray-700 mb-1">اختر الدور أو نوع الحساب</p>
                <div className="flex gap-2 p-1 bg-gray-100/80 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setRole('doctor')}
                    className={`flex-1 py-1.5 px-2 rounded-md text-sm font-bold transition-all flex items-center justify-center ${role === 'doctor'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600'
                      }`}
                  >
                    طبيب
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('supplier')}
                    className={`flex-1 py-1.5 px-2 rounded-md text-sm font-bold transition-all flex items-center justify-center ${role === 'supplier'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600'
                      }`}
                  >
                    مورد
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('laboratory')}
                    className={`flex-1 py-1.5 px-2 rounded-md text-sm font-bold transition-all flex items-center justify-center ${role === 'laboratory'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600'
                      }`}
                  >
                    مختبر
                  </button>
                </div>
              </div>
            )}

            {/* Normal Login Form */}
            {loginMode === 'normal' && (
              <div className="space-y-4">
                {/* Social Logins */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center justify-center gap-2 bg-white"
                    onClick={() => handleOAuthLogin('google')}
                    disabled={loading || !!loadingProvider}
                  >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                    {loadingProvider === 'google' ? 'جاري التحويل...' : 'Google'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center justify-center gap-2 bg-[#1877F2] text-white hover:bg-[#1865F2]"
                    onClick={() => handleOAuthLogin('facebook')}
                    disabled={loading || !!loadingProvider}
                  >
                    <img src="https://www.svgrepo.com/show/354981/facebook-option.svg" alt="Facebook" className="w-5 h-5 brightness-0 invert" />
                    {loadingProvider === 'facebook' ? 'جاري التحويل...' : 'Facebook'}
                  </Button>
                </div>

                <div className="flex items-center gap-4 text-gray-500 text-sm">
                  <span className="flex-1 h-px bg-gray-200"></span>
                  أو بالبريد الإلكتروني
                  <span className="flex-1 h-px bg-gray-200"></span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline ml-1" />
                      {t('email')}
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="example@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock className="w-4 h-4 inline ml-1" />
                      {t('password')}
                    </label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="text-right">
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                      {t('forgotPassword')}
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={loading || !!loadingProvider}
                  >
                    {loading ? 'جاري الدخول...' : t('login')}
                  </Button>
                </form>
              </div>
            )}

            {/* Quick Login */}
            {loginMode === 'quick' && (
              <div className="space-y-4">
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                  <Zap className="w-12 h-12 text-accent-green mx-auto mb-2" />
                  <h3 className="font-bold text-lg text-gray-900 mb-2">تسجيل دخول سريع</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    استخدم هذا الخيار للدخول السريع للتجربة بدون إنشاء حساب
                  </p>
                  <div className="bg-white rounded-lg p-3 text-right text-sm mb-4">
                    <p className="text-gray-700">
                      <strong>نوع الحساب:</strong> {role === 'doctor' ? 'طبيب أسنان' : role === 'supplier' ? 'مورد' : 'إدارة المنصة'}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      سيتم استخدام حساب تجريبي للوصول السريع
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    className="w-full bg-accent-green hover:bg-green-600 flex items-center justify-center gap-2"
                    onClick={handleQuickLogin}
                    disabled={loading}
                  >
                    <Zap className="w-5 h-5" />
                    {loading ? 'جاري الدخول...' : 'دخول سريع للتجربة'}
                  </Button>
                </div>
              </div>
            )}

            {/* Register Link */}
            <div className="text-center text-sm text-gray-600">
              ليس لديك حساب؟{' '}
              <Link to="/register" className="text-primary font-bold hover:underline underline-offset-4 transition-all duration-200">
                إنشاء حساب جديد
              </Link>
            </div>

            {/* Quick Login Options */}


            {/* Quick Links */}
            <div className="pt-4 border-t text-center space-y-2">
              <div className="flex justify-center items-center gap-4 text-xs text-gray-500 relative">
                <Link to="/privacy-policy" className="hover:text-primary">سياسة الخصوصية</Link>
                <span>•</span>
                <Link to="/terms-of-service" className="hover:text-primary">الشروط والأحكام</Link>

                {/* Hidden Admin Button */}
                <button
                  type="button"
                  onClick={() => { setLoginMode('quick'); setRole('admin'); }}
                  className="w-4 h-4 rounded-md bg-gray-400 opacity-20 hover:opacity-100 hover:bg-gray-500 transition-all absolute left-0 flex items-center justify-center text-[10px] text-white font-bold"
                  title="Admin"
                >
                  A
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};
