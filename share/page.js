import { buildProgressShareUrl, parseProgressShareUrl, progressShareText, SHARE_QUOTES } from './model.js';
import { renderProgressCard } from './card.js';

const snapshot = parseProgressShareUrl(location.href);
const status = document.querySelector('#status');
const shareButton = document.querySelector('#share-button');
const saveButton = document.querySelector('#save-button');
let file;
const cancelled = error => error?.name === 'AbortError' || /^share cancel(?:led|ed)$/i.test(error?.message ?? '');

if (snapshot) {
  const quote = SHARE_QUOTES.find(item => item.id === snapshot.quoteId);
  document.title = `Day ${snapshot.days} · A little progress with Patch`;
  document.querySelector('#day-number').textContent = String(snapshot.days);
  document.querySelector('#day-number').dataset.digits = String(snapshot.days).length;
  document.querySelector('#quote').textContent = `“${quote.text}”`;
  document.querySelector('#progress-card').hidden = false;
  document.querySelector('#card-actions').hidden = false;
  document.querySelector('#snapshot-note').hidden = false;
  document.querySelector('#share-link').value = buildProgressShareUrl(snapshot);
  renderProgressCard(snapshot).then(blob => {
    file = new File([blob], `Patch-day-${snapshot.days}.png`, { type: 'image/png' });
    saveButton.disabled = false;
    saveButton.textContent = 'Save image ↓';
  }).catch(() => { saveButton.textContent = 'Image unavailable'; status.textContent = 'You can still share this card with its link.'; });
} else document.querySelector('#unavailable').hidden = false;

shareButton.addEventListener('click', async () => {
  if (!snapshot) return;
  status.textContent = '';
  const data = { title: `Day ${snapshot.days} · Patch`, text: progressShareText(snapshot), url: buildProgressShareUrl(snapshot) };
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

saveButton.addEventListener('click', async () => {
  if (!file || !snapshot) return;
  status.textContent = '';
  let canShare = false;
  try { canShare = Boolean(navigator.share && navigator.canShare?.({ files: [file] })); } catch { /* Use download. */ }
  try {
    if (canShare) { await navigator.share({ title: `Day ${snapshot.days} · Patch`, files: [file] }); return; }
    const url = URL.createObjectURL(file), anchor = document.createElement('a');
    anchor.href = url; anchor.download = file.name; document.body.append(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    status.textContent = 'Image downloaded. Ready for your story or feed.';
  } catch (error) { if (!cancelled(error)) status.textContent = 'The image could not be shared. Try again, or share the link.'; }
});
