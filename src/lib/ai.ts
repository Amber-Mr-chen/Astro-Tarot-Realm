import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function generateTarotReading(cardName: string, isReversed: boolean, deep = false): Promise<string> {
  const position = isReversed ? 'REVERSED' : 'UPRIGHT'
  const ctx = await getCloudflareContext({ async: true })
  const ai = (ctx.env as any).AI

  if (!ai) {
    return `The ${cardName} card (${position}) brings powerful energy today. Trust your intuition and embrace the journey ahead.`
  }

  const prompt = deep
    ? `You are an ancient oracle speaking directly to a seeker. They drew the ${cardName} card (${position}). Speak in second person ("you"), poetic and personal. Write exactly 7 sections separated by "|||" in this exact order, each section is plain text only, no labels, no asterisks, no markdown:
1. Card energy (2-3 sentences about what this card reveals right now)
2. Past (1-2 sentences on what pattern brought them here)
3. Present (1-2 sentences on today's energy)
4. Future (1-2 sentences on what is opening up)
5. Love (2-3 sentences on heart and relationships)
6. Career (2-3 sentences on work and purpose)
7. Growth (2 sentences on inner evolution)
8. Action (one specific concrete thing to do today)
9. Reflection (one powerful question to sit with, no quotes)
Separate each section with ||| only. No other separators.`
    : `You are a mystic speaking directly to a seeker. They drew the ${cardName} card (${position}). Speak in second person ("you"), warm and direct. Write 2-3 sentences (under 80 words): the card's core message for today, and one empowering truth. No asterisks or special formatting.`

  const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [{ role: 'user', content: prompt }],
    max_tokens: deep ? 800 : 300
  })

  return response.response || (deep ? '|||'.repeat(8) : 'The cards speak of transformation and new beginnings.')
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
