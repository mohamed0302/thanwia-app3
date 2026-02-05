import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Card from '../components/Card'
import { fetchVideosByGrade } from '../features/videos/videosApi'

export default function Videos() {
  const { user } = useAuth()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const grade = user?.role === 'student' ? user.grade : null

  useEffect(() => {
    if (!grade) {
      setLoading(false)
      return
    }
    fetchVideosByGrade(grade)
      .then(setList)
      .catch(() => setError('تعذر تحميل الفيديوهات'))
      .finally(() => setLoading(false))
  }, [grade])

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

  if (!grade) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>سجّل الدخول بكود الطالب لمشاهدة فيديوهات الشرح</p>
      </div>
    )
  }

  if (list.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="text-4xl mb-2">🎬</p>
        <p>لا توجد فيديوهات لصفك حتى الآن</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-slate-800 font-bold text-lg">فيديوهات الشرح</h2>
      <p className="text-slate-500 text-sm">محتوى صفك فقط</p>
      <div className="space-y-3">
        {list.map((v) => (
          <Card key={v.id}>
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-xl bg-primary-50 flex items-center justify-center text-2xl shrink-0">
                🎬
              </div>
              <div className="flex-1 min-w-0 text-right">
                <h4 className="font-semibold text-slate-800">{v.title}</h4>
                {v.subject && (
                  <p className="text-slate-500 text-sm">{v.subject}</p>
                )}
                {v.video_url && (
                  <a
                    href={v.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 text-sm mt-1 inline-block font-medium"
                  >
                    مشاهدة ←
                  </a>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
