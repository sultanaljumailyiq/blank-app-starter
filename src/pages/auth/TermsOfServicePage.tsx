import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { formatNumericDate } from '../../lib/date';

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-10 h-10" />
            <h1 className="text-3xl md:text-4xl font-bold">الشروط والأحكام</h1>
          </div>
          <p className="text-lg opacity-90">آخر تحديث: {formatNumericDate(new Date())}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. القبول بالشروط</h2>
              <p className="text-gray-700 leading-relaxed">
                باستخدامك لمنصة SMART، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام خدماتنا.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. التعريفات</h2>
              <ul className="list-disc pr-6 space-y-2 text-gray-700">
                <li><strong>"المنصة":</strong> تشير إلى تطبيق ويب SMART وجميع خدماته</li>
                <li><strong>"المستخدم":</strong> أي شخص يستخدم المنصة (مريض، طبيب، أو مورد)</li>
                <li><strong>"الخدمات":</strong> جميع الميزات والوظائف المتاحة على المنصة</li>
                <li><strong>"المحتوى":</strong> النصوص، الصور، البيانات، والمعلومات المتاحة على المنصة</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. استخدام المنصة</h2>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">3.1 الأهلية</h3>
              <p className="text-gray-700 mb-3">
                يجب أن يكون عمرك 18 عاماً على الأقل لاستخدام المنصة. باستخدامك للمنصة، تؤكد أنك تستوفي هذا الشرط.
              </p>

              <h3 className="font-semibold text-lg text-gray-900 mb-2">3.2 إنشاء الحساب</h3>
              <ul className="list-disc pr-6 space-y-2 text-gray-700 mb-3">
                <li>يجب تقديم معلومات دقيقة وكاملة عند التسجيل</li>
                <li>أنت مسؤول عن الحفاظ على سرية كلمة المرور</li>
                <li>يجب إخطارنا فوراً بأي استخدام غير مصرح به لحسابك</li>
                <li>حساب واحد لكل مستخدم</li>
              </ul>

              <h3 className="font-semibold text-lg text-gray-900 mb-2">3.3 السلوك المقبول</h3>
              <p className="text-gray-700 mb-2">يجب عليك:</p>
              <ul className="list-disc pr-6 space-y-2 text-gray-700">
                <li>استخدام المنصة للأغراض القانونية فقط</li>
                <li>احترام حقوق المستخدمين الآخرين</li>
                <li>عدم نشر محتوى مسيء أو غير لائق</li>
                <li>عدم محاولة اختراق أو إلحاق الضرر بالمنصة</li>
                <li>عدم جمع بيانات المستخدمين الآخرين بدون إذن</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. للأطباء</h2>
              <ul className="list-disc pr-6 space-y-2 text-gray-700">
                <li>يجب تقديم إثبات الترخيص الطبي الساري</li>
                <li>الالتزام بأخلاقيات المهنة الطبية</li>
                <li>تقديم معلومات دقيقة عن الخدمات والأسعار</li>
                <li>الرد على استفسارات المرضى في وقت معقول</li>
                <li>الحفاظ على سرية معلومات المرضى</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. للموردين</h2>
              <ul className="list-disc pr-6 space-y-2 text-gray-700">
                <li>تقديم منتجات طبية معتمدة ومرخصة</li>
                <li>وصف دقيق للمنتجات والخدمات</li>
                <li>الالتزام بمعايير الجودة والسلامة</li>
                <li>معالجة الطلبات والشكاوى بمهنية</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. الرسوم والمدفوعات</h2>
              <p className="text-gray-700 mb-3">
                قد تطبق رسوم على بعض الخدمات المتقدمة:
              </p>
              <ul className="list-disc pr-6 space-y-2 text-gray-700">
                <li>جميع الأسعار معروضة بالدينار العراقي</li>
                <li>الرسوم غير قابلة للاسترداد إلا في حالات محددة</li>
                <li>نحتفظ بالحق في تغيير الأسعار مع إشعار مسبق</li>
                <li>المدفوعات تتم عبر بوابات دفع آمنة</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. الملكية الفكرية</h2>
              <p className="text-gray-700 leading-relaxed">
                جميع المحتويات على المنصة (التصميم، الشعارات، النصوص، الصور) محمية بحقوق الملكية الفكرية. لا يجوز نسخها أو توزيعها بدون إذن كتابي مسبق.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. إخلاء المسؤولية</h2>
              <p className="text-gray-700 mb-3">
                المنصة توفر معلومات عامة فقط ولا تحل محل الاستشارة الطبية المباشرة:
              </p>
              <ul className="list-disc pr-6 space-y-2 text-gray-700">
                <li>لا نتحمل مسؤولية الأخطاء في المعلومات المقدمة من الأطباء أو الموردين</li>
                <li>المحتوى التعليمي للإرشاد فقط وليس بديلاً عن الاستشارة الطبية</li>
                <li>نتائج التشخيص الذكي تقديرية ويجب استشارة طبيب مختص</li>
                <li>لا نضمن توفر الخدمة بشكل مستمر أو خالٍ من الأخطاء</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. إنهاء الحساب</h2>
              <p className="text-gray-700 mb-3">
                نحتفظ بالحق في تعليق أو إنهاء حسابك في الحالات التالية:
              </p>
              <ul className="list-disc pr-6 space-y-2 text-gray-700">
                <li>انتهاك هذه الشروط والأحكام</li>
                <li>تقديم معلومات مضللة أو كاذبة</li>
                <li>السلوك المسيء تجاه المستخدمين الآخرين</li>
                <li>عدم النشاط لفترة طويلة</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. التعديلات على الشروط</h2>
              <p className="text-gray-700 leading-relaxed">
                نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سنخطرك بالتغييرات الجوهرية عبر البريد الإلكتروني أو إشعار على المنصة. استمرارك في استخدام المنصة بعد التغييرات يعني موافقتك عليها.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. القانون المطبق</h2>
              <p className="text-gray-700 leading-relaxed">
                تخضع هذه الشروط والأحكام لقوانين جمهورية العراق. أي نزاعات تنشأ عن هذه الشروط ستحل في المحاكم العراقية المختصة.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. تواصل معنا</h2>
              <p className="text-gray-700 leading-relaxed">
                لأي استفسارات حول هذه الشروط والأحكام:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-3 space-y-2 text-gray-700">
                <p><strong>البريد الإلكتروني:</strong> legal@smart-dental.com</p>
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
