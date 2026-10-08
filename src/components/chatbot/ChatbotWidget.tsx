'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Loader2, Sparkles } from 'lucide-react';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });
  const isLoading = status === 'submitted' || status === 'streaming';

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  // Helper to ensure markdown asterisks and list dashes are completely stripped
  const formatMessageText = (text: string, isUser: boolean) => {
    if (isUser) return text;
    return text
      .replace(/\*{1,3}/g, '') // strip all *, **, ***
      .replace(/^\s*[-•]\s+/gm, '') // strip leading dashes or bullet symbols
      .replace(/([^\n])\n\s*[-•]\s+/g, '$1\n');
  };

  return (
    <div
      className={`fixed right-5 z-[110] font-sans ${!isOpen ? 'bottom-24' : 'bottom-5'}`}
    >
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 bg-gradient-to-r from-[var(--secondary-500)] to-[var(--secondary-600)] hover:brightness-105 text-white px-5 py-3.5 rounded-full shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
          aria-label="Open Chatbot"
        >
          <Sparkles className="w-5 h-5 animate-pulse text-amber-200" />
          <span className="font-semibold text-sm">Ask Combine AI</span>
        </button>
      )}

      {isOpen && (
        <div className="w-[calc(100vw-2.5rem)] sm:w-[380px] h-[520px] max-h-[calc(100dvh-10rem)] bg-[var(--background)] text-[var(--foreground)] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[var(--secondary-500)] to-[var(--secondary-600)] text-white flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-tight">Combine Assistant</h3>
                <p className="text-[11px] text-orange-100 opacity-90">Official AI Helper</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              aria-label="Close Chatbot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-sm bg-white">
            {messages.length === 0 && (
              <div className="text-center my-8 px-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950/60 text-[var(--secondary-500)] rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Bot className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-[var(--foreground)] text-sm">
                  Welcome to Combine Foundation!
                </h4>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 leading-relaxed">
                  Ask me about our mission, ongoing courses, upcoming events, or programs.
                </p>
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

              // Skip finished assistant bubbles with no visible text
              // (tool-only turns, or a stream that died before any text arrived).
              if (m.role === 'assistant' && !plainText.trim() && !showPlaceholder) return null;

              const usedTool = m.parts.some((p) => p.type.startsWith('tool-'));

              return (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-[var(--secondary-500)] text-white rounded-br-none shadow-sm font-medium'
                        : 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-200 dark:border-gray-700 shadow-sm'
                    }`}
                  >
                    {m.parts.map((part, i) =>
                      part.type === 'text' && part.text.trim() ? (
                        <span key={i}>{formatMessageText(part.text, m.role === 'user')}</span>
                      ) : null
                    )}
                    {showPlaceholder && (
                      <span className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs italic">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--secondary-500)]" />
                        {usedTool ? 'Looking up Combine Foundation details...' : 'Thinking...'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {error && (
              <div className="flex justify-start">
                <div className="max-w-[82%] rounded-2xl rounded-bl-none px-3.5 py-2.5 text-xs sm:text-sm bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 shadow-sm">
                  Sorry, I could not get a response right now. Please try again in a moment.
                </div>
              </div>
            )}

            {status === 'submitted' && (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs italic pl-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--secondary-500)]" />
                Checking Combine Foundation details...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input / Footer Area */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-blue-600 border-t border-blue-500/60 flex gap-2 items-center"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about courses, events, or programs..."
              className="flex-1 bg-blue-700/70 text-white rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all placeholder:text-blue-200"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-white hover:bg-blue-50 text-blue-600 p-2.5 rounded-xl disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed shadow-sm"
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
