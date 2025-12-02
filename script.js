const nameInput = document.getElementById('name');
const typeSelect = document.getElementById('type');
const claimBtn = document.getElementById('claim');
const previewWrap = document.getElementById('previewWrap');
const badgeContainer = document.getElementById('badgeContainer');
const downloadBtn = document.getElementById('download');
const copyCaptionBtn = document.getElementById('copyCaption');
const msg = document.getElementById('msg');

function makeBadgeSVG(displayName, badgeType) {
  const date = new Date().toLocaleDateString();
  const bgColor = '#0b5fff';
  const accent = '#ffd166';

  return 
  <svg class="badge" xmlns="http://www.w3.org/2000/svg" width="720" height="360" viewBox="0 0 720 360">
    <rect width="720" height="360" rx="24" fill="#ffffff" />
    <rect x="24" y="24" width="672" height="312" rx="16" fill="${bgColor}" />
    <circle cx="120" cy="180" r="72" fill="${accent}" />
    <text x="220" y="145" font-size="34" fill="#fff" font-weight="700">${displayName}</text>
    <text x="220" y="190" font-size="24" fill="#e6f0ff">${badgeType}</text>
    <text x="220" y="230" font-size="16" fill="#cfe0ff">${date}</text>
  </svg>;
}

claimBtn.addEventListener('click', () => {
  const name = nameInput.value.trim() || 'Anonymous';
  const badgeType = typeSelect.value;

  const svg = makeBadgeSVG(name, badgeType);
  badgeContainer.innerHTML = svg;

  previewWrap.classList.remove('hidden');
  msg.textContent = 'Badge ready — download or copy caption to share.';

  downloadBtn.onclick = () => {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ${name}_${badgeType}.svg;
    a.click();
  };

  copyCaptionBtn.onclick = () => {
    const caption = 🏅 ${badgeType} badge earned!\n${name}\n#BadgeHub #Farcaster;
    navigator.clipboard.writeText(caption)
      .then(() => msg.textContent = "Caption copied!")
      .catch(() => msg.textContent = "Copy failed, please copy manually.");
  };
});
