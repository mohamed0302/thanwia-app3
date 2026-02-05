import { Link } from 'react-router-dom'

const cards = [
  { to: '/admin/account', title: 'حسابي', desc: 'تغيير البريد والاسم وكلمة المرور — تحكم كامل', icon: '👤', color: 'bg-slate-600' },
  { to: '/admin/videos', title: 'الفيديوهات', desc: 'إضافة أو حذف فيديوهات الشرح حسب الصف', icon: '🎬', color: 'bg-primary-500' },
  { to: '/admin/exams', title: 'الامتحانات', desc: 'إضافة أو حذف روابط الامتحانات حسب الصف', icon: '📝', color: 'bg-emerald-500' },
  { to: '/admin/messages', title: 'الرسائل والغياب', desc: 'عرض وحذف رسائل الدرجات والغياب لأي طالب', icon: '📋', color: 'bg-amber-500' },
]

export default function AdminDashboard() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-slate-800 mb-2">لوحة تحكم المدرس</h2>
      <p className="text-slate-500 text-sm mb-6">اختر القسم للتحكم في المحتوى</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="block">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow text-right">
              <span className={`inline-flex w-12 h-12 rounded-xl items-center justify-center text-2xl ${c.color} text-white mb-3`}>
                {c.icon}
              </span>
              <h3 className="font-semibold text-slate-800">{c.title}</h3>
              <p className="text-slate-500 text-sm mt-1">{c.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
