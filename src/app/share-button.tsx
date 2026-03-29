'use client'

interface ShareButtonProps {
  text: string
}

export default function ShareButton({ text }: ShareButtonProps) {
  function handleShare() {
    // Twitter limits 280 chars; URL counts as 23. Leave room for text.
    const maxText = 255
    const truncated = text.length > maxText ? text.slice(0, maxText - 1) + '…' : text
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(truncated)}`
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400')
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95"
      style={{
        background: 'linear-gradient(135deg, #1DA1F2, #0d8ecf)',
        color: '#fff',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      Share on X
    </button>
  )
}
