import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Stethoscope, Package, TestTube, Lock, MapPin, CheckCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { IRAQI_GOVERNORATES } from '../../utils/location';

type Role = 'doctor' | 'supplier' | 'laboratory';

const ROLE_CONFIG: Record<Role, {
  label: string;
  sub: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  shadow: string;
  check: string;
}> = {
  doctor: {
    label: 'طبيب',
    sub: 'عيادة أسنان',
    icon: Stethoscope,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    shadow: 'shadow-blue-100',
    check: 'bg-blue-500',
  },
  laboratory: {
    label: 'مختبر',
    sub: 'مختبر أسنان',
    icon: TestTube,
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-500',
    shadow: 'shadow-purple-100',
    check: 'bg-purple-500',
  },
  supplier: {
    label: 'مورد',
    sub: 'متجر المستلزمات',
    icon: Package,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-500',
    shadow: 'shadow-emerald-100',
    check: 'bg-emerald-500',
  },
};

export const CompleteRegistrationModal: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // ⚠️ No default role – user MUST choose explicitly
  const [role, setRole] = useState<Role | ''>('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Only show if user is authenticated but has no role yet (or defaulted to 'newuser')
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

    if (!role) {
      setError('يرجى اختيار نوع الحساب');
      return;
    }
    if (phone.length !== 10) {
      setError('رقم الهاتف يجب أن يتكون من 10 أرقام (بدون الصفر)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fullPhone = `+964${phone}`;

      // 1. Update Auth Metadata
      const { error: authError } = await supabase.auth.updateUser({
        password: password || undefined,
        data: { role, phone: fullPhone, governorate }
      });
      if (authError) throw authError;

      // 2. Upsert profile
      const { error: profileError } = await supabase.from('profiles').upsert([{
        id: user.id,
        email: user.email,
        full_name: user.name,
        role,
        phone: fullPhone,
        governorate: governorate || null,
        avatar_url: user.avatar || null
      }], { onConflict: 'id' });
      if (profileError) throw profileError;

      // Reload to apply new role
      window.location.reload();

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء حفظ البيانات، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">

        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary-dark p-6 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
            <span className="font-bold text-2xl">S</span>
          </div>
          <h2 className="text-2xl font-bold">أهلاً بك في منصة سمارت! 🎉</h2>
          <p className="mt-2 text-white/80 text-sm">سجّلت الدخول بنجاح — أكمل إعداد ملفك للمتابعة</p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center font-medium">
                ⚠️ {error}
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                🏷️ نوع الحساب <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-400 mb-3">اختر نوع حسابك بدقة — لا يمكن تغييره لاحقاً</p>

              <div className="grid grid-cols-3 gap-3">
                {(Object.entries(ROLE_CONFIG) as [Role, typeof ROLE_CONFIG[Role]][]).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  const selected = role === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => { setRole(key); setError(''); }}
                      className={`
                        relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 
                        transition-all duration-200 transform hover:scale-[1.03] focus:outline-none
                        ${selected
                          ? `${cfg.border} ${cfg.bg} shadow-lg ${cfg.shadow} scale-[1.03]`
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      {/* Check badge */}
                      {selected && (
                        <span className={`absolute top-1.5 left-1.5 w-5 h-5 ${cfg.check} rounded-full flex items-center justify-center`}>
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                        </span>
                      )}

                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selected ? cfg.bg : 'bg-gray-100'}`}>
                        <Icon className={`w-6 h-6 ${selected ? cfg.color : 'text-gray-400'}`} />
                      </div>

                      {/* Text */}
                      <div className="text-center">
                        <span className={`block text-sm font-bold ${selected ? cfg.color : 'text-gray-600'}`}>
                          {cfg.label}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-0.5 block">{cfg.sub}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* No selection hint */}
              {!role && (
                <p className="text-xs text-center text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2 font-medium">
                  👆 يجب اختيار نوع الحساب للمتابعة
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                رقم الهاتف <span className="text-red-500">*</span>
              </label>
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
                  className="flex-1 min-w-0 px-4 py-2.5 border border-gray-300 rounded-e-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5 text-right">سيُستخدم للتواصل الرسمي واستقبال الطلبات</p>
            </div>

            {/* Governorate */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                <MapPin className="w-4 h-4 inline ml-1 text-gray-500" />
                المحافظة <span className="text-red-500">*</span>
              </label>
              <select
                value={governorate}
                onChange={e => setGovernorate(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900 transition-all"
              >
                <option value="" disabled>— اختر المحافظة —</option>
                {IRAQI_GOVERNORATES.map(gov => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
            </div>

            {/* Password Optional */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                <Lock className="w-4 h-4 inline ml-1 text-gray-500" />
                كلمة مرور (اختياري)
              </label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="أدخل كلمة مرور إن أردت"
                dir="ltr"
              />
              <p className="text-xs text-gray-400 mt-1.5 text-right">للتمكن من الدخول بالإيميل وكلمة السر مستقبلاً</p>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full shadow-lg"
              disabled={loading || !role || phone.length !== 10 || !governorate}
            >
              {loading ? 'جاري الحفظ...' : '✓ حفظ ومتابعة'}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};
