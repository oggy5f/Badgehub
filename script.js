// BadgeHub — main client script (no-template version)

// --------- Helper ----------
function $(id) {
  return document.getElementById(id);
}

// --------- DOM refs ----------
const nameInput       = $('nameInput') || $('name');
const typeSelect      = $('typeSelect') || $('type');
const shapeSelect     = $('shapeSelect');
const sizeSlider      = $('sizeSlider');
const randomColorChk  = $('randomColor');
const autoCopyChk     = $('autoCopy');
const autoDownloadChk = $('autoDownload');
const themeSelect     = $('themeSelect');
const streakValue     = $('streakValue');

const claimBtn        = $('claimBtn') || $('claim');
const downloadBtn     = $('downloadBtn') || $('download');
const copyCaptionBtn  = $('copyCaption') || $('copyCaptionBtn');
const shareBtn        = $('shareBtn');
const mintBtn         = $('mintBtn');

const svgWrap         = $('svgwrap') || $('previewWrap') || $('badgeContainer');
const captionPreview  = $('captionPreview') || $('captionBox');

// --------- Small utils ----------
function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function clamp(num, min, max) {
  return Math.min(max, Math.max(min, num));
}

// Random pastel color
function randomPastel() {
  const h = Math.floor(Math.random() * 360);
  const s = 70;
  const l = 75;
  return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}

// --------- Theme handling ----------
const THEME_KEY = 'badgehub_theme_v1';

function applyTheme(theme) {
  const body = document.body;
  body.classList.remove('theme-dark', 'theme-yellow', 'theme-sky', 'theme-choco', 'theme-light');

  if (theme === 'yellow') body.classList.add('theme-yellow');
  else if (theme === 'sky') body.classList.add('theme-sky');
  else if (theme === 'choco') body.classList.add('theme-choco');
  else if (theme === 'light') body.classList.add('theme-light');
  else body.classList.add('theme-dark'); // default

  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.warn('theme save failed', e);
  }
}

function initTheme() {
  let saved = null;
  try {
    saved = localStorage.getItem(THEME_KEY);
  } catch (e) {}
  if (!saved) saved = 'dark';
  if (themeSelect) themeSelect.value = saved;
  applyTheme(saved);
}

// --------- Streak handling ----------
const STREAK_KEY = 'badgehub_streak_v1';
const LAST_DATE_KEY = 'badgehub_lastDate_v1';

function formatYMD(d) {
  const y = d.getFullYear();
  const m = ('0' + (d.getMonth() + 1)).slice(0 - 2);
  const day = ('0' + d.getDate()).slice(0 - 2);
  return y + '-' + m + '-' + day;
}

function loadStreak() {
  let streak = 0;
  try {
    const s = localStorage.getItem(STREAK_KEY);
    if (s) streak = parseInt(s, 10) || 0;
  } catch (e) {}
  if (streakValue) streakValue.textContent = streak;
}

function updateStreakOnClaim() {
  const today = new Date();
  const todayKey = formatYMD(today);
  let streak = 0;
  let lastDate = null;

  try {
    const s = localStorage.getItem(STREAK_KEY);
    if (s) streak = parseInt(s, 10) || 0;
    lastDate = localStorage.getItem(LAST_DATE_KEY);
  } catch (e) {}

  if (!lastDate) {
    streak = 1;
  } else if (lastDate === todayKey) {
    // same day — streak stays same
  } else {
    // find diff in days
    const [y, m, d] = lastDate.split('-');
    const prev = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    const diffMs = today - prev;
    const diffDays = Math.round(diffMs / 86400000);

    if (diffDays === 1) {
      streak += 1; // consecutive
    } else {
      streak = 1; // reset
    }
  }

  try {
    localStorage.setItem(STREAK_KEY, String(streak));
    localStorage.setItem(LAST_DATE_KEY, todayKey);
  } catch (e) {}

  if (streakValue) streakValue.textContent = streak;
}

// --------- SVG maker ----------
function makeBadgeSVG(displayName, badgeType) {
  const dateStr = new Date().toLocaleDateString();

  // base colors (default)
  let bgColor = '#0b5fff';
  let accent = '#ffb347';

  // random color toggle
  if (randomColorChk && randomColorChk.checked) {
    bgColor = randomPastel();
  }

  // size percent from slider
  let scale = 1;
  if (sizeSlider) {
    const val = parseInt(sizeSlider.value, 10) || 100;
    scale = clamp(val, 30, 130) / 100.0;
  }

  const safeName = escapeXml(displayName || '');
  const safeType = escapeXml(badgeType || '');
  const safeDate = escapeXml(dateStr);

  // Build SVG string (no backticks)
  let svg = '';
  svg += '<svg class="badge-svg" xmlns="http://www.w3.org/2000/svg"';
  svg += ' width="720" height="360" viewBox="0 0 720 360">';
  svg += '<defs>';
  svg += '<filter id="cardShadow" x="-5%" y="-10%" width="110%" height="130%">';
  svg += '<feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="rgba(0,0,0,0.45)"/>';
  svg += '</filter>';
  svg += '</defs>';

  svg += '<g transform="translate(360,180) scale(' + scale + ') translate(-360,-180)">';
  svg += '<rect x="40" y="40" width="640" height="280" rx="32" fill="#050816" filter="url(#cardShadow)"/>';
  svg += '<rect x="48" y="48" width="624" height="264" rx="28" fill="' + bgColor + '"/>';

  svg += '<circle cx="170" cy="150" r="72" fill="' + accent + '"/>';

  svg += '<text x="170" y="245" text-anchor="middle"';
  svg += ' font-size="22" fill="rgba(255,255,255,0.82)" font-family="system-ui, -apple-system, BlinkMacSystemFont,';
  svg += ' Segoe UI, sans-serif">';
  svg += safeType + '</text>';

  svg += '<text x="520" y="150" text-anchor="middle"';
  svg += ' font-size="44" fill="#ffffff" font-weight="700"';
  svg += ' font-family="system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif">';
  svg += safeName + '</text>';

  svg += '<text x="520" y="190" text-anchor="middle"';
  svg += ' font-size="18" fill="rgba(255,255,255,0.7)"';
  svg += ' font-family="system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif">';
  svg += 'Daily Check-in • BadgeHub';
  svg += '</text>';

  svg += '<text x="520" y="230" text-anchor="middle"';
  svg += ' font-size="16" fill="rgba(255,255,255,0.7)"';
  svg += ' font-family="system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif">';
  svg += safeDate + '</text>';

  svg += '</g></svg>';

  return svg;
}

// --------- Caption builder ----------
function buildCaption(name, type) {
  const display = name && name.trim() ? name.trim() : 'anon';
  const btype = type || 'Daily Check-in';
  return '🥇 ' + display + ' — ' + btype + ' badge earned on Base.\n#BadgeHub';
}

// --------- Main claim flow ----------
function handleClaim() {
  if (!svgWrap) return;

  const name = nameInput && nameInput.value ? nameInput.value.trim() : '';
  const type = typeSelect && typeSelect.value ? typeSelect.value : 'Daily Check-in';

  const svg = makeBadgeSVG(name, type);

  svgWrap.innerHTML = svg;

  // simple pop animation class
  const svgEl = svgWrap.querySelector('svg');
  if (svgEl) {
    svgEl.classList.remove('pop');
    void svgEl.offsetWidth;
    svgEl.classList.add('pop');
  }

  // caption
  const caption = buildCaption(name || '@you', type);
  if (captionPreview) captionPreview.textContent = caption;

  updateStreakOnClaim();

  // auto copy
  if (autoCopyChk && autoCopyChk.checked) {
    copyCaptionToClipboard(caption);
  }

  // auto download
  if (autoDownloadChk && autoDownloadChk.checked) {
    downloadSVG(svg);
  }
}

// --------- Download / copy / share helpers ----------
function downloadSVG(svg) {
  try {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'badge.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('download failed', e);
  }
}

function copyCaptionToClipboard(caption) {
  if (!navigator.clipboard) return;
  navigator.clipboard.writeText(caption).catch(function (e) {
    console.warn('clipboard failed', e);
  });
}

function handleDownloadClick() {
  if (!svgWrap) return;
  const svgEl = svgWrap.querySelector('svg');
  if (!svgEl) return;
  const svg = svgWrap.innerHTML;
  downloadSVG(svg);
}

function handleCopyCaptionClick() {
  const name = nameInput && nameInput.value ? nameInput.value.trim() : '';
  const type = typeSelect && typeSelect.value ? typeSelect.value : 'Daily Check-in';
  const caption = buildCaption(name || '@you', type);
  copyCaptionToClipboard(caption);
}

function handleShareClick() {
  // Farcaster share (Warpcast)
  const name = nameInput && nameInput.value ? nameInput.value.trim() : '';
  const type = typeSelect && typeSelect.value ? typeSelect.value : 'Daily Check-in';
  const caption = buildCaption(name || '@you', type);
  const text = encodeURIComponent(caption);
  const url = encodeURIComponent(window.location.href);
  const full = 'https://warpcast.com/~/compose?text=' + text + '&embeds[]=' + url;
  window.open(full, '_blank');
}

function handleMintClick() {
  alert('Mint on Base: placeholder. Baad me API connect karenge 🙂');
}

// --------- Init listeners ----------
function initListeners() {
  if (claimBtn)       claimBtn.addEventListener('click', handleClaim);
  if (downloadBtn)    downloadBtn.addEventListener('click', handleDownloadClick);
  if (copyCaptionBtn) copyCaptionBtn.addEventListener('click', handleCopyCaptionClick);
  if (shareBtn)       shareBtn.addEventListener('click', handleShareClick);
  if (mintBtn)        mintBtn.addEventListener('click', handleMintClick);

  if (themeSelect) {
    themeSelect.addEventListener('change', function () {
      applyTheme(themeSelect.value);
    });
  }
}

// --------- Boot ----------
document.addEventListener('DOMContentLoaded', function () {
  initTheme();
  loadStreak();
  initListeners();
  console.log('script.js loaded OK');
});
