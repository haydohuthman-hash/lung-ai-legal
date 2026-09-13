// Stable IDs keep old shared cards readable. Original words written for Patch.
export const SHARE_QUOTES = Object.freeze([
  { id: 'small-steps', text: 'Small steps still take you somewhere.' },
  { id: 'showing-up', text: 'I am becoming someone who shows up for me.' },
  { id: 'own-pace', text: 'My pace. My progress. My next little step.' },
  { id: 'begin-again', text: 'Starting again is part of moving forward.' },
  { id: 'little-braver', text: 'A little kinder. A little braver. A little more me.' },
  { id: 'future-me', text: 'Today, I did something my future self will thank me for.' },
]);

export const PROGRESS_SHARE_BASE_URL = 'https://haydohuthman-hash.github.io/lung-ai-legal/share/';
export const PATCH_APP_STORE_URL = 'https://apps.apple.com/app/id6810251830';

export function createProgressShare(days, quoteId = SHARE_QUOTES[0].id) {
  if (!Number.isSafeInteger(days) || days < 1 || days > 99999) throw new Error('Choose a valid journey day.');
  if (!SHARE_QUOTES.some(quote => quote.id === quoteId)) throw new Error('Choose a Patch quote.');
  return { days, quoteId };
}

export function buildProgressShareUrl(snapshot) {
  const valid = createProgressShare(snapshot.days, snapshot.quoteId);
  const url = new URL(PROGRESS_SHARE_BASE_URL);
  url.searchParams.set('d', String(valid.days));
  url.searchParams.set('q', valid.quoteId);
  return url.href;
}

/** Strict input handling: a shared card never reads HTML or identity from a URL. */
export function parseProgressShareUrl(input) {
  try {
    const url = new URL(input, PROGRESS_SHARE_BASE_URL);
    const day = url.searchParams.get('d');
    if (url.searchParams.getAll('d').length !== 1 || url.searchParams.getAll('q').length !== 1 || !/^[1-9]\d{0,4}$/.test(day ?? '')) return null;
    return createProgressShare(Number(day), url.searchParams.get('q'));
  } catch { return null; }
}

export function progressShareText(snapshot) {
  const valid = createProgressShare(snapshot.days, snapshot.quoteId);
  const quote = SHARE_QUOTES.find(item => item.id === valid.quoteId);
  return `Day ${valid.days} of my journey with Patch.\n“${quote.text}”`;
}
