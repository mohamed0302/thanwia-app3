import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Card from '../components/Card'
import { DEVELOPER } from '../lib/branding'

const displayName = (user) => {
  if (!user) return 'مرحباً'
  if (user.role === 'student' && user.name) return user.name
  if (user.name) return user.name
  if (user.role === 'guest') return 'زائر'
  return 'مرحباً'
}

const cards = [
  { id: 'grades', to: '/grades', title: 'الدرجات والغياب', desc: 'الحضور والغياب والدرجات والملاحظات', icon: '📋', color: 'bg-emerald-50 text-emerald-700' },
  { id: 'exams', to: '/exams', title: 'الامتحانات', desc: 'روابط الامتحانات وابدأ الامتحان', icon: '📝', color: 'bg-amber-50 text-amber-700' },
  { id: 'videos', to: '/videos', title: 'فيديوهات الشرح', desc: 'دروسك حسب صفك فقط', icon: '🎬', color: 'bg-primary-50 text-primary-700' },
]

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const name = displayName(user)

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 p-5 text-white shadow-lg">
        <p className="text-primary-100 text-sm mb-1">مرحباً بك</p>
        <h2 className="text-xl font-bold">{name}</h2>
        <p className="text-primary-100/90 text-sm mt-1">
          اختر القسم للمتابعة
        </p>
        <p className="text-primary-100/80 text-xs mt-3 pt-3 border-t border-white/20">
          مطور التطبيق: <span className="font-semibold">{DEVELOPER.name}</span>
        </p>
      </section>

      <section>
        <h3 className="text-slate-600 text-sm font-medium mb-3">الأقسام</h3>
        <div className="space-y-3">
          {cards.map((item) => (
            <Card key={item.id} onClick={() => navigate(item.to)}>
              <div className="flex items-center gap-4">
                <span className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${item.color}`}>
                  {item.icon}
                </span>
                <div className="flex-1 text-right min-w-0">
                  <h4 className="font-semibold text-slate-800">{item.title}</h4>
                  <p className="text-slate-500 text-sm">{item.desc}</p>
                </div>
                <span className="text-slate-400 shrink-0">←</span>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
