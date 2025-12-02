// script.js - BadgeHub functionality

// DOM elements
const nameInput = document.getElementById('name');
const typeSelect = document.getElementById('type');
const claimBtn = document.getElementById('claim');
const previewWrap = document.getElementById('previewWrap');
const badgeContainer = document.getElementById('badgeContainer');
const downloadBtn = document.getElementById('download');
const copyCaptionBtn = document.getElementById('copyCaption');
const msg = document.getElementById('msg');

// SVG maker function
function makeBadgeSVG(displayName, badgeType) {
  const date = new Date().toLocaleDateString();
  const bgColor = '#0b5fff';
  const accent = '#ffd166';

  // return as a JS template string (backticks) so file stays valid JS
  return 
<svg class="badge" xmlns="http://www.w3.org/2000/svg" width="720" height="360" viewBox="0 0 720 360" role="img" aria-label="Badge for ${displayName}">
  <title>Badge for ${displayName}</title>
  <rect width="720" height="360" rx="24" fill="#ffffff" />
  <rect x="24" y="24" width="672" height="312" rx="16" fill="${bgColor}" />
  <circle cx="120" cy="180" r="72" fill="${accent}" />
  <text x="220" y="145" font-size="34" fill="#fff" font-weight="700" font-family="Inter, Arial, sans-serif">${displayName}</text>
  <text x="220" y="190" font-size="24" fill="#fff">${badgeType}</text>
  <text x="220" y="230" font-size="16" fill="#cfe0ff">${date}</text>
</svg>
.trim();
}

// Claim button event
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

// Download SVG button
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

// Copy Caption
if (copyCaptionBtn) {
  copyCaptionBtn.addEventListener('click', () => {
    const badgeType = (typeSelect && typeSelect.value) || 'Daily Check-in';
    const caption = 🏅 ${badgeType} badge earned!\n#BadgeHub;

    navigator.clipboard.writeText(caption).then(() => {
      if (msg) msg.textContent = 'Caption copied!';
    }).catch(() => {
      if (msg) msg.textContent = 'Copy failed — please copy manually.';
    });
  });
}
