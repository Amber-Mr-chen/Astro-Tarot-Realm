'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/tarot',        label: '🃏 Tarot' },
  { href: '/yes-no-tarot', label: '✨ Yes/No' },
  { href: '/horoscope',    label: '⭐ Horoscope' },
  { href: '/birth-chart',  label: '🌌 Birth Chart' },
  { href: '/compatibility',label: '💫 Compatibility' },
  { href: '/history',      label: '📖 History' },
]

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close menu on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = () => setOpen(false)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [open])

  return (
    <div className="md:hidden relative" onClick={e => e.stopPropagation()}>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-purple-900/20 transition-colors"
        aria-label="Open menu"
      >
        <span className={`block w-5 h-0.5 bg-textSub transition-transform duration-200 ${open ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`block w-5 h-0.5 bg-textSub transition-opacity duration-200 ${open ? 'opacity-0' : ''}`} />
        <span className={`block w-5 h-0.5 bg-textSub transition-transform duration-200 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-48 rounded-xl py-2 z-50 shadow-xl"
          style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.3)' }}
        >
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="block px-4 py-2.5 text-sm text-textSub hover:text-gold hover:bg-purple-900/20 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="border-t border-purple-900/30 mt-2 pt-2">
            <a
              href="/pricing"
              className="block px-4 py-2.5 text-sm font-semibold hover:bg-purple-900/20 transition-colors"
              style={{ color: '#F39C12' }}
            >
              ✨ Upgrade to Pro
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
