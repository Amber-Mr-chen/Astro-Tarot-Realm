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

// Static content for horoscope sign landing pages (SEO)
export const SIGN_STATIC: Record<string, {
  symbol: string
  ruling: string
  strengths: string[]
  challenges: string[]
  compatible: string[]
  about: string
  faq: { q: string; a: string }[]
}> = {
  Aries: {
    symbol: '♈', ruling: 'Mars',
    strengths: ['Natural-born leader', 'Courageous and decisive', 'Energetic and passionate'],
    challenges: ['Impatience and impulsiveness', 'Can be quick-tempered', 'Difficulty slowing down'],
    compatible: ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],
    about: 'Aries is the first sign of the zodiac, ruled by Mars. As a Cardinal Fire sign, Aries embodies the spirit of new beginnings — bold, direct, and fearless. Those born under Aries carry an infectious enthusiasm and the courage to charge ahead where others hesitate.',
    faq: [
      { q: 'What is Aries known for?', a: 'Aries is known for their bold, pioneering spirit. They are natural leaders who thrive on challenge and love being first. Ruled by Mars, they bring energy, courage, and directness to everything they do.' },
      { q: 'Who is Aries most compatible with?', a: 'Aries is most compatible with fellow fire signs Leo and Sagittarius, who match their passion and energy. Air signs Gemini and Aquarius also complement Aries well with intellectual stimulation.' },
      { q: 'What are Aries strengths and weaknesses?', a: 'Aries strengths include courage, leadership, and enthusiasm. Their main challenges are impatience, impulsiveness, and a tendency to act before thinking things through.' },
    ],
  },
  Taurus: {
    symbol: '♉', ruling: 'Venus',
    strengths: ['Reliable and grounded', 'Patient and persistent', 'Deeply loyal and sensual'],
    challenges: ['Stubborn and resistant to change', 'Can be possessive', 'Slow to adapt'],
    compatible: ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
    about: 'Taurus is the second sign of the zodiac, ruled by Venus. As a Fixed Earth sign, Taurus represents stability, beauty, and the pleasure of the material world. Those born under Taurus are grounded, dependable, and have a deep appreciation for comfort, art, and loyalty.',
    faq: [
      { q: 'What is Taurus known for?', a: 'Taurus is known for their reliability, patience, and love of beauty and comfort. Ruled by Venus, they have a refined taste and deep appreciation for the finer things in life, along with legendary loyalty to those they love.' },
      { q: 'Who is Taurus most compatible with?', a: 'Taurus is most compatible with earth signs Virgo and Capricorn, who share their practical and grounded nature. Water signs Cancer and Pisces also create nurturing, harmonious bonds with Taurus.' },
      { q: 'What are Taurus strengths and weaknesses?', a: 'Taurus strengths are reliability, patience, and sensuality. Their challenges include stubbornness, resistance to change, and a tendency toward possessiveness in relationships.' },
    ],
  },
  Gemini: {
    symbol: '♊', ruling: 'Mercury',
    strengths: ['Witty and intellectually curious', 'Adaptable and versatile', 'Excellent communicator'],
    challenges: ['Indecisive and inconsistent', 'Can be superficial', 'Difficulty with commitment'],
    compatible: ['Libra', 'Aquarius', 'Aries', 'Leo'],
    about: 'Gemini is the third sign of the zodiac, ruled by Mercury. As a Mutable Air sign, Gemini is the social butterfly of the zodiac — quick-minded, endlessly curious, and gifted with the ability to see every side of a situation. Those born under Gemini are natural communicators who thrive on variety and connection.',
    faq: [
      { q: 'What is Gemini known for?', a: 'Gemini is known for their quick wit, intellectual curiosity, and dual nature. Ruled by Mercury, they are gifted communicators who can adapt to any situation and keep conversations endlessly engaging.' },
      { q: 'Who is Gemini most compatible with?', a: 'Gemini is most compatible with fellow air signs Libra and Aquarius, who match their love of ideas and communication. Fire signs Aries and Leo also energize Gemini with passion and spontaneity.' },
      { q: 'What are Gemini strengths and weaknesses?', a: 'Gemini strengths include versatility, intelligence, and social ease. Their challenges include indecisiveness, inconsistency, and difficulty committing to one path or person.' },
    ],
  },
  Cancer: {
    symbol: '♋', ruling: 'Moon',
    strengths: ['Deeply intuitive and empathetic', 'Fiercely loyal and nurturing', 'Strong emotional intelligence'],
    challenges: ['Moody and overly sensitive', 'Can be clingy or overprotective', 'Difficulty letting go'],
    compatible: ['Scorpio', 'Pisces', 'Taurus', 'Virgo'],
    about: 'Cancer is the fourth sign of the zodiac, ruled by the Moon. As a Cardinal Water sign, Cancer is the nurturer of the zodiac — deeply intuitive, emotionally rich, and powerfully connected to home, family, and memory. Those born under Cancer carry the gift of unconditional love and the strength of deep feeling.',
    faq: [
      { q: 'What is Cancer known for?', a: 'Cancer is known for their deep empathy, nurturing nature, and strong intuition. Ruled by the Moon, they are deeply connected to their emotions and those of others, making them the most caring and protective sign of the zodiac.' },
      { q: 'Who is Cancer most compatible with?', a: 'Cancer is most compatible with water signs Scorpio and Pisces, who understand their emotional depth. Earth signs Taurus and Virgo also provide the stability and security Cancer craves.' },
      { q: 'What are Cancer strengths and weaknesses?', a: 'Cancer strengths include empathy, loyalty, and emotional intelligence. Their challenges include moodiness, over-sensitivity, and difficulty releasing past hurts.' },
    ],
  },
  Leo: {
    symbol: '♌', ruling: 'Sun',
    strengths: ['Charismatic and confident', 'Generous and warm-hearted', 'Creative and dramatic'],
    challenges: ['Pride and ego sensitivity', 'Can be domineering', 'Needs frequent validation'],
    compatible: ['Aries', 'Sagittarius', 'Gemini', 'Libra'],
    about: 'Leo is the fifth sign of the zodiac, ruled by the Sun. As a Fixed Fire sign, Leo radiates warmth, creativity, and a natural magnetism that draws others in. Those born under Leo possess a generous heart and an innate desire to shine — not from vanity, but from a genuine need to share their light with the world.',
    faq: [
      { q: 'What is Leo known for?', a: 'Leo is known for their confidence, generosity, and magnetic charisma. Ruled by the Sun, they naturally command attention and have a flair for drama and creativity. Leo is fiercely loyal and loves to celebrate those they care about.' },
      { q: 'Who is Leo most compatible with?', a: 'Leo is most compatible with fire signs Aries and Sagittarius, who match their energy and enthusiasm. Air signs Gemini and Libra also complement Leo well — Gemini feeds their intellect, Libra their love of beauty and balance.' },
      { q: 'What are Leo strengths and weaknesses?', a: 'Leo strengths include charisma, generosity, and creative power. Their challenges include pride, a need for constant admiration, and sensitivity to criticism.' },
    ],
  },
  Virgo: {
    symbol: '♍', ruling: 'Mercury',
    strengths: ['Analytical and detail-oriented', 'Hardworking and dedicated', 'Deeply helpful and caring'],
    challenges: ['Overly critical and perfectionist', 'Prone to anxiety and overthinking', 'Can be rigid'],
    compatible: ['Taurus', 'Capricorn', 'Cancer', 'Scorpio'],
    about: 'Virgo is the sixth sign of the zodiac, ruled by Mercury. As a Mutable Earth sign, Virgo is the healer and craftsperson of the zodiac — precise, thoughtful, and driven by a genuine desire to be of service. Those born under Virgo see the details others miss and have the patience to make things genuinely better.',
    faq: [
      { q: 'What is Virgo known for?', a: 'Virgo is known for their analytical mind, attention to detail, and dedication to service. Ruled by Mercury, they are practical problem-solvers who bring order and precision to everything they touch, combined with a deep desire to help.' },
      { q: 'Who is Virgo most compatible with?', a: 'Virgo is most compatible with earth signs Taurus and Capricorn, who share their practical and grounded approach. Water signs Cancer and Scorpio also create deep, meaningful bonds with Virgo through emotional depth and loyalty.' },
      { q: 'What are Virgo strengths and weaknesses?', a: 'Virgo strengths include analytical ability, reliability, and genuine care for others. Their challenges include perfectionism, self-criticism, and a tendency toward anxiety when things feel out of control.' },
    ],
  },
  Libra: {
    symbol: '♎', ruling: 'Venus',
    strengths: ['Diplomatic and fair-minded', 'Charming and socially graceful', 'Aesthetic and refined taste'],
    challenges: ['Indecisive and conflict-avoidant', 'Can be people-pleasing', 'Difficulty asserting needs'],
    compatible: ['Gemini', 'Aquarius', 'Leo', 'Sagittarius'],
    about: 'Libra is the seventh sign of the zodiac, ruled by Venus. As a Cardinal Air sign, Libra is the diplomat and aesthete of the zodiac — graceful, fair-minded, and deeply committed to beauty and balance in all things. Those born under Libra have an innate gift for seeing all sides of a situation and creating harmony where there was conflict.',
    faq: [
      { q: 'What is Libra known for?', a: 'Libra is known for their charm, fairness, and love of beauty and harmony. Ruled by Venus, they are natural diplomats who seek balance in all areas of life and have an exceptional eye for aesthetics and style.' },
      { q: 'Who is Libra most compatible with?', a: 'Libra is most compatible with air signs Gemini and Aquarius, who match their love of ideas and social connection. Fire signs Leo and Sagittarius also create exciting, dynamic relationships with Libra.' },
      { q: 'What are Libra strengths and weaknesses?', a: 'Libra strengths include diplomacy, charm, and a keen sense of justice. Their challenges include indecisiveness, conflict avoidance, and difficulty prioritizing their own needs over others.' },
    ],
  },
  Scorpio: {
    symbol: '♏', ruling: 'Pluto',
    strengths: ['Intensely perceptive and intuitive', 'Deeply loyal and passionate', 'Transformative and resilient'],
    challenges: ['Jealous and possessive tendencies', 'Difficulty trusting others', 'Can be controlling or secretive'],
    compatible: ['Cancer', 'Pisces', 'Virgo', 'Capricorn'],
    about: 'Scorpio is the eighth sign of the zodiac, ruled by Pluto. As a Fixed Water sign, Scorpio is the most profound and transformative force in the zodiac — intense, magnetic, and capable of perceiving what lies beneath the surface. Those born under Scorpio are drawn to depth, truth, and the mysteries of life, death, and rebirth.',
    faq: [
      { q: 'What is Scorpio known for?', a: 'Scorpio is known for their intensity, perceptiveness, and magnetic presence. Ruled by Pluto, they are deeply intuitive and drawn to uncovering hidden truths. Scorpio is fiercely loyal but demands the same depth and honesty in return.' },
      { q: 'Who is Scorpio most compatible with?', a: 'Scorpio is most compatible with water signs Cancer and Pisces, who understand their emotional depth. Earth signs Virgo and Capricorn also create strong, loyal bonds with Scorpio through shared values of depth and commitment.' },
      { q: 'What are Scorpio strengths and weaknesses?', a: 'Scorpio strengths include emotional depth, intuition, and the power to transform through adversity. Their challenges include jealousy, difficulty trusting others, and a tendency toward secrecy or control.' },
    ],
  },
  Sagittarius: {
    symbol: '♐', ruling: 'Jupiter',
    strengths: ['Optimistic and adventurous', 'Philosophical and open-minded', 'Honest and direct'],
    challenges: ['Commitment-phobic and restless', 'Can be blunt or tactless', 'Overextends and overpromises'],
    compatible: ['Aries', 'Leo', 'Libra', 'Aquarius'],
    about: 'Sagittarius is the ninth sign of the zodiac, ruled by Jupiter. As a Mutable Fire sign, Sagittarius is the philosopher-adventurer of the zodiac — expansive, freedom-loving, and eternally optimistic about what lies over the next horizon. Those born under Sagittarius are truth-seekers who inspire others with their vision and enthusiasm for life.',
    faq: [
      { q: 'What is Sagittarius known for?', a: 'Sagittarius is known for their adventurous spirit, philosophical mind, and love of freedom. Ruled by Jupiter, they are eternal optimists who seek meaning, travel, and expansion in all areas of life, and inspire others with their enthusiasm and honesty.' },
      { q: 'Who is Sagittarius most compatible with?', a: 'Sagittarius is most compatible with fire signs Aries and Leo, who share their passion and zest for life. Air signs Libra and Aquarius also connect well with Sagittarius through shared love of ideas and social adventure.' },
      { q: 'What are Sagittarius strengths and weaknesses?', a: 'Sagittarius strengths include optimism, open-mindedness, and inspirational vision. Their challenges include restlessness, commitment issues, and a tendency to be blunt or overcommit to more than they can deliver.' },
    ],
  },
  Capricorn: {
    symbol: '♑', ruling: 'Saturn',
    strengths: ['Disciplined and ambitious', 'Responsible and reliable', 'Patient and persistent'],
    challenges: ['Overly rigid and work-obsessed', 'Emotionally reserved', 'Can be pessimistic or cold'],
    compatible: ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],
    about: 'Capricorn is the tenth sign of the zodiac, ruled by Saturn. As a Cardinal Earth sign, Capricorn is the master builder of the zodiac — patient, disciplined, and committed to creating something that lasts. Those born under Capricorn understand that the most meaningful things in life take time, and they have the endurance to see them through.',
    faq: [
      { q: 'What is Capricorn known for?', a: 'Capricorn is known for their discipline, ambition, and remarkable work ethic. Ruled by Saturn, they are master planners who build toward long-term goals with patience and persistence, earning deep respect through their reliability and integrity.' },
      { q: 'Who is Capricorn most compatible with?', a: 'Capricorn is most compatible with earth signs Taurus and Virgo, who share their practical, grounded nature. Water signs Scorpio and Pisces also complement Capricorn by adding emotional depth and intuition to their structure.' },
      { q: 'What are Capricorn strengths and weaknesses?', a: 'Capricorn strengths include discipline, dependability, and long-term vision. Their challenges include emotional reserve, rigidity, and a tendency to sacrifice personal life for professional achievement.' },
    ],
  },
  Aquarius: {
    symbol: '♒', ruling: 'Uranus',
    strengths: ['Original and inventive', 'Humanitarian and idealistic', 'Independent and progressive'],
    challenges: ['Emotionally detached', 'Can be unpredictable or rebellious', 'Difficulty with intimacy'],
    compatible: ['Gemini', 'Libra', 'Aries', 'Sagittarius'],
    about: 'Aquarius is the eleventh sign of the zodiac, ruled by Uranus. As a Fixed Air sign, Aquarius is the visionary and humanitarian of the zodiac — original, unconventional, and always thinking ahead of their time. Those born under Aquarius are driven by a desire to improve the world and march to the beat of their own drum.',
    faq: [
      { q: 'What is Aquarius known for?', a: 'Aquarius is known for their originality, humanitarian ideals, and independent spirit. Ruled by Uranus, they are forward-thinking visionaries who challenge convention and are deeply committed to making the world a more progressive and equitable place.' },
      { q: 'Who is Aquarius most compatible with?', a: 'Aquarius is most compatible with air signs Gemini and Libra, who match their intellectual energy and love of ideas. Fire signs Aries and Sagittarius also create exciting, stimulating connections with Aquarius.' },
      { q: 'What are Aquarius strengths and weaknesses?', a: 'Aquarius strengths include originality, humanitarian vision, and intellectual brilliance. Their challenges include emotional detachment, unpredictability, and difficulty sustaining personal intimacy.' },
    ],
  },
  Pisces: {
    symbol: '♓', ruling: 'Neptune',
    strengths: ['Deeply empathetic and compassionate', 'Imaginative and creative', 'Spiritually sensitive and intuitive'],
    challenges: ['Escapist and avoidant tendencies', 'Difficulty with boundaries', 'Overly idealistic'],
    compatible: ['Cancer', 'Scorpio', 'Taurus', 'Capricorn'],
    about: 'Pisces is the twelfth and final sign of the zodiac, ruled by Neptune. As a Mutable Water sign, Pisces is the most spiritually sensitive and empathic force in the zodiac — creative, dreamy, and capable of feeling the entire spectrum of human emotion. Those born under Pisces carry the wisdom of all twelve signs and a compassion that knows no boundaries.',
    faq: [
      { q: 'What is Pisces known for?', a: 'Pisces is known for their deep empathy, creativity, and spiritual sensitivity. Ruled by Neptune, they are natural dreamers and healers who can feel what others cannot name, bringing art, compassion, and intuition to everything they touch.' },
      { q: 'Who is Pisces most compatible with?', a: 'Pisces is most compatible with water signs Cancer and Scorpio, who understand their emotional depth and intuition. Earth signs Taurus and Capricorn also provide the grounding and stability that Pisces needs to thrive.' },
      { q: 'What are Pisces strengths and weaknesses?', a: 'Pisces strengths include empathy, creativity, and spiritual wisdom. Their challenges include escapism, poor boundaries, and a tendency to lose themselves in others or in fantasy when reality becomes difficult.' },
    ],
  },
}
