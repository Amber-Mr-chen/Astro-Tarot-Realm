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

  const prompt = deep
    ? `You are a master astrologer. Generate a deep horoscope for ${sign} on ${date}. Respond with ONLY valid JSON, no other text. Use this exact format:
{"energy":{"text":"40-50 word reading about overall planetary energy and what it means for ${sign} today","stars":4},"love":{"text":"50-60 word reading about love relationships and emotional life","stars":4},"career":{"text":"50-60 word reading about work ambition and opportunities","stars":3},"money":{"text":"50-60 word reading about finances and material matters","stars":3},"advice":{"text":"40-50 word personalized action advice for today","stars":5},"lucky":{"color":"one lucky color","number":7,"time":"best time of day"}}`
    : `You are an astrologer. Generate today's horoscope for ${sign} on ${date}. Respond with ONLY a JSON object, no other text, no markdown. Use this exact format: {"love":{"text":"20-30 word reading here","stars":4},"career":{"text":"20-30 word reading here","stars":3},"money":{"text":"20-30 word reading here","stars":4}}`

  const model = deep ? '@cf/meta/llama-3.3-70b-instruct-fp8-fast' : '@cf/meta/llama-3.1-8b-instruct'
  const response = await ai.run(model, {
    messages: [{ role: 'user', content: prompt }],
    max_tokens: deep ? 800 : 400
  })

  return String(response.response || '{}')
}
