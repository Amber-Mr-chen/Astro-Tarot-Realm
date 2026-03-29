import Link from 'next/link'

interface ExploreItem {
  icon: string
  title: string
  desc: string
  href: string
}

interface ExploreMoreProps {
  items: ExploreItem[]
}

export default function ExploreMore({ items }: ExploreMoreProps) {
  return (
    <div className="mt-2">
      <p className="text-center text-xs text-textSub uppercase tracking-widest mb-3 font-cinzel">✦ Explore More ✦</p>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl p-4 flex flex-col gap-1 transition-all hover:scale-[1.02] hover:border-gold/50 active:scale-[0.98]"
            style={{ backgroundColor: '#12122A', border: '1px solid rgba(155,89,182,0.25)' }}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-textMain text-sm font-semibold leading-tight">{item.title}</span>
            <span className="text-textSub text-xs leading-snug">{item.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
