'use client'
import Link from 'next/link'

const PREVIEW_SECTIONS = [
  {
    icon: '⏳',
    title: 'Past · Present · Future',
    preview: 'There is a pattern from your past that has been quietly shaping the decisions you face today. The energy you carry from previous chapters — both the courage and the hesitation — is more present than you realize.',
    blurRest: true,
    fullBlur: false,
  },
  {
    icon: '💕',
    title: 'Love & Relationships',
    preview: 'Your heart is navigating a delicate crossroads right now. Someone in your life may be asking more of you than you feel ready to give — or perhaps you are the one holding back.',
    blurRest: false,
    fullBlur: true,
  },
  {
    icon: '💼',
    title: 'Career & Purpose',
    preview: 'A shift is coming in how you engage with your work. The path forward requires you to trust a skill or gift you have been underselling.',
    blurRest: false,
    fullBlur: true,
  },
  {
    icon: '⚡',
    title: "Today's Action",
    preview: 'Three concrete steps you can take today to align with the energy of this card and move forward with clarity.',
    blurRest: false,
    fullBlur: true,
  },
]

interface DeepReadingPreviewProps {
  cardName: string
}

export default function DeepReadingPreview({ cardName }: DeepReadingPreviewProps) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,168,76,0.3)', background: 'linear-gradient(180deg, rgba(26,26,46,0.8) 0%, rgba(26,26,46,0.95) 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3 text-center">
        <div className="text-gold font-cinzel text-xs tracking-[0.2em] uppercase mb-1">✦ Deep Reading Preview ✦</div>
        <p className="text-textSub text-xs">See what a full deep reading of <strong className="text-textMain">{cardName}</strong> reveals</p>
      </div>

      <div className="px-5 pb-2 space-y-3">
        {PREVIEW_SECTIONS.map((section) => (
          <div key={section.title} className="rounded-xl overflow-hidden relative" style={{ backgroundColor: '#12122A', border: '1px solid rgba(155,89,182,0.2)' }}>
            <div className="p-4">
              <h4 className="font-cinzel text-xs font-bold text-gold uppercase tracking-wider mb-2">
                {section.icon} {section.title}
              </h4>

              {section.fullBlur ? (
                /* Fully blurred section */
                <div className="relative">
                  <p className="text-textMain text-sm leading-relaxed select-none" style={{ filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none' }}>
                    {section.preview}
                  </p>
                  <div className="absolute inset-0" />
                </div>
              ) : (
                /* Partial: first sentence visible, rest blurred */
                <div>
                  <p className="text-textMain text-sm leading-relaxed mb-2">
                    {section.preview.split('.')[0]}.
                  </p>
                  <p className="text-textMain text-sm leading-relaxed select-none" style={{ filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none' }}>
                    {section.preview.split('.').slice(1).join('.').trim()}
                  </p>
                </div>
              )}
            </div>

            {/* Lock overlay for fully blurred sections */}
            {section.fullBlur && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(13,13,26,0.15)' }}>
                <span className="text-xs text-textSub/60">🔒</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-5 py-5 text-center" style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.06), rgba(155,89,182,0.06))' }}>
        <p className="text-textSub text-xs mb-3">
          Unlock the complete deep reading — past, present, future, love, career, growth & daily action.
        </p>
        <Link
          href="/pricing"
          className="inline-block px-6 py-3 rounded-full text-sm font-bold text-bg transition-all hover:scale-105 hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C96D)', boxShadow: '0 0 20px rgba(201,168,76,0.3)' }}
        >
          ✨ Unlock Full Deep Reading — Pro
        </Link>
        <p className="text-textSub/50 text-xs mt-2">From $3.99/month · Cancel anytime</p>
      </div>
    </div>
  )
}
