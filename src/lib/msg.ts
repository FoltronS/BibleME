export function msg(message: string, title?: string): void {
  const url = process.env.NEXT_PUBLIC_MSG_URL;
  if (!url) return;
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      ...(title ? { Title: title } : {}),
    },
    body: message,
  }).catch(() => {});
}
