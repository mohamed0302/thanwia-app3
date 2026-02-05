# إعداد Firebase — تشغيل التطبيق بالكامل من مكان واحد

## دخول المدرس: معرّف وكلمة مرور ثابتة

المدرس يدخل بمعرّف وكلمة مرور ثابتة من ملف **config.json**:

```json
{
  "teacherEmail": "teacher@test.com",
  "teacherPassword": "123456"
}
```

غيّر القيم كما تريد، ثم أعد بناء التطبيق أو عدّل `dist/config.json` بعد النشر.

## قواعد Firebase (Realtime Database)

للسماح بعمليات الإدارة (فيديوهات، امتحانات، رسائل)، في Rules ضع:

```json
{
  "rules": {
    "videos": { ".read": true, ".write": true },
    "exams": { ".read": true, ".write": true },
    "students": { ".read": true, ".write": true }
  }
}
```

## تشغيل التطبيق

- شغّل: `npm run dev`
- للطالب: أدخل كود الطالب
- للمدرس: أدخل المعرّف وكلمة المرور من config.json (الافتراضي: teacher@test.com / 123456)
