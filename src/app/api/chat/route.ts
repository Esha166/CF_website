import { createChatResponse } from '@/lib/ai/provider';
import { SYSTEM_PROMPT } from '@/lib/ai/system-prompt';
import { chatbotTools } from '@/lib/ai/tools';
import { matchTrivialIntent, buildTrivialReply } from '@/lib/ai/router';
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from 'ai';

export const maxDuration = 30;

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => (part as { text: string }).text)
    .join(' ');
}

// Streams a plain canned answer in the UI message protocol, so the client
// renders it exactly like a normal assistant reply — but with zero LLM calls.
function plainTextResponse(text: string): Response {
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const id = 'router';
      writer.write({ type: 'start' });
      writer.write({ type: 'start-step' });
      writer.write({ type: 'text-start', id });
      writer.write({ type: 'text-delta', id, delta: text });
      writer.write({ type: 'text-end', id });
      writer.write({ type: 'finish-step' });
      writer.write({ type: 'finish' });
    },
  });
  return createUIMessageStreamResponse({ stream });
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Fast path: greetings, thanks, contact and mission are answered instantly
    // without spending an AI call.
    const lastUser = [...messages].reverse().find((m: UIMessage) => m.role === 'user');
    if (lastUser) {
      const intent = matchTrivialIntent(getMessageText(lastUser));
      if (intent) {
        return plainTextResponse(await buildTrivialReply(intent));
      }
    }

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
