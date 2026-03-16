
## تحليل الوضع الحالي

**ما هو موجود:**
- `manifest.json` موجود بالفعل مع إعدادات أساسية
- `<link rel="manifest">` مرتبط في `index.html`
- `localStorage` مستخدم في عدة أماكن (cart, wishlist, mockDb, auth session)
- Supabase Auth يستخدم `storage: localStorage` مع `persistSession: true` → **الجلسة محفوظة تلقائياً عند إغلاق التطبيق وإعادة فتحه**
- **لا يوجد** `vite-plugin-pwa` أو Service Worker أو أي دعم offline حالياً

**إجابة سؤال "هل يفتح عند إعادة الفتح؟"**
نعم، الجلسة تُحفظ في localStorage عبر Supabase `persistSession: true` — لكن بدون Service Worker، سيظهر شاشة بيضاء offline لأن الملفات لا تُخزَّن في الكاش.

---

## الخطة

### 1. تثبيت وإعداد `vite-plugin-pwa`

تحديث `vite.config.ts` لإضافة PWA plugin مع:
- `registerType: 'autoUpdate'` → التطبيق يتحدث تلقائياً في الخلفية
- `workbox` مع استراتيجية `NetworkFirst` للـ API calls، و`CacheFirst` للـ assets
- استثناء مسار `/~oauth` من الـ Service Worker cache
- استثناء الـ Supabase API calls من الـ cache

```text
vite.config.ts
  ├── VitePWA plugin
  │     ├── registerType: 'autoUpdate'
  │     ├── workbox.navigateFallbackDenylist: [/^\/~oauth/]
  │     ├── workbox.runtimeCaching:
  │     │     ├── CacheFirst → /assets/ (JS, CSS, images)
  │     │     └── NetworkFirst → كل شيء آخر
  │     └── manifest: (بدلاً من manifest.json الخارجي)
  └── (إزالة manifest.json الخارجي واستبداله بـ inline في plugin)
```

### 2. تحديث `index.html`
إضافة meta tags للموبايل:
- `apple-mobile-web-app-capable`
- `apple-mobile-web-app-status-bar-style`
- `apple-touch-icon`
- `mobile-web-app-capable`

### 3. إنشاء hook مركزي `useLocalCache`
`src/hooks/useLocalCache.ts`  
Hook بسيط يوفر:
- `get(key)` / `set(key, value, ttl?)` / `remove(key)`
- دعم TTL (صلاحية البيانات) لتجنب البيانات القديمة
- يُستخدم في PlatformContext وغيره لحفظ الإعدادات offline

### 4. تحديث `PlatformContext` لدعم Offline
تحميل الإعدادات من localStorage أولاً (بيانات مخبأة)، ثم تحديثها من الشبكة عند الاتصال → يعمل التطبيق فوراً حتى بدون إنترنت.

### 5. مكوّن `PWAInstallPrompt`
`src/components/common/PWAInstallPrompt.tsx`  
شريط صغير في الأسفل يظهر للمستخدمين على الموبايل ويقترح التثبيت كتطبيق:
- يظهر مرة واحدة فقط (يُحفظ "تم الإغلاق" في localStorage)
- دعم iOS (تعليمات Share → Add to Home Screen)
- دعم Android/Chrome (زر Install التلقائي)

### 6. مكوّن `OfflineIndicator`
`src/components/common/OfflineIndicator.tsx`  
شريط صغير يظهر أعلى الشاشة عند انقطاع الإنترنت ويختفي عند العودة.

---

## الملفات التي ستُعدَّل/تُنشأ

```text
package.json                          [تعديل] إضافة vite-plugin-pwa
vite.config.ts                        [تعديل] إضافة VitePWA config
index.html                            [تعديل] إضافة mobile meta tags
src/hooks/useLocalCache.ts            [جديد]  hook للـ local caching مع TTL
src/contexts/PlatformContext.tsx      [تعديل] دعم offline cache للإعدادات
src/components/common/PWAInstallPrompt.tsx  [جديد] زر تثبيت التطبيق
src/components/common/OfflineIndicator.tsx  [جديد] مؤشر انقطاع الإنترنت
src/main.tsx                          [تعديل] إضافة PWAInstallPrompt + OfflineIndicator
```

---

## النتيجة بعد التنفيذ

| الميزة | الحالة |
|--------|--------|
| تثبيت كتطبيق على الموبايل | ✅ زر تثبيت تلقائي |
| فتح التطبيق بدون إنترنت | ✅ يعرض آخر نسخة مخبأة |
| حفظ الجلسة عند إغلاق التطبيق | ✅ موجود مسبقاً (Supabase localStorage) |
| مؤشر عند انقطاع الإنترنت | ✅ شريط تنبيه |
| تحديث تلقائي للتطبيق | ✅ عند توفر نسخة جديدة |
| بيانات الإعدادات offline | ✅ من localStorage cache |
