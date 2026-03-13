

## تحليل الوضع الحالي

**ما هو موجود بالفعل:**
1. `ClinicPatientProfile.tsx` - يحتوي على تبويب "الخدمات الذكية" (`smart`) مع:
   - بطاقتا تحليل الصور والمساعد الذكي (كـ onClick cards)
   - Modal لتحليل الصور (`isAnalysisModalOpen`) + Modal للمحادثة (`isChatModalOpen`)
   - الكود موجود لكن المتغيرات `isAnalysisModalOpen`, `isChatModalOpen`, `aiHistory`, `aiAnalyzing`, `aiUploading`, `refreshAI`, `analyzeExistingImage`, `selectedImageIds`, `isSelectionMode` تبدو غير معرّفة في الـ state
   
2. `useAIAnalysis` hook - يتصل بـ Supabase لجلب تاريخ التحليلات من `ai_analyses`
3. `AIService.ts` - يدير الوكلاء، يستخدم `ai_agents` و `ai_usage_logs`
4. `SmartDiagnosisPage.tsx` (الصفحة العامة `/diagnosis/ai`) - تستخدم `patient_assistant` وكيل لكنها بسيطة وغير مرتبطة بـ Lovable AI
5. `MedicalServicesSection.tsx` في admin - يحتوي `AIConfigManager` يقرأ من DB ويعدّل الـ agents

**المشاكل الرئيسية:**
1. **في ملف المريض**: المتغيرات المستخدمة في `renderSmartServicesTab()` مثل `isAnalysisModalOpen`, `isChatModalOpen`, `aiHistory`, `aiAnalyzing`, `aiUploading`, `refreshAI`, `analyzeExistingImage`, `selectedImageIds`, `isSelectionMode` **غير معرفة** في الـ state → شاشة بيضاء أو أخطاء
2. **AIService.ts** يتصل مباشرة بـ OpenAI/Anthropic/Google APIs من المتصفح (client-side) دون API keys → يقع في **Mock Mode** دائماً
3. **SmartDiagnosisPage** تستخدم نفس الـ AIService القديم ولا تستخدم Lovable AI Gateway

**الحل المقترح:**

### 1. ربط Lovable AI في Edge Function
إنشاء Edge Function واحدة تخدم ثلاثة أغراض:
- `image_analysis`: تحليل صور الأسنان (يقرأ system prompt من `ai_agents`)
- `doctor_assistant`: محادثة الطبيب (يقرأ system prompt من `ai_agents`)  
- `patient_assistant`: محادثة المريض في صفحة `/diagnosis/ai`

### 2. تحديث AIService.ts
استبدال الاستدعاءات المباشرة لـ OpenAI/Anthropic بـ استدعاء الـ Edge Function

### 3. إصلاح ClinicPatientProfile.tsx
إضافة المتغيرات المفقودة في الـ state لكي تعمل الـ modals في تبويب "الخدمات الذكية"

### 4. تحديث SmartDiagnosisPage.tsx
تحسين الصفحة لاستخدام Edge Function بدلاً من AIService مباشرة

---

## خطة التنفيذ التفصيلية

### الملفات التي ستُعدَّل:

```text
1. supabase/functions/ai-agent/index.ts  [جديد]
   - Edge function واحدة تخدم جميع وكلاء الذكاء الاصطناعي
   - تقرأ إعدادات الوكيل (system_rules, model) من ai_agents في DB
   - تُوجِّه الطلب إلى Lovable AI Gateway (google/gemini-3-flash-preview)
   - تدعم: image_analysis, doctor_assistant, patient_assistant
   - تسجّل الاستخدام في ai_usage_logs

2. supabase/config.toml  [تعديل]
   - إضافة [functions.ai-agent] مع verify_jwt = false

3. src/services/ai/AIService.ts  [تعديل]
   - تحديث analyzeImage() لتستدعي Edge Function بدلاً من OpenAI مباشرة
   - تحديث chat() لتستدعي Edge Function بدلاً من APIs مباشرة

4. src/pages/doctor/clinic/ClinicPatientProfile.tsx  [تعديل]
   - إضافة المتغيرات المفقودة في الـ state:
     * isAnalysisModalOpen, isChatModalOpen
     * aiHistory, aiAnalyzing, aiUploading
     * analyzeExistingImage (من useAIAnalysis)
     * refreshAI (من useAIAnalysis)
     * selectedImageIds, isSelectionMode
   - تمرير props صحيحة لـ SmartAssistantChat

5. src/pages/public/SmartDiagnosisPage.tsx  [تعديل]
   - استبدال aiService.chat() بـ fetch مباشر للـ Edge Function
   - تحسين بسيط للـ UI (loading state أوضح)

6. supabase/functions/ai-agent/deno.json  [جديد]
   - imports للـ Deno dependencies
```

### بنية Edge Function:

```text
POST /functions/v1/ai-agent
Body: {
  agent_type: "image_analysis" | "doctor_assistant" | "patient_assistant",
  message: string,
  image_url?: string,  // لتحليل الصور
  context?: object,    // بيانات المريض
  session_id?: string,
  clinic_id?: number
}
```

**المنطق الداخلي للـ Edge Function:**
1. تقرأ config الوكيل من `ai_agents` (system_rules, is_active)
2. ترسل الطلب لـ Lovable AI Gateway بـ model `google/gemini-3-flash-preview` افتراضياً
3. تسجّل الاستخدام في `ai_usage_logs`
4. تُعيد الرد

### هيكل الربط في ملف المريض:

```text
ClinicPatientProfile
  └── تبويب "الخدمات الذكية"
        ├── بطاقة "تحليل الصور" → Modal تحليل الصور
        │     └── ImageUploadZone → useAIAnalysis.analyzeImage()
        │           └── AIService.analyzeImage() → Edge Function
        └── بطاقة "المساعد الذكي" → Modal المحادثة
              └── SmartAssistantChat
                    └── AIService.chat('doctor_assistant') → Edge Function
```

### هيكل الربط في صفحة المريض العامة:

```text
SmartDiagnosisPage (/diagnosis/ai)
  └── chat → fetch Edge Function (agent_type: "patient_assistant")
  └── image → fetch Edge Function (agent_type: "image_analysis")
```

### قراءة الإعدادات من Admin:
الـ Edge Function تقرأ من `ai_agents` table في DB → أي تعديل في لوحة الـ Admin (system_rules, model preference) ينعكس فوراً على الخدمة

**ملاحظة مهمة**: نستخدم `google/gemini-3-flash-preview` كموديل افتراضي عبر Lovable AI Gateway، لكن الـ admin يستطيع تغيير `system_rules` من لوحة التحكم وستُحمَّل في الـ Edge Function ديناميكياً.

