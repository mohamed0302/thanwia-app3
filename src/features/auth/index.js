/**
 * Auth feature: guest + student code login, session in localStorage.
 * Teacher login remains in pages/Login via existing api.
 */
export { fetchStudentByCode, buildStudentSession } from './studentAuth'
export { normalizeStudentCode, STORAGE_KEYS } from './constants'
