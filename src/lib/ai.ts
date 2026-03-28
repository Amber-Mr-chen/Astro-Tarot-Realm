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
    ? `You are a master astrologer giving a deep personal reading. Generate a horoscope for ${sign} on ${date}. Output ONLY a JSON object with no extra text before or after.

Required JSON structure (replace all placeholder text with real content):
{"energy":{"text":"Write 3 sentences about the overall cosmic energy for ${sign} today and how the planets are influencing their day.","stars":4},"love":{"text":"Write 3-4 sentences about ${sign}'s love life and emotional connections today. Be specific and personal.","stars":4},"career":{"text":"Write 3-4 sentences about ${sign}'s work, ambitions, and professional opportunities today. Give concrete guidance.","stars":3},"money":{"text":"Write 3-4 sentences about ${sign}'s finances and material situation today. Include practical advice.","stars":3},"advice":{"text":"Write 3 sentences of specific, actionable guidance for ${sign} to make the most of today's energy.","stars":5},"lucky":{"color":"Pick one lucky color specifically meaningful for ${sign}","number":3,"time":"morning or afternoon or evening"}}`
    : `You are an astrologer. Write today's horoscope for ${sign} on ${date}. Output ONLY valid JSON, no extra text. Format: {"love":{"text":"2 sentence reading","stars":4},"career":{"text":"2 sentence reading","stars":3},"money":{"text":"2 sentence reading","stars":4}}`

  const model = '@cf/meta/llama-3.1-8b-instruct'
  const response = await ai.run(model, {
    messages: [{ role: 'user', content: prompt }],
    max_tokens: deep ? 1000 : 400
  })

  return String(response.response || '{}')
}
