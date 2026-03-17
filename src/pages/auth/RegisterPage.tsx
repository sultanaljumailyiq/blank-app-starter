import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Phone, CheckCircle, Building, Stethoscope, Package, TestTube, Settings, MapPin, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { IRAQI_GOVERNORATES } from '../../utils/location';

export const RegisterPage: React.FC = () => {
  const { t } = useLanguage();
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    governorate: 'بغداد',
    address: '',
    password: '',
    confirmPassword: '',
    accountType: 'doctor' as 'doctor' | 'supplier' | 'laboratory',
    agreeToTerms: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // تحديث نوع الحساب بناءً على query parameter
  useEffect(() => {
    const type = searchParams.get('type');
    if (type && ['doctor', 'supplier', 'laboratory'].includes(type)) {
      setFormData(prev => ({ ...prev, accountType: type as any }));
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'الاسم الكامل مطلوب';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^\d{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'رقم الهاتف يجب أن يتكون من 10 أو 11 رقماً';
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمتا المرور غير متطابقتين';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'يجب الموافقة على الشروط والأحكام';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register(
        formData.email,
        formData.password,
        formData.fullName,
        formData.accountType as any,
        `+964${formData.phone}`
      );

      // Show success screen instead of redirecting immediately
      setRegistrationSuccess(true);
    } catch (error) {
      console.error('Registration error:', error);
      alert('حدث خطأ أثناء التسجيل. سجل الدخول إذا كان حسابك موجوداً، أو حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // مسح الخطأ عند التعديل
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-blue-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md my-8 text-center p-8 shadow-2xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">إنشاء الحساب ناجح!</h2>
          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-6 text-right">
            <p className="font-medium mb-2">الخطوة التالية:</p>
            <p className="text-sm">
              لقد أرسلنا رسالة تأكيد إلى بريدك الإلكتروني:
              <br />
              <strong className="block mt-1 text-center" dir="ltr">{formData.email}</strong>
            </p>
            <p className="text-sm mt-3 border-t border-blue-200 pt-3">
              يرجى التحقق من بريدك (وصندوق الرسائل غير المرغوب فيها Spam) والضغط على رابط التفعيل لتتمكن من تسجيل الدخول.
            </p>
          </div>
          <Button
            onClick={() => navigate('/login')}
            className="w-full"
            variant="primary"
          >
            الانتقال لصفحة تسجيل الدخول
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-blue-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl my-8">
        <div className="p-8 space-y-6">
          {/* Logo */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">إنشاء حساب جديد</h1>
            <p className="text-gray-600 mt-2">انضم إلى SMART اليوم</p>
          </div>

          {/* Account Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              نوع الحساب
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleInputChange('accountType', 'doctor')}
                className={`p-4 rounded-lg border-2 transition-all ${formData.accountType === 'doctor'
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-primary/50'
                  }`}
              >
                <Stethoscope className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-medium text-gray-900">طبيب أسنان</p>
                <p className="text-xs text-gray-500 mt-1">للأطباء المتخصصين</p>
              </button>

              <button
                type="button"
                onClick={() => handleInputChange('accountType', 'supplier')}
                className={`p-4 rounded-lg border-2 transition-all ${formData.accountType === 'supplier'
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-primary/50'
                  }`}
              >
                <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-medium text-gray-900">مورد</p>
                <p className="text-xs text-gray-500 mt-1">لموردي المعدات الطبية</p>
              </button>

              <button
                type="button"
                onClick={() => handleInputChange('accountType', 'laboratory')}
                className={`p-4 rounded-lg border-2 transition-all ${formData.accountType === 'laboratory'
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-primary/50'
                  }`}
              >
                <TestTube className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-medium text-gray-900">مختبر أسنان</p>
                <p className="text-xs text-gray-500 mt-1">للمختبرات الطبية</p>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline ml-1" />
                الاسم الكامل
              </label>
              <Input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="أدخل اسمك الكامل"
                className={errors.fullName ? 'border-red-500' : ''}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline ml-1" />
                  البريد الإلكتروني
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="example@email.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline ml-1" />
                  رقم الهاتف
                </label>
                <div className="flex" dir="ltr">
                  <div className="flex items-center justify-center px-4 bg-gray-50 border border-gray-300 rounded-s-lg border-e-0 text-gray-600 font-medium">
                    +964
                  </div>
                  <input
                    type="tel"
                    dir="ltr"
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 11) {
                        handleInputChange('phone', val);
                      }
                    }}
                    placeholder="770 123 4567"
                    className={`flex-1 min-w-0 px-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-e-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1 text-right">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Governorate & Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline ml-1" />
                  المحافظة
                </label>
                <select
                  value={formData.governorate}
                  onChange={(e) => handleInputChange('governorate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900"
                >
                  {IRAQI_GOVERNORATES.map(gov => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline ml-1" />
                  العنوان (اختياري)
                </label>
                <Input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="شارع، حي، منطقة..."
                />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline ml-1" />
                  كلمة المرور
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="••••••••"
                    className={errors.password ? 'border-red-500' : ''}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline ml-1" />
                  تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                أوافق على{' '}
                <Link to="/terms-of-service" className="text-primary hover:underline" target="_blank">
                  الشروط والأحكام
                </Link>
                {' '}و{' '}
                <Link to="/privacy-policy" className="text-primary hover:underline" target="_blank">
                  سياسة الخصوصية
                </Link>
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-red-500 text-xs">{errors.agreeToTerms}</p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full flex items-center justify-center gap-2"
              disabled={loading}
            >
              <UserPlus className="w-5 h-5" />
              {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center text-sm text-gray-600">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              تسجيل الدخول
            </Link>
          </div>

          {/* Quick Links */}
          <div className="pt-4 border-t text-center space-y-2">
            <Link to="/" className="block text-sm text-gray-600 hover:text-primary">
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};
