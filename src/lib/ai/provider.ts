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

// Order = priority. Only providers that have a key are used.
const providers = () =>
  [
    process.env.GOOGLE_GENERATIVE_AI_API_KEY && {
      name: 'gemini',
      model: google('gemini-3.8-flash'),
    },
    process.env.GROQ_API_KEY && {
      name: 'groq',
      model: groq('openai/gpt-oss-20b'),
    },
  ].filter(Boolean) as { name: string; model: LanguageModel }[];

export async function createChatResponse({ messages, system, tools }: Args) {
  const modelMessages = await convertToModelMessages(messages);

  for (const { name, model } of providers()) {
    const result = streamText({
      model,
      system,
      messages: modelMessages,
      tools,
      stopWhen: stepCountIs(5),
    });

    // API errors (429, bad key) show up inside the stream, not as exceptions,
    // so peek at the first chunks before committing to this provider.
    const reader = result.toUIMessageStream().getReader();
    const buffered: unknown[] = [];
    let failed = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value.type === 'error') {
        failed = true;
        break;
      }
      buffered.push(value);
      // Commit only once real model output starts — until then an error
      // can still be recovered by trying the next provider.
      if (
        value.type === 'text-delta' ||
        value.type.startsWith('tool-') ||
        value.type === 'finish'
      ) {
        break;
      }
    }

    if (failed) {
      console.warn(`${name} failed or rate limited, trying next provider...`);
      continue;
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

  throw new Error('All AI providers failed or no API keys are set.');
}
