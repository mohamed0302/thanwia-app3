import { useState, useEffect } from 'react'
import Card from '../components/Card'
import { api } from '../lib/api'

export default function Booking() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/booking')
      .then((res) => setBookings(res.data.bookings || []))
      .catch(() => setError('تعذر تحميل الحجوزات'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-slate-500">جاري التحميل...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm">{error}</div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="text-4xl mb-2">📅</p>
        <p>لا توجد حجوزات</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-slate-600 text-sm font-medium">حجوزات الطلبة</h3>
      {bookings.map((b) => (
        <Card key={b.id}>
          <div className="flex justify-between items-start gap-2 text-right">
            <div>
              <h4 className="font-semibold text-slate-800">{b.studentName || 'طالب'}</h4>
              <p className="text-slate-500 text-sm">{b.date || '—'} · {b.time || '—'}</p>
              {b.note && <p className="text-slate-500 text-sm mt-1">{b.note}</p>}
            </div>
            <span className="text-xs px-2 py-1 rounded-lg bg-primary-50 text-primary-700 shrink-0">
              {b.status || 'مؤكد'}
            </span>
          </div>
        </Card>
      ))}
    </div>
  )
}
