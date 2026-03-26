'use client'
import { useSession, signIn } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const PAYPAL_CLIENT_ID = 'AS4b4DJ7D6RHTBG2cBrwc6c7O25k09WdK5TAgnXI5EaAyzZBsznIGFpUzBIUWO8VNaPJa_Ow77CcXONm'

// Load PayPal SDK once globally
let paypalLoaded = false
let paypalLoadPromise: Promise<void> | null = null

function loadPayPalSDK(): Promise<void> {
  if (paypalLoaded) return Promise.resolve()
  if (paypalLoadPromise) return paypalLoadPromise

  paypalLoadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById('paypal-sdk')
    if (existing) { paypalLoaded = true; resolve(); return }

    const script = document.createElement('script')
    script.id = 'paypal-sdk'
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`
    script.onload = () => { paypalLoaded = true; resolve() }
    script.onerror = reject
    document.head.appendChild(script)
  })

  return paypalLoadPromise
}
const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    planKey: null,
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
  },
  {
    name: 'Pro Monthly',
    price: '$3.99',
    period: 'per month',
    planKey: 'monthly',
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
  },
  {
    name: 'Pro Yearly',
    price: '$29.99',
    period: 'per year',
    planKey: 'yearly',
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
  },
]

const faqs = [
  {
    q: 'What is a Deep Reading?',
    a: 'A Deep Reading uses our advanced AI model to give you a much more detailed, personalized analysis — including past influences, present energies, and future guidance. Pro users get 10 deep readings per day.',
  },
  {
    q: 'What happens when I reach my daily limit?',
    a: "Free users get 3 standard readings per day. After that, you'll need to wait until tomorrow or upgrade to Pro for unlimited access.",
  },
  {
    q: 'How does payment work?',
    a: 'We use PayPal for secure payments. After payment, your account is instantly upgraded to Pro. Monthly plan lasts 30 days, yearly plan lasts 365 days.',
  },
  {
    q: 'Is my payment secure?',
    a: 'Yes. All payments are processed by PayPal — an industry-leading payment provider. We never store your card details.',
  },
  {
    q: 'Do you offer refunds?',
    a: "We offer a 7-day money-back guarantee if you're not satisfied with your Pro subscription.",
  },
  {
    q: "What's the difference between monthly and yearly?",
    a: 'Both plans have identical features. Yearly saves you 37% — you pay $29.99 instead of $47.88 for 12 months.',
  },
]

function PayPalButton({ planKey, color }: { planKey: string; color: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const paypalRef = useRef<HTMLDivElement>(null)
  const buttonRendered = useRef(false)

  useEffect(() => {
    if (buttonRendered.current) return
    buttonRendered.current = true

    loadPayPalSDK().then(() => {
      if (!(window as any).paypal || !paypalRef.current) return

      ;(window as any).paypal.Buttons({
        style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay' },
        createOrder: async () => {
          setLoading(true)
          const res = await fetch('/api/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan: planKey }),
          })
          const data = await res.json()
          setLoading(false)
          if (!data.id) throw new Error('Failed to create order')
          return data.id
        },
        onApprove: async (data: any) => {
          setLoading(true)
          const res = await fetch('/api/paypal/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderID: data.orderID, plan: planKey }),
          })
          const result = await res.json()
          setLoading(false)
          if (result.success) {
            setMessage('🎉 Payment successful! Redirecting...')
            setTimeout(() => router.push('/profile'), 2000)
          } else {
            setMessage('❌ Payment failed. Please try again.')
          }
        },
        onError: () => {
          setLoading(false)
          setMessage('❌ Payment failed. Please try again.')
        },
      }).render(paypalRef.current)
    }).catch(() => {
      setMessage('❌ Failed to load PayPal. Please refresh.')
    })
  }, [planKey, router])

  return (
    <div>
      {loading && <p className="text-center text-textSub text-sm mb-2">Processing...</p>}
      <div ref={paypalRef} />
      {message && (
        <p className="text-center text-sm mt-2" style={{ color: message.startsWith('🎉') ? '#2ecc71' : '#e74c3c' }}>
          {message}
        </p>
      )}
    </div>
  )
}

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

            {/* CTA */}
            {!plan.planKey ? (
              <button disabled className="w-full py-3 rounded-full text-sm font-semibold opacity-40 text-white"
                style={{ background: 'rgba(155,89,182,0.15)' }}>
                Current Plan
              </button>
            ) : !session ? (
              <button
                onClick={() => signIn('google')}
                className="w-full py-3 rounded-full text-sm font-semibold text-white transition-all hover:opacity-80"
                style={{ background: `linear-gradient(135deg, ${plan.color}, #6C3483)` }}>
                Sign in to Upgrade →
              </button>
            ) : (
              <PayPalButton planKey={plan.planKey} color={plan.color} />
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
