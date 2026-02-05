/**
 * لوحة تحكم ويب للـ assistant
 * إحصائيات وروابط سريعة
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/Card'
import { api } from '../lib/api'

export default function Dashboard() {
  const [stats, setStats] = useState({ videos: 0, bookings: 0, students: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/videos').catch(() => ({ data: { videos: [] } })),
      api.get('/booking').catch(() => ({ data: { bookings: [] } })),
      api.get('/grades').catch(() => ({ data: { records: [] } })),
    ]).then(([v, b, g]) => {
      setStats({
        videos: (v.data?.videos || []).length,
        bookings: (b.data?.bookings || []).length,
        students: (g.data?.records || []).length,
      })
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex justify-center py-12"><p className="text-slate-500">جاري التحميل...</p></div>
  }

  const links = [
    { to: '/videos', label: 'الفيديوهات', count: stats.videos },
    { to: '/booking', label: 'الحجوزات', count: stats.bookings },
    { to: '/grades', label: 'الطلبة والدرجات', count: stats.students },
  ]

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-slate-800 text-white p-5">
        <h2 className="text-lg font-bold mb-1">لوحة التحكم</h2>
        <p className="text-slate-300 text-sm">نظرة سريعة على الأقسام</p>
      </section>
      <section className="grid grid-cols-3 gap-2">
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-600">{stats.videos}</p>
          <p className="text-slate-500 text-xs">فيديوهات</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-amber-600">{stats.bookings}</p>
          <p className="text-slate-500 text-xs">حجوزات</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-slate-700">{stats.students}</p>
          <p className="text-slate-500 text-xs">طلبة</p>
        </div>
      </section>
      <section>
        <h3 className="text-slate-600 text-sm font-medium mb-3">انتقل إلى</h3>
        <div className="space-y-2">
          {links.map((l) => (
            <Link key={l.to} to={l.to}>
              <Card>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-800">{l.label}</span>
                  <span className="text-slate-400 text-sm">{l.count}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
