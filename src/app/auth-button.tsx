'use client'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function AuthButton() {
  const { data: session } = useSession()

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-textSub text-xs md:text-sm hidden sm:inline truncate max-w-[100px]">
          {session.user?.name}
        </span>
        <button
          onClick={() => signOut()}
          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-700 text-white hover:bg-gray-600 whitespace-nowrap"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: 'linear-gradient(135deg, #9B59B6, #6C3483)', color: 'white' }}
    >
      Sign In
    </button>
  )
}
