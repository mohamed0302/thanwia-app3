import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import { getAdminErrorMessage } from '../../lib/adminError'
import { DEVELOPER } from '../../lib/branding'

export default function AdminAccount() {
  const { user: authUser, login } = useAuth()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    api.get('/admin/me')
      .then((r) => {
        setEmail(r.data.user?.email || '')
        setName(r.data.user?.name || '')
      })
      .catch((e) => setError(getAdminErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (newPassword && newPassword !== confirmPassword) {
      setError('كلمة المرور الجديدة وتأكيدها غير متطابقتين')
      return
    }
    if (newPassword && newPassword.length < 6) {
      setError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل')
      return
    }
    if (newPassword && !currentPassword) {
      setError('أدخل كلمة المرور الحالية لتغيير كلمة المرور')
      return
    }
    setSaving(true)
    try {
      const payload = { email: email.trim(), name: name.trim() }
      if (currentPassword) payload.currentPassword = currentPassword
      if (newPassword) payload.newPassword = newPassword
      const res = await api.put('/admin/me', payload)
      const { user, token } = res.data
      login(user, token)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccess('تم حفظ التغييرات. يمكنك استخدام البريد وكلمة المرور الجديدة من الآن.')
    } catch (err) {
      setError(getAdminErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-slate-500">جاري التحميل...</p>
  }

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-xl font-bold text-slate-800">حسابي — التحكم الكامل</h2>
      <p className="text-slate-500 text-sm">غيّر بريدك واسمك وكلمة المرور. بعد الحفظ استخدمها لتسجيل الدخول.</p>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm">{error}</div>}
      {success && <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div>
          <label className="block text-slate-700 text-sm font-medium mb-1">البريد الإلكتروني (للدخول)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
            placeholder="your@email.com"
            required
          />
        </div>
        <div>
          <label className="block text-slate-700 text-sm font-medium mb-1">الاسم (يظهر في الإدارة)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
            placeholder="اسمك"
          />
        </div>
        <hr className="border-slate-200" />
        <p className="text-slate-600 text-sm font-medium">تغيير كلمة المرور (اتركها فارغة إن لم تُرد التغيير)</p>
        <div>
          <label className="block text-slate-700 text-sm font-medium mb-1">كلمة المرور الحالية</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="block text-slate-700 text-sm font-medium mb-1">كلمة المرور الجديدة</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
            placeholder="6 أحرف على الأقل"
          />
        </div>
        <div>
          <label className="block text-slate-700 text-sm font-medium mb-1">تأكيد كلمة المرور الجديدة</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
            placeholder="••••••••"
          />
        </div>
        <button type="submit" disabled={saving} className="btn-primary py-2.5 px-5 disabled:opacity-50">
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </form>

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
