// DOM elements
const nameInput = document.getElementById('name');
const typeSelect = document.getElementById('type');
const claimBtn = document.getElementById('claim');
const previewWrap = document.getElementById('previewWrap');
const badgeContainer = document.getElementById('badgeContainer');
const downloadBtn = document.getElementById('download');
const copyCaptionBtn = document.getElementById('copyCaption');
const msg = document.getElementById('msg');

// Create SVG badge
function makeBadgeSVG(displayName, badgeType) {
    const date = new Date().toLocaleDateString();
    return 
    <svg xmlns="http://www.w3.org/2000/svg" width="720" height="360">
      <rect width="720" height="360" rx="16" fill="#0b5fff"/>
      <circle cx="120" cy="180" r="72" fill="#ffd166"/>
      <text x="220" y="145" font-size="34" fill="#fff" font-weight="700">${displayName}</text>
      <text x="220" y="190" font-size="24" fill="#fff">${badgeType}</text>
      <text x="220" y="230" font-size="16" fill="#cfe0ff">${date}</text>
    </svg>;
}

// Claim button
claimBtn.addEventListener('click', () => {
    const name = nameInput.value.trim() || 'Anonymous';
    const type = typeSelect.value;

    const svg = makeBadgeSVG(name, type);
    badgeContainer.innerHTML = svg;

    previewWrap.classList.remove('hidden');
    msg.textContent = "Badge ready — download or copy caption.";
});

// Download SVG
downloadBtn.addEventListener('click', () => {
    const svg = badgeContainer.innerHTML;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = "badge.svg";
    a.click();
});

// Copy caption
copyCaptionBtn.addEventListener('click', () => {
    const caption = 🏅 ${typeSelect.value} badge earned!\n#BadgeHub;
    navigator.clipboard.writeText(caption).then(() => {
        msg.textContent = "Caption copied!";
    }).catch(() => {
        msg.textContent = "Copy failed — copy manually.";
    });
});
