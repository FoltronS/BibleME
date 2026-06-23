'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useUser } from '@/context/user-context';
import { useChat } from '@/hooks/useChat';
import { useASR } from '@/hooks/useASR';
import { TtsButton } from '@/components/devotional/TtsButton';

export default function ChatPage() {
  const t = useTranslations('chat');
  const { nickname, struggle, locale, hydrated } = useUser();
  const { messages, isStreaming, sendMessage } = useChat(nickname, struggle);
  const { isListening, transcript, start: startASR, stop: stopASR, supported: asrSupported } = useASR(locale);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mirror live transcript into input as user speaks
  useEffect(() => {
    if (isListening) setInput(transcript);
  }, [transcript, isListening]);

  // When listening stops, keep whatever was transcribed in the input
  useEffect(() => {
    if (!isListening && transcript) setInput(transcript);
  }, [isListening]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSend() {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    sendMessage(text);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function toggleASR() {
    if (isListening) {
      stopASR();
    } else {
      setInput('');
      startASR();
    }
  }

  if (!hydrated) return null;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Bibly avatar header */}
      <div className="flex flex-col items-center py-5">
        <div className="w-16 h-16 rounded-full bg-soft-gold/20 border-2 border-soft-gold/30 flex items-center justify-center text-3xl mb-2">
          🕊️
        </div>
        <p className="font-[family-name:var(--font-playfair)] font-semibold text-charcoal text-lg">
          Bibly
        </p>
        <p className="text-warm-gray text-xs">{t('subtitle')}</p>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll space-y-3 pb-3">
        {/* Welcome bubble */}
        <div className="bg-ivory rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
          <p className="text-sm text-charcoal leading-relaxed">
            {t('welcome', { name: nickname })}
          </p>
        </div>

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`px-4 py-3 max-w-[85%] shadow-sm ${
                msg.role === 'user'
                  ? 'bg-rose/10 rounded-2xl rounded-br-sm'
                  : 'bg-ivory rounded-2xl rounded-bl-sm'
              }`}
            >
              <p className="text-sm text-charcoal leading-relaxed whitespace-pre-line">
                {msg.content}
                {msg.role === 'assistant' && isStreaming && i === messages.length - 1 && (
                  <span className="inline-block w-1.5 h-4 bg-warm-gray/40 ml-0.5 animate-pulse" />
                )}
              </p>
              {msg.role === 'assistant' && msg.content && !(isStreaming && i === messages.length - 1) && (
                <div className="mt-2 flex justify-end">
                  <TtsButton text={msg.content} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="flex gap-2 py-3 items-end">
        {asrSupported && (
          <button
            onClick={toggleASR}
            className={`rounded-full p-3 transition-colors shrink-0 ${
              isListening
                ? 'bg-rose text-white animate-pulse'
                : 'bg-ivory text-warm-gray hover:bg-sage/20 shadow-sm'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Voice input'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </button>
        )}
        <textarea
          value={input}
          onChange={(e) => !isListening && setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? '🎙️ ...' : t('placeholder')}
          disabled={isStreaming}
          rows={1}
          className={`flex-1 rounded-2xl px-4 py-3 text-sm text-charcoal focus:outline-none focus:ring-2 disabled:opacity-50 resize-none shadow-sm transition-colors ${
            isListening
              ? 'bg-rose/10 border border-rose/40 focus:ring-rose/30'
              : 'bg-ivory border border-soft-gold/30 placeholder:text-warm-gray/40 focus:ring-soft-gold/30'
          }`}
          style={{ minHeight: '48px', maxHeight: '120px' }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isStreaming}
          className="bg-soft-gold text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-rose-dark transition-colors disabled:opacity-40 shrink-0 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 12L21 4L13 21L11 13Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
