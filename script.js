// BadgeHub - script.js (clean working version)

// safe query helper
const $ = id => document.getElementById(id);

// DOM elements
const nameInput = $('name');
const typeSelect = $('type');
const claimBtn = $('claim');
const previewWrap = $('previewWrap');
const badgeContainer = $('badgeContainer');
const downloadBtn = $('download');
const copyCaptionBtn = $('copyCaption');
const msg = $('msg');

// small helper to escape < & > for SVG text nodes
function escapeXml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// make SVG string using template literal (backticks)
function makeBadgeSVG(displayName = 'Anonymous', badgeType = 'Daily Check-in') {
  const date = new Date().toLocaleDateString();
  const bgColor = '#0b5fff';
  const accent = '#ffd166';

  return 
<svg class="badge" xmlns="http://www.w3.org/2000/svg" width="720" height="360" viewBox="0 0 720 360">
  <title>Badge for ${escapeXml(displayName)}</title>
  <rect width="720" height="360" rx="24" fill="#ffffff" />
  <rect x="24" y="24" width="672" height="312" rx="16" fill="${bgColor}" />
  <circle cx="120" cy="180" r="72" fill="${accent}" />
  <text x="220" y="145" font-size="34" fill="#fff" font-weight="700" font-family="Inter, system-ui, Arial, Helvetica, sans-serif">${escapeXml(displayName)}</text>
  <text x="220" y="190" font-size="24" fill="#fff">${escapeXml(badgeType)}</text>
  <text x="220" y="230" font-size="16" fill="#cfe0ff">${escapeXml(date)}</text>
</svg>
.trim();
}

// Claim button logic
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
    if (!svg) {
      if (msg) msg.textContent = 'No badge to download. Claim first.';
      return;
    }

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'badge.svg';
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  });
}

// Copy caption
if (copyCaptionBtn) {
  copyCaptionBtn.addEventListener('click', () => {
    const badgeType = typeSelect ? typeSelect.value : 'Daily Check-in';
    const name = nameInput ? (nameInput.value.trim() || 'Anonymous') : 'Anonymous';

    const caption = 🏅 ${name} — ${badgeType} badge earned!\n#BadgeHub;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(caption)
        .then(() => { if (msg) msg.textContent = 'Caption copied!'; })
        .catch(() => { if (msg) msg.textContent = 'Copy failed — please copy manually.'; });
    } else {
      // fallback: prompt
      window.prompt('Copy this caption (Ctrl+C then Enter):', caption);
    }
  });
}

console.log('script.js fully loaded');
