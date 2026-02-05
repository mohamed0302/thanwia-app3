import { useState } from 'react'
import { fetchStudentMessages, addMessage, deleteMessage as deleteMessageApi } from '../../features/admin/firebaseAdminApi'

const TYPE_LABELS = { grade: 'درجات', absence: 'غياب وحضور', message: 'تقارير أو ملاحظات طارئة' }

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

/** استخراج حقول تقرير الامتحان (نفس منطق Grades.jsx) */
function parseGradeReport(content) {
  if (!content || typeof content !== 'string') return null
  const t = content.trim()
  const gradeMatch = t.match(/الدرجة المحققة:\s*([\d.٠-٩]+)\s*\/\s*([\d٠-٩]+)/)
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
  const slashMatch = t.match(/(.+?)\s*([\d٠-٩.]+)\s*\/\s*([\d٠-٩.]+)\s*$/)
  const minMatch = t.match(/(.+?)\s+([\d٠-٩.]+)\s+من\s+([\d٠-٩.]+)\s*$/)
  const simple = slashMatch || minMatch
  if (simple) return { type: 'simple', description: simple[1].trim(), achieved: simple[2], total: simple[3] }
  return null
}

/** عرض تقرير الدرجة بشكل مرتب مع إبراز الدرجة المحققة */
function formatGradeText(text) {
  if (!text || typeof text !== 'string') return <span>—</span>
  const parsed = parseGradeReport(text)

  if (parsed?.type === 'report') {
    const { achieved, total, percent, status, examName, class: cls, date, description, evaluation, tips, teacher } = parsed
    return (
      <div className="text-right space-y-4 w-full">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-4 text-white shadow-lg ring-2 ring-indigo-400/50">
          <div className="text-xs font-medium opacity-90 mb-1">الدرجة المحققة</div>
          <div className="flex flex-wrap items-baseline gap-2 gap-y-1">
            <span className="text-3xl font-bold tabular-nums">{achieved}</span>
            <span className="text-lg opacity-90">من {total}</span>
            {percent && <span className="mr-auto text-lg font-semibold bg-white/20 px-2 py-0.5 rounded-lg">{percent}%</span>}
          </div>
          {status && <div className="mt-2 text-sm font-medium bg-white/15 rounded-lg px-2 py-1 inline-block">{status}</div>}
        </div>
        {(examName || cls || date) && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1.5">
            <div className="text-xs font-semibold text-slate-500 mb-2">تفاصيل الامتحان</div>
            {examName && <div><span className="text-slate-500 text-sm">اسم الامتحان:</span> <span className="text-slate-800">{examName}</span></div>}
            {cls && <div><span className="text-slate-500 text-sm">الصف:</span> <span className="text-slate-800">{cls}</span></div>}
            {date && <div><span className="text-slate-500 text-sm">التاريخ:</span> <span className="text-slate-800">{date}</span></div>}
            {description && description !== '—' && <div><span className="text-slate-500 text-sm">الوصف:</span> <span className="text-slate-800">{description}</span></div>}
          </div>
        )}
        {evaluation && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
            <div className="text-xs font-semibold text-amber-800 mb-1">التقييم</div>
            <p className="text-slate-700 text-sm leading-relaxed">{evaluation}</p>
          </div>
        )}
        {tips && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold text-slate-600 mb-1">نصائح للتحسن</div>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{tips}</p>
          </div>
        )}
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
  return <span className="text-slate-700 whitespace-pre-line">{text}</span>
}

function MessageText({ type, text }) {
  if (!text) return <span>—</span>
  if (type === 'grade') return formatGradeText(text)
  if (type === 'absence' || type === 'message') return highlightPresence(text)
  return <span>{text}</span>
}
const ADD_TYPES = [
  { value: 'grade', label: 'درجات الامتحانات' },
  { value: 'absence', label: 'الغياب والحضور' },
  { value: 'message', label: 'تقارير أو ملاحظات طارئة' },
]

export default function AdminMessages() {
  const [code, setCode] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [addForm, setAddForm] = useState({ studentCode: '', type: 'grade', text: '' })
  const [adding, setAdding] = useState(false)
  const [addSuccess, setAddSuccess] = useState('')

  const fetchMessages = (e) => {
    e?.preventDefault()
    const c = code.trim()
    if (!c) {
      setError('أدخل كود الطالب')
      return
    }
    setLoading(true)
    setError('')
    setData(null)
    fetchStudentMessages(c)
      .then(setData)
      .catch((e) => setError(e.message || 'تعذر التحميل'))
      .finally(() => setLoading(false))
  }

  const deleteMessage = (studentCode, type, messageId) => {
    if (!confirm('حذف هذه الرسالة؟')) return
    deleteMessageApi(studentCode, type, messageId)
      .then(() => fetchMessages())
      .catch((e) => setError(e.message || 'تعذر الحذف'))
  }

  const handleAddMessage = (e) => {
    e.preventDefault()
    const c = addForm.studentCode.trim()
    const text = addForm.text.trim()
    if (!c || !text) {
      setError('كود الطالب ونص الرسالة مطلوبان')
      return
    }
    setAdding(true)
    setError('')
    setAddSuccess('')
    addMessage(c, addForm.type, text)
      .then(() => {
        setAddSuccess('تم إرسال الرسالة.')
        setAddForm((f) => ({ ...f, text: '' }))
        if (code === c) fetchMessages()
      })
      .catch((e) => setError(e.message || 'تعذر الإرسال'))
      .finally(() => setAdding(false))
  }

  const all = data
    ? [
        ...(data.grades || []).map((m) => ({ ...m, type: 'grade' })),
        ...(data.absence || []).map((m) => ({ ...m, type: 'absence' })),
        ...(data.messages || []).map((m) => ({ ...m, type: 'message' })),
      ].sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
    : []

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-xl font-bold text-slate-800">الرسائل والغياب</h2>
      <p className="text-slate-500 text-sm">اعرض رسائل طالب معيّن واحذف أي رسالة</p>

      <form onSubmit={fetchMessages} className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="كود الطالب"
          className="rounded-xl border border-slate-200 px-3 py-2 w-40"
        />
        <button type="submit" disabled={loading} className="btn-primary py-2 px-4 disabled:opacity-50">
          {loading ? 'جاري التحميل...' : 'عرض الرسائل'}
        </button>
      </form>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm">{error}</div>}
      {addSuccess && <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-sm">{addSuccess}</div>}

      <section className="bg-white rounded-2xl border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-800 mb-3">إرسال رسالة جديدة (يُرسل إشعار للطالب)</h3>
        <form onSubmit={handleAddMessage} className="space-y-3">
          <div>
            <label className="block text-slate-600 text-sm mb-1">كود الطالب</label>
            <input
              type="text"
              value={addForm.studentCode}
              onChange={(e) => setAddForm((f) => ({ ...f, studentCode: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder="كود الطالب"
            />
          </div>
          <div>
            <label className="block text-slate-600 text-sm mb-1">نوع الرسالة</label>
            <select
              value={addForm.type}
              onChange={(e) => setAddForm((f) => ({ ...f, type: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            >
              {ADD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-600 text-sm mb-1">نص الرسالة</label>
            <textarea
              value={addForm.text}
              onChange={(e) => setAddForm((f) => ({ ...f, text: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 min-h-[80px]"
              placeholder="درجات: امتحان الفصل الأول 85/100 — غياب: غائب يوم ١٠/١ حاضر يوم ١١/١ — ملاحظات: أي نص (حاضر/غائب ستُبرز تلقائياً)"
              rows={3}
            />
          </div>
          <button type="submit" disabled={adding} className="btn-primary py-2 px-4 disabled:opacity-50">
            {adding ? 'جاري الإرسال...' : 'إرسال الرسالة'}
          </button>
        </form>
      </section>

      {data && (
        <section className="bg-white rounded-2xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-800 mb-3">رسائل الطالب (كود: {code})</h3>
          {all.length === 0 ? (
            <p className="text-slate-500 text-sm">لا توجد رسائل</p>
          ) : (
            <ul className="space-y-3">
              {all.map((m) => (
                <li key={`${m.type}-${m.id}`} className="flex items-start justify-between gap-2 py-2 border-b border-slate-100 last:border-0">
                  <div className="min-w-0 text-right">
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">{TYPE_LABELS[m.type]}</span>
                    <div className="text-slate-800 mt-1">
                      <MessageText type={m.type} text={m.text} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteMessage(code, m.type, m.id)}
                    className="shrink-0 text-red-600 hover:text-red-700 text-sm px-2 py-1"
                  >
                    حذف
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}
