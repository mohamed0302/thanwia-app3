# ربط التطبيق بـ Firebase (نظام latest ali)

التطبيق يقرأ من **Firebase Realtime Database** نفس البنية التي يستخدمها نظامك في مجلد `latest ali`.

## البنية في Firebase

```
students/
  {كود_الطالب}/          ← مثلاً 1000, 1001, 1002
    meta/
      الاسم
      الصف
      المجموعة
      الهاتف
      البريد
      code
    grades/              ← رسائل الدرجات (من send_message_to_student مع category='grades')
      {pushId}: { text, timestamp }
    absence/             ← رسائل الغياب (category='absence')
      {pushId}: { text, timestamp }
    messages/            ← رسائل عامة (category='messages')
      {pushId}: { text, timestamp }
```

أي درجة أو غياب ترسلها من السيستم (Python) عبر `send_message_to_student(code, text, 'grades')` أو `'absence'` تظهر تلقائياً في تطبيق الطالب في قسم **الدرجات والغياب**.

## إعداد تطبيق الويب في Firebase

1. افتح [Firebase Console](https://console.firebase.google.com) → مشروعك **alisystem-3a4c5**.
2. **Project Settings** (⚙️) → **General** → تحت **Your apps** اضغط **Add app** واختر **Web** (أيقونة `</>`).
3. سجّل اسم التطبيق (مثلاً `finapp`) ثم **Register app**.
4. انسخ كائن `firebaseConfig` (apiKey, authDomain, databaseURL, projectId, ...).
5. في مجلد المشروع أنشئ ملف **`.env`** وضع القيم كالتالي (بدون علامات اقتباس حول القيم):

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=alisystem-3a4c5.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://alisystem-3a4c5-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=alisystem-3a4c5
VITE_FIREBASE_STORAGE_BUCKET=alisystem-3a4c5.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=1:...
```

6. أعد تشغيل التطبيق: `npm run dev`.

## قواعد الأمان (Realtime Database)

في Firebase Console → **Realtime Database** → **Rules** استخدم قواعد تسمح **بالقراءة فقط** لمسار الطالب عند معرفة الكود (لا يمكن عرض قائمة كل الطلاب):

```json
{
  "rules": {
    "students": {
      "$code": {
        ".read": true,
        ".write": false
      }
    }
  }
}
```

- **قراءة:** التطبيق يقرأ فقط `students/{كود_الطالب}` عند إدخال الطالب للكود؛ لا نعرض قائمة بكل الطلاب.
- **كتابة:** من التطبيق لا يوجد؛ الإضافة والتحديث من نظامك (Python + service account) فقط.

إذا أردت تقييد القراءة أكثر (مثلاً فقط من دومين معيّن) يمكن استخدام `auth != null` أو شروط أخرى لاحقاً.

## التحقق

1. الطالب يدخل **كود الطالب** (مثل 1000 من ملف `students_with_codes.csv`).
2. التطبيق يقرأ `students/1000/meta` ويعرض الاسم والصف في الملف الشخصي.
3. في **الدرجات والغياب** يقرأ `students/1000/grades` و `absence` و `messages` ويعرضها مجمّعة.

لا تحتاج لتغيير شيء في نظامك Python؛ نفس الـ `send_message_to_student` والبنية الحالية كافية.
