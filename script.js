// script.js - BadgeHub (final working)

// helper: safe document query
const $ = id => document.getElementById(id);

// DOM elements (may be null until DOM loaded, but we use defer)
const nameInput = $('name');
const typeSelect = $('type');
const claimBtn = $('claim');
const previewWrap = $('previewWrap');
const badgeContainer = $('badgeContainer');
const downloadBtn = $('download');
const copyCaptionBtn = $('copyCaption');
const msg = $('msg');

// helper: escape text for XML/SVG
function escapeXml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// make SVG as template literal (note the backticks)
function makeBadgeSVG(displayName, badgeType) {
  const date = new Date().toLocaleDateString();
  const bgColor = '#0b5fff';
  const accent = '#ffd166';

  return 
<svg class="badge" xmlns="http://www.w3.org/2000/svg" width="720" height="360" viewBox="0 0 720 360">
  <title>Badge for ${escapeXml(displayName)}</title>
  <rect width="720" height="360" rx="24" fill="#ffffff" />
  <rect x="24" y="24" width="672" height="312" rx="16" fill="${bgColor}" />
  <circle cx="120" cy="180" r="72" fill="${accent}" />
  <text x="220" y="145" font-size="34" fill="#ffffff" font-weight="700" font-family="Inter, system-ui, Arial, Helvetica, sans-serif">${escapeXml(displayName)}</text>
  <text x="220" y="190" font-size="24" fill="#ffffff">${escapeXml(badgeType)}</text>
  <text x="220" y="230" font-size="16" fill="#cfe0ff">${escapeXml(date)}</text>
</svg>
.trim();
}

// claim button logic
if (claimBtn) {
  claimBtn.addEventListener('click', () => {
    const name = (nameInput && nameInput.value && nameInput.value.trim()) || 'Anonymous';
    const badgeType = (typeSelect && typeSelect.value) || 'Daily Check-in';

    const svg = makeBadgeSVG(name, badgeType);
    if (badgeContainer) badgeContainer.innerHTML = svg;

    if (previewWrap && previewWrap.classList.contains('hidden')) {
      previewWrap.classList.remove('hidden');
    }

    if (msg) msg.textContent = 'Badge ready — download or copy caption.';
  });
}

// download SVG
if (downloadBtn) {
  downloadBtn.addEventListener('click', () => {
    const svg = badgeContainer ? badgeContainer.innerHTML : '';
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'badge.svg';
    a.click();
    URL.revokeObjectURL(url);
  });
}

// copy caption
if (copyCaptionBtn) {
  copyCaptionBtn.addEventListener('click', () => {
    const badgeType = (typeSelect && typeSelect.value) || 'Daily Check-in';
    const name = (nameInput && nameInput.value.trim()) || 'Anonymous';
    const caption = 🏅 ${name} – ${badgeType} badge earned!\n#BadgeHub;

    navigator.clipboard.writeText(caption)
      .then(() => {
        if (msg) msg.textContent = 'Caption copied!';
      })
      .catch(() => {
        if (msg) msg.textContent = 'Copy failed — please copy manually.';
      });
  });
}

console.log('script.js fully loaded');
