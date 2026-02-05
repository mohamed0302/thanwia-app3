/**
 * رسالة موحّدة عند فشل طلبات الإدارة (سيرفر غير شغّال أو جلسة انتهت)
 */
export function getAdminErrorMessage(err) {
  const status = err.response?.status
  const msg = err.response?.data?.message
  if (status === 401) {
    return 'انتهت الجلسة أو الدخول غير مسموح. سجّل الخروج ثم ادخل مرة أخرى كمدرس من صفحة الدخول.'
  }
  // استخدم رسالة السيرفر إن وُجدت (مثلاً: Firebase غير متصل)
  if (status === 503 && msg) return msg
  if (status === 500 && msg) return msg
  if (status === 502 || status === 503 || status === 504 || status === 500 || !err.response) {
    return 'السيرفر غير مشغّل. شغّل السيرفر من مجلد server (npm run dev) ثم سجّل الدخول كمدرس وحاول مرة أخرى.'
  }
  if (status === 400 && msg) return msg
  if (status === 403 && msg) return msg
  return msg || 'تعذر تنفيذ العملية. حاول مرة أخرى.'
}
