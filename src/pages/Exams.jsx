import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Card from '../components/Card'
import { fetchExamsByGrade } from '../features/exams/examsApi'

/** فتح الرابط بأمان في تاب جديد (بدون استخدام مكتبات خارجية) */
function openExamUrl(url) {
  if (!url || typeof url !== 'string') return
  const trimmed = url.trim()
  if (!trimmed) return
  try {
    const u = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
    window.open(u.href, '_blank', 'noopener,noreferrer')
  } catch {
    window.open(trimmed, '_blank', 'noopener,noreferrer')
  }
}

export default function Exams() {
  const { user } = useAuth()
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const grade = user?.role === 'student' ? user.grade : null

  useEffect(() => {
    if (!grade) {
      setLoading(false)
      return
    }
    fetchExamsByGrade(grade)
      .then(setExams)
      .catch(() => setError('تعذر تحميل الامتحانات'))
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
        <p>سجّل الدخول بكود الطالب لمشاهدة الامتحانات</p>
      </div>
    )
  }

  if (exams.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="text-4xl mb-2">📝</p>
        <p>لا توجد امتحانات حتى الآن</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-slate-800 font-bold text-lg">الامتحانات</h2>
      <p className="text-slate-500 text-sm">اضغط ابدأ الامتحان لفتح الرابط في المتصفح</p>
      <div className="space-y-3">
        {exams.map((exam) => (
          <Card key={exam.id}>
            <div className="flex flex-col gap-3 text-right">
              <h4 className="font-semibold text-slate-800">{exam.title}</h4>
              <button
                type="button"
                onClick={() => openExamUrl(exam.url)}
                className="btn-primary w-full py-2.5 text-sm"
              >
                ابدأ الامتحان
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
