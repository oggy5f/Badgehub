// script.js - BadgeHub final (paste-safe, no template literals)

// ---------- helpers ----------
function $(id){ return document.getElementById(id); }
function escapeXml(s){ return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function downloadBlob(filename, text){
  var blob = new Blob([text], { type: 'image/svg+xml' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
function randFrom(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

// ---------- palettes ----------
var BG_PALETTE = ['#f1c2f0','#f6c6d3','#cbd8ff','#cff7e1','#ffd7a6','#eb8fcf','#c9f0ff'];
var ACCENT_PALETTE = ['#ffb07a','#ff9fb5','#7cc1ff','#4bd6a1','#ffb94c'];

// ---------- DOM references ----------
var nameEl = $('name');
var typeEl = $('type');
var shapeEl = $('shape');
var scaleRange = $('scaleRange');
var scaleValue = $('scaleValue');
var randColors = $('randColors');
var randShape = $('randShape');
var autoCopy = $('autoCopy');
var autoDownload = $('autoDownload');

var claimBtn = $('claim');
var downloadBtn = $('download');
var copyCaptionBtn = $('copyCaption');
var shareWarpBtn = $('shareWarp');
var mintBtn = $('mint');

var svgwrap = $('svgwrap');
var captionEl = $('caption');
var streakDisplay = $('streakDisplay');

// ---------- scale UI ----------
scaleValue.textContent = scaleRange.value + '%';
scaleRange.addEventListener('input', function(){
  scaleValue.textContent = scaleRange.value + '%';
});

// ---------- streak localStorage ----------
var KEY_LAST = 'bh_last_claim';
var KEY_STREAK = 'bh_streak';
function loadStreak(){
  var s = parseInt(localStorage.getItem(KEY_STREAK) || '0', 10) || 0;
  streakDisplay.textContent = s;
}
function saveStreak(n){
  localStorage.setItem(KEY_STREAK, String(n));
  streakDisplay.textContent = n;
}
loadStreak();

function updateStreakOnClaim(){
  var today = (new Date()).toISOString().slice(0,10);
  var last = localStorage.getItem(KEY_LAST);
  var streak = parseInt(localStorage.getItem(KEY_STREAK) || '0', 10) || 0;
  if(last === today){
    // already claimed today - do nothing
    return streak;
  }
  var yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  var ystr = yesterday.toISOString().slice(0,10);
  if(last === ystr){
    streak = streak + 1;
  } else {
    streak = 1;
  }
  localStorage.setItem(KEY_LAST, today);
  saveStreak(streak);
  return streak;
}

// ---------- shape fragment builder ----------
function shapeFragment(shape, accent){
  if(shape === 'circle'){
    return '<circle cx="120" cy="180" r="72" fill="' + accent + '"/>';
  }
  if(shape === 'square'){
    return '<rect x="48" y="108" width="144" height="144" rx="18" fill="' + accent + '"/>';
  }
  if(shape === 'diamond'){
    return '<polygon points="120,108 192,180 120,252 48,180" fill="' + accent + '"/>';
  }
  // fallback circle
  return '<circle cx="120" cy="180" r="72" fill="' + accent + '"/>';
}

// ---------- SVG generator (actual size scaled) ----------
function makeScaledSVG(name, badgeType, shape, bgColor, accentColor, scalePercent){
  var scale = Math.max(10, Math.min(100, Number(scalePercent || 30))) / 100;
  var W = Math.round(720 * scale);
  var H = Math.round(360 * scale);

  // build svg via concatenation (paste-safe)
  var svg = '';
  svg += '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 720 360">';
  svg += '<rect width="720" height="360" rx="24" fill="#ffffff"/>';
  svg += '<rect x="24" y="24" width="672" height="312" rx="16" fill="' + bgColor + '"/>';
  svg += shapeFragment(shape, accentColor);

  svg += '<text x="220" y="145" font-size="34" fill="#ffffff" font-weight="700" font-family="Inter, system-ui, Arial">' + escapeXml(name) + '</text>';
  svg += '<text x="220" y="190" font-size="22" fill="#ffffff">' + escapeXml(badgeType) + '</text>';
  var d = new Date();
  var dateText = ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth()+1)).slice(-2) + '/' + d.getFullYear();
  svg += '<text x="220" y="230" font-size="14" fill="#e6f0ff">' + escapeXml(dateText) + '</text>';
  svg += '</svg>';
  return svg;
}

// ---------- helpers ----------
function pickColors(){
  return { bg: randFrom(BG_PALETTE), ac: randFrom(ACCENT_PALETTE) };
}
function buildCaptionText(name, type){
  return '🏅 ' + name + ' — ' + type + ' badge earned! #BadgeHub';
}

// ---------- render + animation trigger ----------
function renderBadge(svgString){
  svgwrap.innerHTML = svgString;
  // find svg element
  var el = svgwrap.querySelector('svg');
  if(!el) return;
  // add animation class (pop)
  el.classList.remove('anim-pop');
  // force reflow then re-add
  void el.offsetWidth;
  el.classList.add('anim-pop');
}

// ---------- claim handler ----------
claimBtn.addEventListener('click', function(){
  var name = (nameEl.value || '').trim() || 'Anonymous';
  var type = (typeEl.value || 'Daily Check-in');
  var shape = shapeEl.value || 'circle';
  var scale = Number(scaleRange.value || 30);

  if(randShape.checked){
    shape = randFrom(['circle','square','diamond']);
  }

  var bg = '#8ec5ff';
  var ac = '#ffb07a';
  if(randColors.checked){
    var picked = pickColors();
    bg = picked.bg;
    ac = picked.ac;
  }

  var svg = makeScaledSVG(name, type, shape, bg, ac, scale);
  renderBadge(svg);

  // caption
  var caption = buildCaptionText(name, type);
  captionEl.textContent = caption;

  // streak update
  updateStreakOnClaim();

  // auto copy caption
  if(autoCopy.checked && navigator.clipboard){
    navigator.clipboard.writeText(caption).then(function(){/* ok */});
  }

  // auto download
  if(autoDownload.checked){
    downloadBlob('badge.svg', svg);
  }
});

// ---------- download / copy / share ----------
downloadBtn.addEventListener('click', function(){
  var inner = svgwrap.innerHTML;
  if(!inner || inner.trim() === ''){ alert('No badge to download — claim first'); return; }
  downloadBlob('badge.svg', inner);
});

copyCaptionBtn.addEventListener('click', function(){
  var name = (nameEl.value || '').trim() || 'Anonymous';
  var type = (typeEl.value || 'Daily Check-in');
  var caption = buildCaptionText(name, type);
  if(navigator.clipboard){
    navigator.clipboard.writeText(caption).then(function(){ alert('Caption copied'); });
  } else {
    prompt('Copy this caption:', caption);
  }
});

// share to Farcaster (warpcast compose)
shareWarpBtn.addEventListener('click', function(){
  var name = (nameEl.value || '').trim() || 'Anonymous';
  var type = (typeEl.value || 'Daily Check-in');
  var caption = buildCaptionText(name, type);
  var url = 'https://warpcast.com/~/compose?text=' + encodeURIComponent(caption);
  window.open(url, '_blank');
});

// mint placeholder
mintBtn.addEventListener('click', function(){
  alert('Mint integration not implemented. Add your contract/API flow here.');
});

// ---------- init ----------
(function init(){
  svgwrap.innerHTML = '<div class="small">No badge yet — click Claim</div>';
  captionEl.textContent = 'Caption will appear after claim.';
  loadStreak();
})();
