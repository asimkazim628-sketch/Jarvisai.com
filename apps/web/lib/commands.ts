export type JarvisCommand =
  | { type: 'open'; label: string; url: string }
  | { type: 'time'; text: string }
  | { type: 'date'; text: string }
  | { type: 'search'; query: string; url: string }
  | { type: 'weather'; query: string; url: string }
  | { type: 'email'; subject: string; url: string }
  | { type: 'translate'; text: string }
  | { type: 'note'; content: string }
  | { type: 'reminder'; content: string };

const shortcuts: Record<string, { label: string; url: string }> = {
  google: { label: 'Google', url: 'https://www.google.com' },
  youtube: { label: 'YouTube', url: 'https://www.youtube.com' },
  facebook: { label: 'Facebook', url: 'https://www.facebook.com' },
  gmail: { label: 'Gmail', url: 'https://mail.google.com' },
  calculator: { label: 'Calculator', url: 'https://www.google.com/search?q=calculator' }
};

export function parseJarvisCommand(raw: string): JarvisCommand | null {
  const input = raw.trim();
  const normalized = input.toLowerCase();
  for (const [key, value] of Object.entries(shortcuts)) {
    if (normalized.includes(key) && /(open|kholo|karo|چلا|کھولو)/i.test(normalized)) return { type: 'open', ...value };
  }
  if (/\btime\b|وقت|samay/i.test(normalized)) return { type: 'time', text: new Date().toLocaleTimeString() };
  if (/\bdate\b|tareekh|تاریخ/i.test(normalized)) return { type: 'date', text: new Date().toLocaleDateString() };
  if (/weather|mosam|mausam|موسم/i.test(normalized)) {
    const query = input.replace(/weather|mosam|mausam|batao|بتاؤ/gi, '').trim() || 'current location';
    return { type: 'weather', query, url: `https://www.google.com/search?q=${encodeURIComponent(`weather ${query}`)}` };
  }
  if (/search|google par|internet|تلاش/i.test(normalized)) {
    const query = input.replace(/search|google par|internet|karo|کر و|تلاش/gi, '').trim();
    if (query) return { type: 'search', query, url: `https://www.google.com/search?q=${encodeURIComponent(query)}` };
  }
  if (/email|mail draft|ای میل/i.test(normalized)) return { type: 'email', subject: input, url: `mailto:?subject=${encodeURIComponent('Draft from JARVIS')}&body=${encodeURIComponent(input)}` };
  if (/translate|tarjuma|ترجمہ/i.test(normalized)) return { type: 'translate', text: input };
  if (/note|save karo|نوٹ/i.test(normalized)) return { type: 'note', content: input.replace(/note|save karo|نوٹ/gi, '').trim() || input };
  if (/reminder|yaad|یاد/i.test(normalized)) return { type: 'reminder', content: input };
  return null;
}
