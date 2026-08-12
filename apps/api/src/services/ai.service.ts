import OpenAI from 'openai';
import { env } from '../config/env.js';

const client = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY, baseURL: env.OPENAI_BASE_URL }) : null;

export async function askJarvis(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>) {
  const system = 'You are JARVIS: a secure multilingual AI assistant. Reply in the user language when obvious, support Hindi, Urdu, and English, and give actionable professional answers.';
  if (!client) {
    return 'JARVIS AI provider is not configured. Add OPENAI_API_KEY in .env to enable live intelligent responses.';
  }
  const response = await client.chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [{ role: 'system', content: system }, ...messages],
    temperature: 0.4
  });
  return response.choices[0]?.message?.content ?? 'I could not generate a response.';
}

export async function generateWebsiteBrief(prompt: string) {
  return askJarvis([{ role: 'user', content: `Create a production-ready website plan and file map for: ${prompt}` }]);
}
