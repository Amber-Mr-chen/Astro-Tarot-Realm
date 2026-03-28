// Shared astrological knowledge base used by birth-chart and compatibility APIs
// Grounded in traditional Hellenistic and psychological astrology

export const SIGN_KNOWLEDGE: Record<string, {
  element: string; quality: string; ruler: string
  core: string; emotion: string; shadow: string; gift: string
}> = {
  Aries:       { element: 'Fire',  quality: 'Cardinal', ruler: 'Mars',    core: 'courage, initiative, raw energy, and the drive to act first', emotion: 'quick to anger and quick to forgive, deeply passionate', shadow: 'impulsiveness and difficulty with patience', gift: 'natural leadership and the spark that starts things others only dream of' },
  Taurus:      { element: 'Earth', quality: 'Fixed',    ruler: 'Venus',   core: 'stability, sensuality, loyalty, and a deep connection to the physical world', emotion: 'slow to react but deeply feeling, holding emotions like bedrock', shadow: 'stubbornness and resistance to necessary change', gift: 'the rare ability to build lasting beauty and security that others can rely on' },
  Gemini:      { element: 'Air',   quality: 'Mutable',  ruler: 'Mercury', core: 'curiosity, adaptability, wit, and an insatiable hunger for connection and ideas', emotion: 'emotionally versatile, processing feelings through thought and conversation', shadow: 'restlessness and a tendency to stay on the surface', gift: 'the ability to see multiple sides of every truth and bridge worlds together' },
  Cancer:      { element: 'Water', quality: 'Cardinal', ruler: 'Moon',    core: 'deep nurturing, fierce emotional memory, intuition, and protection of those loved', emotion: 'emotions run as deep as the ocean — powerful, tidal, and transformative', shadow: 'emotional withdrawal and holding onto wounds longer than needed', gift: 'creating sanctuary and safety for others through unconditional emotional presence' },
  Leo:         { element: 'Fire',  quality: 'Fixed',    ruler: 'Sun',     core: 'creative power, generosity, dignity, and the authentic need to shine and be seen', emotion: 'warm-hearted and loyal to the core, hurt by betrayal and indifference', shadow: 'pride and the fear of not being enough', gift: 'inspiring others to believe in themselves through sheer radiant presence' },
  Virgo:       { element: 'Earth', quality: 'Mutable',  ruler: 'Mercury', core: 'discernment, service, precision, and the devotion to making things genuinely better', emotion: 'emotions channeled through analysis — feeling deeply but expressing carefully', shadow: 'self-criticism and anxiety when perfection is unachievable', gift: 'the ability to find the flaw that matters and the solution that heals' },
  Libra:       { element: 'Air',   quality: 'Cardinal', ruler: 'Venus',   core: 'harmony, fairness, aesthetic sense, and the instinct to build balanced relationships', emotion: 'deeply affected by disharmony, craving peace but capable of deep feeling', shadow: 'indecision and suppressing own needs to keep the peace', gift: 'creating beauty and equity in a world that desperately needs both' },
  Scorpio:     { element: 'Water', quality: 'Fixed',    ruler: 'Pluto',   core: 'depth, transformation, intensity, and the relentless pursuit of hidden truth', emotion: 'emotions are volcanic — contained beneath the surface until they cannot be', shadow: 'control, jealousy, and difficulty trusting others fully', gift: 'the power to transform completely — to die and be reborn stronger than before' },
  Sagittarius: { element: 'Fire',  quality: 'Mutable',  ruler: 'Jupiter', core: 'freedom, philosophy, expansion, and the unquenchable need to seek larger meaning', emotion: 'optimistic and emotionally buoyant, but chafes against restriction or smallness', shadow: 'overcommitment and bypassing difficult emotions with philosophical distance', gift: 'the vision to see beyond the horizon and inspire others to believe in possibility' },
  Capricorn:   { element: 'Earth', quality: 'Cardinal', ruler: 'Saturn',  core: 'discipline, mastery, responsibility, and the patient building of something that endures', emotion: 'emotions held close and rarely shown — loyalty expressed through action, not words', shadow: 'excessive self-denial and equating worth with achievement', gift: 'the endurance to climb any mountain and the wisdom earned at the top' },
  Aquarius:    { element: 'Air',   quality: 'Fixed',    ruler: 'Uranus',  core: 'originality, humanitarian vision, independence, and thinking generations ahead', emotion: 'emotionally detached in private yet capable of fierce love for humanity as a whole', shadow: 'disconnection from personal intimacy in favor of abstract ideals', gift: 'the revolutionary mind that can see what the world has not yet imagined' },
  Pisces:      { element: 'Water', quality: 'Mutable',  ruler: 'Neptune', core: 'empathy, spiritual sensitivity, creativity, and the dissolving of boundaries between self and other', emotion: 'feels the emotions of everyone in the room — a gift and an overwhelming burden', shadow: 'escapism and difficulty separating self from others\' pain', gift: 'the boundless compassion that can touch what no logic can reach' },
}

// Extract a plain string from an AI value that might be a nested object or array
export function extractString(val: unknown): string {
  if (typeof val === 'string') return val.trim()
  if (Array.isArray(val)) return val.map(extractString).filter(Boolean).join('. ')
  if (val && typeof val === 'object') {
    const obj = val as Record<string, unknown>
    for (const key of ['description', 'text', 'content', 'reading', 'summary', 'analysis']) {
      if (typeof obj[key] === 'string') return (obj[key] as string).trim()
    }
    for (const v of Object.values(obj)) {
      if (typeof v === 'string' && v.length > 10) return v.trim()
    }
  }
  return ''
}

// Element compatibility matrix
// Returns base score 0-100
export function getElementScore(elemA: string, elemB: string): number {
  const compatible: Record<string, string[]> = {
    Fire:  ['Fire', 'Air'],
    Earth: ['Earth', 'Water'],
    Air:   ['Air', 'Fire'],
    Water: ['Water', 'Earth'],
  }
  const neutral: Record<string, string[]> = {
    Fire:  ['Earth'],
    Earth: ['Fire'],
    Air:   ['Water'],
    Water: ['Air'],
  }
  if (elemA === elemB) return 88
  if (compatible[elemA]?.includes(elemB)) return 82
  if (neutral[elemA]?.includes(elemB)) return 62
  return 50 // challenging combo
}

// Quality (modality) compatibility
export function getQualityBonus(qualA: string, qualB: string): number {
  if (qualA === qualB) return -5  // same modality = friction / power struggle
  if ((qualA === 'Cardinal' && qualB === 'Mutable') || (qualA === 'Mutable' && qualB === 'Cardinal')) return 8
  if ((qualA === 'Fixed' && qualB === 'Mutable') || (qualA === 'Mutable' && qualB === 'Fixed')) return 5
  return 2 // Cardinal + Fixed = some tension but respect
}

// Compute all three compatibility scores deterministically
export function computeCompatibility(signA: string, signB: string): {
  overall: number; love: number; friendship: number; work: number
} {
  const a = SIGN_KNOWLEDGE[signA]
  const b = SIGN_KNOWLEDGE[signB]
  if (!a || !b) return { overall: 70, love: 70, friendship: 70, work: 70 }

  const elemScore  = getElementScore(a.element, b.element)
  const qualBonus  = getQualityBonus(a.quality, b.quality)

  // Love weights emotion + element harmony heavily
  const love = Math.min(99, Math.max(30, elemScore + qualBonus + (a.element === b.element ? 5 : 0)))
  // Friendship weights element + shared interests
  const friendship = Math.min(99, Math.max(35, elemScore + qualBonus + 5))
  // Work weights quality (modality) more — complementary styles work better
  const workBase = a.quality !== b.quality ? elemScore + 10 : elemScore - 5
  const work = Math.min(99, Math.max(35, workBase + qualBonus))
  // Overall = weighted average
  const overall = Math.round((love * 0.4 + friendship * 0.35 + work * 0.25))

  return { overall, love, friendship, work }
}
