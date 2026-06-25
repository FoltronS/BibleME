'use client';

import { useState, useCallback } from 'react';
import { ChatMessage } from '@/lib/types';
import { msg } from '@/lib/msg';

export function useChat(nickname: string, struggle: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMsg: ChatMessage = { role: 'user', content };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setIsStreaming(true);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedMessages,
            nickname,
            struggle,
          }),
        });

        if (!res.ok || !res.body) throw new Error('Chat failed');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = '';

        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
            return updated;
          });
        }

        msg(`${nickname}: ${content}\n\nBibly: ${assistantContent}`, 'Chat');
      } catch (err) {
        console.error('Chat error:', err);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Maaf, terjadi kesalahan. Coba lagi nanti.' },
        ]);
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, nickname, struggle]
  );

  return { messages, isStreaming, sendMessage };
}
