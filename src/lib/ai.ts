import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function generateTarotReading(cardName: string, isReversed: boolean, deep = false): Promise<string> {
  const position = isReversed ? 'REVERSED' : 'UPRIGHT'
  const ctx = await getCloudflareContext({ async: true })
  const ai = (ctx.env as any).AI

  if (!ai) {
    return `The ${cardName} card (${position}) brings powerful energy today. Trust your intuition and embrace the journey ahead.`
  }

  const prompt = deep
    ? `You are a master tarot reader. A user drew the ${cardName} card (${position}). Write a deep reading in exactly 4 short paragraphs (total under 200 words): 1) Card energy & symbolism, 2) Love & relationships, 3) Career & purpose, 4) A closing affirmation. No asterisks or markdown. Be mystical and personal.`
    : `You are a wise tarot reader. A user drew the ${cardName} card (${position}). Write a reading in 2-3 sentences (under 80 words): key energy, message, and affirmation. No asterisks or special formatting. Be warm and mystical.`

  const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 512
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
    ? `You are a master tarot reader. User asked: "${question}". They drew ${cardName} (${isReversed ? 'REVERSED' : 'UPRIGHT'}). Answer: ${answer}. Write 3 short paragraphs (under 150 words total): 1) Why the answer is ${answer}, 2) Hidden energies at play, 3) Empowering advice. No asterisks or markdown.`
    : `User asked: "${question}". They drew ${cardName} (${isReversed ? 'REVERSED' : 'UPRIGHT'}). Answer: ${answer}. Write 2 sentences of explanation and advice (under 60 words). No special symbols.`

  const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 400
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

  const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 600
  })

  return response.response || '{}'
}
