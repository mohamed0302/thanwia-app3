/**
 * Session keys for localStorage — student and guest only (no paid auth).
 */
export const STORAGE_KEYS = {
  TOKEN: 'finapp_token',
  USER: 'finapp_user',
}

/** Normalize student_code for lookup (trim, single case) */
export function normalizeStudentCode(code) {
  if (typeof code !== 'string') return ''
  return code.trim()
}
