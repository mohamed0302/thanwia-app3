/**
 * الهيكل العام للتطبيق:
 * هيدر من فوق + محتوى في النص + شريط سفلي على الموبايل فقط
 */
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'
import { APP_NAME } from '../lib/branding'
import { askNotificationPermissionOnce } from '../lib/notifications'
import { useAuth } from '../context/AuthContext'

const titles = { '/': APP_NAME, '/videos': 'فيديوهات الشرح', '/booking': 'حجوزات الطلبة', '/grades': 'الدرجات والغياب', '/exams': 'الامتحانات', '/dashboard': 'لوحة التحكم', '/profile': 'الملف الشخصي' }

function Layout({ children }) {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const title = titles[pathname] || APP_NAME

  useEffect(() => {
    if (user?.role === 'student') askNotificationPermissionOnce()
  }, [user?.role])

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header title={title} />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

export default Layout
