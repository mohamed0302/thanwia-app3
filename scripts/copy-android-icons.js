/**
 * نسخ أيقونات التطبيق من icons/android إلى مشروع أندرويد
 * يشغّل بعد: npx cap add android
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const iconsSrc = join(root, 'icons', 'android')
const resDir = join(root, 'android', 'app', 'src', 'main', 'res')

if (!existsSync(resDir)) {
  console.log('مجلد android غير موجود. نفّذ أولاً: npm run cap:add:android')
  process.exit(1)
}

const folders = readdirSync(iconsSrc, { withFileTypes: true }).filter((d) => d.isDirectory())
for (const folder of folders) {
  const srcPath = join(iconsSrc, folder.name)
  const destPath = join(resDir, folder.name)
  if (!existsSync(destPath)) mkdirSync(destPath, { recursive: true })
  const files = readdirSync(srcPath)
  for (const file of files) {
    copyFileSync(join(srcPath, file), join(destPath, file))
    console.log(`تم: ${folder.name}/${file}`)
  }
}
console.log('تم نسخ جميع الأيقونات بنجاح.')
