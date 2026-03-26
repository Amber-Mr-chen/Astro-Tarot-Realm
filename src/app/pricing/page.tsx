'use client'
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    color: 'rgba(155,89,182,0.3)',
    badge: null,
    features: [
      '3 readings per day',
      'All 3 reading types',
      '7-day history',
      'Basic AI reading',
    ],
    cta: 'Current Plan',
    ctaDisabled: true,
  },
  {
    name: 'Pro Monthly',
    price: '$3.99',
    period: 'per month',
    color: '#9B59B6',
    badge: 'POPULAR',
    features: [
      'Unlimited readings',
      'All 3 reading types',
      'Full history (forever)',
      'Advanced AI reading',
      'Priority support',
    ],
    cta: 'Upgrade Now',
    ctaDisabled: false,
  },
  {
    name: 'Pro Yearly',
    price: '$29.99',
    period: 'per year',
    color: '#F39C12',
    badge: 'SAVE 37%',
    features: [
      'Everything in Monthly',
      'Only $2.50/month',
      'Early access to new features',
      'Priority support',
    ],
    cta: 'Best Value',
    ctaDisabled: false,
  },
]

const creditPacks = [
  { credits: 20, price: '$1.99', per: '$0.10/reading', popular: false },
  { credits: 50, price: '$3.99', per: '$0.08/reading', popular: true },
  { credits: 150, price: '$9.99', per: '$0.07/reading', popular: false },
]

const faqs = [
  {
    q: 'What happens when I reach my daily limit?',
    a: 'Free users get 3 readings per day. After that, you can use credits or upgrade to Pro for unlimited access.',
  },
  {
    q: 'What are credits?',
    a: 'Credits let you do extra readings beyond your daily free limit. 1 credit = 1 reading. They never expire.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes! Cancel anytime. You keep Pro access until the end of your billing period.',
  },
  {
    q: 'What AI model powers the readings?',
    a: 'Free users use our base AI model. Pro users get access to our advanced model for deeper, more personalized readings.',
  },
  {
    q: 'Is my payment secure?',
    a: 'Yes. Payments are processed by PayPal and Stripe — industry-leading payment providers. We never store your card details.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'We offer a 7-day money-back guarantee if you\'re not satisfied with your Pro subscription.',
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
          Unlock Your Full Potential
        </h1>
        <p className="text-textSub text-lg max-w-xl mx-auto">
          Start free. Upgrade when you're ready for deeper cosmic guidance.
        </p>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {plans.map((plan) => (
          <div key={plan.name} className="rounded-2xl p-6 relative"
            style={{ backgroundColor: '#1A1A2E', border: `1px solid ${plan.color}` }}>
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-black"
                style={{ backgroundColor: plan.color }}>
                {plan.badge}
              </div>
            )}
            <h3 className="font-cinzel text-xl font-bold text-textMain mb-2">{plan.name}</h3>
            <div className="mb-4">
              <span className="text-4xl font-bold text-gold">{plan.price}</span>
              <span className="text-textSub text-sm ml-1">{plan.period}</span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-textSub">
                  <span className="text-green-400 mt-0.5">✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => !plan.ctaDisabled && !session && signIn('google')}
              disabled={plan.ctaDisabled}
              className="w-full py-3 rounded-full text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-50"
              style={{
                background: plan.ctaDisabled ? 'rgba(155,89,182,0.2)' : `linear-gradient(135deg, ${plan.color}, #6C3483)`,
                color: 'white'
              }}>
              {plan.ctaDisabled ? plan.cta : `${plan.cta} →`}
            </button>
            {!plan.ctaDisabled && (
              <p className="text-center text-textSub text-xs mt-2">Coming soon · PayPal & Stripe</p>
            )}
          </div>
        ))}
      </div>

      {/* Credits Section */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="font-cinzel text-2xl font-bold text-textMain mb-2">Buy Credits</h2>
          <p className="text-textSub">Pay as you go. Perfect for occasional extra readings. Never expire.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {creditPacks.map((pack) => (
            <div key={pack.credits} className="rounded-2xl p-5 text-center relative"
              style={{ backgroundColor: '#1A1A2E', border: `1px solid ${pack.popular ? '#F39C12' : 'rgba(155,89,182,0.3)'}` }}>
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-black bg-yellow-500">
                  BEST VALUE
                </div>
              )}
              <div className="font-cinzel text-3xl font-bold text-gold mb-1">{pack.credits}</div>
              <div className="text-textSub text-sm mb-3">Credits</div>
              <div className="text-2xl font-bold text-textMain mb-1">{pack.price}</div>
              <div className="text-textSub text-xs mb-4">{pack.per}</div>
              <button className="w-full py-2 rounded-full text-sm font-semibold text-white hover:opacity-80"
                style={{ background: 'linear-gradient(135deg, #9B59B6, #6C3483)' }}>
                Buy Credits →
              </button>
              <p className="text-textSub text-xs mt-2">Coming soon</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <div className="text-center mb-8">
          <h2 className="font-cinzel text-2xl font-bold text-textMain mb-2">Frequently Asked Questions</h2>
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
