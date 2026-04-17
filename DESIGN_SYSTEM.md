# Shoofly Admin — Design System Reference

هذا الملف هو المرجع الكامل لتصميم النظام. **كل صفحة جديدة أو تعديل لازم يتبع هذا الملف حرفياً.**

---

## 1. نظام الألوان (Color Tokens)

```css
/* globals.css — @theme inline */

/* الخلفيات */
--color-background: #f9fafb;   /* خلفية الصفحة الرئيسية */
--color-surface:    #ffffff;   /* خلفية الكروت والجداول والـ sidebar */

/* النصوص */
--color-foreground: #111827;   /* نص أساسي — headings وقيم مهمة */
--color-subtle:     #6b7280;   /* نص ثانوي — labels ووصف */
--color-faint:      #9ca3af;   /* نص خافت — timestamps ومعرّفات */

/* البراند */
--color-primary:          #f97316;  /* برتقالي — الزرار الرئيسي والـ active state */
--color-primary-hover:    #ea6c0a;  /* برتقالي داكن للـ hover */
--color-primary-foreground: #ffffff;/* نص فوق البرتقالي */
--color-primary-subtle:   #fff7ed;  /* خلفية خفيفة جداً للـ active nav item */
--color-primary-muted:    #fed7aa;  /* border أو accent خفيف */

/* الحدود */
--color-border:       #e5e7eb;  /* border عادي */
--color-border-strong: #d1d5db; /* border أقوى للـ dividers */

/* الحالات */
--color-success:    #16a34a;  --color-success-bg:  #f0fdf4;
--color-warning:    #d97706;  --color-warning-bg:  #fffbeb;
--color-danger:     #dc2626;  --color-danger-bg:   #fef2f2;
--color-info:       #2563eb;  --color-info-bg:     #eff6ff;
```

**القواعد:**
- لا تستخدم ألوان مباشرة زي `text-white` أو `bg-black`. دايما استخدم الـ tokens.
- نص فوق خلفية ملونة لازم يكون `text-white` أو `text-gray-900` — مش أي حاجة تانية.
- البرتقالي بس للـ CTAs وال active states والـ badges المهمة. مش للزينة.

---

## 2. التايبوغرافي (Typography)

**الفونت:** `Tajawal` (Arabic) — وحيد للكل، مش فونتين.

```
Font Base:     14px / line-height: 1.5
Font Smooth:   antialiased
```

### Scale الثابت:

| الاستخدام | Class | Weight |
|-----------|-------|--------|
| Page Title (H1) | `text-2xl` | `font-bold` |
| Section Title (H2) | `text-base` | `font-semibold` |
| Card Label | `text-xs` | `font-medium` |
| Card Value | `text-2xl` | `font-bold` |
| Table Header | `text-xs uppercase tracking-wide` | `font-semibold` |
| Table Cell | `text-sm` | `font-normal / font-medium` |
| Badge | `text-xs` | `font-semibold` |
| Sidebar Nav Item | `text-[13px]` | `font-medium` |
| Sub-label / hint | `text-xs` | `font-normal` |

**قاعدة ذهبية:** أكبر فونت في الصفحة هو `text-2xl`. ما في `text-4xl` أو `text-3xl` في الـ admin.

---

## 3. المسافات والـ Layout

### الهيكل الأساسي:
```
┌─────────────────────────────────────────────────┐
│  Sidebar (256px, fixed, right)  │  Main Content │
│  - Brand Logo                   │  - Topbar     │
│  - Nav Groups                   │  - Page Body  │
│  - User Footer                  │               │
└─────────────────────────────────────────────────┘
```

### قواعد المسافات:
```
Page Padding:     px-6 py-6  (24px أفقي، 24px رأسي)
Section Gap:      space-y-6  (24px بين الأقسام)
Card Inner:       p-5        (20px داخل الكروت)
Card Grid Gap:    gap-4      (16px بين الكروت)
Table Cell:       px-4 py-3  (أفقي 16px، رأسي 12px)
Sidebar Width:    w-64       (256px)
Topbar Height:    h-16       (64px)
```

### الـ Page Header (لازم يكون في كل صفحة):
```tsx
<div className="mb-6">
  <h1 className="text-2xl font-bold text-gray-900">عنوان الصفحة</h1>
  <p className="text-sm text-gray-500 mt-1">وصف مختصر لغرض الصفحة</p>
</div>
```

---

## 4. المكونات (Components)

### 4.1 الكرت الإحصائي (Stat Card)

**الشكل الوحيد المسموح به:**
```tsx
<div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
  <div className="flex items-start justify-between mb-4">
    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
      <Icon className="w-5 h-5 text-orange-500" />
    </div>
    {/* اختياري: trend badge */}
    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
      +12%
    </span>
  </div>
  <p className="text-xs font-medium text-gray-500 mb-1">إجمالي المستخدمين</p>
  <p className="text-2xl font-bold text-gray-900">1,240</p>
</div>
```

**قواعد الـ Stat Card:**
- الخلفية دايما `bg-white`.
- الأيقونة في مربع `w-10 h-10` بخلفية فاتحة (`bg-orange-50`، `bg-blue-50`، إلخ).
- الـ label فوق، الـ value تحت.
- `shadow-sm` فقط — مش shadow كبيرة.
- `rounded-xl` — مش أكبر.
- مش فيها borders ملونة أو جوانب ملونة.

### 4.2 الجدول (Table)

```tsx
<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
  {/* Header اختياري */}
  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
    <h2 className="text-base font-semibold text-gray-900">عنوان الجدول</h2>
    <button className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors">
      عرض الكل
    </button>
  </div>

  <table className="w-full">
    <thead>
      <tr className="border-b border-gray-100 bg-gray-50/50">
        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
          العمود
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-100">
      <tr className="hover:bg-gray-50/60 transition-colors">
        <td className="px-4 py-3 text-sm text-gray-900">القيمة</td>
      </tr>
    </tbody>
  </table>
</div>
```

### 4.3 الـ Badge / الحالة (Status Badge)

```tsx
/* دايما استخدم هذا النمط */

// pending / انتظار
<span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
  قيد الانتظار
</span>

// active / مكتمل
<span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700">
  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
  مكتمل
</span>

// danger / ملغى
<span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700">
  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
  ملغى
</span>

// info / قيد المعالجة
<span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
  قيد المعالجة
</span>
```

### 4.4 الزرار (Button)

```tsx
/* Primary — الفعل الأساسي */
<button className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 active:scale-95 transition-all shadow-sm">
  <Plus className="w-4 h-4" />
  إضافة جديد
</button>

/* Secondary — فعل ثانوي */
<button className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all">
  تصدير
</button>

/* Ghost — فعل خفيف */
<button className="inline-flex items-center gap-2 px-3 py-1.5 text-gray-500 text-sm font-medium rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors">
  عرض الكل
</button>

/* Danger */
<button className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 active:scale-95 transition-all">
  حذف
</button>
```

### 4.5 الـ Input و Search

```tsx
/* Search */
<div className="relative">
  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
  <input
    placeholder="بحث..."
    className="w-full h-9 bg-white border border-gray-200 rounded-lg pr-9 pl-4 text-sm text-gray-900 placeholder:text-gray-400 
               focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
  />
</div>

/* Select */
<select className="h-9 bg-white border border-gray-200 rounded-lg px-3 text-sm text-gray-700 
                   focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all appearance-none cursor-pointer">
  <option>كل الحالات</option>
</select>

/* Text Input */
<input
  className="w-full h-10 bg-white border border-gray-200 rounded-lg px-4 text-sm text-gray-900 placeholder:text-gray-400 
             focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
/>
```

### 4.6 الـ Avatar (دائري أو مربع)

```tsx
/* مربع — للمستخدمين في الجداول */
<div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
  م
</div>

/* دائري — للـ topbar والـ comments */
<div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
  م
</div>
```

### 4.7 الـ Loading Skeleton

```tsx
/* استخدمها بدل "جاري التحميل" */
<div className="space-y-3">
  {[...Array(5)].map((_, i) => (
    <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
  ))}
</div>
```

### 4.8 الـ Empty State

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
    <Icon className="w-6 h-6 text-gray-400" />
  </div>
  <p className="text-sm font-semibold text-gray-900 mb-1">لا توجد نتائج</p>
  <p className="text-xs text-gray-500">جرب تغيير معايير البحث</p>
</div>
```

---

## 5. الـ Sidebar

**الحجم:** `w-64` (256px) ثابت، `sticky top-0 h-screen`.

**البنية:**
```
┌──────────────────────────┐
│  Brand (h-16)            │  ← Logo + اسم المنصة
├──────────────────────────┤
│  Nav Groups              │  ← p-3, space-y-5
│   • Group Title          │  ← text-[10px] uppercase tracking-widest text-gray-400
│   • Nav Items            │  ← rounded-lg, text-[13px]
├──────────────────────────┤
│  User Footer             │  ← user card + logout button
└──────────────────────────┘
```

**الـ Nav Item — Active:**
```tsx
className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium
           bg-orange-50 text-orange-600"
// الأيقونة: text-orange-500
// الـ badge: bg-orange-500 text-white
```

**الـ Nav Item — Inactive:**
```tsx
className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium
           text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
// الأيقونة: text-gray-400
// الـ badge: bg-gray-100 text-gray-500
```

---

## 6. هيكل الصفحة الكامل

```tsx
// template لكل صفحة admin

export default function PageName() {
  return (
    <div className="p-6 max-w-7xl" dir="rtl">

      {/* 1. Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">عنوان الصفحة</h1>
        <p className="text-sm text-gray-500 mt-1">وصف مختصر</p>
      </div>

      {/* 2. Controls (Search / Filter / Actions) */}
      <div className="flex items-center gap-3 mb-6">
        {/* search input */}
        {/* filter selects */}
        <div className="flex-1" />
        {/* action buttons */}
      </div>

      {/* 3. Stat Cards (إن وجدت) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Stat Cards */}
      </div>

      {/* 4. Main Content (Table / List / Detail) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table or Content */}
      </div>

      {/* 5. Pagination (إن وجدت) */}
      <div className="flex items-center justify-between pt-4 text-sm text-gray-500">
        <span>عرض X من Y</span>
        <div className="flex gap-2">
          {/* pagination buttons */}
        </div>
      </div>
    </div>
  );
}
```

---

## 7. قواعد الـ Shadows

```
shadow-sm  → للكروت والجداول (الاستخدام الافتراضي)
shadow-md  → للـ dropdowns والـ popovers
shadow-lg  → للـ modals والـ drawers
لا shadow  → للعناصر داخل كروت
```

---

## 8. ما هو ممنوع تماماً

| ممنوع | البديل |
|-------|--------|
| `text-4xl` أو `text-3xl` | `text-2xl` كأقصى حد |
| ألوان خلفية داكنة `bg-slate-950` | `bg-white` أو `bg-gray-50` |
| `border-4` أو `border-8` | `border` أو `border-2` فقط |
| Shadow كبيرة `shadow-2xl` | `shadow-sm` أو `shadow-md` |
| Gradient خلفيات | ألوان solid فقط |
| `rounded-3xl` أو أكبر | `rounded-xl` كأقصى حد |
| أكثر من 5 ألوان في صفحة | orange + gray scale فقط |
| Text tracking عريض `tracking-widest` | بس في الـ table headers و section labels |
| `font-black` | `font-bold` أو `font-semibold` |
| Animation مبالغ فيها | `transition-colors` و `transition-all` بس |
| Emojis في الكود | أيقونات Lucide فقط |

---

## 9. نظام الـ Colors في الأدوار والحالات

### أدوار المستخدمين:
```
admin    → bg-purple-50  text-purple-700
client   → bg-blue-50    text-blue-700
vendor   → bg-orange-50  text-orange-700
delivery → bg-green-50   text-green-700
```

### حالات الطلبات:
```
PENDING_QUOTES / انتظار عروض   → amber   (bg-amber-50  text-amber-700)
REVIEWING_QUOTES / مراجعة       → blue    (bg-blue-50   text-blue-700)
ORDER_PLACED / تم الطلب         → indigo  (bg-indigo-50 text-indigo-700)
ORDER_PAID / تم الدفع           → green   (bg-green-50  text-green-700)
OUT_FOR_DELIVERY / في التوصيل   → orange  (bg-orange-50 text-orange-700)
DELIVERED / تم التسليم           → green   (bg-green-50  text-green-700)
CANCELLED / ملغى                → red     (bg-red-50    text-red-700)
```

---

## 10. الأيقونات

**المكتبة:** Lucide React حصراً.

**الأحجام المسموح بها فقط:**
```
w-4 h-4  (16px) → داخل الجداول والـ badges
w-5 h-5  (20px) → داخل الكروت الإحصائية وأيقونات الـ Nav
w-6 h-6  (24px) → الـ empty states والـ big indicators
```

**أيقونات الـ Nav الرسمية:**
```
LayoutGrid  → لوحة التحكم
Package     → الطلبات
Truck       → التوصيل / التتبع
BarChart3   → التحليلات / المالية
Users       → المستخدمين
Briefcase   → الموردين
CreditCard  → المدفوعات / السحب
Shield      → الـ Brand Logo
```

---

## 11. الـ Responsive

```
Mobile  (< 768px):  sidebar مخفي، topbar فيه زرار menu
Tablet  (768-1024): sidebar overlay عند الضغط
Desktop (> 1024px): sidebar ثابت على اليمين
```

```tsx
// sidebar على الـ desktop
<aside className="hidden lg:flex w-64 shrink-0 sticky top-0 h-screen">

// زرار المحمول
<button className="lg:hidden ...">
  <Menu className="w-5 h-5" />
</button>
```

---

*آخر تحديث: نظام تصميم Shoofly Admin v1.0*
