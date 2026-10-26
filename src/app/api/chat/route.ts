import { createChatResponse } from '@/lib/ai/provider';
import { SYSTEM_PROMPT } from '@/lib/ai/system-prompt';
import { chatbotTools } from '@/lib/ai/tools';
import { matchTrivialIntent, buildTrivialReply } from '@/lib/ai/router';
import { checkRateLimit } from '@/lib/server/rate-limit';
import {
  getClientIp,
  hashRateLimitKey,
  jsonError,
  readJsonBody,
} from '@/lib/server/security';
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from 'ai';

export const maxDuration = 30;
export const runtime = 'nodejs';

const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 5 * 60 * 1000;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_BODY_BYTES = 100_000;

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
    const ip = getClientIp(req);
    const rate = await checkRateLimit(
      `chat:${hashRateLimitKey(ip)}`,
      RATE_LIMIT,
      RATE_WINDOW_MS
    );
    if (!rate.allowed) {
      const minutes = Math.ceil(rate.retryAfterSeconds / 60);
      return jsonError(
        `Too many messages. Please wait ${minutes} minute${minutes === 1 ? '' : 's'} and try again.`,
        429,
        rate.retryAfterSeconds
      );
    }

    const parsed = await readJsonBody(req, MAX_BODY_BYTES);
    if (!parsed.ok) {
      return jsonError(
        parsed.status === 413 ? 'Request is too large.' : 'Invalid request.',
        parsed.status
      );
    }

    const { messages } = parsed.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return jsonError('Invalid request.', 400);
    }

    // Fast path: greetings, thanks, contact and mission are answered instantly
    // without spending an AI call.
    const lastUser = [...messages].reverse().find((m: UIMessage) => m.role === 'user');
    if (lastUser) {
      const text = getMessageText(lastUser);
      if (text.length > MAX_MESSAGE_LENGTH) {
        return jsonError('Message is too long. Please keep it under 2000 characters.', 400);
      }
      const intent = matchTrivialIntent(text);
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
