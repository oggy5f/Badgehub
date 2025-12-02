// BadgeHub — script.js (FINAL WORKING VERSION)

// Helper
const $ = (id) => document.getElementById(id);

// DOM
const nameInput = $('name');
const typeSelect = $('type');
const claimBtn = $('claim');
const previewWrap = $('previewWrap');
const badgeContainer = $('badgeContainer');
const downloadBtn = $('download');
const copyCaptionBtn = $('copyCaption');
const msg = $('msg');

// Escape text (avoid breaking SVG)
function escapeXml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// SVG maker
function makeBadgeSVG(displayName, badgeType) {
  const date = new Date().toLocaleDateString();
  const bgColor = "#0b5fff";
  const accent = "#ffd166";

  return 
<svg class="badge" xmlns="http://www.w3.org/2000/svg" width="720" height="360" viewBox="0 0 720 360">
<title>Badge for ${escapeXml(displayName)}</title>

<rect width="720" height="360" rx="24" fill="#ffffff"/>
<rect x="24" y="24" width="672" height="312" rx="16" fill="${bgColor}" />
<circle cx="120" cy="180" r="72" fill="${accent}" />

<text x="220" y="145" font-size="34" fill="#fff" font-weight="700" font-family="Inter, Arial">${escapeXml(displayName)}</text>
<text x="220" y="190" font-size="24" fill="#fff">${escapeXml(badgeType)}</text>
<text x="220" y="230" font-size="16" fill="#cfe0ff">${escapeXml(date)}</text>

</svg>
.trim();
}

// -------------------- Claim badge --------------------
if (claimBtn) {
  claimBtn.addEventListener("click", () => {
    const name = nameInput.value.trim() || "Anonymous";
    const badgeType = typeSelect.value || "Daily Check-in";

    const svg = makeBadgeSVG(name, badgeType);

    badgeContainer.innerHTML = svg;
    previewWrap.classList.remove("hidden");

    msg.textContent = "Badge ready — download or copy caption.";
  });
}

// -------------------- Download SVG --------------------
if (downloadBtn) {
  downloadBtn.addEventListener("click", () => {
    const svg = badgeContainer.innerHTML;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "badge.svg";
    a.click();

    URL.revokeObjectURL(url);
  });
}

// -------------------- Copy Caption --------------------
if (copyCaptionBtn) {
  copyCaptionBtn.addEventListener("click", () => {
    const badgeType = typeSelect.value;
    const name = nameInput.value.trim() || "Anonymous";

    const caption = 🏅 ${name} — ${badgeType} badge earned!\n#BadgeHub;

    navigator.clipboard.writeText(caption)
      .then(() => msg.textContent = "Caption copied!")
      .catch(() => msg.textContent = "Copy failed — please copy manually.");
  });
}

console.log("script.js fully loaded");
