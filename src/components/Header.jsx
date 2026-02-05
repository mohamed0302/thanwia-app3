import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { APP_NAME, PHOTOS } from '../lib/branding'

function Header({ title }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isLogin = location.pathname === '/login'
  const displayTitle = title || APP_NAME

  return (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-100 safe-bottom">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        <div className="min-w-[80px]" />
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-center">
          <img src={PHOTOS.logo} alt="" className="w-8 h-8 rounded-lg object-contain shrink-0 bg-slate-50" onError={(e) => { e.target.style.display = 'none' }} />
          <h1 className="text-lg font-semibold text-slate-800 truncate">{displayTitle}</h1>
        </div>
        <div className="min-w-[100px] flex justify-end items-center gap-2">
          {!isLogin && user && (
            <>
              {(user.role === 'teacher' || user.role === 'assistant' || user.role === 'demo') && (
                <>
                  <button
                    type="button"
                    onClick={() => navigate('/admin')}
                    className="text-slate-500 hover:text-slate-700 text-sm"
                  >
                    الإدارة
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="text-slate-500 hover:text-slate-700 text-sm"
                  >
                    لوحة التحكم
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="text-slate-500 hover:text-slate-700 text-sm"
              >
                الملف
              </button>
              <button
                type="button"
                onClick={() => { logout(); navigate('/login') }}
                className="text-slate-500 hover:text-slate-700 text-sm"
              >
                خروج
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
