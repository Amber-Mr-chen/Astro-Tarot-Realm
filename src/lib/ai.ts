import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function generateTarotReading(cardName: string, isReversed: boolean, deep = false): Promise<string> {
  const position = isReversed ? 'REVERSED' : 'UPRIGHT'
  const ctx = await getCloudflareContext({ async: true })
  const ai = (ctx.env as any).AI

  if (!ai) {
    return `The ${cardName} card (${position}) brings powerful energy today. Trust your intuition and embrace the journey ahead.`
  }

  const prompt = deep
    ? `You are a master tarot reader with decades of experience. A user drew the ${cardName} card (${position}) for their daily reading. Provide a comprehensive deep reading (250-350 words) covering: 1) Card symbolism and energy, 2) Love & relationships, 3) Career & life purpose, 4) Personal growth & shadow work, 5) A powerful affirmation. Be mystical, insightful, and deeply personal.`
    : `You are a wise tarot reader. A user drew the ${cardName} card (${position}) for their daily reading. Provide a personalized reading (under 150 words): overall energy, key message, and an affirmation. Be warm and mystical.`

  const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [{ role: 'user', content: prompt }]
  })

  return response.response || 'The cards speak of transformation and new beginnings.'
}

export async function generateYesNoReading(question: string, cardName: string, isReversed: boolean, deep = false): Promise<string> {
  const answer = isReversed ? 'No' : 'Yes'
  const ctx = await getCloudflareContext({ async: true })
  const ai = (ctx.env as any).AI

  if (!ai) {
    return `${answer}. The ${cardName} card suggests this path. Trust your inner wisdom.`
  }

  const prompt = deep
    ? `You are a master tarot reader. User asked: "${question}". They drew ${cardName} (${isReversed ? 'REVERSED' : 'UPRIGHT'}). The answer is: ${answer}. Provide a deep analysis (150-200 words) covering: 1) Why the cards say ${answer}, 2) Hidden factors or energies at play, 3) What to watch out for, 4) Empowering advice for moving forward.`
    : `User asked: "${question}". They drew ${cardName} (${isReversed ? 'REVERSED' : 'UPRIGHT'}). Answer is: ${answer}. Give a 2-sentence explanation and advice (under 60 words).`

  const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [{ role: 'user', content: prompt }]
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
    ? `Generate a comprehensive deep horoscope for ${sign} (${date}). Return JSON: {"love":{"text":"...","stars":1-5},"career":{"text":"...","stars":1-5},"money":{"text":"...","stars":1-5}}. Each text should be 80-120 words with detailed insights, planetary influences, and actionable advice.`
    : `Generate today's horoscope for ${sign} (${date}). Return JSON: {"love":{"text":"...","stars":1-5},"career":{"text":"...","stars":1-5},"money":{"text":"...","stars":1-5}}. Each text under 40 words.`

  const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [{ role: 'user', content: prompt }]
  })

  return response.response || '{}'
}
