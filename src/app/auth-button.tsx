'use client'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AuthButton() {
  const { data: session } = useSession()
  const router = useRouter()

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push('/profile')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          {session.user?.image && (
            <img src={session.user.image} alt="avatar" className="w-7 h-7 rounded-full" />
          )}
          <span className="text-textSub text-xs hidden sm:inline truncate max-w-[80px]">
            {session.user?.name?.split(' ')[0]}
          </span>
        </button>
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
