import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function generateTarotReading(cardName: string, isReversed: boolean, deep = false): Promise<string> {
  const position = isReversed ? 'REVERSED' : 'UPRIGHT'
  const ctx = await getCloudflareContext({ async: true })
  const ai = (ctx.env as any).AI

  if (!ai) {
    return `The ${cardName} card (${position}) brings powerful energy today. Trust your intuition and embrace the journey ahead.`
  }

  const prompt = deep
    ? `You are an ancient oracle. The seeker drew ${cardName} (${position}). Speak directly to them in second person ("you"). Write each section below with the EXACT label shown, followed by a colon and your text. Do not skip any section. No asterisks or markdown.

ENERGY: 2-3 sentences on what this card reveals about the seeker right now.
PAST: 1-2 sentences on the past pattern that brought them here.
PRESENT: 1-2 sentences on the energy surrounding them today.
FUTURE: 1-2 sentences on what is opening up ahead.
LOVE: 2-3 sentences on their heart and relationships.
CAREER: 2-3 sentences on their work and purpose.
GROWTH: 2 sentences on their inner evolution.
ACTION: One specific, concrete thing they can do today.`
    : `You are a mystic speaking directly to a seeker. They drew the ${cardName} card (${position}). Speak in second person ("you"), warm and direct. Write 2-3 sentences (under 80 words): the card's core message for today, and one empowering truth. No asterisks or special formatting.`

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
    ? `You are a master tarot reader. User asked: "${question}". They drew ${cardName} (${isReversed ? 'REVERSED' : 'UPRIGHT'}). Answer: ${answer}. Write 3 short paragraphs (under 150 words total): 1) Why the answer is ${answer}, 2) Hidden energies at play, 3) Empowering advice. No asterisks or markdown.`
    : `User asked: "${question}". They drew ${cardName} (${isReversed ? 'REVERSED' : 'UPRIGHT'}). Answer: ${answer}. Write 2 sentences of explanation and advice (under 60 words). No special symbols.`

  const model = deep ? '@cf/meta/llama-3.3-70b-instruct-fp8-fast' : '@cf/meta/llama-3.1-8b-instruct'
  const response = await ai.run(model, {
    messages: [{ role: 'user', content: prompt }],
    max_tokens: deep ? 600 : 200
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

  const prompt = deep
    ? `Generate a deep horoscope for ${sign} (${date}). Return only valid JSON: {"love":{"text":"...","stars":1-5},"career":{"text":"...","stars":1-5},"money":{"text":"...","stars":1-5}}. Each text 50-70 words with insights and advice. No asterisks or markdown.`
    : `Generate today's horoscope for ${sign} (${date}). Return only valid JSON: {"love":{"text":"...","stars":1-5},"career":{"text":"...","stars":1-5},"money":{"text":"...","stars":1-5}}. Each text under 35 words, natural writing.`

  const model = deep ? '@cf/meta/llama-3.3-70b-instruct-fp8-fast' : '@cf/meta/llama-3.1-8b-instruct'
  const response = await ai.run(model, {
    messages: [{ role: 'user', content: prompt }],
    max_tokens: deep ? 800 : 400
  })

  return response.response || '{}'
}
