import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/** عرض المحتوى فقط للمدرس أو المساعد؛ غير ذلك إعادة توجيه للرئيسية */
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">جاري التحميل...</p>
      </div>
    )
  }

  const isAdmin = user?.role === 'teacher' || user?.role === 'assistant' || user?.role === 'demo'
  if (!user || !isAdmin) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }

  return children
}
