/**
 * سياق تثبيت PWA — يشارك beforeinstallprompt بين المكونات
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const InstallContext = createContext(null)

export function InstallProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  useEffect(() => {
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://')
    )
  }, [])

  const canInstall = Boolean(deferredPrompt) && !isStandalone

  const install = useCallback(async () => {
    if (!deferredPrompt) return { outcome: 'unsupported' }
    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      return { outcome }
    } catch {
      return { outcome: 'error' }
    }
  }, [deferredPrompt])

  const value = { canInstall, install, isStandalone }
  return (
    <InstallContext.Provider value={value}>
      {children}
    </InstallContext.Provider>
  )
}

export function useInstall() {
  const ctx = useContext(InstallContext)
  if (!ctx) throw new Error('useInstall must be used within InstallProvider')
  return ctx
}
