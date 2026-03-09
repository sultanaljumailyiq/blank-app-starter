
## إصلاح أخطاء البناء (Build Errors)

هناك نوعان من الأخطاء يجب إصلاحها:

---

### النوع الأول: خطأ `'error' is of type 'unknown'` (4 ملفات)

في TypeScript الحديث، الـ `error` في `catch` يكون من نوع `unknown` وليس `any`، لذا يجب التعامل معه بشكل صحيح.

**الملفات المتأثرة:**
- `supabase/functions/manage-articles/index.ts` (السطر 189)
- `supabase/functions/manage-clinics/index.ts` (السطر 168)
- `supabase/functions/manage-community/index.ts` (السطر 224)
- `supabase/functions/seed-data/index.ts` (السطر 339)
- `supabase/functions/seed-initial-data/index.ts` (السطر 191)

**الحل:** تغيير `error.message` إلى `(error as Error).message` في جميع الأماكن.

---

### النوع الثاني: خطأ `Parameter 'u' implicitly has an 'any' type` (ملف seed-initial-data)

في السطرين 34 و60 من `seed-initial-data/index.ts`:
```
existingUsers.users?.some(u => u.email === adminEmail)
existingUsers.users.find(u => u.email === adminEmail)
```

**الحل:** إضافة نوع صريح للـ parameter: `(u: any) => ...`

---

### النوع الثالث: خطأ `'city' does not exist in type 'Clinic'`

في `src/data/mock/index.ts` السطر 39، الكود يستخدم `city: 'Mansour'` لكن نوع `Clinic` لا يحتوي على حقل `city`.

**الحل:** إما إضافة `city?: string` لـ interface `Clinic` في `src/types/index.ts`، أو حذف حقل `city` من البيانات.
- الأفضل: إضافة `city?: string` للـ interface لأن الحقل مفيد.

---

### النوع الرابع: خطأ `'address' is missing in type Supplier`

في `src/data/mock/store.ts`، جميع الموردين الخمسة لا يحتوون على حقل `address` المطلوب في interface `Supplier`.

**الحل:** إضافة `address: ''` أو قيمة مناسبة لكل مورد في ملف `store.ts`.

---

### الملفات التي ستُعدَّل:
1. `supabase/functions/manage-articles/index.ts` - إصلاح error casting
2. `supabase/functions/manage-clinics/index.ts` - إصلاح error casting
3. `supabase/functions/manage-community/index.ts` - إصلاح error casting
4. `supabase/functions/seed-data/index.ts` - إصلاح error casting
5. `supabase/functions/seed-initial-data/index.ts` - إصلاح error casting + parameter typing
6. `src/types/index.ts` - إضافة `city?: string` لـ Clinic interface
7. `src/data/mock/store.ts` - إضافة حقل `address` للموردين
