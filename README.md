# تطبيق المدرس — FinApp

تطبيق ويب/موبايل خفيف للمدرس: فيديوهات، حجوزات، غياب ودرجات.

## التشغيل السريع (بدون Backend)

1. تثبيت الحزم وتشغيل الواجهة:
```bash
cd c:\Users\Mohamed\Desktop\finapp
npm install
npm run dev
```
2. افتح المتصفح على: http://localhost:5173
3. **للطالب:** أدخل كود الطالب (مثل `STU001` أو `demo` بدون Supabase) أو اضغط "الدخول كزائر"
4. **للمدرس:** اضغط "دخول المدرس" ثم البريد + كلمة المرور (مثل `teacher@test.com` / `123456`)

---

## ربط مع Firebase (نظامك — latest ali)

إذا ملف الطلاب والدرجات والغياب على **Firebase Realtime Database** (مثل نظامك في مجلد `latest ali`):

1. في [Firebase Console](https://console.firebase.google.com) → مشروعك → **Add app** → Web، ثم انسخ إعدادات الـ config.
2. أنشئ ملف `.env` في جذر المشروع واملأ قيم Firebase (انظر `.env.example` و `docs/FIREBASE_SETUP.md`).
3. شغّل `npm run dev` — الطالب يدخل **كود الطالب** (مثل 1000، 1001 من ملف الطلاب) فيظهر اسمه وبياناته، وأي **درجة أو غياب** مرسلة من السيستم تظهر في قسم الدرجات والغياب.

التفاصيل وقواعد الأمان: **`docs/FIREBASE_SETUP.md`**

---

## تشغيل مع Supabase (للطلاب — مجاني)

1. أنشئ مشروعاً مجانياً على [Supabase](https://supabase.com)
2. من **SQL Editor** شغّل السكربتات في `docs/SUPABASE_SCHEMA.md` (جدول الطلاب، الرسائل، الامتحانات، الفيديوهات + بيانات تجريبية)
3. انسخ من Project Settings → API: **Project URL** و **anon public** key
4. أنشئ ملف `.env` في جذر المشروع:
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```
5. أعد تشغيل `npm run dev` — الطالب يسجّل دخوله بالكود ويظهر اسمه وبياناته تلقائياً

---

## التشغيل مع الـ Backend (بيانات حقيقية)

1. تشغيل السيرفر (في طرفية أولى):
```bash
cd c:\Users\Mohamed\Desktop\finapp\server
npm install
npm run dev
```
2. تشغيل الواجهة (في طرفية ثانية):
```bash
cd c:\Users\Mohamed\Desktop\finapp
npm run dev
```
3. **حسابات الدخول:**
   - افتراضي: **المدرس** `teacher@test.com` / `123456`
   - أو عند **أول تشغيل** يمكنك تعيين بريدك وكلمة مرورك عبر متغيرات البيئة قبل تشغيل السيرفر:
     - `ADMIN_EMAIL=your@email.com`
     - `ADMIN_PASSWORD=yourPassword`
     - `ADMIN_NAME=اسمك`
   - بعد الدخول من لوحة **الإدارة → حسابي** يمكنك تغيير البريد والاسم وكلمة المرور وتحكم كامل من عندك.

البيانات تُحفظ في `server/data.json`.

---

## لوحة تحكم المدرس (الإدارة)

قسم **للمدرس والمساعد فقط** للتحكم في المحتوى:

1. **تسجيل الدخول** كالمدرس (دخول المدرس من صفحة تسجيل الدخول).
2. من الواجهة اضغط **«الإدارة»** في الأعلى أو افتح الرابط: **`/admin`**.
3. من لوحة الإدارة يمكنك:
   - **الفيديوهات:** اختيار الصف، إضافة فيديو (عنوان + رابط + مادة)، وحذف أي فيديو. الفيديوهات تُحفظ في Firebase وتظهر للطلاب حسب صفهم.
   - **الرسائل والغياب:** إدخال كود الطالب، عرض كل رسائله (درجات، غياب، إعلانات)، وحذف أي رسالة.

**مطلوب لعمل الإدارة مع Firebase:**

- في مجلد **`server`** ضع نسخة من ملف **`serviceAccountKey.json`** (من مشروع Firebase / مجلد `latest ali`).
- في مجلد `server` نفّذ: `npm install` (لتثبيت `firebase-admin`).

بدون هذا الملف، السيرفر يعمل لكن طلبات الإدارة (فيديوهات / حذف رسائل) سترجع «Firebase غير متصل».

---

## بناء تطبيق أندرويد (APK)

1. تثبيت Capacitor وإضافة أندرويد:
```bash
cd c:\Users\Mohamed\Desktop\finapp
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init
npx cap add android
```
2. بناء المشروع ثم نسخه لـ Capacitor:
```bash
npm run build
npx cap copy
npx cap sync
```
3. فتح المشروع في Android Studio وبناء الـ APK:
```bash
npx cap open android
```
من Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s).

**ملاحظة:** بناء الـ APK يحتاج تثبيت [Android Studio](https://developer.android.com/studio). إذا كان جهازك ضعيفاً يمكنك استخدام التطبيق كـ PWA من المتصفح أو بناء الـ APK لاحقاً على جهاز آخر.

---

## هيكل المشروع

- `src/` — واجهة React (صفحات، مكونات، تسجيل دخول، API)
- `server/` — Backend Express (JWT، فيديوهات، حجوزات، درجات)
- `capacitor.config.json` — إعدادات تطبيق الموبايل

## التقنيات

- Frontend: React + Vite + Tailwind + React Router
- Backend: Node.js + Express + JWT
- تخزين: ملف JSON (يمكن استبداله بقاعدة بيانات لاحقاً)
- موبايل: Capacitor (Android)
"# thanwia-app3" 
"# thanwia-app3" 
