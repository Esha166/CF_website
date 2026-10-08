import { createChatResponse } from '@/lib/ai/provider';
import { SYSTEM_PROMPT } from '@/lib/ai/system-prompt';
import { chatbotTools } from '@/lib/ai/tools';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    return await createChatResponse({
      messages: messages.slice(-8), // keeps tokens under Groq's 12K/min cap
      system: SYSTEM_PROMPT,
      tools: chatbotTools,
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Chatbot is busy, please try again shortly.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
