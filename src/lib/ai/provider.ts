import { google } from '@ai-sdk/google';
import { groq } from '@ai-sdk/groq';
import {
  streamText,
  stepCountIs,
  convertToModelMessages,
  createUIMessageStreamResponse,
  type UIMessage,
  type LanguageModel,
  type ToolSet,
} from 'ai';

type Args = { messages: UIMessage[]; system: string; tools: ToolSet };

// Cap agentic steps so a single turn can't loop through tools indefinitely.
// 4 allows a list -> details -> answer chain with one step of headroom.
const MAX_STEPS = 4;
// Retry a provider once on transient (non rate-limit) errors before failing over.
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 400;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRateLimit = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return /rate.?limit|quota|429|resource.?exhausted|too many requests/i.test(message);
};

type ProviderConfig = { name: string; model: LanguageModel; tools: ToolSet };

// Order = priority. Only providers that have a key are used.
// The foundation profile lives in the system prompt, so the remaining tools are
// all Firestore-backed. Both providers get the same tool set so Groq can answer
// course/event/project questions just like the primary provider when it is the
// one serving the turn.
const providers = (tools: ToolSet): ProviderConfig[] =>
  [
    process.env.GOOGLE_GENERATIVE_AI_API_KEY && {
      name: 'gemini',
      model: google('gemini-2.5-flash'),
      tools,
    },
    process.env.GROQ_API_KEY && {
      name: 'groq',
      model: groq('openai/gpt-oss-20b'),
      tools,
    },
  ].filter(Boolean) as ProviderConfig[];

export async function createChatResponse({ messages, system, tools }: Args) {
  const modelMessages = await convertToModelMessages(messages);

  for (const { name, model, tools: providerTools } of providers(tools)) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      let streamError: unknown;

      const result = streamText({
        model,
        system,
        messages: modelMessages,
        tools: providerTools,
        stopWhen: stepCountIs(MAX_STEPS),
        onError: ({ error }) => {
          streamError = error;
        },
      });

      // API errors (429, bad key) show up inside the stream, not as exceptions,
      // so peek at the first chunks before committing to this provider.
      const reader = result.toUIMessageStream().getReader();
      const buffered: unknown[] = [];
      let failed = false;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value.type === 'error') {
            failed = true;
            break;
          }
          buffered.push(value);
          // Commit only once real model output starts — until then an error
          // can still be recovered by trying another attempt/provider.
          if (
            value.type === 'text-delta' ||
            value.type.startsWith('tool-') ||
            value.type === 'finish'
          ) {
            break;
          }
        }
      } catch (error) {
        streamError = error;
        failed = true;
      }

      if (failed) {
        const rateLimited = isRateLimit(streamError);
        // An immediate retry won't clear a rate limit — fail over right away.
        if (!rateLimited && attempt < MAX_RETRIES) {
          console.warn(`${name} transient error, retrying (attempt ${attempt + 2})...`);
          await sleep(RETRY_DELAY_MS * (attempt + 1));
          continue;
        }
        console.warn(
          `${name} failed${rateLimited ? ' (rate limited)' : ''}, trying next provider...`
        );
        break;
      }

      // Replay the peeked chunks, then continue with the rest of the stream
      const stream = new ReadableStream({
        start(controller) {
          buffered.forEach((chunk) => controller.enqueue(chunk));
        },
        async pull(controller) {
          const { done, value } = await reader.read();
          if (done) controller.close();
          else controller.enqueue(value);
        },
      });

      return createUIMessageStreamResponse({ stream });
    }
  }

  throw new Error('All AI providers failed or no API keys are set.');
}
