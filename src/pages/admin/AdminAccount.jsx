import { useAuth } from '../../context/AuthContext'
import { DEVELOPER } from '../../lib/branding'

export default function AdminAccount() {
  const { user: authUser } = useAuth()

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-xl font-bold text-slate-800">حسابي</h2>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <p className="text-slate-700"><strong>البريد:</strong> {authUser?.email || '—'}</p>
        <p className="text-slate-500 text-sm mt-2">المعرّف وكلمة المرور ثابتة من ملف config.json — لتغييرهما عدّل الملف وأعد تحميل التطبيق.</p>
      </div>

      {/* معلومات المبرمج */}
      <section className="rounded-2xl bg-slate-50 border border-slate-200 p-4 mt-6">
        <h3 className="text-slate-700 font-semibold text-sm mb-2">معلومات التطبيق والمبرمج</h3>
        <p className="text-slate-600 text-sm">طور التطبيق بالكامل: <span className="font-bold text-slate-800">{DEVELOPER.name}</span></p>
        <div className="mt-2 text-slate-500 text-xs space-y-0.5">
          <a href={`tel:${DEVELOPER.phone}`} className="block text-primary-600 hover:underline">{DEVELOPER.phone}</a>
          <a href={`mailto:${DEVELOPER.email}`} className="block text-primary-600 hover:underline">{DEVELOPER.email}</a>
          <a href={DEVELOPER.linkedin} target="_blank" rel="noopener noreferrer" className="block text-primary-600 hover:underline">LinkedIn</a>
        </div>
      </section>
    </div>
  )
}
