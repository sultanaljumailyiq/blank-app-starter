import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Phone, CheckCircle, Building, Stethoscope, Package, TestTube, Settings, MapPin } from 'lucide-react';
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
    accountType: 'doctor' as 'doctor' | 'supplier' | 'laboratory' | 'admin',
    agreeToTerms: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // تحديث نوع الحساب بناءً على query parameter
  useEffect(() => {
    const type = searchParams.get('type');
    if (type && ['doctor', 'supplier', 'laboratory', 'admin'].includes(type)) {
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
    } else if (!/^\+964\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'رقم الهاتف يجب أن يبدأ بـ +964 ويتبعه 10 أرقام';
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
      // محاكاة عملية التسجيل
      await new Promise(resolve => setTimeout(resolve, 1500));

      // بعد التسجيل الناجح، تسجيل الدخول تلقائياً
      await login(formData.email, formData.password, formData.accountType);

      // التوجيه إلى المركز المناسب
      switch (formData.accountType) {
        case 'doctor':
          navigate('/doctor');
          break;
        case 'supplier':
          navigate('/supplier');
          break;
        case 'laboratory':
          navigate('/laboratory');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('حدث خطأ أثناء التسجيل. حاول مرة أخرى.');
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
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

              <button
                type="button"
                onClick={() => handleInputChange('accountType', 'admin')}
                className={`p-4 rounded-lg border-2 transition-all ${formData.accountType === 'admin'
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-primary/50'
                  }`}
              >
                <Settings className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-medium text-gray-900">إدارة المنصة</p>
                <p className="text-xs text-gray-500 mt-1">لمالك النظام</p>
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
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+964 770 123 4567"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
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
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="••••••••"
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline ml-1" />
                  تأكيد كلمة المرور
                </label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
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
