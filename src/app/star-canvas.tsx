'use client'
import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  opacitySpeed: number
  color: string
}

interface Meteor {
  x: number
  y: number
  len: number
  speed: number
  opacity: number
  angle: number
  active: boolean
  timer: number
}

export default function StarCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const colors = ['rgba(255,255,255,', 'rgba(201,168,76,', 'rgba(155,89,182,', 'rgba(180,180,255,']
    let stars: Star[] = []
    let meteor: Meteor = { x: 0, y: 0, len: 120, speed: 12, opacity: 0, angle: Math.PI / 4, active: false, timer: 0 }
    let animId: number
    let W = 0, H = 0

    function initStars() {
      W = window.innerWidth
      H = window.innerHeight
      canvas!.width = W
      canvas!.height = H
      const count = W < 768 ? 60 : 150
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        size: Math.random() * 1.5 + 0.3,
        speedX: (Math.random() - 0.5) * 0.08,
        speedY: (Math.random() - 0.5) * 0.08,
        opacity: Math.random(),
        opacitySpeed: (Math.random() * 0.004 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
        color: colors[Math.floor(Math.random() * colors.length)],
      }))
    }

    function spawnMeteor() {
      if (meteor.active) return
      meteor = {
        x: Math.random() * W * 0.6,
        y: Math.random() * H * 0.3,
        len: 100 + Math.random() * 80,
        speed: 10 + Math.random() * 8,
        opacity: 1,
        angle: Math.PI / 5 + Math.random() * (Math.PI / 8),
        active: true,
        timer: 0,
      }
    }

    let meteorTimeout: ReturnType<typeof setTimeout>
    function scheduleMeteor() {
      meteorTimeout = setTimeout(() => {
        spawnMeteor()
        scheduleMeteor()
      }, 6000 + Math.random() * 10000)
    }
    scheduleMeteor()

    function draw() {
      ctx!.clearRect(0, 0, W, H)

      // Stars
      for (const s of stars) {
        s.x += s.speedX
        s.y += s.speedY
        s.opacity += s.opacitySpeed
        if (s.opacity >= 1) { s.opacity = 1; s.opacitySpeed *= -1 }
        if (s.opacity <= 0.1) { s.opacity = 0.1; s.opacitySpeed *= -1 }
        if (s.x < 0) s.x = W
        if (s.x > W) s.x = 0
        if (s.y < 0) s.y = H
        if (s.y > H) s.y = 0

        ctx!.beginPath()
        ctx!.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx!.fillStyle = s.color + s.opacity + ')'
        ctx!.fill()
      }

      // Meteor
      if (meteor.active) {
        meteor.timer += meteor.speed
        const tailX = meteor.x + meteor.timer * Math.cos(meteor.angle)
        const tailY = meteor.y + meteor.timer * Math.sin(meteor.angle)
        const headX = tailX + meteor.len * Math.cos(meteor.angle)
        const headY = tailY + meteor.len * Math.sin(meteor.angle)

        meteor.opacity -= 0.012
        if (meteor.opacity <= 0 || tailX > W || tailY > H) {
          meteor.active = false
        } else {
          const grad = ctx!.createLinearGradient(tailX, tailY, headX, headY)
          grad.addColorStop(0, `rgba(255,255,255,0)`)
          grad.addColorStop(1, `rgba(255,255,255,${meteor.opacity})`)
          ctx!.beginPath()
          ctx!.moveTo(tailX, tailY)
          ctx!.lineTo(headX, headY)
          ctx!.strokeStyle = grad
          ctx!.lineWidth = 1.5
          ctx!.stroke()
        }
      }

      animId = requestAnimationFrame(draw)
    }

    initStars()
    draw()

    const onResize = () => initStars()
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      clearTimeout(meteorTimeout)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
