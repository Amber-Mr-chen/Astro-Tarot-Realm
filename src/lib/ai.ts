import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function generateTarotReading(cardName: string, isReversed: boolean, deep = false): Promise<string> {
  const position = isReversed ? 'REVERSED' : 'UPRIGHT'
  const ctx = await getCloudflareContext({ async: true })
  const ai = (ctx.env as any).AI

  if (!ai) {
    return `The ${cardName} card (${position}) brings powerful energy today. Trust your intuition and embrace the journey ahead.`
  }

  const prompt = deep
    ? `You are a master tarot reader with 25 years of experience in the Rider-Waite-Smith tradition. You have deep knowledge of each card's symbolism, numerology, elemental correspondences, and psychological archetypes. You speak with quiet authority — warm, direct, and grounded in established tarot tradition. You never fabricate meanings that don't belong to a card. Every interpretation is rooted in the card's actual symbolism.

Writing style: Write like a real human speaking — not like AI generating content. Vary your sentence length. Use short punchy sentences sometimes. Avoid transition words like "Furthermore", "Moreover", "Additionally", "In conclusion". Never start two sentences in a row the same way. Be specific, not generic. Speak from intuition and experience, not analysis.

The seeker drew ${cardName} (${position}). Speak directly to them in second person ("you"). Write each section below with the EXACT label shown, followed by a colon and your text. Write 400+ words total across all sections. No asterisks, no markdown, no bullet points.

ENERGY: 3-4 sentences on what ${cardName} ${position} reveals about the seeker's current energy and situation, grounded in this card's traditional symbolism.
PAST: 2-3 sentences on the past pattern or experience that has led them to this moment, as reflected by ${cardName}.
PRESENT: 2-3 sentences on the immediate energy and circumstances surrounding them today.
FUTURE: 2-3 sentences on what is opening up or closing down ahead, based on this card's trajectory.
LOVE: 3-4 sentences on how ${cardName} ${position} speaks to their heart, relationships, and emotional life.
CAREER: 3-4 sentences on how this card's energy applies to their work, purpose, and ambitions.
GROWTH: 3 sentences on the inner evolution and soul lesson this card is asking them to embrace.
ACTION: 2-3 specific, concrete, practical things they can do today that align with this card's wisdom.`
    : `You are an experienced tarot reader with deep knowledge of the Rider-Waite-Smith tradition. You speak warmly and directly, grounded in each card's established symbolism and meaning. You never invent meanings — every insight comes from the card's actual archetypal tradition.

Writing style: Write like a real person talking, not like AI. Use natural rhythm. Mix short and longer sentences. Avoid "Furthermore", "Moreover", "Additionally". Be warm but direct.

The seeker drew ${cardName} (${position}). Speak directly to them in second person ("you"). Write 4-5 sentences (120-160 words total):
- First 1-2 sentences: the core energy and message of ${cardName} ${position} for today, rooted in this card's traditional meaning.
- Next 1-2 sentences: a specific insight about their current situation or inner state this card reveals.
- Final 1 sentence: one clear, grounded action or awareness they can carry into their day.
No asterisks, no markdown, no special formatting. Write as flowing natural prose.`

  const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [{ role: 'user', content: prompt }],
    max_tokens: deep ? 900 : 350
  })

  return response.response || ''
}

export async function generateYesNoReading(question: string, cardName: string, isReversed: boolean, deep = false): Promise<string> {
  const answer = isReversed ? 'No' : 'Yes'
  const ctx = await getCloudflareContext({ async: true })
  const ai = (ctx.env as any).AI

  if (!ai) {
    return `${answer}. The ${cardName} card suggests this path. Trust your inner wisdom.`
  }

  const prompt = deep
    ? `You are a professional tarot counselor with 20 years of experience helping people navigate real decisions. You combine deep knowledge of tarot symbolism with practical, grounded guidance. You speak like a wise, trusted friend — direct, warm, and honest. You never fabricate card meanings or make predictions about specific future events. You focus on energy, patterns, and empowering the seeker to act with clarity.

Writing style: Write like a real human talking to a friend — not like AI. Vary sentence length. Use short sentences for impact. Avoid "Furthermore", "Moreover", "Additionally", "It is important to note". Never be vague or mystical for the sake of it. Be direct.

The seeker asked: "${question}"
They drew ${cardName} (${isReversed ? 'REVERSED' : 'UPRIGHT'}).
The answer is: ${answer}.

Speak directly to them in second person ("you"). Write exactly 4 natural paragraphs (300-400 words total):

1) Why the answer is ${answer} — explain what ${cardName} ${isReversed ? 'reversed' : 'upright'} specifically reveals about their question and situation.
2) What hidden energies, patterns, or blind spots are at play right now that this card is illuminating.
3) What they should be aware of or watch for as they move forward with this answer.
4) Concrete, practical guidance and 1-2 specific actions they can take today.

No asterisks, no markdown, no special formatting.`
    : `You are a tarot reader with expertise in the Rider-Waite-Smith tradition. You give clear, grounded answers rooted in each card's established symbolism. You are direct and practical — not vague or mystical.

Writing style: Write like a real person — natural, warm, varied sentences. No "Furthermore", "Moreover". No stiff AI phrasing.

The seeker asked: "${question}"
They drew ${cardName} (${isReversed ? 'REVERSED' : 'UPRIGHT'}).
The answer is: ${answer}.

Write 3-4 sentences (80-100 words) speaking directly to them ("you"):
- State clearly why the answer is ${answer} based on what ${cardName} ${isReversed ? 'reversed' : 'upright'} means.
- Give one specific insight about their situation this card reveals.
- End with one practical piece of advice they can act on today.
No asterisks, no special symbols, no vague mystical language.`

  const model = deep ? '@cf/meta/llama-3.3-70b-instruct-fp8-fast' : '@cf/meta/llama-3.1-8b-instruct'
  const response = await ai.run(model, {
    messages: [{ role: 'user', content: prompt }],
    max_tokens: deep ? 700 : 250
  })

  return response.response || `${answer}. The cards have spoken.`
}

export async function generateHoroscope(sign: string, date: string, deep = false): Promise<string> {
  const ctx = await getCloudflareContext({ async: true })
  const ai = (ctx.env as any).AI

  if (!ai) {
    return JSON.stringify({
      love: { text: "Romance is in the air today.", stars: 4 },
      career: { text: "Focus on your goals.", stars: 3 },
      money: { text: "Financial stability ahead.", stars: 4 }
    })
  }

  const traits = {
    Aries:       'Cardinal Fire sign ruled by Mars — bold, pioneering, energetic, competitive, direct',
    Taurus:      'Fixed Earth sign ruled by Venus — patient, sensual, reliable, stubborn, pleasure-seeking',
    Gemini:      'Mutable Air sign ruled by Mercury — curious, adaptable, witty, restless, communicative',
    Cancer:      'Cardinal Water sign ruled by Moon — nurturing, intuitive, emotional, protective, memory-driven',
    Leo:         'Fixed Fire sign ruled by Sun — confident, generous, creative, proud, warm-hearted',
    Virgo:       'Mutable Earth sign ruled by Mercury — analytical, precise, helpful, critical, health-conscious',
    Libra:       'Cardinal Air sign ruled by Venus — diplomatic, fair, charming, indecisive, harmony-seeking',
    Scorpio:     'Fixed Water sign ruled by Pluto — intense, perceptive, transformative, secretive, deeply loyal',
    Sagittarius: 'Mutable Fire sign ruled by Jupiter — optimistic, adventurous, philosophical, blunt, freedom-loving',
    Capricorn:   'Cardinal Earth sign ruled by Saturn — disciplined, ambitious, patient, reserved, achievement-driven',
    Aquarius:    'Fixed Air sign ruled by Uranus — innovative, independent, humanitarian, detached, forward-thinking',
    Pisces:      'Mutable Water sign ruled by Neptune — empathetic, dreamy, creative, boundary-less, spiritually sensitive',
  } as Record<string, string>

  const signInfo = traits[sign] ?? sign

  const prompt = deep
    ? `You are a professional astrologer with 20 years of experience in natal and transit astrology. You speak with quiet authority — warm, specific, and grounded in traditional astrological knowledge. You never fabricate planetary positions or invent influences that don't exist. You focus on the archetypal energy of the sign and the general cosmic climate for this date.

Writing style: Write like a real astrologer speaking — not like AI. Natural rhythm, varied sentence length. Short punchy lines when needed. Avoid "Furthermore", "Moreover", "It is worth noting". Be specific to ${sign}, never generic.

Write a deep daily horoscope for ${sign} (${signInfo}) for ${date}. Each text field must be 3-4 full sentences. Output ONLY valid JSON with no extra text before or after.

JSON format: {"energy":{"text":"3-4 sentences about today's specific cosmic energy for ${sign} and how it affects their day","stars":4},"love":{"text":"3-4 sentences about ${sign}'s love life and relationships today — specific to their nature","stars":4},"career":{"text":"3-4 sentences about ${sign}'s work, ambitions, and career energy today","stars":3},"money":{"text":"3-4 sentences about ${sign}'s financial energy and practical matters today","stars":3},"advice":{"text":"3-4 sentences of specific, actionable daily guidance tailored to ${sign}'s strengths and challenges","stars":5}}`
    : `You are a professional astrologer. Write a concise daily horoscope for ${sign} (${signInfo}) for ${date}. Be specific to ${sign}'s nature — not generic. Each text field: 2-3 sentences. Write naturally, like a real person — not AI. Output ONLY valid JSON, no extra text.

Format: {"love":{"text":"2-3 sentences specific to ${sign}'s love and relationship energy today","stars":4},"career":{"text":"2-3 sentences specific to ${sign}'s work and career energy today","stars":3},"money":{"text":"2-3 sentences specific to ${sign}'s financial energy today","stars":4}}`

  const model = '@cf/meta/llama-3.1-8b-instruct'
  const response = await ai.run(model, {
    messages: [{ role: 'user', content: prompt }],
    max_tokens: deep ? 1000 : 400
  })

  return String(response.response || '{}')
}
