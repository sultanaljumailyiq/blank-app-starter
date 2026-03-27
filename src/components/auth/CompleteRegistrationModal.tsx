import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Stethoscope, Package, TestTube, Lock, Phone } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';

export const CompleteRegistrationModal: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  const [role, setRole] = useState<'doctor' | 'supplier' | 'laboratory'>('doctor');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Only show if user is authenticated but has no role yet (or defaulted to 'newuser' by database trigger)
  if (!isAuthenticated || !user || (user.role && user.role !== 'newuser')) {
    return null;
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.startsWith('0')) val = val.substring(1);
    if (val.length <= 10) setPhone(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setError('رقم الهاتف يجب أن يتكون من 10 أرقام');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // 1. Update Auth Metadata and potentially Password
      const metadataUpdates: any = { role, phone: `+964${phone}` };
      
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        password: password ? password : undefined,
        data: metadataUpdates
      });
      
      if (authError) throw authError;

      // 2. Insert into profiles with full name from metadata or default
      const { error: profileError } = await supabase.from('profiles').upsert([{
        id: user.id,
        email: user.email,
        full_name: user.name,
        role,
        phone: `+964${phone}`,
        avatar_url: user.avatar || null
      }], { onConflict: 'id' });
      
      if (profileError) {
         throw profileError;
      }

      // Reload page to apply new role in context and trigger native redirects
      window.location.reload();
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-primary p-6 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
            <span className="font-bold text-2xl">S</span>
          </div>
          <h2 className="text-2xl font-bold">أهلاً بك في منصة سمارت!</h2>
          <p className="mt-2 text-primary-50 text-sm">لقد سجلت الدخول بنجاح. يرجى إكمال إعداد ملفك الشخصي للمتابعة.</p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">اختر نوع حسابك (إلزامي)</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('doctor')}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${role === 'doctor'
                    ? 'border-primary bg-primary/5 shadow-md scale-105'
                    : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                    }`}
                >
                  <Stethoscope className={`w-6 h-6 ${role === 'doctor' ? 'text-primary' : 'text-gray-400'}`} />
                  <span className={`text-xs font-bold ${role === 'doctor' ? 'text-primary' : 'text-gray-600'}`}>طبيب</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('laboratory')}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${role === 'laboratory'
                    ? 'border-primary bg-primary/5 shadow-md scale-105'
                    : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                    }`}
                >
                  <TestTube className={`w-6 h-6 ${role === 'laboratory' ? 'text-primary' : 'text-gray-400'}`} />
                  <span className={`text-xs font-bold ${role === 'laboratory' ? 'text-primary' : 'text-gray-600'}`}>مختبر</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('supplier')}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${role === 'supplier'
                    ? 'border-primary bg-primary/5 shadow-md scale-105'
                    : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                    }`}
                >
                  <Package className={`w-6 h-6 ${role === 'supplier' ? 'text-primary' : 'text-gray-400'}`} />
                  <span className={`text-xs font-bold ${role === 'supplier' ? 'text-primary' : 'text-gray-600'}`}>مورد</span>
                </button>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">رقم الهاتف الشغال (إلزامي)</label>
              <div className="flex shadow-sm" dir="ltr">
                <div className="flex items-center justify-center gap-2 px-4 bg-gray-50 border border-gray-300 rounded-s-lg border-e-0 text-gray-600 font-medium">
                  <img src="https://flagcdn.com/w20/iq.png" alt="Iraq" className="w-5" />
                  <span dir="ltr">+964</span>
                </div>
                <input
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="77x xxx xxxx"
                  className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-e-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-right">سيتم استخدامه للتواصل الرسمي واستقبال الطلبات وإرسالها.</p>
            </div>

            {/* Password Optional */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">تعيين كلمة مرور للحساب (اختياري)</label>
              <div className="relative shadow-sm rounded-lg">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-4 pr-10"
                  dir="ltr"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-right">أنت حالياً متصل بحساب اجتماعي. يمكنك تعيين كلمة مرور إذا أردت استخدام الإيميل وكلمة السر مستقبلاً في تسجيل الدخول.</p>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full shadow-lg"
              disabled={loading}
            >
              {loading ? 'جاري الحفظ...' : 'حفظ ومتابعة الدخول'}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};
