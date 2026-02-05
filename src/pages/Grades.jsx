import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Card from '../components/Card'
import { fetchStudentMessages, groupMessagesByType } from '../features/messages/messagesApi'

const typeLabels = { grade: 'درجات الامتحانات', absence: 'الغياب والحضور', message: 'تقارير أو ملاحظات طارئة' }
const typeColors = {
  grade: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  absence: 'bg-amber-50 text-amber-800 border-amber-200',
  message: 'bg-violet-50 text-violet-800 border-violet-200',
}
const typeIcons = { grade: '📊', absence: '📅', message: '📌' }

/** تنسيق التاريخ بشكل منظم (مثال: ٢٠٢٥/٠٢/٠٣ - ١٠:٣٠ ص) */
function formatMessageDate(iso) {
  if (!iso) return null
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return null
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const h = d.getHours()
    const min = String(d.getMinutes()).padStart(2, '0')
    const am = h < 12 ? 'ص' : 'م'
    const h12 = h % 12 || 12
    return `${y}/${m}/${day} — ${h12}:${min} ${am}`
  } catch {
    return null
  }
}

/** يبرز كلمة حاضر أو غائب في النص بشكل واضح عن باقي الرسالة */
function highlightPresence(text) {
  if (!text || typeof text !== 'string') return <>—</>
  const parts = text.split(/(حاضر|غائب)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part === 'حاضر') {
          return (
            <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg font-bold text-emerald-800 bg-emerald-200 border-2 border-emerald-400 ring-2 ring-emerald-200/80 shadow-sm mx-0.5">
              حاضر
            </span>
          )
        }
        if (part === 'غائب') {
          return (
            <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg font-bold text-amber-900 bg-amber-200 border-2 border-amber-400 ring-2 ring-amber-200/80 shadow-sm mx-0.5">
              غائب
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

/** استخراج حقول تقرير الامتحان من النص (تقرير كامل أو صيغة بسيطة مثل 85/100) */
function parseGradeReport(content) {
  if (!content || typeof content !== 'string') return null
  const t = content.trim()
  // تقرير كامل: الدرجة المحققة: 22.0/40.0
  const gradeMatch = t.match(/الدرجة المحققة:\s*([\d.٠-٩]+)\s*\/\s*([\d.٠-٩]+)/)
  const percentMatch = t.match(/النسبة المئوية:\s*([\d.٠-٩.]+)\s*%?/)
  const statusMatch = t.match(/الحالة:\s*([^\n•🎯💡📞]+)/)
  const examNameMatch = t.match(/اسم الامتحان:\s*([^\n•]+?)(?=\s*•|$)/)
  const classMatch = t.match(/الصف:\s*([^\n•]+?)(?=\s*•|$)/)
  const dateMatch = t.match(/التاريخ:\s*([^\n•]+?)(?=\s*•|$)/)
  const descMatch = t.match(/الوصف:\s*([^\n•]+?)(?=\s*•|$)/)
  const evalMatch = t.match(/التقييم:\s*([^\n]+?)(?=\s*💡|📞|$)/s)
  const tipsMatch = t.match(/نصائح للتحسن:\s*([^\n]+(?:\n[^📞]*)?)(?=📞|$)/s)
  const teacherMatch = t.match(/المعلم:\s*([^\n]+)/)

  const clean = (s) => (s ? String(s).trim().replace(/\bnan\b/gi, '—') : '')

  if (gradeMatch) {
    return {
      type: 'report',
      achieved: gradeMatch[1],
      total: gradeMatch[2],
      percent: percentMatch ? clean(percentMatch[1]) : null,
      status: statusMatch ? clean(statusMatch[1]) : null,
      examName: examNameMatch ? clean(examNameMatch[1]) : null,
      class: classMatch ? clean(classMatch[1]) : null,
      date: dateMatch ? clean(dateMatch[1]) : null,
      description: descMatch ? clean(descMatch[1]) : null,
      evaluation: evalMatch ? clean(evalMatch[1]) : null,
      tips: tipsMatch ? clean(tipsMatch[1]) : null,
      teacher: teacherMatch ? clean(teacherMatch[1]) : null,
    }
  }

  // صيغة بسيطة: 85/100 أو 85 من 100
  const slashMatch = t.match(/(.+?)\s*([\d٠-٩.]+)\s*\/\s*([\d٠-٩.]+)\s*$/)
  const minMatch = t.match(/(.+?)\s+([\d٠-٩.]+)\s+من\s+([\d٠-٩.]+)\s*$/)
  const simple = slashMatch || minMatch
  if (simple) {
    return {
      type: 'simple',
      description: simple[1].trim(),
      achieved: simple[2],
      total: simple[3],
    }
  }
  return null
}

/** عرض تقرير الدرجة بشكل مرتب مع إبراز الدرجة المحققة */
function formatGradeContent(content) {
  if (!content || typeof content !== 'string') return <span>—</span>
  const parsed = parseGradeReport(content)

  if (parsed?.type === 'report') {
    const { achieved, total, percent, status, examName, class: cls, date, description, evaluation, tips, teacher } = parsed
    return (
      <div className="text-right space-y-4 w-full">
        {/* الدرجة المحققة — الأبرز */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-4 text-white shadow-lg ring-2 ring-indigo-400/50">
          <div className="text-xs font-medium opacity-90 mb-1">الدرجة المحققة</div>
          <div className="flex flex-wrap items-baseline gap-2 gap-y-1">
            <span className="text-3xl font-bold tabular-nums">{achieved}</span>
            <span className="text-lg opacity-90">من {total}</span>
            {percent && (
              <span className="mr-auto text-lg font-semibold bg-white/20 px-2 py-0.5 rounded-lg">
                {percent}%
              </span>
            )}
          </div>
          {status && (
            <div className="mt-2 text-sm font-medium bg-white/15 rounded-lg px-2 py-1 inline-block">
              {status}
            </div>
          )}
        </div>

        {/* تفاصيل الامتحان */}
        {(examName || cls || date) && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1.5">
            <div className="text-xs font-semibold text-slate-500 mb-2">تفاصيل الامتحان</div>
            {examName && <div><span className="text-slate-500 text-sm">اسم الامتحان:</span> <span className="text-slate-800">{examName}</span></div>}
            {cls && <div><span className="text-slate-500 text-sm">الصف:</span> <span className="text-slate-800">{cls}</span></div>}
            {date && <div><span className="text-slate-500 text-sm">التاريخ:</span> <span className="text-slate-800">{date}</span></div>}
            {description && description !== '—' && <div><span className="text-slate-500 text-sm">الوصف:</span> <span className="text-slate-800">{description}</span></div>}
          </div>
        )}

        {/* التقييم */}
        {evaluation && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
            <div className="text-xs font-semibold text-amber-800 mb-1">التقييم</div>
            <p className="text-slate-700 text-sm leading-relaxed">{evaluation}</p>
          </div>
        )}

        {/* نصائح للتحسن */}
        {tips && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold text-slate-600 mb-1">نصائح للتحسن</div>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{tips}</p>
          </div>
        )}

        {/* المعلم */}
        {teacher && (
          <div className="text-slate-500 text-sm pt-1 border-t border-slate-100">
            <span className="font-medium">المعلم:</span> {teacher}
          </div>
        )}
      </div>
    )
  }

  if (parsed?.type === 'simple') {
    const { description, achieved, total } = parsed
    return (
      <span className="inline-block text-right w-full">
        {description && (
          <span className="block text-slate-700 text-sm mb-1.5">
            <span className="font-medium text-slate-500">الامتحان / المادة:</span> {description}
          </span>
        )}
        <span className="inline-flex items-baseline gap-1.5 flex-wrap">
          <span className="text-slate-600 text-sm font-medium">الدرجة المحققة:</span>
          <span className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1.5 rounded-xl font-bold text-lg text-white bg-indigo-600 border-2 border-indigo-700 shadow-md ring-2 ring-indigo-200">
            {achieved}
          </span>
          <span className="text-slate-500 text-sm">من {total}</span>
        </span>
      </span>
    )
  }

  return <span className="text-slate-700 whitespace-pre-line">{content}</span>
}

function MessageCard({ item }) {
  const style = typeColors[item.type] || 'bg-slate-50 text-slate-800'
  const icon = typeIcons[item.type] || '•'
  const isAbsence = item.type === 'absence'
  const isGrade = item.type === 'grade'
  const isReport = item.type === 'message'
  const dateStr = formatMessageDate(item.created_at)

  return (
    <Card className="overflow-hidden">
      <div className="flex gap-3 text-right">
        <span className="text-2xl shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-xs font-medium px-2 py-1 rounded-md border ${style}`}>
              {typeLabels[item.type]}
            </span>
            {dateStr && (
              <span className="text-slate-500 text-xs font-medium">
                {dateStr}
              </span>
            )}
          </div>
          <div className="text-slate-800 leading-relaxed mt-1">
            {isGrade && formatGradeContent(item.content)}
            {isAbsence && (
              <>
                <span className="text-slate-600 text-sm font-medium">حالة الحضور: </span>
                {highlightPresence(item.content)}
              </>
            )}
            {isReport && (
              <>
                <span className="text-slate-600 text-sm font-medium">الملاحظة: </span>
                {highlightPresence(item.content)}
              </>
            )}
            {!isGrade && !isAbsence && !isReport && <span>{item.content || '—'}</span>}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function Grades() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const studentId = user?.role === 'student' ? user.id : null

  useEffect(() => {
    if (!studentId) {
      setLoading(false)
      return
    }
    fetchStudentMessages(studentId)
      .then(setMessages)
      .catch(() => setError('تعذر تحميل الرسائل'))
      .finally(() => setLoading(false))
  }, [studentId])

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

  if (!studentId) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>سجّل الدخول بكود الطالب لمشاهدة الدرجات والغياب</p>
      </div>
    )
  }

  const { grades, absences, announcements } = groupMessagesByType(messages)
  const hasAny = grades.length > 0 || absences.length > 0 || announcements.length > 0

  if (!hasAny) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="text-4xl mb-2">📋</p>
        <p>لا توجد رسائل حتى الآن</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-slate-800 font-bold text-lg">الدرجات والغياب</h2>

      {grades.length > 0 && (
        <section>
          <h3 className="text-slate-600 text-sm font-medium mb-2 flex items-center gap-2">
            <span>{typeIcons.grade}</span> درجات الامتحانات
          </h3>
          <div className="space-y-3">
            {grades.map((m) => (
              <MessageCard key={m.id} item={m} />
            ))}
          </div>
        </section>
      )}

      {absences.length > 0 && (
        <section>
          <h3 className="text-slate-600 text-sm font-medium mb-2 flex items-center gap-2">
            <span>{typeIcons.absence}</span> الغياب والحضور
          </h3>
          <div className="space-y-3">
            {absences.map((m) => (
              <MessageCard key={m.id} item={m} />
            ))}
          </div>
        </section>
      )}

      {announcements.length > 0 && (
        <section>
          <h3 className="text-slate-600 text-sm font-medium mb-2 flex items-center gap-2">
            <span>{typeIcons.message}</span> تقارير أو ملاحظات طارئة
          </h3>
          <div className="space-y-3">
            {announcements.map((m) => (
              <MessageCard key={m.id} item={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
