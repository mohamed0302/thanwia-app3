/**
 * بطاقة عامة للقوائم والعناصر
 * تستخدم في الصفحة الرئيسية وصفحات أخرى
 */
function Card({ children, className = '', onClick }) {
  const base = 'card ' + className
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={base + ' w-full text-right block hover:shadow-soft active:scale-[0.99] transition-all'}>
        {children}
      </button>
    )
  }
  return <div className={base}>{children}</div>
}

export default Card
