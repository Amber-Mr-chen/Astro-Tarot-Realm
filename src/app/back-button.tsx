'use client'
import { usePathname, useRouter } from 'next/navigation'

export default function BackButton() {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/') return null

  return (
    <button
      onClick={() => router.push('/')}
      className="flex items-center gap-1 text-sm text-textSub hover:text-gold transition-colors"
    >
      ← Home
    </button>
  )
}
