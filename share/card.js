import { createProgressShare, SHARE_QUOTES } from './model.js';

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The Patch illustration could not load. Please try again.'));
    image.src = url;
  });
}

function linesFor(ctx, text, width) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > width) { lines.push(line); line = word; }
    else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Code-drawn artwork, exported at full social-feed resolution. */
export async function renderProgressCard(snapshot, options = {}) {
  const valid = createProgressShare(snapshot.days, snapshot.quoteId);
  const quote = SHARE_QUOTES.find(item => item.id === valid.quoteId);
  const mascotUrl = options.mascotUrl ?? './mascot.png';
  const displayFont = options.displayFont ?? 'Patch Fraunces';
  const bodyFont = options.bodyFont ?? 'Patch Inter';
  const [mascot] = await Promise.all([
    loadImage(mascotUrl),
    document.fonts?.load(`800 64px "${displayFont}"`),
    document.fonts?.load(`600 32px "${bodyFont}"`),
  ]);
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Image export is unavailable. You can still share your link.');
  const teal = '#174A49', cream = '#FFFCF3', orange = '#EC9456';
  ctx.fillStyle = teal;
  ctx.fillRect(0, 0, 1080, 1350);
  ctx.fillStyle = cream;
  ctx.beginPath(); ctx.roundRect(38, 38, 1004, 1170, 48); ctx.fill();
  ctx.strokeStyle = '#CACCB9'; ctx.lineWidth = 2; ctx.setLineDash([9, 10]);
  ctx.beginPath(); ctx.roundRect(60, 60, 960, 1126, 32); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = teal;
  ctx.font = `900 74px "${displayFont}", Georgia, serif`;
  ctx.fillText('patch', 540, 131);
  // A little stitched orange square is part of the established wordmark.
  ctx.fillStyle = orange; ctx.save(); ctx.translate(501, 137); ctx.rotate(-.12);
  ctx.fillRect(-7, -7, 14, 14); ctx.restore();
  ctx.fillStyle = '#526C61'; ctx.font = `600 25px "${bodyFont}", sans-serif`;
  ctx.fillText('ONE LITTLE STEP AT A TIME', 540, 214);
  ctx.fillStyle = teal;
  ctx.font = `800 56px "${displayFont}", Georgia, serif`; ctx.fillText('day', 540, 301);
  ctx.font = `800 ${valid.days >= 10000 ? 178 : valid.days >= 1000 ? 216 : 258}px "${displayFont}", Georgia, serif`;
  ctx.fillText(String(valid.days), 540, 463);
  ctx.font = `500 28px "${bodyFont}", sans-serif`; ctx.fillStyle = '#526C61';
  ctx.fillText('of my journey', 540, 615);
  ctx.save(); ctx.globalCompositeOperation = 'multiply';
  // The exported local asset is already the happy sprite, cropped from the atlas.
  ctx.drawImage(mascot, 374, 651, 332, 332); ctx.restore();
  ctx.fillStyle = teal; ctx.font = `650 49px "${displayFont}", Georgia, serif`;
  const lines = linesFor(ctx, `“${quote.text}”`, 810);
  lines.forEach((line, i) => ctx.fillText(line, 540, 1050 + (i - (lines.length - 1) / 2) * 61));
  ctx.fillStyle = '#FFFCF3'; ctx.font = `600 29px "${bodyFont}", sans-serif`;
  ctx.fillText('Make a little room for yourself.', 540, 1255);
  ctx.font = `500 21px "${bodyFont}", sans-serif`; ctx.fillStyle = '#C1D2C5';
  ctx.fillText('Find Patch on the App Store', 540, 1301);
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('The image could not be saved. Please try again.')), 'image/png'));
}
