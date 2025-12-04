// script.js - BadgeHub (no template literals)

// helper: safe getElementById
function $(id) { return document.getElementById(id); }

// DOM
var nameInput = $('name');
var typeSelect = $('type');
var claimBtn = $('claim');
var previewWrap = $('previewWrap');
var badgeContainer = $('badgeContainer');
var downloadBtn = $('download');
var copyCaptionBtn = $('copyCaption');
var msg = $('msg');

// escape to avoid breaking SVG
function escapeXml(str) {
  str = String(str || '');
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// build SVG using string concatenation (no backticks)
function makeBadgeSVG(displayName, badgeType) {
  var date = new Date().toLocaleDateString();
  var bgColor = '#0b5fff';
  var accent = '#ffd166';

  var svg = '<svg class="badge" xmlns="http://www.w3.org/2000/svg" width="720" height="360" viewBox="0 0 720 360">';
  svg += '<title>Badge for ' + escapeXml(displayName) + '</title>';

  svg += '<rect width="720" height="360" rx="24" fill="#ffffff" />';
  svg += '<rect x="24" y="24" width="672" height="312" rx="16" fill="' + bgColor + '" />';
  svg += '<circle cx="120" cy="180" r="72" fill="' + accent + '" />';

  svg += '<text x="220" y="145" font-size="34" fill="#fff" font-weight="700" font-family="Inter, system-ui, Arial, Helvetica, sans-serif">';
  svg += escapeXml(displayName);
  svg += '</text>';

  svg += '<text x="220" y="190" font-size="24" fill="#fff">';
  svg += escapeXml(badgeType);
  svg += '</text>';

  svg += '<text x="220" y="230" font-size="16" fill="#cfe0ff">';
  svg += escapeXml(date);
  svg += '</text>';

  svg += '</svg>';

  return svg.trim();
}

// Claim button
if (claimBtn) {
  claimBtn.addEventListener('click', function () {
    var name = (nameInput && nameInput.value && nameInput.value.trim()) || 'Anonymous';
    var badgeType = (typeSelect && typeSelect.value) || 'Daily Check-in';

    var svg = makeBadgeSVG(name, badgeType);
    if (badgeContainer) badgeContainer.innerHTML = svg;
    if (previewWrap && previewWrap.classList && previewWrap.classList.contains('hidden')) {
      previewWrap.classList.remove('hidden');
    }
    if (msg) msg.textContent = 'Badge ready — download or copy caption.';
  });
}

// Download SVG
if (downloadBtn) {
  downloadBtn.addEventListener('click', function () {
    var svg = badgeContainer ? badgeContainer.innerHTML : '';
    if (!svg) {
      if (msg) msg.textContent = 'No badge to download. Claim first.';
      return;
    }
    var blob = new Blob([svg], { type: 'image/svg+xml' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
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
  copyCaptionBtn.addEventListener('click', function () {
    var name = nameInput ? (nameInput.value.trim() || 'Anonymous') : 'Anonymous';
    var badgeType = typeSelect ? typeSelect.value : 'Daily Check-in';
    var caption = '🏅 ' + name + ' — ' + badgeType + ' badge earned!\n#BadgeHub';

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(caption).then(function () {
        if (msg) msg.textContent = 'Caption copied!';
      }).catch(function () {
        if (msg) msg.textContent = 'Copy failed — please copy manually.';
      });
    } else {
      window.prompt('Copy this caption (Ctrl+C then Enter):', caption);
    }
  });
}

console.log('script.js (no-template) loaded');
