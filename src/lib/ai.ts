import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function generateTarotReading(cardName: string, isReversed: boolean, deep = false): Promise<string> {
  const position = isReversed ? 'REVERSED' : 'UPRIGHT'
  const ctx = await getCloudflareContext({ async: true })
  const ai = (ctx.env as any).AI

  if (!ai) {
    return `The ${cardName} card (${position}) brings powerful energy today. Trust your intuition and embrace the journey ahead.`
  }

  const prompt = deep
    ? `You are an ancient oracle. The seeker drew ${cardName} (${position}). Speak directly to them in second person ("you"). Write each section below with the EXACT label shown, followed by a colon and your text. Write 400+ words total across all sections. No asterisks or markdown.

ENERGY: 3-4 sentences on what this card reveals about the seeker right now.
PAST: 2-3 sentences on the past pattern that brought them here.
PRESENT: 2-3 sentences on the energy surrounding them today.
FUTURE: 2-3 sentences on what is opening up ahead.
LOVE: 3-4 sentences on their heart and relationships.
CAREER: 3-4 sentences on their work and purpose.
GROWTH: 3 sentences on their inner evolution.
ACTION: 2-3 specific, concrete things they can do today.`
    : `You are a mystic. The seeker drew ${cardName} (${position}). Speak directly to them ("you"), warm and clear. Write 2-3 sentences (under 80 words): the card's core message for today, and one empowering truth. No special formatting.`

  const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [{ role: 'user', content: prompt }],
    max_tokens: deep ? 900 : 300
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
    ? `You are an ancient oracle. The seeker asked: "${question}". They drew ${cardName} (${isReversed ? 'REVERSED' : 'UPRIGHT'}). The answer is: ${answer}. 

Speak directly to them in second person ("you"), warm and conversational - like a wise friend, not a mystical AI. Write exactly 4 natural paragraphs (total 300-400 words):

1) Why the answer is ${answer} - explain what the card reveals about their situation
2) What hidden energies or patterns are at play right now
3) What they should watch for or be aware of moving forward  
4) Concrete advice and actions they can take today

Write naturally, avoid phrases like "dear seeker", "the universe", "cosmic wisdom". Be direct, warm, and practical. No asterisks or special formatting.`
    : `User asked: "${question}". They drew ${cardName} (${isReversed ? 'REVERSED' : 'UPRIGHT'}). Answer: ${answer}. Write 2 sentences of explanation and advice (under 60 words). No special symbols.`

  const model = deep ? '@cf/meta/llama-3.3-70b-instruct-fp8-fast' : '@cf/meta/llama-3.1-8b-instruct'
  const response = await ai.run(model, {
    messages: [{ role: 'user', content: prompt }],
    max_tokens: deep ? 700 : 200
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
    Aries: 'Fire sign ruled by Mars, Cardinal quality, traits: bold, pioneering, energetic',
    Taurus: 'Earth sign ruled by Venus, Fixed quality, traits: patient, reliable, sensual',
    Gemini: 'Air sign ruled by Mercury, Mutable quality, traits: curious, adaptable, witty',
    Cancer: 'Water sign ruled by Moon, Cardinal quality, traits: nurturing, intuitive, emotional',
    Leo: 'Fire sign ruled by Sun, Fixed quality, traits: confident, creative, generous',
    Virgo: 'Earth sign ruled by Mercury, Mutable quality, traits: analytical, precise, helpful',
    Libra: 'Air sign ruled by Venus, Cardinal quality, traits: diplomatic, fair, social',
    Scorpio: 'Water sign ruled by Pluto, Fixed quality, traits: intense, perceptive, transformative',
    Sagittarius: 'Fire sign ruled by Jupiter, Mutable quality, traits: optimistic, adventurous, philosophical',
    Capricorn: 'Earth sign ruled by Saturn, Cardinal quality, traits: disciplined, ambitious, patient',
    Aquarius: 'Air sign ruled by Uranus, Fixed quality, traits: innovative, independent, humanitarian',
    Pisces: 'Water sign ruled by Neptune, Mutable quality, traits: empathetic, dreamy, artistic',
  } as Record<string, string>

  const signInfo = traits[sign] ?? sign

  const prompt = deep
    ? `You are a master astrologer. ${sign} is a ${signInfo}. Write a deep personal horoscope for ${sign} on ${date}. Output ONLY valid JSON with no extra text before or after. Each text field must be 3-4 full sentences, personal and specific to ${sign}'s nature.

JSON format: {"energy":{"text":"3-4 sentences about today's cosmic energy for ${sign}","stars":4},"love":{"text":"3-4 sentences about ${sign}'s love and relationships today","stars":4},"career":{"text":"3-4 sentences about ${sign}'s work and career today","stars":3},"money":{"text":"3-4 sentences about ${sign}'s finances today","stars":3},"advice":{"text":"3-4 sentences of specific actionable advice for ${sign} today","stars":5}}`
    : `You are an astrologer. Write today's horoscope for ${sign} (${signInfo}) on ${date}. Output ONLY valid JSON, no extra text. Format: {"love":{"text":"2 sentences specific to ${sign}","stars":4},"career":{"text":"2 sentences specific to ${sign}","stars":3},"money":{"text":"2 sentences specific to ${sign}","stars":4}}`

  const model = '@cf/meta/llama-3.1-8b-instruct'
  const response = await ai.run(model, {
    messages: [{ role: 'user', content: prompt }],
    max_tokens: deep ? 1000 : 400
  })

  return String(response.response || '{}')
}
