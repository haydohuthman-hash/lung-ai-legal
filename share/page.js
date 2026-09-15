import { buildProgressShareUrl, parseProgressShareUrl, progressShareText, progressShareDay, getJourneyTimer, formatJourneyClock, SHARE_QUOTES } from './model.js';
import { renderProgressCard } from './card.js';

const snapshot = parseProgressShareUrl(location.href);
const status = document.querySelector('#status');
const shareButton = document.querySelector('#share-button');
const saveButton = document.querySelector('#save-button');
const refreshButton = document.querySelector('#refresh-image');
const imageNote = document.querySelector('#image-note');
let file;
const cancelled = error => error?.name === 'AbortError' || /^share cancel(?:led|ed)$/i.test(error?.message ?? '');
const scheduledAt = now => snapshot && 'startedAt' in snapshot && Date.parse(snapshot.startedAt) > now;
const shareTitle = now => scheduledAt(now) ? 'My journey starts soon · Patch' : `Day ${progressShareDay(snapshot, now)} · Patch`;

if (snapshot) {
  const quote = SHARE_QUOTES.find(item => item.id === snapshot.quoteId);
  const liveTimer = 'startedAt' in snapshot;
  const updateTimer = () => {
    const now = Date.now();
    const day = progressShareDay(snapshot, now);
    document.title = `Day ${day} · A little progress with Patch`;
    document.querySelector('#day-number').textContent = String(day);
    document.querySelector('#day-number').dataset.digits = String(day).length;
    if (liveTimer) {
      const timer = getJourneyTimer(snapshot.startedAt, now);
      const scheduled = Date.parse(snapshot.startedAt) > now;
      document.querySelector('.day-label').textContent = scheduled ? 'my journey starts' : 'day';
      document.querySelector('.day-caption').textContent = scheduled ? 'A fresh beginning.' : 'of my journey';
      document.querySelector('#day-number').hidden = scheduled;
      document.querySelector('.clock-labels').hidden = scheduled;
      if (scheduled) {
        document.title = 'My journey starts soon · Patch';
        document.querySelector('#journey-clock').textContent = new Date(snapshot.startedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
        document.querySelector('#journey-clock').setAttribute('aria-label', `Scheduled journey start ${new Date(snapshot.startedAt).toLocaleString()}`);
        return;
      }
      document.querySelector('#journey-clock').textContent = formatJourneyClock(timer);
      document.querySelector('#journey-clock').setAttribute('aria-label', `${timer.hours} hours, ${timer.minutes} minutes, ${timer.seconds} seconds`);
    }
  };
  updateTimer();
  if (liveTimer) {
    document.querySelector('#timer-display').hidden = false;
    document.querySelector('#snapshot-note').textContent = 'A live timer from the start of their journey. Day 1 begins at 00:00:00.';
    let interval;
    const resume = () => {
      clearInterval(interval);
      updateTimer();
      if (!document.hidden) interval = setInterval(updateTimer, 1000);
    };
    document.addEventListener('visibilitychange', resume);
    window.addEventListener('pageshow', resume);
    window.addEventListener('focus', updateTimer);
    window.addEventListener('pagehide', () => clearInterval(interval));
    resume();
  }
  document.querySelector('#quote').textContent = `“${quote.text}”`;
  document.querySelector('#progress-card').hidden = false;
  document.querySelector('#card-actions').hidden = false;
  document.querySelector('#snapshot-note').hidden = false;
  document.querySelector('#share-link').value = buildProgressShareUrl(snapshot);
  saveButton.disabled = false;
} else document.querySelector('#unavailable').hidden = false;

shareButton.addEventListener('click', async () => {
  if (!snapshot) return;
  status.textContent = '';
  const now = Date.now();
  const data = { title: shareTitle(now), text: progressShareText(snapshot, now), url: buildProgressShareUrl(snapshot) };
  try {
    if (navigator.share) { await navigator.share(data); return; }
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(data.url);
    status.textContent = 'Link copied. Send a little progress someone’s way.';
  } catch (error) {
    if (cancelled(error)) return;
    document.querySelector('#manual-copy').hidden = false;
    document.querySelector('#share-link').focus();
    document.querySelector('#share-link').select();
    status.textContent = 'Select and copy your link below.';
  }
});

async function prepareImage() {
  if (!snapshot || saveButton.disabled) return;
  const capturedAt = Date.now();
  saveButton.disabled = true;
  refreshButton.disabled = true;
  saveButton.textContent = 'Preparing image…';
  status.textContent = '';
  try {
    const blob = await renderProgressCard(snapshot, { now: capturedAt });
    file = new File([blob], scheduledAt(capturedAt) ? 'Patch-my-journey-starts.png' : `Patch-day-${progressShareDay(snapshot, capturedAt)}.png`, { type: 'image/png', lastModified: capturedAt });
    const clock = 'startedAt' in snapshot ? ` · ${formatJourneyClock(getJourneyTimer(snapshot.startedAt, capturedAt))}` : '';
    imageNote.textContent = scheduledAt(capturedAt) ? 'Your chosen start time. Tap Save snapshot to share or download this image.' : `Image snapshot: Day ${progressShareDay(snapshot, capturedAt)}${clock}. Tap Save snapshot to share or download this still image.`;
    imageNote.hidden = false;
    refreshButton.hidden = false;
    saveButton.textContent = 'Save snapshot ↓';
  } catch {
    file = undefined;
    saveButton.textContent = 'Create image ↓';
    status.textContent = 'The image could not be prepared. Try again, or share the live link.';
  } finally {
    saveButton.disabled = false;
    refreshButton.disabled = false;
  }
}

refreshButton.addEventListener('click', prepareImage);
saveButton.addEventListener('click', async () => {
  if (!snapshot) return;
  if (!file) { await prepareImage(); return; }
  status.textContent = '';
  let canShare = false;
  try { canShare = Boolean(navigator.share && navigator.canShare?.({ files: [file] })); } catch { /* Use download. */ }
  try {
    if (canShare) { await navigator.share({ title: shareTitle(file.lastModified), text: progressShareText(snapshot, file.lastModified), files: [file] }); return; }
    const url = URL.createObjectURL(file), anchor = document.createElement('a');
    anchor.href = url; anchor.download = file.name; document.body.append(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    status.textContent = 'Image downloaded. Ready for your story or feed.';
  } catch (error) { if (!cancelled(error)) status.textContent = 'The image could not be shared. Try again, or share the link.'; }
});
