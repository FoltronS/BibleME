import { NextRequest } from 'next/server';
import { aiStream } from '@/lib/ai-client';
import { biblyChatPrompt } from '@/lib/prompts';

export async function POST(req: NextRequest) {
  try {
    const { messages, nickname, struggle } = (await req.json()) as {
      messages: { role: 'user' | 'assistant'; content: string }[];
      nickname: string;
      struggle: string;
    };

    const systemPrompt = biblyChatPrompt(nickname, struggle);

    const stream = await aiStream({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      maxTokens: 800,
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response('Failed to generate response', { status: 500 });
  }
}
