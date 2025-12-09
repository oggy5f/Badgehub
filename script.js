// script.js – BadgeHub (no template literals)

// Small helper
function $(id) {
  return document.getElementById(id);
}

// DOM refs
var nameInput = $("nameInput");
var typeSelect = $("typeSelect");
var shapeSelect = $("shapeSelect");
var randomColorsChk = $("randomColors");
var autoCopyChk = $("autoCopy");
var autoDownloadChk = $("autoDownload");

var themeSelect = $("themeSelect");
var claimBtn = $("claimBtn");
var downloadBtn = $("downloadBtn");
var copyCaptionBtn = $("copyCaption");
var shareBtn = $("shareBtn");

var svgwrap = $("svgwrap");
var captionPreview = $("captionPreview");
var streakDisplay = $("streakDisplay");
var msg = $("msg");

// ---------- Theme handling ----------

function applyTheme(theme) {
  var body = document.body;
  body.classList.remove("theme-dark", "theme-yellow", "theme-sky", "theme-choco");

  if (theme === "yellow") {
    body.classList.add("theme-yellow");
  } else if (theme === "sky") {
    body.classList.add("theme-sky");
  } else if (theme === "choco") {
    body.classList.add("theme-choco");
  } else {
    body.classList.add("theme-dark");
    theme = "dark";
  }

  try {
    localStorage.setItem("bh_theme", theme);
  } catch (e) {}
}

(function initTheme() {
  var saved = null;
  try {
    saved = localStorage.getItem("bh_theme");
  } catch (e) {}
  if (!saved) {
    saved = "dark";
  }
  themeSelect.value = saved;
  applyTheme(saved);
})();

themeSelect.addEventListener("change", function () {
  applyTheme(themeSelect.value);
});

// ---------- Streak logic ----------

function updateStreak() {
  var todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  var last = null;
  var streak = 0;

  try {
    last = localStorage.getItem("bh_lastDate");
    streak = parseInt(localStorage.getItem("bh_streak") || "0", 10);
  } catch (e) {
    last = null;
    streak = 0;
  }

  if (!last) {
    streak = 1;
  } else {
    var lastDate = new Date(last);
    var today = new Date(todayStr);
    var diffMs = today - lastDate;
    var diffDays = Math.round(diffMs / 86400000);

    if (diffDays === 1) {
      streak = streak + 1;
    } else if (diffDays === 0) {
      // same day, keep streak
    } else {
      streak = 1;
    }
  }

  try {
    localStorage.setItem("bh_lastDate", todayStr);
    localStorage.setItem("bh_streak", String(streak));
  } catch (e) {}

  streakDisplay.textContent = "Streak: " + streak + " 🔥";
}

// ---------- SVG builder ----------

function pickThemeColors(themeName) {
  var cfg = {
    bg: "#0f172a",
    card: "#f9fafb",
    accent: "#38bdf8",
    textMain: "#111827",
    textSub: "#4b5563"
  };

  if (themeName === "yellow") {
    cfg.bg = "#fef9c3";
    cfg.card = "#f8fafc";
    cfg.accent = "#f97316";
    cfg.textMain = "#111827";
    cfg.textSub = "#6b7280";
  } else if (themeName === "sky") {
    cfg.bg = "#0f172a";
    cfg.card = "#e0f2fe";
    cfg.accent = "#0ea5e9";
    cfg.textMain = "#020617";
    cfg.textSub = "#0f172a";
  } else if (themeName === "choco") {
    cfg.bg = "#111827";
    cfg.card = "#fef3c7";
    cfg.accent = "#92400e";
    cfg.textMain = "#111827";
    cfg.textSub = "#6b7280";
  }

  return cfg;
}

function randomAccent() {
  var palette = [
    "#22c55e",
    "#e11d48",
    "#f97316",
    "#a855f7",
    "#0ea5e9",
    "#facc15"
  ];
  var idx = Math.floor(Math.random() * palette.length);
  return palette[idx];
}

function escapeText(str) {
  if (!str) return "";
  var s = String(str);
  s = s.replace(/&/g, "&amp;");
  s = s.replace(/</g, "&lt;");
  s = s.replace(/>/g, "&gt;");
  return s;
}

function makeBadgeSVG(name, badgeType, themeName, shape, useRandomAccent) {
  var dateStr = new Date().toLocaleDateString();
  var cfg = pickThemeColors(themeName || "dark");

  if (useRandomAccent) {
    cfg.accent = randomAccent();
  }

  var safeName = escapeText(name || "Anonymous");
  var safeType = escapeText(badgeType || "Daily Check-in");
  var safeDate = escapeText(dateStr);

  var parts = [];

  parts.push(
    '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="360" viewBox="0 0 720 360">'
  );
  parts.push('<defs>');
  parts.push(
    '<linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">'
  );
  parts.push('<stop offset="0" stop-color="' + cfg.card + '"/>');
  parts.push('<stop offset="1" stop-color="' + cfg.bg + '"/>');
  parts.push("</linearGradient>");
  parts.push("</defs>");

  // Card base
  parts.push(
    '<rect x="24" y="24" width="672" height="312" rx="32" fill="url(#cardGrad)"/>'
  );

  // Accent shape
  if (shape === "square") {
    parts.push(
      '<rect x="72" y="80" width="160" height="160" rx="24" fill="' +
        cfg.accent +
        '"/>'
    );
  } else if (shape === "pill") {
    parts.push(
      '<rect x="72" y="110" width="220" height="100" rx="50" fill="' +
        cfg.accent +
        '"/>'
    );
  } else {
    // default circle
    parts.push(
      '<circle cx="152" cy="180" r="80" fill="' + cfg.accent + '"/>'
    );
  }

  // Vertical bar on right
  parts.push(
    '<rect x="560" y="42" width="96" height="276" rx="40" fill="' +
      cfg.accent +
      '" opacity="0.9"/>'
  );
  parts.push(
    '<text x="608" y="80" text-anchor="middle" font-size="16" fill="#f9fafb" ' +
      'font-weight="600" transform="rotate(90 608 80)">' +
      safeType +
      "</text>"
  );

  // Main text
  parts.push(
    '<text x="300" y="150" font-size="34" fill="' +
      cfg.textMain +
      '" font-weight="700" font-family="Inter, system-ui, -apple-system, sans-serif">' +
      safeName +
      "</text>"
  );

  parts.push(
    '<text x="300" y="190" font-size="22" fill="' +
      cfg.textSub +
      '" font-weight="500" font-family="Inter, system-ui, -apple-system, sans-serif">' +
      safeType +
      "</text>"
  );

  parts.push(
    '<text x="300" y="228" font-size="16" fill="' +
      cfg.textSub +
      '" font-family="Inter, system-ui, -apple-system, sans-serif">' +
      safeDate +
      "</text>"
  );

  // Tiny brand
  parts.push(
    '<text x="40" y="310" font-size="13" fill="' +
      cfg.textSub +
      '" font-family="Inter, system-ui, -apple-system, sans-serif">BadgeHub · base-mini-app</text>'
  );

  parts.push("</svg>");

  return parts.join("");
}

// ---------- Caption builder ----------

function buildCaption(name, badgeType, streak) {
  var baseName = name && name.trim() ? name.trim() : "Anon";
  var type = badgeType && badgeType.trim() ? badgeType.trim() : "Daily Check-in";
  var s = "🏅 " + baseName + " — " + type + " badge earned!";
  if (streak && streak > 1) {
    s += "\n🔥 Streak: " + streak + " days on-chain.";
  }
  s += "\n#BadgeHub #Base";
  return s;
}

// ---------- Actions ----------

function renderBadge() {
  var name = nameInput.value || "";
  var type = typeSelect.value || "Daily Check-in";
  var shape = shapeSelect.value || "circle";
  var themeName = themeSelect.value || "dark";
  var useRandom = !!randomColorsChk.checked;

  var svgString = makeBadgeSVG(name, type, themeName, shape, useRandom);

  svgwrap.innerHTML = svgString;

  var svgEl = svgwrap.querySelector("svg");
  if (svgEl) {
    svgEl.classList.add("badge-pop");
    svgEl.addEventListener(
      "animationend",
      function () {
        svgEl.classList.remove("badge-pop");
      },
      { once: true }
    );
  }
}

function getCurrentStreak() {
  var s = 0;
  try {
    s = parseInt(localStorage.getItem("bh_streak") || "0", 10);
  } catch (e) {
    s = 0;
  }
  return s;
}

function handleClaim() {
  renderBadge();
  updateStreak();

  var streak = getCurrentStreak();
  var caption = buildCaption(nameInput.value, typeSelect.value, streak);
  captionPreview.textContent = caption;

  msg.textContent = "Badge ready — copy, download, or share.";

  if (autoCopyChk.checked) {
    copyCaptionToClipboard(caption);
  }

  if (autoDownloadChk.checked) {
    downloadCurrentSVG();
  }
}

function getCurrentSVGString() {
  var svgEl = svgwrap.querySelector("svg");
  if (!svgEl) return null;
  return svgEl.outerHTML;
}

function downloadCurrentSVG() {
  var svg = getCurrentSVGString();
  if (!svg) {
    msg.textContent = "No badge to download.";
    return;
  }

  var blob = new Blob([svg], { type: "image/svg+xml" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "badge.svg";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  msg.textContent = "SVG downloaded.";
}

function copyCaptionToClipboard(captionText) {
  var txt = captionText || captionPreview.textContent || "";
  if (!txt) {
    msg.textContent = "Nothing to copy.";
    return;
  }

  navigator.clipboard
    .writeText(txt)
    .then(function () {
      msg.textContent = "Caption copied ✔";
    })
    .catch(function () {
      msg.textContent = "Copy failed — copy manually.";
    });
}

function shareToFarcaster() {
  var streak = getCurrentStreak();
  var caption = buildCaption(nameInput.value, typeSelect.value, streak);

  copyCaptionToClipboard(caption);

  var url =
    "https://warpcast.com/~/compose?text=" + encodeURIComponent(caption);
  window.open(url, "_blank");
}

// ---------- Listeners ----------

claimBtn.addEventListener("click", handleClaim);
downloadBtn.addEventListener("click", downloadCurrentSVG);
copyCaptionBtn.addEventListener("click", function () {
  copyCaptionToClipboard();
});
shareBtn.addEventListener("click", shareToFarcaster);

// Initial streak display
(function initStreakUI() {
  var s = getCurrentStreak();
  if (!s) s = 0;
  streakDisplay.textContent = "Streak: " + s + " 🔥";
})();
