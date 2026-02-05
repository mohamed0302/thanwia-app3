# Auth module — how to test

## What was done (Step 1: Authentication only)

1. **Dual login**
   - **Guest:** button "الدخول كزائر" — no backend write, limited access (same as before).
   - **Student code:** input "كود الطالب" → fetch from Supabase (or local demo) → store session in `localStorage` (same keys `finapp_token` / `finapp_user`), then redirect to home.

2. **Session**
   - Stored in `localStorage`: `finapp_user` (JSON with `id`, `student_code`, `name`, `grade`, `phone`, `role: 'student'`) and `finapp_token` (e.g. `student-<id>`).
   - No paid auth; Supabase used only as free DB to fetch student by code.

3. **Profile**
   - Page `/profile` shows: name, grade, student code, avatar placeholder (first letter of name). All from session — no manual entry.
   - Guest and teacher/assistant get a minimal view.

4. **Code added**
   - `src/lib/supabase.js` — Supabase client (only if env set).
   - `src/features/auth/constants.js` — session keys, `normalizeStudentCode`.
   - `src/features/auth/studentAuth.js` — `fetchStudentByCode`, `buildStudentSession`.
   - `src/features/auth/index.js` — re-exports.
   - `src/pages/Login.jsx` — student code form first, then guest, then collapsible "دخول المدرس".
   - `src/pages/Profile.jsx` — new page.
   - `src/App.jsx` — route `/profile`, title.
   - `src/components/Layout.jsx` — title for `/profile`.
   - `src/components/Header.jsx` — "الملف" link, dashboard only for teacher/assistant.
   - `src/components/BottomNav.jsx` — added "الملف" tab.
   - `.env.example` — `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
   - `docs/SUPABASE_SCHEMA.md` — SQL for `students` table.
   - `docs/AUTH_MODULE_TEST.md` — this file.

---

## How to test

### 1. Install dependency

```bash
cd c:\Users\Mohamed\Desktop\finapp
npm install
```

### 2. Guest login (no Supabase)

- Run `npm run dev`, open http://localhost:5173.
- Click **"الدخول كزائر"**.
- You should land on Home. Open **الملف** (profile): should show "زائر" and limited message.

### 3. Student code — without Supabase (demo)

- Logout (خروج), then in login type code: **STU001** or **demo**.
- Click **"تسجيل الدخول بالكود"**.
- You should land on Home. Open **الملف**: name "طالب تجريبي", grade "1st_secondary", code STU001/demo.

### 4. Student code — with Supabase

- Create project at https://supabase.com (free).
- In SQL Editor run the script from `docs/SUPABASE_SCHEMA.md` (create `students` table + seed `STU001`).
- Copy Project URL and anon key to `.env`:
  - `VITE_SUPABASE_URL=https://xxx.supabase.co`
  - `VITE_SUPABASE_ANON_KEY=eyJ...`
- Restart dev server. Login with code **STU001** → should load real row (e.g. "أحمد محمد", "1st_secondary") and profile should show it.

### 5. Teacher login (unchanged)

- On login page click **"دخول المدرس"** to expand.
- Enter email + password (e.g. `teacher@test.com` / `123456` if backend is running, or any email + `123456` when backend is down for demo).
- Dashboard and rest of app should work as before.

---

## Next steps (not in this phase)

- Home screen redesign (welcome + cards).
- Messages / grades / exams / videos by grade.
- Offline cache and lazy loading.
