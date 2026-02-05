# Supabase schema (FREE tier)

شغّل في **Supabase SQL Editor**: Dashboard → SQL Editor → New query

---

## 1. جدول الطلاب (إن لم يكن موجوداً)

```sql
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  student_code text unique not null,
  name text not null,
  grade text not null,
  phone text,
  created_at timestamptz default now()
);

alter table public.students enable row level security (rls);

create policy "Students readable"
  on public.students for select using (true);

create policy "No anon insert students"
  on public.students for insert with check (false);
create policy "No anon update students"
  on public.students for update using (false);
```

---

## 2. جدول الرسائل (غياب / درجات / إعلانات)

كل رسالة مرتبطة بطالب معيّن؛ التطبيق يجلب فقط رسائل الطالب المسجّل عبر دالة آمنة.

```sql
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  type text not null check (type in ('absence', 'grade', 'message')),
  content text not null default '',
  created_at timestamptz default now()
);

create index if not exists idx_messages_student_id on public.messages(student_id);
create index if not exists idx_messages_created_at on public.messages(created_at desc);

alter table public.messages enable row level security (rls);

-- لا نسمح بقراءة مباشرة من الجدول (القراءة فقط عبر الدالة)
create policy "No direct select messages"
  on public.messages for select using (false);

create policy "No anon insert messages"
  on public.messages for insert with check (false);
create policy "No anon update messages"
  on public.messages for update using (false);

-- دالة آمنة: تجلب رسائل طالب واحد فقط (باستخدام id الطالب)
create or replace function public.get_student_messages(p_student_id uuid)
returns setof public.messages
language sql
security definer
set search_path = public
as $$
  select * from public.messages where student_id = p_student_id order by created_at desc;
$$;

grant execute on function public.get_student_messages(uuid) to anon;
grant execute on function public.get_student_messages(uuid) to authenticated;
```

---

## 3. جدول الامتحانات (عنوان + رابط، حسب الصف)

```sql
create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  grade text not null,
  created_at timestamptz default now()
);

create index if not exists idx_exams_grade on public.exams(grade);

alter table public.exams enable row level security (rls);

create policy "Exams readable by grade"
  on public.exams for select using (true);

create policy "No anon insert exams"
  on public.exams for insert with check (false);
create policy "No anon update exams"
  on public.exams for update using (false);
```

---

## 4. جدول فيديوهات الشرح (حسب الصف + مادة اختيارية)

```sql
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  video_url text not null,
  grade text not null,
  subject text,
  created_at timestamptz default now()
);

create index if not exists idx_videos_grade on public.videos(grade);

alter table public.videos enable row level security (rls);

create policy "Videos readable by grade"
  on public.videos for select using (true);

create policy "No anon insert videos"
  on public.videos for insert with check (false);
create policy "No anon update videos"
  on public.videos for update using (false);
```

---

## 5. بيانات تجريبية

```sql
-- طالب تجريبي
insert into public.students (student_code, name, grade, phone)
values ('STU001', 'أحمد محمد', '1st_secondary', null)
on conflict (student_code) do nothing;

-- رسائل للطالب (استبدل الطالب_id بـ id الطالب من جدول students)
do $$
declare
  sid uuid;
begin
  select id into sid from public.students where student_code = 'STU001' limit 1;
  if sid is not null then
    insert into public.messages (student_id, type, content)
    values
      (sid, 'grade', 'امتحان الفصل الأول: 85/100'),
      (sid, 'absence', 'غياب يوم ١٠/١ - مراجعة مع المدرس'),
      (sid, 'message', 'إعلان: موعد الامتحان النصفي الأسبوع القادم');
  end if;
end $$;

-- امتحانات (حسب الصف) — شغّل مرة أو أضف يدوياً من لوحة Supabase
insert into public.exams (title, url, grade)
values
  ('امتحان رياضيات - أولى ثانوي', 'https://example.com/exam1', '1st_secondary'),
  ('امتحان عربي - أولى ثانوي', 'https://example.com/exam2', '1st_secondary');

-- فيديوهات (حسب الصف)
insert into public.videos (title, video_url, grade, subject)
values
  ('الدرس الأول - الجبر', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '1st_secondary', 'رياضيات'),
  ('الدرس الثاني - الهندسة', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '1st_secondary', 'رياضيات');
```

---

## قيم الصفوف المستخدمة في التطبيق

- `1st_secondary` — أولى ثانوي  
- `2nd_secondary` — ثانية ثانوي  
- `3rd_secondary` — ثالثة ثانوي  

يمكنك إضافة صفوف أخرى بنفس النمط (نص واضح بالإنجليزية أو عربي حسب ما تستخدمه في التطبيق).
