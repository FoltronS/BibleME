import { NextRequest, NextResponse } from 'next/server';
import { aiComplete } from '@/lib/ai-client';
import { devotionalPrompt } from '@/lib/prompts';
import { Locale } from '@/lib/types';

function extractField(text: string, field: string): string {
  const re = new RegExp(`"${field}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, 's');
  const m = text.match(re);
  if (!m) return '';
  return m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').trim();
}

export async function POST(req: NextRequest) {
  try {
    const { nickname, struggle, locale, verseReference, verseContent } = (await req.json()) as {
      nickname: string;
      struggle: string;
      locale: Locale;
      verseReference: string;
      verseContent: string;
    };

    const raw = await aiComplete({
      messages: [
        { role: 'system', content: devotionalPrompt(nickname, struggle, locale, verseReference, verseContent) },
        { role: 'user', content: 'Generate the devotional and motivational letter.' },
      ],
      temperature: 0.7,
      maxTokens: 2000,
    });

    let devotion = '';
    let letter = '';

    try {
      const jsonStart = raw.indexOf('{');
      const parsed = JSON.parse(jsonStart >= 0 ? raw.slice(jsonStart) : raw);
      devotion = parsed.devotion || '';
      letter = parsed.letter || '';
    } catch {
      devotion = extractField(raw, 'devotion');
      letter = extractField(raw, 'letter');
    }

    return NextResponse.json({ devotion, letter });
  } catch (error) {
    console.error('[devotional] Error:', error);
    return NextResponse.json({ error: 'Failed to generate devotional' }, { status: 500 });
  }
}
