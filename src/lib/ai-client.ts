interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AiCompletionOptions {
  messages: AiMessage[];
  temperature?: number;
  maxTokens?: number;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/__/g, '')
    .replace(/_/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/`{1,3}/g, '')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/\u2014/g, ',')   // em dash — → comma
    .replace(/\u2013/g, '-');  // en dash – → hyphen
}

export async function aiComplete(options: AiCompletionOptions): Promise<string> {
  const { messages, temperature = 0.7, maxTokens = 1024 } = options;

  const baseUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
  const apiKey = process.env.AI_API_KEY || '';
  const model = process.env.AI_MODEL || 'gpt-4o-mini';

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';
  return stripMarkdown(content);
}

export async function aiStream(options: AiCompletionOptions): Promise<ReadableStream> {
  const { messages, temperature = 0.7, maxTokens = 1024 } = options;

  const baseUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
  const apiKey = process.env.AI_API_KEY || '';
  const model = process.env.AI_MODEL || 'gpt-4o-mini';

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI API error (${res.status}): ${err}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  return new ReadableStream({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') {
            controller.close();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const chunk = parsed.choices?.[0]?.delta?.content || '';
            if (chunk) {
              controller.enqueue(new TextEncoder().encode(stripMarkdown(chunk)));
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    },
  });
}
