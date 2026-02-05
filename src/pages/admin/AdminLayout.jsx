import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { APP_NAME, TEACHER_NAME, PHOTOS } from '../../lib/branding'

const navItems = [
  { to: '/admin', end: true, label: 'لوحة التحكم', icon: '📊' },
  { to: '/admin/account', end: false, label: 'حسابي', icon: '👤' },
  { to: '/admin/videos', end: false, label: 'الفيديوهات', icon: '🎬' },
  { to: '/admin/messages', end: false, label: 'الرسائل والغياب', icon: '📋' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      <aside className="bg-slate-800 text-white w-full md:w-56 shrink-0 safe-bottom">
        <div className="p-4 border-b border-slate-700">
          <img src={PHOTOS.logo} alt="" className="w-12 h-12 rounded-xl object-contain bg-slate-700/50 mb-2" onError={(e) => { e.target.style.display = 'none' }} />
          <h1 className="font-bold text-lg">{APP_NAME}</h1>
          <p className="text-slate-400 text-sm">{user?.name || user?.email || TEACHER_NAME}</p>
        </div>
        <nav className="p-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-right transition-colors ${
                  isActive ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-2 mt-auto border-t border-slate-700">
          <button
            type="button"
            onClick={() => { logout(); navigate('/login') }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white text-right"
          >
            <span>🚪</span>
            <span>خروج</span>
          </button>
          <NavLink
            to="/"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white text-right mt-1"
          >
            <span>🏠</span>
            <span>العودة للتطبيق</span>
          </NavLink>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  )
}
