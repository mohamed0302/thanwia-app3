import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { fetchStudentByCode, buildStudentSession } from '../features/auth/studentAuth'
import { APP_NAME, TEACHER_NAME, PHOTOS, DEVELOPER } from '../lib/branding'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const { login } = useAuth()

  const [studentCode, setStudentCode] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGuestLogin = () => {
    setError('')
    login(
      { id: 'guest', email: '', name: 'زائر', role: 'guest' },
      'guest-token'
    )
    navigate(redirect, { replace: true })
  }

  const handleStudentLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const student = await fetchStudentByCode(studentCode)
      const { user, token } = buildStudentSession(student)
      login(user, token)
      navigate(redirect, { replace: true })
    } catch (err) {
      setError(err.message || 'تعذر تسجيل الدخول بالكود')
    } finally {
      setLoading(false)
    }
  }

  const handleTeacherSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const emailTrimmed = (email || '').trim().toLowerCase()
    const passwordTrimmed = (password || '').trim()
    try {
      const res = await api.post('/auth/login', { email: emailTrimmed, password: passwordTrimmed })
      const { user, token } = res.data
      login(user, token)
      navigate('/admin', { replace: true })
    } catch (err) {
      const status = err.response?.status
      const is401 = status === 401
      const isServerDown = !is401 && (
        status === 502 || status === 503 || status === 504 || status === 500 ||
        err.message === 'Failed to fetch' || err.code === 'ERR_NETWORK' || !err.response
      )
      if (isServerDown && passwordTrimmed === '123456') {
        login(
          { id: 'demo', email: emailTrimmed || 'teacher@test.com', name: 'مستخدم تجريبي', role: 'teacher' },
          'demo-token'
        )
        navigate('/admin', { replace: true })
        return
      }
      if (isServerDown) {
        setError('السيرفر غير مشغّل. شغّل السيرفر من مجلد server (npm run dev) أو استخدم كلمة المرور 123456 للدخول الآن.')
        return
      }
      setError(err.response?.data?.message || 'البريد أو كلمة المرور غير صحيحة.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-md mx-auto">
        {/* الهيدر */}
        <div className="text-center mb-6">
          <div className="relative h-24 bg-slate-100 rounded-2xl mb-3 overflow-hidden">
            <img src={PHOTOS.cover} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
          </div>
          <img src={PHOTOS.logo} alt="" className="w-16 h-16 mx-auto object-contain rounded-xl bg-white border border-slate-100 -mt-10 relative z-10 mb-2" onError={(e) => { e.target.style.display = 'none' }} />
          <h1 className="text-xl font-bold text-slate-800">{APP_NAME}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{TEACHER_NAME}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl mb-4">{error}</div>
        )}

        {/* دخول طالب */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-4">
          <h2 className="text-slate-800 font-semibold mb-3 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center text-sm">١</span>
            دخول الطالب
          </h2>
          <form onSubmit={handleStudentLogin} className="space-y-3">
            <input
              type="text"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-center"
              placeholder="أدخل كود الطالب"
              autoComplete="off"
              disabled={loading}
            />
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
              {loading ? 'جاري الدخول...' : 'تسجيل الدخول كطالب'}
            </button>
          </form>
          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full mt-2 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
          >
            الدخول كزائر
          </button>
        </section>

        {/* دخول مدرس */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <h2 className="text-slate-800 font-semibold mb-3 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-sm">٢</span>
            دخول المدرس
          </h2>
          <form onSubmit={handleTeacherSubmit} className="space-y-3">
            <input
              type="text"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
              placeholder="معرّف الدخول"
              autoComplete="username"
              disabled={loading}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
            />
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
              {loading ? 'جاري الدخول...' : 'تسجيل الدخول كمدرس'}
            </button>
          </form>
        </section>

        {/* معلومات المبرمج */}
        <footer className="mt-6 text-center text-slate-500 text-xs pb-4">
          <p>طور التطبيق: <span className="font-semibold text-slate-600">{DEVELOPER.name}</span></p>
          <p className="mt-1">
            <a href={`tel:${DEVELOPER.phone}`} className="text-primary-600 hover:underline">{DEVELOPER.phone}</a>
            {' · '}
            <a href={`mailto:${DEVELOPER.email}`} className="text-primary-600 hover:underline">البريد</a>
            {' · '}
            <a href={DEVELOPER.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">LinkedIn</a>
          </p>
        </footer>
      </div>
    </div>
  )
}
