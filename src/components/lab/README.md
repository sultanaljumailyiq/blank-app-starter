# مكونات المختبر المحسنة
# Enhanced Lab Components

مجموعة شاملة من المكونات المحسنة لنظام إدارة المختبرات، مصممة لتوفير تجربة مستخدم متطورة ومتسقة.

## 🎨 المزايا الرئيسية

- **تصميم متسق**: استخدام نفس نظام الألوان والخطوط من ClinicDashboard
- **استجابة كاملة**: يعمل على جميع الأجهزة والشاشات
- **إمكانية الوصول**: يدعم قارئات الشاشة والوصولية
- **أداء محسن**: محسن للسرعة والذاكرة
- **سهولة التخصيص**: مرن وقابل للتطوير

## 📦 المكونات المتوفرة

### 1. `LabRequestCard`
بطاقة عرض معلومات طلب المختبر مع تصميم محسن.

```tsx
import { LabRequestCard } from '@/components/lab';

<LabRequestCard
  request={request}
  onViewDetails={(id) => console.log('تفاصيل:', id)}
  onUpdateStatus={(id, status) => console.log('تحديث:', id, status)}
  className="my-4"
/>
```

**المزايا:**
- عرض شامل لمعلومات الطلب
- مؤشرات الحالة والأولوية
- أزرار إجراءات سريعة
- تصميم متجاوب

### 2. `LabRequestsTable`
جدول محسن لعرض وإدارة طلبات المختبر.

```tsx
import { LabRequestsTable } from '@/components/lab';

<LabRequestsTable
  requests={requests}
  onViewDetails={handleViewDetails}
  onUpdateStatus={handleUpdateStatus}
  onDelete={handleDelete}
/>
```

**المزايا:**
- ترتيب وفلترة متقدمة
- تحديد متعدد
- بحث فوري
- إجراءات مجمعة

### 3. `LabStatsCard`
بطاقة إحصائيات محسنة مع رسوم بيانية.

```tsx
import { LabStatsCard, getDefaultLabStats } from '@/components/lab';

<LabStatsCard
  stats={getDefaultLabStats()}
  showCharts={true}
  period="today"
/>
```

**المزايا:**
- إحصائيات شاملة
- مؤشرات الأداء
- رسوم بيانية
- مؤشرات الاتجاه

### 4. `LabNavigation`
تنقل محسن للتبويبات مع ميزات متقدمة.

```tsx
import { LabNavigation, getDefaultLabNavigation } from '@/components/lab';

<LabNavigation
  items={getDefaultLabNavigation()}
  activeTab="overview"
  onTabChange={setActiveTab}
  showSearch={true}
  showNotifications={true}
  notificationCount={5}
/>
```

**المزايا:**
- تنقل سلس
- بحث مدمج
- إشعارات فورية
- إجراءات سريعة

### 5. `LabMainCard`
بطاقة رئيسية قابلة للتخصيص مع إمكانيات متقدمة.

```tsx
import { LabMainCard } from '@/components/lab';

<LabMainCard
  title="إدارة طلبات المختبر"
  subtitle="عرض وتعديل جميع طلبات المختبر"
  stats={{ total: 150, today: 12, completed: 89 }}
  actions={[
    { type: 'refresh', onClick: handleRefresh },
    { type: 'download', onClick: handleDownload }
  ]}
  search={{ show: true, onSearch: handleSearch }}
  filters={{ show: true, onFilterChange: handleFilter }}
/>
```

**المزايا:**
- تخطيط مرن
- إحصائيات مدمجة
- أدوات بحث وفلترة
- إجراءات قابلة للتخصيص

### 6. `SampleInfoCard`
بطاقة معلومات العينة مع إمكانيات تحرير.

```tsx
import { SampleInfoCard } from '@/components/lab';

<SampleInfoCard
  sample={sample}
  onUpdateStatus={handleUpdateStatus}
  onUpdateCondition={handleUpdateCondition}
  onAddNote={handleAddNote}
  editable={true}
/>
```

**المزايا:**
- عرض شامل لمعلومات العينة
- تحرير مباشر
- إدارة الفحوصات
- ملاحظات مرنة

## 🎨 نظام الألوان

```css
:root {
  --lab-primary: #3B82F6;      /* الأزرق الأساسي */
  --lab-primary-dark: #1E40AF; /* الأزرق الداكن */
  --lab-success: #10B981;      /* الأخضر (نجح) */
  --lab-warning: #F59E0B;      /* البرتقالي (تحذير) */
  --lab-error: #EF4444;        /* الأحمر (خطأ) */
  --lab-info: #3B82F6;         /* الأزرق (معلومات) */
}
```

## 🔧 الاستخدام المتقدم

### تخصيص المكونات

```tsx
import { labCn, labColors } from '@/components/lab';

// استخدام فئات مخصصة
<div className={labCn('lab-card', 'custom-class')}>
  محتوى البطاقة
</div>

// الوصول لألوان النظام
const customStyle = {
  color: labColors.primary,
  backgroundColor: labColors.gray50
};
```

### إضافة أنماط CSS مخصصة

```css
/* استيراد الأنماط الأساسية */
@import '@/components/lab/lab-styles.css';

/* إضافة تخصيصات خاصة */
.lab-custom-component {
  /* أنماطك المخصصة */
}
```

### دوال مساعدة

```tsx
import { formatLabDate, generateLabReference } from '@/components/lab';

// تنسيق التواريخ
const formattedDate = formatLabDate(new Date());

// إنشاء رقم مرجعي
const reference = generateLabReference('LAB');

// حساب المدة
const duration = calculateDuration('2025-11-10 09:00', '2025-11-10 11:30');
```

## 📱 التصميم المتجاوب

جميع المكونات مصممة لتكون متجاوبة:

- **الشاشات الكبيرة**: تخطيط شبكي متقدم
- **الأجهزة اللوحية**: تخطيط متوسط مع الحفاظ على الوظائف
- **الهواتف الذكية**: تخطيط مكدس مع تنقل محسن

## ♿ إمكانية الوصول

- **دعم قارئات الشاشة**: نصوص بديلة مناسبة
- **التباين العالي**: ألوان محسنة للرؤية
- **التنقل بلوحة المفاتيح**: دعم كامل للتنقل
- **تصغير الحركة**: احترام تفضيلات المستخدم

## 🔄 التحريك والانتقالات

```css
/* أنماط التحريك المدمجة */
.lab-fade-in    /* تلاشي */
.lab-slide-in   /* انزلاق */
.lab-scale-in   /* تكبير */
.lab-pulse      /* نبض */
```

## 📊 أمثلة للاستخدام

### مثال بسيط

```tsx
import React from 'react';
import { 
  LabRequestCard, 
  LabStatsCard, 
  getDefaultLabStats 
} from '@/components/lab';

export const SimpleLabView = () => {
  const stats = getDefaultLabStats();
  
  return (
    <div className="space-y-6">
      <LabStatsCard stats={stats} />
      <LabRequestCard request={sampleRequest} />
    </div>
  );
};
```

### مثال متقدم

```tsx
import React, { useState } from 'react';
import { 
  LabNavigation,
  LabMainCard,
  LabRequestsTable,
  QuickActions
} from '@/components/lab';

export const AdvancedLabDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div>
      <LabNavigation
        items={getDefaultLabNavigation()}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <LabMainCard
        title="لوحة تحكم المختبر"
        stats={{ total: 150, today: 12 }}
        search={{ show: true }}
        actions={[
          { type: 'refresh', onClick: refreshData },
          { type: 'download', onClick: exportData }
        ]}
      >
        <LabRequestsTable
          requests={requests}
          onViewDetails={viewDetails}
          onUpdateStatus={updateStatus}
        />
      </LabMainCard>
    </div>
  );
};
```

## 🎯 أفضل الممارسات

1. **استخدم المكونات الافتراضية** كبداية ثم خصصها حسب الحاجة
2. **احتفظ بالتناسق** في استخدام الألوان والخطوط
3. **اختبر على أجهزة متعددة** للتأكد من التجاوب
4. **راعي إمكانية الوصول** عند إضافة محتوى مخصص
5. **استخدم الأنماط المساعدة** بدلاً من كتابة CSS جديد

## 🔧 الاستكشاف وحل المشاكل

### مشاكل شائعة وحلولها

**المشكلة**: المكونات لا تظهر بالشكل المتوقع
**الحل**: تأكد من استيراد ملف `lab-styles.css`

**المشكلة**: الألوان لا تتطابق مع التطبيق
**الحل**: تحقق من متغيرات CSS في ملف `index.css`

**المشكلة**: المكونات لا تتجاوب على الهاتف
**الحل**: تأكد من وجود فئات Tailwind المتجاوبة

## 📝 ملاحظات التطوير

- جميع المكونات مكتوبة بـ TypeScript للأمان
- تستخدم React Hooks الحديثة
- متوافقة مع React 18+
- محسنة للأداء والذاكرة

## 🤝 المساهمة

للمساهمة في تطوير المكونات:

1. اتبع الأنماط المستخدمة
2. أضف اختبارات للوظائف الجديدة
3. حدث التوثيق
4. تأكد من إمكانية الوصول

---

**تم تطوير هذه المكونات بعناية لتوفير تجربة مستخدم متميزة ومتسقة مع نظام إدارة العيادة الشامل.**