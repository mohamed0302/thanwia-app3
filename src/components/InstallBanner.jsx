/**
 * PWA Install Banner – يعرض على الموبايل فقط
 * يظهر عند فتح الموقع ويتيح تثبيت التطبيق عبر beforeinstallprompt
 */
import { useState, useEffect, useCallback } from 'react'
import { useInstall } from '../context/InstallContext'

const DISMISSED_KEY = 'pwa-install-banner-dismissed'
const DISMISS_DURATION_DAYS = 7

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const handler = () => setIsMobile(mq.matches)
    handler()
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return isMobile
}

function wasDismissedRecently() {
  try {
    const stored = localStorage.getItem(DISMISSED_KEY)
    if (!stored) return false
    const { ts } = JSON.parse(stored)
    return Date.now() - ts < DISMISS_DURATION_DAYS * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify({ ts: Date.now() }))
  } catch {}
}

function InstallBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const isMobile = useIsMobile()
  const { canInstall, install, isStandalone } = useInstall()

  const hideBanner = useCallback(() => {
    setIsExiting(true)
    markDismissed()
    setTimeout(() => {
      setShowBanner(false)
      setIsExiting(false)
    }, 300)
  }, [])

  const handleInstall = useCallback(async () => {
    const { outcome } = await install()
    if (['accepted', 'dismissed', 'unsupported', 'error'].includes(outcome)) {
      hideBanner()
    }
  }, [install, hideBanner])

  useEffect(() => {
    if (!isMobile || isStandalone || wasDismissedRecently()) return
    // Optional preload: slight delay so banner appears while app loads
    const t = setTimeout(() => setShowBanner(true), 400)
    return () => clearTimeout(t)
  }, [isMobile, isStandalone])

  const showInstallButton = canInstall || true

  if (!showBanner) return null

  return (
    <div
      role="dialog"
      aria-label="تثبيت التطبيق"
      className={`fixed left-4 right-4 z-30 md:hidden transition-all duration-300 ease-out ${
        isExiting
          ? 'opacity-0 translate-y-full'
          : 'opacity-100 translate-y-0 animate-install-banner-in'
      }`}
      style={{ bottom: '5.5rem' }}
    >
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden relative">
        <button
          type="button"
          onClick={hideBanner}
          aria-label="إغلاق"
          className="absolute top-2 left-2 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <span className="text-lg leading-none">×</span>
        </button>
        <div className="p-4 space-y-3">
          <p className="text-slate-800 font-medium text-center text-base leading-snug pr-8 pl-4">
            نزّل التطبيق الآن لتجربة أفضل!
          </p>

          {showInstallButton && (
            <button
              type="button"
              onClick={handleInstall}
              className="w-full py-3 px-5 rounded-xl font-semibold text-white bg-primary-600 hover:bg-primary-700 active:scale-[0.98] transition-all shadow-sm hover:shadow"
            >
              نزّل الآن
            </button>
          )}

          <p className="text-[11px] text-slate-500 text-center leading-tight">
            المبرمج محمد ايهاب قاسم – رقم التواصل:{' '}
            <a
              href="tel:+201017027347"
              className="text-primary-600 hover:underline"
            >
              +201017027347
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default InstallBanner
