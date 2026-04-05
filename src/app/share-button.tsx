'use client'
import { useEffect, useRef, useState } from 'react'

// Support two modes:
// 1. Card mode: pass cardName + isReversed + reading → generates Canvas image card
// 2. Legacy text mode: pass text → opens X (Twitter) share
type ShareButtonProps =
  | { cardName: string; isReversed: boolean; reading: string; text?: never }
  | { text: string; cardName?: never; isReversed?: never; reading?: never }

function drawTarotCard(
  canvas: HTMLCanvasElement,
  cardName: string,
  isReversed: boolean,
  reading: string
) {
  const W = 1080, H = 1080
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#06061A')
  bg.addColorStop(0.5, '#12082E')
  bg.addColorStop(1, '#0A1030')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Scattered stars
  const stars: [number, number][] = [
    [80,70],[300,50],[600,30],[900,80],[1020,55],
    [50,300],[1040,250],[30,600],[1050,550],[60,900],
    [200,980],[500,1050],[800,1000],[1000,900],[150,150],
    [950,200],[400,100],[700,120],[250,850],[850,150],
    [180,450],[920,480],[350,700],[780,650]
  ]
  stars.forEach(([x, y], i) => {
    const size = i % 3 === 0 ? 2.5 : i % 3 === 1 ? 1.5 : 1
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fillStyle = i % 4 === 0 ? 'rgba(243,156,18,0.9)' : 'rgba(255,255,255,0.7)'
    ctx.fill()
  })

  // Outer gold border
  ctx.strokeStyle = 'rgba(243,156,18,0.7)'
  ctx.lineWidth = 3
  ctx.strokeRect(36, 36, W - 72, H - 72)

  // Inner purple border
  ctx.strokeStyle = 'rgba(155,89,182,0.5)'
  ctx.lineWidth = 1
  ctx.strokeRect(50, 50, W - 100, H - 100)

  // Corner ornaments
  const corners: [number, number][] = [[72, 72], [W - 72, 72], [72, H - 72], [W - 72, H - 72]]
  ctx.fillStyle = 'rgba(243,156,18,0.85)'
  ctx.font = 'bold 26px Georgia, "Times New Roman", serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  corners.forEach(([x, y]) => ctx.fillText('\u2736', x, y))

  // Header brand name
  ctx.fillStyle = '#F39C12'
  ctx.font = 'bold 30px Georgia, "Times New Roman", serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('\u2736   T A R O T   R E A L M   \u2736', W / 2, 115)

  // Top divider
  const grad1 = ctx.createLinearGradient(100, 0, W - 100, 0)
  grad1.addColorStop(0, 'transparent')
  grad1.addColorStop(0.3, 'rgba(243,156,18,0.5)')
  grad1.addColorStop(0.7, 'rgba(243,156,18,0.5)')
  grad1.addColorStop(1, 'transparent')
  ctx.strokeStyle = grad1
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(100, 135)
  ctx.lineTo(W - 100, 135)
  ctx.stroke()

  // Central mystical circle
  const cx = W / 2, cy = 380
  const outerR = 155

  // Glow
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerR)
  glow.addColorStop(0, 'rgba(155,89,182,0.25)')
  glow.addColorStop(0.6, 'rgba(155,89,182,0.08)')
  glow.addColorStop(1, 'transparent')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2)
  ctx.fill()

  // Outer ring
  ctx.strokeStyle = 'rgba(243,156,18,0.6)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2)
  ctx.stroke()

  // Inner ring
  ctx.strokeStyle = 'rgba(155,89,182,0.5)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(cx, cy, outerR - 18, 0, Math.PI * 2)
  ctx.stroke()

  // Star inside circle
  ctx.fillStyle = 'rgba(243,156,18,0.9)'
  ctx.font = 'bold 120px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('\u2736', cx, cy)

  // Tick marks on circle
  ctx.strokeStyle = 'rgba(243,156,18,0.4)'
  ctx.lineWidth = 1.5
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2
    const x1 = cx + Math.cos(angle) * (outerR - 12)
    const y1 = cy + Math.sin(angle) * (outerR - 12)
    const x2 = cx + Math.cos(angle) * outerR
    const y2 = cy + Math.sin(angle) * outerR
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  // Card name
  ctx.fillStyle = '#F5C842'
  ctx.font = `bold ${cardName.length > 14 ? '54' : '66'}px Georgia, "Times New Roman", serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.shadowColor = 'rgba(243,156,18,0.5)'
  ctx.shadowBlur = 15
  ctx.fillText(cardName, W / 2, 595)
  ctx.shadowBlur = 0

  // Position label
  ctx.fillStyle = isReversed ? '#B39DDB' : '#CE93D8'
  ctx.font = '28px Georgia, "Times New Roman", serif'
  ctx.textAlign = 'center'
  ctx.fillText(isReversed ? '\u2014  R E V E R S E D  \u2014' : '\u2014  U P R I G H T  \u2014', W / 2, 640)

  // Middle divider
  const grad2 = ctx.createLinearGradient(100, 0, W - 100, 0)
  grad2.addColorStop(0, 'transparent')
  grad2.addColorStop(0.3, 'rgba(155,89,182,0.5)')
  grad2.addColorStop(0.7, 'rgba(155,89,182,0.5)')
  grad2.addColorStop(1, 'transparent')
  ctx.strokeStyle = grad2
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(100, 670)
  ctx.lineTo(W - 100, 670)
  ctx.stroke()

  // Reading excerpt — word wrap, max 4 lines
  ctx.fillStyle = 'rgba(230,220,255,0.88)'
  ctx.font = '30px Georgia, "Times New Roman", serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  const maxLineWidth = W - 220
  const words = reading.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const test = currentLine ? `${currentLine} ${word}` : word
    if (ctx.measureText(test).width > maxLineWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
      if (lines.length >= 4) break
    } else {
      currentLine = test
    }
  }
  if (currentLine && lines.length < 4) {
    lines.push(lines.length === 3 && reading.length > 200 ? currentLine.slice(0, -3) + '...' : currentLine)
  }

  const lineH = 52
  const textStartY = 700 + (4 - lines.length) * lineH / 2
  lines.forEach((line, i) => ctx.fillText(line, W / 2, textStartY + i * lineH))

  // Bottom divider
  const grad3 = ctx.createLinearGradient(100, 0, W - 100, 0)
  grad3.addColorStop(0, 'transparent')
  grad3.addColorStop(0.3, 'rgba(243,156,18,0.4)')
  grad3.addColorStop(0.7, 'rgba(243,156,18,0.4)')
  grad3.addColorStop(1, 'transparent')
  ctx.strokeStyle = grad3
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(100, H - 115)
  ctx.lineTo(W - 100, H - 115)
  ctx.stroke()

  // Website watermark
  ctx.fillStyle = 'rgba(243,156,18,0.8)'
  ctx.font = 'bold 28px Georgia, "Times New Roman", serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('tarotrealm.xyz', W / 2, H - 72)
}

export default function ShareButton(props: ShareButtonProps) {
  // Card mode
  if ('cardName' in props && props.cardName !== undefined) {
    return <CardShareButton {...props as { cardName: string; isReversed: boolean; reading: string }} />
  }
  // Legacy text mode (other pages)
  return <TextShareButton text={(props as { text: string }).text} />
}

function CardShareButton({ cardName, isReversed, reading }: { cardName: string; isReversed: boolean; reading: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const blobUrlRef = useRef<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !cardName) return

    setIsReady(false)
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }

    const timer = setTimeout(() => {
      drawTarotCard(canvas, cardName, isReversed, reading)
      canvas.toBlob((blob) => {
        if (blob) {
          blobUrlRef.current = URL.createObjectURL(blob)
          setIsReady(true)
        }
      }, 'image/png')
    }, 100)

    return () => {
      clearTimeout(timer)
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
    }
  }, [cardName, isReversed, reading])

  async function handleShare() {
    if (!isReady || sharing || !blobUrlRef.current) return
    setSharing(true)
    try {
      const response = await fetch(blobUrlRef.current)
      const blob = await response.blob()
      const file = new File([blob], 'tarot-reading.png', { type: 'image/png' })
      const shareText = `I drew ${cardName} (${isReversed ? 'Reversed' : 'Upright'}) on TarotRealm \u2728\n\nGet your free reading \u2192 tarotrealm.xyz/tarot`

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `My Tarot: ${cardName}`, text: shareText })
      } else if (navigator.share) {
        await navigator.share({ title: `My Tarot: ${cardName}`, text: shareText, url: 'https://tarotrealm.xyz/tarot' })
      } else {
        const a = document.createElement('a')
        a.href = blobUrlRef.current!
        a.download = 'tarot-reading.png'
        a.click()
      }
    } catch {
      // user cancelled
    } finally {
      setSharing(false)
    }
  }

  return (
    <>
      <canvas ref={canvasRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} />
      <button
        onClick={handleShare}
        disabled={!isReady || sharing}
        className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, #F39C12, #9B59B6)', color: '#fff' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        {sharing ? 'Sharing...' : isReady ? 'Share Reading' : 'Preparing...'}
      </button>
    </>
  )
}

function TextShareButton({ text }: { text: string }) {
  function handleShare() {
    const maxText = 255
    const truncated = text.length > maxText ? text.slice(0, maxText - 1) + '\u2026' : text
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(truncated)}`
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400')
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95"
      style={{ background: 'linear-gradient(135deg, #1DA1F2, #0d8ecf)', color: '#fff' }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      Share on X
    </button>
  )
}
