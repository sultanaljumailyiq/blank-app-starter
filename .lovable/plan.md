

# ربط التكلفة التقديرية بقائمة العلاجات

## الهدف
بدلاً من أن يخمّن الذكاء الاصطناعي تكلفة كل علاج من عنده، سيتم جلب الأسعار الفعلية من **قائمة العلاجات** المعرّفة في قسم العلاجات داخل العيادة، وحقنها في تقرير التحليل.

## المشاكل في الوضع الحالي
1. الذكاء الاصطناعي يقدّر التكاليف بشكل عشوائي (أرقام تقريبية بالدينار العراقي قد لا تطابق أسعار العيادة).
2. لا يوجد ربط بين المشاكل المُشخّصة وأسماء العلاجات المعتمدة في العيادة.
3. كل عيادة لها أسعارها الخاصة — التقدير العام غير دقيق.

## خطة التنفيذ

### 1) استكشاف بنية قسم العلاجات
- التحقق من جدول العلاجات في قاعدة البيانات (الاسم المتوقع: `treatments` أو `clinic_treatments` أو `services`) لمعرفة الحقول: `name`, `price`, `category`, `clinic_id`, `duration`.
- التحقق من الواجهة الحالية لقسم العلاجات لمعرفة كيف تُعرض الأسعار.

### 2) جلب قائمة علاجات العيادة قبل التحليل
- في `src/hooks/useAIAnalysis.ts` (أو في الصفحة المستدعية للتحليل): قبل استدعاء `aiService.analyzeImage()`، جلب علاجات العيادة الحالية من DB:
  ```ts
  const { data: treatments } = await supabase
    .from('treatments')
    .select('name, price, category, duration_minutes')
    .eq('clinic_id', clinicId)
    .eq('is_active', true);
  ```
- تمرير `treatments` كـ `clinic_treatments_catalog` ضمن payload الإيدج فانكشن.

### 3) تحديث Edge Function (`supabase/functions/ai-agent/index.ts`)
- قبول `clinic_treatments_catalog` في body الطلب.
- عند بناء الـ system prompt للتحليل، حقن قائمة العلاجات بصيغة JSON:
  ```
  CLINIC TREATMENT CATALOG (use ONLY these for cost estimation):
  [{ "name": "حشوة كومبوزيت", "price": 35000, "category": "restorative" }, ...]
  ```
- إضافة قاعدة إجبارية في برومبت `IMAGE_ANALYSIS_SYSTEM`:
  > "لا تخترع أسعاراً. استخدم فقط أسعار `clinic_treatments_catalog` المرفقة. لكل مشكلة، اختر العلاج الأنسب من القائمة وأدرج اسمه الفعلي وسعره. إذا لم يوجد علاج مطابق، اكتب `'يحتاج تسعير يدوي'`."
- توسيع schema الأداة `dental_analysis_report` بحقول جديدة لكل issue:
  - `matched_treatment_name` (string) — اسم العلاج من قائمة العيادة
  - `matched_treatment_price` (number) — السعر الفعلي من القائمة
  - `treatment_match_status` ('matched' | 'manual_pricing_needed')
- حساب `treatment_plan.total_estimated_cost` من مجموع الأسعار الفعلية المختارة فقط.

### 4) تحديث الأنواع (`src/types/ai.ts`)
- إضافة الحقول الجديدة على `issues[]`:
  ```ts
  matched_treatment_name?: string;
  matched_treatment_price?: number;
  treatment_match_status?: 'matched' | 'manual_pricing_needed';
  ```

### 5) تحديث بطاقة عرض النتائج (`src/components/ai/AnalysisResultCard.tsx`)
- في كل بطاقة مشكلة: عرض اسم العلاج المطابَق + سعره الفعلي بشكل بارز.
- عرض شارة "سعر معتمد من العيادة" عند `matched`، وشارة صفراء "يحتاج تسعير" عند `manual_pricing_needed`.
- إجمالي الخطة العلاجية يعرض السعر الحقيقي الموحّد بعملة العيادة.
- في حال عدم وجود علاجات معرّفة في العيادة: عرض تنبيه بأعلى البطاقة:
  > "لم تُعرَّف قائمة علاجات لهذه العيادة. التكاليف المعروضة تقديرية. [إدارة العلاجات →]"

### 6) معالجة حالة التحليل العام (بدون عيادة محددة)
- في صفحة `/diagnosis/ai` العامة (للزوار): لا توجد عيادة، لذا يبقى السلوك كما هو (تقدير عام).
- داخل ملف المريض في العيادة: يستخدم `clinicId` تلقائياً لجلب العلاجات.

## الملفات المتأثرة

| الملف | التغيير |
|---|---|
| `supabase/functions/ai-agent/index.ts` | قبول قائمة العلاجات + حقنها في البرومبت + توسيع schema |
| `src/services/ai/AIService.ts` | تمرير `clinicTreatments` في `analyzeImage()` |
| `src/hooks/useAIAnalysis.ts` | جلب علاجات العيادة قبل التحليل |
| `src/types/ai.ts` | إضافة حقول `matched_treatment_*` |
| `src/components/ai/AnalysisResultCard.tsx` | عرض اسم وسعر العلاج المطابَق + شارات |

## النتيجة النهائية
- التحليل سيستخدم **أسعار العيادة الحقيقية** بدلاً من التخمين.
- كل مشكلة مشخّصة سترتبط بعلاج من قائمة العيادة بسعره الفعلي.
- إجمالي تكلفة الخطة العلاجية = مجموع أسعار حقيقية من النظام.
- تنبيه واضح للطبيب عند نقص بيانات العلاجات أو عند الحاجة لتسعير يدوي.

