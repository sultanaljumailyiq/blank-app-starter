import { formatNumericDate } from '../../lib/date';
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';
import { Card } from '../../components/common/Card';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10" />
            <h1 className="text-3xl md:text-4xl font-bold">سياسة الخصوصية</h1>
          </div>
          <p className="text-lg opacity-90">آخر تحديث: {formatNumericDate(new Date())}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">مقدمة</h2>
              <p className="text-gray-700 leading-relaxed">
                نحن في SMART نلتزم بحماية خصوصيتك وأمان معلوماتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات التي تقدمها عند استخدام خدماتنا.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">المعلومات التي نجمعها</h2>
              <div className="space-y-3 text-gray-700">
                <h3 className="font-semibold text-lg">1. المعلومات الشخصية:</h3>
                <ul className="list-disc pr-6 space-y-2">
                  <li>الاسم الكامل</li>
                  <li>البريد الإلكتروني</li>
                  <li>رقم الهاتف</li>
                  <li>العنوان (للأطباء والموردين)</li>
                  <li>معلومات العيادة (للأطباء)</li>
                  <li>معلومات الشركة (للموردين)</li>
                </ul>

                <h3 className="font-semibold text-lg mt-4">2. المعلومات الطبية (للمرضى):</h3>
                <ul className="list-disc pr-6 space-y-2">
                  <li>السجل الطبي</li>
                  <li>تاريخ العلاجات</li>
                  <li>الأعراض والتشخيصات</li>
                  <li>المواعيد والزيارات</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">كيفية استخدام المعلومات</h2>
              <ul className="list-disc pr-6 space-y-2 text-gray-700">
                <li>تقديم وتحسين خدماتنا</li>
                <li>التواصل معك بشأن حسابك والخدمات</li>
                <li>معالجة المعاملات والمواعيد</li>
                <li>تخصيص تجربة المستخدم</li>
                <li>تحليل وتحسين أداء المنصة</li>
                <li>الامتثال للمتطلبات القانونية</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">حماية المعلومات</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                نتخذ تدابير أمنية صارمة لحماية معلوماتك الشخصية:
              </p>
              <ul className="list-disc pr-6 space-y-2 text-gray-700">
                <li>تشفير البيانات أثناء النقل والتخزين</li>
                <li>خوادم آمنة محمية بجدران نارية</li>
                <li>الوصول المحدود للموظفين المصرح لهم فقط</li>
                <li>مراجعات أمنية منتظمة</li>
                <li>الامتثال لمعايير حماية البيانات الدولية</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">مشاركة المعلومات</h2>
              <p className="text-gray-700 leading-relaxed">
                لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك فقط في الحالات التالية:
              </p>
              <ul className="list-disc pr-6 space-y-2 text-gray-700 mt-3">
                <li>مع الأطباء لتقديم الرعاية الطبية (بموافقتك)</li>
                <li>مع مقدمي الخدمات الذين يساعدوننا في تشغيل المنصة</li>
                <li>عند الامتثال للقوانين والأنظمة</li>
                <li>لحماية حقوقنا وسلامة المستخدمين</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">حقوقك</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                لديك الحق في:
              </p>
              <ul className="list-disc pr-6 space-y-2 text-gray-700">
                <li>الوصول إلى معلوماتك الشخصية</li>
                <li>تصحيح أو تحديث معلوماتك</li>
                <li>طلب حذف معلوماتك</li>
                <li>الاعتراض على معالجة معلوماتك</li>
                <li>سحب موافقتك في أي وقت</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">ملفات تعريف الارتباط (Cookies)</h2>
              <p className="text-gray-700 leading-relaxed">
                نستخدم ملفات تعريف الارتباط لتحسين تجربتك على المنصة وتحليل استخدام الموقع. يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات المتصفح.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">التغييرات على السياسة</h2>
              <p className="text-gray-700 leading-relaxed">
                قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار على المنصة.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">تواصل معنا</h2>
              <p className="text-gray-700 leading-relaxed">
                لأي استفسارات حول سياسة الخصوصية أو ممارسات حماية البيانات لدينا، يرجى التواصل معنا:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-3 space-y-2 text-gray-700">
                <p><strong>البريد الإلكتروني:</strong> privacy@smart-dental.com</p>
                <p><strong>الهاتف:</strong> +964 770 000 0000</p>
                <p><strong>العنوان:</strong> بغداد، العراق</p>
              </div>
            </section>
          </Card>

          {/* Back Button */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ArrowRight className="w-4 h-4" />
              العودة لتسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
