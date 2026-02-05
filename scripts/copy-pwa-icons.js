/**
 * نسخ أيقونات PWA من icons/ إلى public/icons قبل البناء
 */
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const publicIcons = join(root, 'public', 'icons')

if (!existsSync(publicIcons)) mkdirSync(publicIcons, { recursive: true })

const copies = [
  [join(root, 'icons', 'playstore.png'), join(publicIcons, 'pwa-512.png')],
  [join(root, 'icons', 'android', 'mipmap-xxhdpi', 'icon.png'), join(publicIcons, 'pwa-192.png')],
]

for (const [src, dest] of copies) {
  if (existsSync(src)) {
    copyFileSync(src, dest)
    console.log('نسخ الأيقونة:', src.split(/[/\\]/).pop(), '→', dest.split(/[/\\]/).pop())
  } else {
    console.warn('تحذير: الملف غير موجود:', src)
  }
}
console.log('تم نسخ أيقونات PWA.')
