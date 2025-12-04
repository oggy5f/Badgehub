// script.js — upgraded BadgeHub (no template literals)

// helpers
var $ = function(id){ return document.getElementById(id); };
var nameInput = $('name'), typeSelect = $('type'), shapeSel = $('shape'), themeSel = $('theme');
var claimBtn = $('claim'), badgeContainer = $('badgeContainer'), previewWrap = $('previewWrap');
var downloadBtn = $('download'), copyCaptionBtn = $('copyCaption'), captionEl = $('caption');
var toast = $('toast'), shareBtn = $('share');
var autoCopyChk = $('autoCopy'), autoDownloadChk = $('autoDownload'), randomColorChk = $('randomColor');
var streakDisplay = $('streakDisplay');

// localStorage keys
var LS_NAME = 'bh_name';
var LS_TYPE = 'bh_type';
var LS_THEME = 'bh_theme';
var LS_STREAK = 'bh_streak';
var LS_LAST = 'bh_lastClaim';

// init values
if(localStorage.getItem(LS_NAME)) nameInput.value = localStorage.getItem(LS_NAME);
if(localStorage.getItem(LS_TYPE)) typeSelect.value = localStorage.getItem(LS_TYPE);
if(localStorage.getItem(LS_THEME)) themeSel.value = localStorage.getItem(LS_THEME);

// apply theme
function applyTheme(t){
  if(t === 'default') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem(LS_THEME, t);
}
applyTheme(themeSel.value || 'default');

// escape helper
function escapeXml(s){ s = String(s || ''); return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// random color
function randomColor(){
  var h = Math.floor(Math.random()*360);
  return 'hsl(' + h + ',70%,70%)';
}

// make SVG with concatenation, shape support
function makeBadgeSvg(name, badgeType, bgColor, accent, shape){
  var date = (new Date()).toLocaleDateString();
  var svg = '';
  svg += '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="360" viewBox="0 0 720 360">';
  svg += '<title>Badge for ' + escapeXml(name) + '</title>';
  svg += '<rect width="720" height="360" rx="20" fill="#ffffff"/>';

  // shape backgrounds
  if(shape === 'circle'){
    svg += '<rect x="24" y="24" width="672" height="312" rx="16" fill="' + bgColor + '"/>';
    svg += '<circle cx="120" cy="180" r="72" fill="' + accent + '"/>';
  } else if(shape === 'shield'){
    svg += '<rect x="24" y="24" width="672" height="312" rx="16" fill="' + bgColor + '"/>';
    svg += '<path d="M120 80 L180 140 L180 230 Q120 290 60 230 L60 140 Z" transform="translate(0,20)" fill="' + accent + '"/>';
  } else if(shape === 'ribbon'){
    svg += '<rect x="24" y="24" width="672" height="312" rx="16" fill="' + bgColor + '"/>';
    svg += '<rect x="36" y="46" width="200" height="110" rx="12" fill="' + accent + '"/>';
    svg += '<path d="M36 156 L76 190 L116 156 L36 156" fill="' + accent + '"/>';
  } else if(shape === 'hex'){
    svg += '<rect x="24" y="24" width="672" height="312" rx="16" fill="' + bgColor + '"/>';
    svg += '<polygon points="120,108 170,138 170,222 120,252 70,222 70,138" fill="' + accent + '"/>';
  } else {
    svg += '<rect x="24" y="24" width="672" height="312" rx="16" fill="' + bgColor + '"/>';
    svg += '<circle cx="120" cy="180" r="72" fill="' + accent + '"/>';
  }

  // text
  svg += '<text x="220" y="145" font-size="34" fill="#ffffff" font-weight="700" font-family="Inter, Arial">' + escapeXml(name) + '</text>';
  svg += '<text x="220" y="190" font-size="24" fill="#ffffff">' + escapeXml(badgeType) + '</text>';
  svg += '<text x="220" y="230" font-size="16" fill="#cfe0ff">' + escapeXml(date) + '</text>';

  svg += '</svg>';
  return svg;
}

// download helper
function downloadSvg(svgText, fileName){
  var blob = new Blob([svgText], { type: 'image/svg+xml' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a'); a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

// toast
function showToast(text){
  toast.textContent = text; toast.style.display = 'block';
  setTimeout(function(){ toast.style.display = 'none'; }, 1600);
}

// caption builder
function buildCaption(name, type){
  return '🏅 ' + name + ' — ' + type + ' badge earned!\\n#BadgeHub';
}

// streak functions
function updateStreakDisplay(){
  var s = parseInt(localStorage.getItem(LS_STREAK) || '0', 10);
  if(isNaN(s)) s = 0;
  streakDisplay.textContent = 'Streak: ' + s + ' 🔥';
}
function maybeIncrementStreak(){
  var last = localStorage.getItem(LS_LAST);
  var now = new Date();
  var s = parseInt(localStorage.getItem(LS_STREAK) || '0', 10);
  if(!last){ s = 1; }
  else {
    var lastD = new Date(last);
    var days = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - new Date(lastD.getFullYear(), lastD.getMonth(), lastD.getDate()))/86400000);
    if(days === 0){ /* already claimed today */ }
    else if(days === 1){ s = s + 1; }
    else { s = 1; }
  }
  localStorage.setItem(LS_STREAK, String(s));
  localStorage.setItem(LS_LAST, now.toISOString());
  updateStreakDisplay();
}

// copy fallback
function tryCopy(text){
  if(navigator.clipboard && navigator.clipboard.writeText){
    return navigator.clipboard.writeText(text);
  }
  // fallback
  return new Promise(function(resolve, reject){
    var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); document.body.removeChild(ta); resolve(); } catch(e){ document.body.removeChild(ta); reject(e); }
  });
}

// claim button logic
claimBtn.addEventListener('click', function(){
  var name = (nameInput.value && nameInput.value.trim()) || 'Anonymous';
  var badgeType = (typeSelect.value) || 'Daily Check-in';
  // store inputs
  localStorage.setItem(LS_NAME, name);
  localStorage.setItem(LS_TYPE, badgeType);

  // colors
  var bg = '#0b5fff', ac = '#ffd166';
  if(randomColorChk.checked){ bg = randomColor(); ac = randomColor(); }

  var shape = (shapeSel.value) || 'circle';
  var svg = makeBadgeSvg(name, badgeType, bg, ac, shape);

  // place into DOM
  badgeContainer.innerHTML = svg;
  captionEl.textContent = buildCaption(name, badgeType);

  // streak
  maybeIncrementStreak();

  // auto copy
  if(autoCopyChk.checked){
    tryCopy(captionEl.textContent).then(function(){ showToast('Caption copied'); }).catch(function(){ showToast('Copy failed'); });
  }

  // auto download
  if(autoDownloadChk.checked){
    try { downloadSvg(svg, 'badge.svg'); showToast('Downloaded'); } catch(e){ showToast('Download failed'); }
  }

  showToast('Badge ready — download or copy caption');
});

// download button
downloadBtn.addEventListener('click', function(){
  var svgEl = badgeContainer.querySelector('svg');
  if(!svgEl){ showToast('No badge to download'); return; }
  downloadSvg(svgEl.outerHTML, 'badge.svg');
});

// copy caption
copyCaptionBtn.addEventListener('click', function(){
  var t = captionEl.textContent || '';
  tryCopy(t).then(function(){ showToast('Caption copied'); }).catch(function(){ showToast('Copy failed'); });
});

// share to Twitter
shareBtn.addEventListener('click', function(){
  var t = captionEl.textContent || '';
  var url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(t);
  window.open(url, '_blank');
});

// theme change
themeSel.addEventListener('change', function(){ applyTheme(themeSel.value); });

// initial preview & streak load
(function init(){
  updateStreakDisplay();
  if(localStorage.getItem(LS_NAME)){
    var nm = localStorage.getItem(LS_NAME);
    var tp = localStorage.getItem(LS_TYPE) || typeSelect.value;
    var sv = makeBadgeSvg(nm, tp, '#0b5fff', '#ffd166', 'circle');
    badgeContainer.innerHTML = sv;
    captionEl.textContent = buildCaption(nm, tp);
  }
})();
