/**
 * Backend خفيف: Express + JWT
 * تشغيل: من مجلد server نفذ npm install ثم npm run dev
 */
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_FILE = join(__dirname, 'data.json')
const JWT_SECRET = process.env.JWT_SECRET || 'finapp-secret-change-in-production'

function loadData() {
  if (!existsSync(DATA_FILE)) {
    const adminEmail = (process.env.ADMIN_EMAIL || 'teacher@test.com').trim().toLowerCase()
    const adminPassword = process.env.ADMIN_PASSWORD || '123456'
    const adminName = process.env.ADMIN_NAME || 'المدرس'
    const defaultData = {
      users: [
        { id: '1', email: adminEmail, password: bcrypt.hashSync(adminPassword, 10), name: adminName, role: 'teacher' },
        { id: '2', email: 'assistant@test.com', password: bcrypt.hashSync('123456', 10), name: 'المساعد', role: 'assistant' },
      ],
      videos: [
        { id: '1', title: 'الدرس الأول', description: 'مقدمة في المادة', url: 'https://www.youtube.com' },
      ],
      bookings: [
        { id: '1', studentName: 'أحمد محمد', date: '2025-02-05', time: '10:00', status: 'مؤكد', note: '' },
      ],
      grades: [
        { id: '1', studentName: 'أحمد محمد', absenceCount: 1, grade: '85' },
        { id: '2', studentName: 'فاطمة علي', absenceCount: 4, grade: '72' },
      ],
    }
    writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2))
    return defaultData
  }
  return JSON.parse(readFileSync(DATA_FILE, 'utf8'))
}

function saveData(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

const app = express()
app.use(cors())
app.use(express.json())

let data = loadData()

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'يجب تسجيل الدخول' })
  }
  const token = auth.slice(7)
  if (token.startsWith('student-')) {
    req.user = { id: token.replace(/^student-/, ''), role: 'student' }
    return next()
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ message: 'انتهت الجلسة، سجّل الدخول مرة أخرى' })
  }
}

/** للمسارات الإدارية فقط — المدرس أو المساعد */
function adminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    const role = req.user?.role
    if (role !== 'teacher' && role !== 'assistant') {
      return res.status(403).json({ message: 'غير مصرح بالدخول لهذا القسم' })
    }
    next()
  })
}

// تسجيل الدخول
app.post('/api/auth/login', (req, res) => {
  const email = (req.body?.email ?? '').toString().trim().toLowerCase()
  const password = (req.body?.password ?? '').toString().trim()
  if (!email || !password) {
    return res.status(400).json({ message: 'البريد وكلمة المرور مطلوبان' })
  }
  let user = data.users.find((u) => u.email === email)
  // الحساب الافتراضي teacher@test.com / 123456: إن كان الهاش لا يطابق نحدّثه ثم نكمل
  if (user && email === 'teacher@test.com' && password === '123456') {
    if (!user.password || !bcrypt.compareSync(password, user.password)) {
      user.password = bcrypt.hashSync('123456', 10)
      saveData(data)
    }
  }
  if (!user || !user.password || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'البريد أو كلمة المرور غير صحيحة' })
  }
  const payload = { id: user.id, email: user.email, role: user.role }
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
  res.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    token,
  })
})

// فيديوهات
app.get('/api/videos', authMiddleware, (req, res) => {
  res.json({ videos: data.videos })
})
app.post('/api/videos', authMiddleware, (req, res) => {
  const { title, description, url } = req.body || {}
  const id = String(Date.now())
  data.videos.push({ id, title: title || '', description: description || '', url: url || '' })
  saveData(data)
  res.json({ video: data.videos[data.videos.length - 1] })
})

// حجوزات
app.get('/api/booking', authMiddleware, (req, res) => {
  res.json({ bookings: data.bookings })
})
app.post('/api/booking', authMiddleware, (req, res) => {
  const { studentName, date, time, note } = req.body || {}
  const id = String(Date.now())
  data.bookings.push({ id, studentName: studentName || '', date: date || '', time: time || '', status: 'مؤكد', note: note || '' })
  saveData(data)
  res.json({ booking: data.bookings[data.bookings.length - 1] })
})

// غياب ودرجات
app.get('/api/grades', authMiddleware, (req, res) => {
  res.json({ records: data.grades })
})
app.post('/api/grades', authMiddleware, (req, res) => {
  const { studentName, absenceCount, grade } = req.body || {}
  const id = String(Date.now())
  data.grades.push({ id, studentName: studentName || '', absenceCount: absenceCount ?? 0, grade: grade || '' })
  saveData(data)
  res.json({ record: data.grades[data.grades.length - 1] })
})

// ————— إدارة (المدرس فقط) — حسابي + Firebase —————
const { ensureFirebase, getMessaging } = await import('./firebase-admin.js')

// حساب المدرس الحالي (بريد، اسم، تغيير كلمة المرور)
app.get('/api/admin/me', adminMiddleware, (req, res) => {
  const user = data.users.find((u) => u.id === req.user.id)
  if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' })
  res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } })
})

app.put('/api/admin/me', adminMiddleware, (req, res) => {
  const { email, name, currentPassword, newPassword } = req.body || {}
  const user = data.users.find((u) => u.id === req.user.id)
  if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' })
  if (currentPassword && !bcrypt.compareSync(currentPassword, user.password)) {
    return res.status(400).json({ message: 'كلمة المرور الحالية غير صحيحة' })
  }
  if (email !== undefined && String(email).trim()) {
    const trimmed = String(email).trim().toLowerCase()
    const existing = data.users.find((u) => u.id !== user.id && u.email === trimmed)
    if (existing) return res.status(400).json({ message: 'البريد مستخدم من حساب آخر' })
    user.email = trimmed
  }
  if (name !== undefined) user.name = String(name).trim() || user.name
  if (newPassword && String(newPassword).trim().length >= 6) {
    user.password = bcrypt.hashSync(String(newPassword).trim(), 10)
  }
  saveData(data)
  const payload = { id: user.id, email: user.email, role: user.role }
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
  res.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    token,
  })
})

app.get('/api/admin/videos', adminMiddleware, async (req, res) => {
  const db = await ensureFirebase()
  if (!db) return res.status(503).json({ message: 'Firebase غير متصل. ضع serviceAccountKey.json في مجلد server.' })
  const grade = req.query.grade || '1st_secondary'
  try {
    const snap = await db.ref(`videos/${grade}`).once('value')
    const val = snap.val()
    const list = val ? Object.entries(val).map(([id, v]) => ({ id, ...v, grade })) : []
    res.json({ videos: list })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'خطأ في جلب الفيديوهات' })
  }
})

app.post('/api/admin/videos', adminMiddleware, async (req, res) => {
  const db = await ensureFirebase()
  if (!db) return res.status(503).json({ message: 'Firebase غير متصل.' })
  const { grade = '1st_secondary', title, video_url, subject } = req.body || {}
  if (!title || !video_url) return res.status(400).json({ message: 'العنوان ورابط الفيديو مطلوبان' })
  try {
    const ref = db.ref(`videos/${grade}`).push()
    await ref.set({ title, video_url, subject: subject || '', createdAt: new Date().toISOString() })
    const id = ref.key
    res.json({ video: { id, title, video_url, subject, grade } })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'خطأ في إضافة الفيديو' })
  }
})

app.delete('/api/admin/videos/:id', adminMiddleware, async (req, res) => {
  const db = await ensureFirebase()
  if (!db) return res.status(503).json({ message: 'Firebase غير متصل.' })
  const grade = req.query.grade || '1st_secondary'
  const { id } = req.params
  if (!id) return res.status(400).json({ message: 'معرف الفيديو مطلوب' })
  try {
    await db.ref(`videos/${grade}/${id}`).remove()
    res.json({ ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'خطأ في حذف الفيديو' })
  }
})

app.get('/api/admin/messages/:studentCode', adminMiddleware, async (req, res) => {
  const db = await ensureFirebase()
  if (!db) return res.status(503).json({ message: 'Firebase غير متصل.' })
  const { studentCode } = req.params
  if (!studentCode) return res.status(400).json({ message: 'كود الطالب مطلوب' })
  try {
    const base = db.ref(`students/${studentCode}`)
    const [gradesSnap, absenceSnap, messagesSnap] = await Promise.all([
      base.child('grades').once('value'),
      base.child('absence').once('value'),
      base.child('messages').once('value'),
    ])
    const toList = (snap, type) => {
      const val = snap.val()
      if (!val || typeof val !== 'object') return []
      return Object.entries(val).map(([id, v]) => ({ id, type, text: v.text || v.content || '', timestamp: v.timestamp }))
    }
    const grades = toList(gradesSnap, 'grade')
    const absence = toList(absenceSnap, 'absence')
    const messages = toList(messagesSnap, 'message')
    res.json({ grades, absence, messages })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'خطأ في جلب الرسائل' })
  }
})

app.delete('/api/admin/messages/:studentCode/:type/:messageId', adminMiddleware, async (req, res) => {
  const db = await ensureFirebase()
  if (!db) return res.status(503).json({ message: 'Firebase غير متصل.' })
  const { studentCode, type, messageId } = req.params
  const map = { grade: 'grades', absence: 'absence', message: 'messages' }
  const path = map[type]
  if (!path) return res.status(400).json({ message: 'نوع غير صحيح' })
  try {
    await db.ref(`students/${studentCode}/${path}/${messageId}`).remove()
    res.json({ ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'خطأ في حذف الرسالة' })
  }
})

// تسجيل جهاز الطالب لاستقبال الإشعارات (FCM)
app.post('/api/register-fcm', authMiddleware, async (req, res) => {
  const token = req.body?.token || req.body?.fcmToken
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ message: 'رمز الجهاز مطلوب' })
  }
  const user = req.user
  if (user?.role !== 'student' || !user?.id) {
    return res.status(400).json({ message: 'للمستخدمين الطلاب فقط' })
  }
  const db = await ensureFirebase()
  if (!db) return res.status(503).json({ message: 'الخدمة غير متوفرة حالياً' })
  try {
    await db.ref(`students/${user.id}/fcmToken`).set(token)
    res.json({ ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'تعذر حفظ رمز الجهاز' })
  }
})

// إضافة رسالة لطالب وإرسال إشعار له
app.post('/api/admin/messages/add', adminMiddleware, async (req, res) => {
  const db = await ensureFirebase()
  if (!db) return res.status(503).json({ message: 'Firebase غير متصل.' })
  const { studentCode, type, text } = req.body || {}
  const pathMap = { grade: 'grades', absence: 'absence', message: 'messages' }
  const path = pathMap[type]
  if (!path || !studentCode || !text) {
    return res.status(400).json({ message: 'كود الطالب ونوع الرسالة والنص مطلوبان' })
  }
  try {
    const ref = db.ref(`students/${studentCode}/${path}`).push()
    await ref.set({ text: text.trim(), content: text.trim(), timestamp: new Date().toISOString() })
    const fcmTokenSnap = await db.ref(`students/${studentCode}/fcmToken`).once('value')
    const fcmToken = fcmTokenSnap?.val()
    const messagingInstance = getMessaging()
    if (fcmToken && messagingInstance) {
      try {
        await messagingInstance.send({
          token: fcmToken,
          notification: { title: 'البسيط — رسالة جديدة', body: text.trim().slice(0, 100) },
        })
      } catch (e) {
        console.error('FCM send:', e)
      }
    }
    res.json({ ok: true, id: ref.key })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'خطأ في إضافة الرسالة' })
  }
})

// ————— امتحانات (Firebase) — للطلاب والادارة —————
app.get('/api/exams', authMiddleware, async (req, res) => {
  const grade = req.query.grade || ''
  if (!grade) return res.json({ exams: [] })
  const db = await ensureFirebase()
  if (!db) return res.json({ exams: [] })
  try {
    const snap = await db.ref(`exams/${grade}`).once('value')
    const val = snap.val()
    const list = val ? Object.entries(val).map(([id, v]) => ({ id, title: v.title || '', url: v.url || '', grade })) : []
    res.json({ exams: list })
  } catch (e) {
    console.error(e)
    res.json({ exams: [] })
  }
})

app.get('/api/admin/exams', adminMiddleware, async (req, res) => {
  const db = await ensureFirebase()
  if (!db) return res.status(503).json({ message: 'Firebase غير متصل. ضع serviceAccountKey.json في مجلد server.' })
  const grade = req.query.grade || '1st_secondary'
  try {
    const snap = await db.ref(`exams/${grade}`).once('value')
    const val = snap.val()
    const list = val ? Object.entries(val).map(([id, v]) => ({ id, ...v, grade })) : []
    res.json({ exams: list })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'خطأ في جلب الامتحانات' })
  }
})

app.post('/api/admin/exams', adminMiddleware, async (req, res) => {
  const db = await ensureFirebase()
  if (!db) return res.status(503).json({ message: 'Firebase غير متصل.' })
  const { grade = '1st_secondary', title, url } = req.body || {}
  if (!title || !url) return res.status(400).json({ message: 'العنوان ورابط الامتحان مطلوبان' })
  try {
    const ref = db.ref(`exams/${grade}`).push()
    await ref.set({ title: title.trim(), url: url.trim(), createdAt: new Date().toISOString() })
    res.json({ exam: { id: ref.key, title: title.trim(), url: url.trim(), grade } })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'خطأ في إضافة الامتحان' })
  }
})

app.delete('/api/admin/exams/:id', adminMiddleware, async (req, res) => {
  const db = await ensureFirebase()
  if (!db) return res.status(503).json({ message: 'Firebase غير متصل.' })
  const grade = req.query.grade || '1st_secondary'
  const { id } = req.params
  if (!id) return res.status(400).json({ message: 'معرف الامتحان مطلوب' })
  try {
    await db.ref(`exams/${grade}/${id}`).remove()
    res.json({ ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'خطأ في حذف الامتحان' })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Backend يعمل على http://localhost:${PORT}`)
  console.log('حسابات تجريبية: teacher@test.com / 123456  أو  assistant@test.com / 123456')
})
