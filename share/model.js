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

const MAX_START_MILLISECONDS = 253402300799999; // Last millisecond of year 9999.

function startMilliseconds(value) {
  if (typeof value === 'number') return Number.isFinite(value) && Math.abs(value) <= 8_640_000_000_000_000 ? value : NaN;
  if (typeof value !== 'string') return NaN;
  const parts = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/);
  if (!parts) return NaN;
  const [, year, month, day, hours, minutes, seconds] = parts.map(Number);
  if (month < 1 || month > 12 || day < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate() || hours > 23 || minutes > 59 || seconds > 59) return NaN;
  return Date.parse(value);
}

/** Derive every tick from wall-clock elapsed time, including after sleep or a timezone change. */
export function getJourneyTimer(startedAt, now = Date.now()) {
  const start = startMilliseconds(startedAt);
  const current = Number.isFinite(now) && Math.abs(now) <= 8_640_000_000_000_000 ? now : Date.now();
  const totalSeconds = Number.isFinite(start) ? Math.max(0, Math.floor((current - start) / 1000)) : 0;
  return {
    dayNumber: Math.floor(totalSeconds / 86400) + 1,
    hours: Math.floor(totalSeconds / 3600) % 24,
    minutes: Math.floor(totalSeconds / 60) % 60,
    seconds: totalSeconds % 60,
    totalSeconds,
  };
}

export function formatJourneyClock(timer) {
  return [timer.hours, timer.minutes, timer.seconds].map(value => String(value).padStart(2, '0')).join(':');
}

/** Public timer URLs need only a start timestamp and a fixed quote ID. */
export function createProgressTimerShare(startedAt, quoteId = SHARE_QUOTES[0].id) {
  const milliseconds = startMilliseconds(startedAt);
  if (!Number.isSafeInteger(milliseconds) || milliseconds < 0 || milliseconds > MAX_START_MILLISECONDS) throw new Error('Choose a valid journey start.');
  if (!SHARE_QUOTES.some(quote => quote.id === quoteId)) throw new Error('Choose a Patch quote.');
  return { startedAt: new Date(milliseconds).toISOString(), quoteId };
}

export function createProgressShare(days, quoteId = SHARE_QUOTES[0].id) {
  if (!Number.isSafeInteger(days) || days < 1 || days > 99999) throw new Error('Choose a valid journey day.');
  if (!SHARE_QUOTES.some(quote => quote.id === quoteId)) throw new Error('Choose a Patch quote.');
  return { days, quoteId };
}

export function buildProgressShareUrl(snapshot) {
  const valid = validateProgressShare(snapshot);
  const url = new URL(PROGRESS_SHARE_BASE_URL);
  if ('startedAt' in valid) url.searchParams.set('s', String(Date.parse(valid.startedAt)));
  else url.searchParams.set('d', String(valid.days));
  url.searchParams.set('q', valid.quoteId);
  return url.href;
}

/** Strict input handling: a shared card never reads HTML or identity from a URL. */
export function parseProgressShareUrl(input) {
  try {
    const url = new URL(input, PROGRESS_SHARE_BASE_URL);
    if (url.searchParams.getAll('q').length !== 1) return null;
    if (url.searchParams.has('s')) {
      const start = url.searchParams.get('s');
      if (url.searchParams.has('d') || url.searchParams.getAll('s').length !== 1 || !/^(?:0|[1-9]\d{0,14})$/.test(start ?? '')) return null;
      const milliseconds = Number(start);
      if (milliseconds > MAX_START_MILLISECONDS) return null;
      return createProgressTimerShare(new Date(milliseconds).toISOString(), url.searchParams.get('q'));
    }
    const day = url.searchParams.get('d');
    if (url.searchParams.getAll('d').length !== 1 || url.searchParams.getAll('q').length !== 1 || !/^[1-9]\d{0,4}$/.test(day ?? '')) return null;
    return createProgressShare(Number(day), url.searchParams.get('q'));
  } catch { return null; }
}

export function validateProgressShare(snapshot) {
  return 'startedAt' in snapshot ? createProgressTimerShare(snapshot.startedAt, snapshot.quoteId) : createProgressShare(snapshot.days, snapshot.quoteId);
}

export function progressShareDay(snapshot, now = Date.now()) {
  const valid = validateProgressShare(snapshot);
  return 'startedAt' in valid ? getJourneyTimer(valid.startedAt, now).dayNumber : valid.days;
}

export function progressShareText(snapshot, now = Date.now()) {
  const valid = validateProgressShare(snapshot);
  const quote = SHARE_QUOTES.find(item => item.id === valid.quoteId);
  if ('startedAt' in valid) {
    const timer = getJourneyTimer(valid.startedAt, now);
    if (Date.parse(valid.startedAt) > now) return `My journey with Patch starts ${new Date(valid.startedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}.\n“${quote.text}”`;
    return `Day ${timer.dayNumber} · ${formatJourneyClock(timer)} of my journey with Patch.\n“${quote.text}”`;
  }
  return `Day ${valid.days} of my journey with Patch.\n“${quote.text}”`;
}
