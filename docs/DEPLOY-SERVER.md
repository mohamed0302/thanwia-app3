# نشر السيرفر (ضروري لقسم إدارة المدرس)

قسم إدارة المدرس يحتاج سيرفر يعمل. اتبع أحد الخيارين:

## الخيار 1: Railway أو Render (مجاني)

1. ارفع مجلد `server/` إلى GitHub
2. أنشئ مشروع جديد على [Railway](https://railway.app) أو [Render](https://render.com)
3. اختر "Deploy from GitHub" وحدّد مجلد server
4. أضف متغيرات البيئة:
   - `ADMIN_EMAIL`: بريد المدرس (مثل teacher@example.com)
   - `ADMIN_PASSWORD`: كلمة مرور المدرس
5. انسخ رابط السيرفر (مثل https://finapp-xxx.railway.app)
6. عدّل `public/config.json` في مشروعك:
   ```json
   {
     "apiUrl": "https://finapp-xxx.railway.app/api",
     "firebaseVapidKey": "GelHL6c8lO4gxKuhm3CEPiWA22GxiMAnzArjNacKkXk"
   }
   ```
7. أعد بناء التطبيق: `npm run build`

**ملاحظة:** ضع ملف `serviceAccountKey.json` في مجلد server (لـ Firebase والإشعارات).

## الخيار 2: تشغيل السيرفر محلياً

إذا تريد التجربة محلياً:
- شغّل `npm run dev` (يشغّل الواجهة + السيرفر معاً)
- في التطوير، الـ proxy يوجّه `/api` للسيرفر تلقائياً
- الحساب الافتراضي: `teacher@test.com` / `123456`
