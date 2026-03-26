'use client'
import { useSession, signIn } from 'next-auth/react'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    color: 'rgba(155,89,182,0.4)',
    badge: null,
    highlight: false,
    features: [
      '3 readings per day',
      'All reading types (Tarot, Yes/No, Horoscope)',
      '7-day reading history',
      'Standard AI readings',
      '❌ No deep readings',
    ],
    cta: 'Current Plan',
    ctaDisabled: true,
  },
  {
    name: 'Pro Monthly',
    price: '$3.99',
    period: 'per month',
    color: '#9B59B6',
    badge: 'MOST POPULAR',
    highlight: true,
    features: [
      'Unlimited readings per day',
      'All reading types',
      'Full history (forever)',
      'Standard AI readings',
      '✨ 10 deep readings per day',
      'Priority support',
    ],
    cta: 'Get Pro Monthly',
    ctaDisabled: false,
  },
  {
    name: 'Pro Yearly',
    price: '$29.99',
    period: 'per year',
    color: '#F39C12',
    badge: 'SAVE 37%',
    highlight: false,
    features: [
      'Everything in Pro Monthly',
      'Only $2.50/month',
      '✨ 10 deep readings per day',
      'Early access to new features',
      'Priority support',
    ],
    cta: 'Get Pro Yearly',
    ctaDisabled: false,
  },
]

const faqs = [
  {
    q: 'What is a Deep Reading?',
    a: 'A Deep Reading uses our advanced AI model to give you a much more detailed, personalized analysis — including past influences, present energies, and future guidance. Pro users get 10 deep readings per day.',
  },
  {
    q: 'What happens when I reach my daily limit?',
    a: 'Free users get 3 standard readings per day. After that, you\'ll need to wait until tomorrow or upgrade to Pro for unlimited access.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes! Cancel anytime with no hassle. You keep Pro access until the end of your billing period.',
  },
  {
    q: 'Is my payment secure?',
    a: 'Yes. Payments are processed by PayPal and Stripe — industry-leading providers. We never store your card details.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'We offer a 7-day money-back guarantee if you\'re not satisfied with your Pro subscription.',
  },
  {
    q: 'What\'s the difference between monthly and yearly?',
    a: 'Both plans have identical features. Yearly saves you 37% — you pay $29.99 instead of $47.88 for 12 months.',
  },
]

export default function PricingPage() {
  const { data: session } = useSession()

  return (
    <main className="min-h-screen px-6 py-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="text-gold text-sm tracking-[0.3em] uppercase font-cinzel mb-4">✦ Plans & Pricing ✦</div>
        <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-textMain mb-4">
          Unlock Deeper Cosmic Guidance
        </h1>
        <p className="text-textSub text-lg max-w-xl mx-auto">
          Start free. Upgrade to Pro for unlimited readings and exclusive deep readings.
        </p>
      </div>

      {/* Deep Reading Highlight Banner */}
      <div className="rounded-2xl p-5 mb-12 text-center"
        style={{ background: 'linear-gradient(135deg, rgba(155,89,182,0.2), rgba(243,156,18,0.2))', border: '1px solid rgba(243,156,18,0.4)' }}>
        <div className="text-3xl mb-2">✨</div>
        <h2 className="font-cinzel text-xl font-bold text-gold mb-2">What is a Deep Reading?</h2>
        <p className="text-textSub max-w-xl mx-auto text-sm leading-relaxed">
          Deep Readings use our most advanced AI for a comprehensive analysis — covering past influences, present energies, and future guidance. Far more detailed than standard readings. <strong className="text-textMain">Exclusive to Pro members (10/day).</strong>
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {plans.map((plan) => (
          <div key={plan.name} className="rounded-2xl p-6 relative flex flex-col"
            style={{
              backgroundColor: '#1A1A2E',
              border: `2px solid ${plan.highlight ? plan.color : 'rgba(155,89,182,0.2)'}`,
              boxShadow: plan.highlight ? `0 0 30px rgba(155,89,182,0.2)` : 'none',
            }}>
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: plan.color === 'rgba(155,89,182,0.4)' ? '#9B59B6' : plan.color }}>
                {plan.badge}
              </div>
            )}
            <h3 className="font-cinzel text-xl font-bold text-textMain mb-2">{plan.name}</h3>
            <div className="mb-5">
              <span className="text-4xl font-bold text-gold">{plan.price}</span>
              <span className="text-textSub text-sm ml-1">{plan.period}</span>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-textSub">
                  <span className={`mt-0.5 ${f.startsWith('❌') ? 'opacity-50' : 'text-green-400'}`}>
                    {f.startsWith('❌') || f.startsWith('✨') ? '' : '✓'}
                  </span>
                  <span className={f.startsWith('❌') ? 'opacity-50' : ''}>{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => !plan.ctaDisabled && !session && signIn('google')}
              disabled={plan.ctaDisabled}
              className="w-full py-3 rounded-full text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-40"
              style={{
                background: plan.ctaDisabled
                  ? 'rgba(155,89,182,0.15)'
                  : `linear-gradient(135deg, ${plan.color === 'rgba(155,89,182,0.4)' ? '#9B59B6' : plan.color}, #6C3483)`,
                color: 'white'
              }}>
              {plan.ctaDisabled ? plan.cta : `${plan.cta} →`}
            </button>
            {!plan.ctaDisabled && (
              <p className="text-center text-textSub text-xs mt-2">🔒 PayPal & Stripe · Coming soon</p>
            )}
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div>
        <div className="text-center mb-8">
          <h2 className="font-cinzel text-2xl font-bold text-textMain">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q} className="rounded-2xl p-5"
              style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.2)' }}>
              <h4 className="font-semibold text-textMain mb-2">{faq.q}</h4>
              <p className="text-textSub text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
