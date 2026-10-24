'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef, useEffect, type ReactNode } from 'react';
import { X, Send, Bot, MessageCircle } from 'lucide-react';

// Site palette (from the screenshot): orange #FF6B00, deep navy-teal headings, soft blue-grey page bg
const ORANGE = 'var(--secondary-500, #FF6B00)';
const NAVY = '#0B3A52';

const SUGGESTIONS = ['What programs do you run?', 'How can I volunteer?', 'Upcoming events'];

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1.5 py-1.5 px-0.5" role="status" aria-label="Assistant is typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{ backgroundColor: ORANGE, animation: `cf-dot 1.2s ease-in-out ${i * 0.16}s infinite` }}
          className="w-2 h-2 rounded-full"
        />
      ))}
    </span>
  );
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [rateNotice, setRateNotice] = useState('');
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      fetch: async (input, init) => {
        const res = await fetch(input, init);
        if (res.status === 429) {
          const data = (await res.clone().json().catch(() => null)) as {
            error?: string;
          } | null;
          setRateNotice(data?.error ?? 'Too many messages. Please wait a moment and try again.');
          // Suppress the generic useChat error so only the rate notice shows.
          return res;
        }
        return res;
      },
    }),
  });
  const isLoading = status === 'submitted' || status === 'streaming';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const send = (text: string) => {
    if (!text.trim() || isLoading) return;
    setRateNotice('');
    sendMessage({ text });
    setInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  // Assistant replies can contain simple "- " bullet lists (used for tool
  // results like courses/events/projects). Strip stray asterisks and turn
  // consecutive bullet lines into a real <ul> so they render as a list.
  const renderAssistantText = (text: string): ReactNode[] => {
    const clean = text.replace(/\*{1,3}/g, '');
    const nodes: ReactNode[] = [];
    let bullets: string[] = [];

    const flushBullets = () => {
      if (!bullets.length) return;
      const items = bullets;
      bullets = [];
      nodes.push(
        <ul key={`ul-${nodes.length}`} className="list-disc pl-5 my-1 space-y-0.5">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    };

    clean.split('\n').forEach((line, i) => {
      const match = line.match(/^\s*(?:[-•*]|\d+[.)])\s+(.*)$/);
      if (match) {
        bullets.push(match[1]);
      } else {
        flushBullets();
        const trimmed = line.trim();
        if (trimmed) nodes.push(<p key={`p-${i}`}>{trimmed}</p>);
      }
    });
    flushBullets();

    return nodes;
  };

  return (
    <div className={`fixed right-5 z-[110] font-sans ${!isOpen ? 'bottom-24' : 'bottom-5'}`}>
      <style>{`@keyframes cf-dot{0%,60%,100%{transform:translateY(0) scale(.7);opacity:.35}30%{transform:translateY(-5px) scale(1);opacity:1}}`}</style>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{ backgroundColor: ORANGE }}
          className="flex items-center gap-2 text-white pl-4 pr-5 py-3 rounded-full shadow-lg ring-4 ring-white/80 hover:brightness-95 transition cursor-pointer"
          aria-label="Open Chatbot"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-semibold text-sm">Ask Combine AI</span>
        </button>
      )}

      {isOpen && (
        <div
          className="w-[calc(100vw-2.5rem)] sm:w-[380px] h-[540px] max-h-[calc(100dvh-10rem)] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden bg-white"
        >
          {/* Header: white like the site nav, orange accent line like the top bar */}
          <div className="relative px-4 py-3.5 bg-white flex justify-between items-center border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div style={{ backgroundColor: ORANGE }} className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 style={{ color: NAVY }} className="font-bold text-sm leading-tight">Combine Assistant</h3>
                <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ color: NAVY }}
              className="p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              aria-label="Close Chatbot"
            >
              <X className="w-5 h-5" />
            </button>
            <span style={{ backgroundColor: ORANGE }} className="absolute bottom-0 left-0 right-0 h-[3px]" />
          </div>

          {/* Messages: soft blue-grey like the page bg */}
          <div className="flex-1 p-4 overflow-y-auto overflow-x-hidden space-y-3 text-sm bg-white">
            {messages.length === 0 && (
              <div className="text-center mt-6 px-2">
                <div
                  style={{ color: ORANGE }}
                  className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3"
                >
                  <Bot className="w-6 h-6" />
                </div>
                <h4 style={{ color: NAVY }} className="font-bold text-base">
                  Welcome to Combine Foundation
                </h4>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                  Ask about our mission, courses, events, or programs.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      style={{ color: ORANGE, borderColor: ORANGE }}
                      className="text-xs font-medium px-3 py-1.5 rounded-full border bg-white hover:bg-orange-50 transition cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => {
              const plainText = m.parts.reduce(
                (acc, part) => (part.type === 'text' ? acc + part.text : acc),
                ''
              );
              const isStreamingReply =
                m.role === 'assistant' && m.id === messages[messages.length - 1]?.id && isLoading;
              const showPlaceholder = isStreamingReply && !plainText.trim();
              if (m.role === 'assistant' && !plainText.trim() && !showPlaceholder) return null;
              const isUser = m.role === 'user';

              return (
                <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    style={isUser ? { backgroundColor: ORANGE } : undefined}
                    className={`max-w-[84%] min-w-0 px-3.5 py-2.5 text-[13px] whitespace-pre-wrap break-words [overflow-wrap:anywhere] leading-relaxed ${
                      isUser
                        ? 'text-white rounded-2xl rounded-br-md'
                        : 'bg-slate-100 text-slate-800 rounded-2xl rounded-bl-md border border-slate-200'
                    }`}
                  >
                    {m.parts.map((part, i) =>
                      part.type === 'text' && part.text.trim() ? (
                        isUser ? (
                          <span key={i}>{part.text}</span>
                        ) : (
                          <div key={i} className="space-y-1.5">
                            {renderAssistantText(part.text)}
                          </div>
                        )
                      ) : null
                    )}
                    {showPlaceholder && <TypingDots />}
                  </div>
                </div>
              );
            })}

            {rateNotice && (
              <div className="flex justify-start">
                <div className="max-w-[84%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[13px] bg-amber-50 text-amber-800 border border-amber-200">
                  {rateNotice}
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-start">
                <div className="max-w-[84%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[13px] bg-red-50 text-red-700 border border-red-200">
                  Couldn&apos;t get a response. Please try again in a moment.
                </div>
              </div>
            )}

            {status === 'submitted' && (
              <div className="flex justify-start">
                <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-bl-md px-3.5 py-2">
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-white border-t border-slate-200 flex gap-2 items-center"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 bg-slate-100 text-slate-900 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-slate-400 border border-transparent"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{ backgroundColor: ORANGE }}
              className="text-white w-10 h-10 flex items-center justify-center rounded-full hover:brightness-95 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}