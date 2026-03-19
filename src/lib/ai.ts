// AI client - supports OpenAI format (Gemini Flash / DeepSeek / OpenAI)
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.AI_API_KEY!,
  baseURL: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
})

export async function generateTarotReading(cardName: string, isReversed: boolean): Promise<string> {
  const position = isReversed ? 'REVERSED' : 'UPRIGHT'
  const res = await client.chat.completions.create({
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    messages: [{
      role: 'user',
      content: `You are a wise and mystical tarot reader with decades of experience.
A user has drawn the ${cardName} card (${position}) for their daily reading.

Please provide a personalized daily reading that includes:
1. Overall energy for the day (2-3 sentences)
2. Key message or warning (1-2 sentences)
3. An inspiring one-line affirmation

Tone: warm, mystical, insightful, and empowering.
Length: under 200 words. Language: English.
Do NOT mention that you are an AI.`
    }],
    max_tokens: 300,
  })
  return res.choices[0].message.content || ''
}

export async function generateYesNoReading(question: string, cardName: string, isReversed: boolean): Promise<string> {
  const answer = isReversed ? 'No' : 'Yes'
  const res = await client.chat.completions.create({
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    messages: [{
      role: 'user',
      content: `You are a tarot reader. The user asked: "${question}"
They drew the ${cardName} card in ${isReversed ? 'REVERSED' : 'UPRIGHT'} position.
The answer is: ${answer}

Respond with:
1. Start with a clear "${answer}"
2. Give a brief 2-sentence explanation based on the card's meaning
3. End with a gentle piece of advice

Keep it under 80 words. Tone: direct but compassionate.`
    }],
    max_tokens: 150,
  })
  return res.choices[0].message.content || ''
}

export async function generateHoroscope(sign: string, date: string): Promise<string> {
  const res = await client.chat.completions.create({
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    messages: [{
      role: 'user',
      content: `You are an expert astrologer. Generate today's horoscope for ${sign}.

Provide readings in this exact JSON format:
{
  "love": { "text": "...(50 words)", "stars": 4 },
  "career": { "text": "...(50 words)", "stars": 3 },
  "money": { "text": "...(50 words)", "stars": 5 }
}

Date context: ${date}
Tone: encouraging, specific, and mystical. Do NOT be generic.`
    }],
    max_tokens: 400,
  })
  return res.choices[0].message.content || ''
}
