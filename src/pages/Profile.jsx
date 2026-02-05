/**
 * Auto profile — data from session only (no manual entry).
 * Student: name, grade, student_code, avatar placeholder.
 * Guest: limited view.
 */
import { useAuth } from '../context/AuthContext'
import { APP_NAME, DEVELOPER } from '../lib/branding'

export default function Profile() {
  const { user } = useAuth()
  const isStudent = user?.role === 'student'
  const isGuest = user?.role === 'guest'

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6">
        <h2 className="text-slate-600 text-sm font-medium mb-4">الملف الشخصي</h2>

        <div className="flex flex-col items-center text-center">
          {/* Avatar placeholder — same for all, no upload in this phase */}
          <div
            className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-3xl text-primary-600 mb-4"
            aria-hidden
          >
            {isStudent && user?.name ? user.name.charAt(0) : isGuest ? '?' : '👤'}
          </div>

          {isStudent && (
            <>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{user.name || '—'}</h3>
              <p className="text-slate-500 text-sm mt-1">الصف: {user.grade || '—'}</p>
              <p className="text-slate-400 text-xs mt-2 font-mono">كود الطالب: {user.student_code || '—'}</p>
              {user.phone && (
                <p className="text-slate-500 text-sm mt-1">الهاتف: {user.phone}</p>
              )}
            </>
          )}

          {isGuest && (
            <>
              <h3 className="text-xl font-bold text-slate-800 mt-1">زائر</h3>
              <p className="text-slate-500 text-sm mt-1">محتوى محدود (فيديوهات عامة فقط)</p>
            </>
          )}

          {user && !isStudent && !isGuest && (
            <>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{user.name || user.email || 'مستخدم'}</h3>
              <p className="text-slate-500 text-sm mt-1">دخول المدرس / المساعد</p>
            </>
          )}
        </div>
      </section>

      {/* معلومات التطبيق والمبرمج */}
      <section className="rounded-2xl bg-slate-100/80 border border-slate-200 p-5">
        <h2 className="text-slate-700 text-sm font-semibold mb-3">معلومات التطبيق</h2>
        <p className="text-slate-600 text-sm mb-4">{APP_NAME} — تطبيق موبايل للمدرس والطلبة</p>
        <div className="rounded-xl bg-white border border-slate-200 p-4 space-y-2">
          <h3 className="text-slate-800 font-bold text-base">المبرمج: {DEVELOPER.name}</h3>
          <p className="text-slate-600 text-sm">مطوّر التطبيق بالكامل</p>
          <div className="pt-2 space-y-1.5">
            <a href={`tel:${DEVELOPER.phone}`} className="block text-primary-600 hover:text-primary-700 text-sm font-medium">
              📞 {DEVELOPER.phone}
            </a>
            <a href={`mailto:${DEVELOPER.email}`} className="block text-primary-600 hover:text-primary-700 text-sm font-medium">
              ✉️ {DEVELOPER.email}
            </a>
            <a href={DEVELOPER.linkedin} target="_blank" rel="noopener noreferrer" className="block text-primary-600 hover:text-primary-700 text-sm font-medium">
              🔗 LinkedIn
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
