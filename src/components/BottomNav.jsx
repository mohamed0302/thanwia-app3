import { NavLink } from 'react-router-dom'

const navItems = [
  { id: 'home', label: 'الرئيسية', icon: '🏠', to: '/' },
  { id: 'grades', label: 'الدرجات والغياب', icon: '📋', to: '/grades' },
  { id: 'exams', label: 'الامتحانات', icon: '📝', to: '/exams' },
  { id: 'videos', label: 'فيديوهات الشرح', icon: '🎬', to: '/videos' },
  { id: 'profile', label: 'الملف', icon: '👤', to: '/profile' },
]

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-200 safe-bottom md:hidden">
      <div className="max-w-2xl mx-auto flex justify-around py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl min-w-[64px] transition-colors ${
                isActive ? 'text-primary-600 bg-primary-50' : 'text-slate-500 hover:bg-slate-50'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
