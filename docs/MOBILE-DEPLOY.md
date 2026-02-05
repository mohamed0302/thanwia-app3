# تشغيل التطبيق على الموبايل

## جعل جزء الإدارة والإشعارات يعملان عند النشر

### ملف config.json

بعد `npm run build`، عدّل ملف **`dist/config.json`** (أو `public/config.json` قبل البناء) بالمحتوى التالي:

```json
{
  "apiUrl": "https://عنوان-سيرفرك.com/api",
  "firebaseVapidKey": "مفتاح-VAPID-من-Firebase"
}
```

- **apiUrl**: عنوان الـ API (السيرفر الذي يشغّل `server/`). مطلوب لكي يعمل جزء إدارة المدرس.
- **firebaseVapidKey**: من Firebase Console → Cloud Messaging → Web Push certificates. مطلوب للإشعارات على الموبايل.

### متطلبات السيرفر

1. نشر مجلد `server/` على خادم (مثلاً Railway، Render، أو VPS)
2. تفعيل CORS للسماح بالطلبات من دومين التطبيق
3. إعداد Firebase Admin (`serviceAccountKey.json`) على السيرفر لإرسال الإشعارات

---

## 1. PWA (مثبت كتطبيق من المتصفح)

- شغّل السيرفر وافتح الموقع من متصفح الموبايل (Chrome أو Edge) عبر HTTPS
- اضغط "إضافة إلى الشاشة الرئيسية" أو "تثبيت التطبيق"
- عدّل `config.json` كما في الأعلى لتفعيل الإشعارات

## 2. تطبيق أندرويد (APK)

### المتطلبات

- Node.js
- Android Studio
- JDK 17

### الخطوات

```bash
# 1. تثبيت الحزم
npm install

# 2. إعداد config.json للنشر
# عدّل public/config.json قبل البناء، أو dist/config.json بعده

# 3. إضافة منصة أندرويد (مرة واحدة فقط)
npm run cap:add:android

# 4. بناء وفتح Android Studio
npm run cap:android
```

سيتم فتح Android Studio. من هناك:

- Build → Build Bundle(s) / APK(s) → Build APK(s)
- أو Run للاختبار على جهاز/محاكي

### الأيقونات

الأيقونات تُنسخ تلقائياً من مجلد `icons/` عند كل `npm run build`.

## 3. الإشعارات

- يُطلب إذن الإشعارات تلقائياً من الطالب عند الدخول
- يتم تسجيل الجهاز في Firebase عند الموافقة
- عندما يرسل المدرس رسالة، يصل الإشعار للموبايل
- التطبيق يجب أن يُفتح مرة على الأقل وأن يوافق الطالب على الإشعارات
