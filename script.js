// ------------------------------
// BadgeHub — Upgraded script.js
// Paste this entire file into script.js (replace old) - no backticks used
// ------------------------------

/* helpers */
function $id(id){ return document.getElementById(id); }
function safeText(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function randFrom(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

/* DOM (may be missing some elements in older HTML; checks included) */
var nameInput = $id('nameInput');
var typeSelect = $id('typeSelect');
var shapeSelect = $id('shapeSelect');
var claimBtn = $id('claimBtn');
var svgwrap = $id('svgwrap');
var downloadBtn = $id('downloadBtn');
var copyCaptionBtn = $id('copyCaption');
var shareBtn = $id('shareBtn');
var captionPreview = $id('captionPreview');
var streakDisplay = $id('streakDisplay');

var themeSelect = $id('theme');        // optional
var sizeScale = $id('sizeScale') || $id('sizeScale') || $id('sizeScale') || $id('sizeScale'); // try common ids
// also try alternative slider id 'sizeScale' or 'scaleRange' or 'scaleRange'
if(!sizeScale) sizeScale = $id('scaleRange') || $id('sizeScale') || $id('size') || null;

var randomColorCheck = $id('randomColor') || $id('randColors') || $id('randColor');
var autoCopyCheck = $id('autoCopy') || $id('auto-copy') || null;

/* persistence keys */
var THEME_KEY = 'badgehub_theme';
var STREAK_KEY = 'badgehub_streak';

/* palettes */
var BG_COLORS = ['#ffe2a8','#c6f0ff','#ffc6e3','#d4ffcf','#fff3b0','#fbe6ff','#e0f7ff'];
var ACCENT_COLORS = ['#ffb07a','#ff9fb5','#7cc1ff','#4bd6a1','#ffb94c'];

/* Theme handling (set data-theme on html root) */
function applyTheme(name){
  var root = document.documentElement;
  var t = name || 'dark';
  root.setAttribute('data-theme', t);
  try { localStorage.setItem(THEME_KEY, t); } catch(e){}
  // Also, if there are CSS classes you want, you can add here (kept simple)
}
function loadTheme(){
  var saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch(e){}
  if(!saved) saved = (themeSelect && themeSelect.value) ? themeSelect.value : 'dark';
  applyTheme(saved);
  if(themeSelect) themeSelect.value = saved;
}
if(themeSelect){
  themeSelect.addEventListener('change', function(e){
    applyTheme(e.target.value);
  });
}
loadTheme();

/* Streak handling */
function readStreak(){
  var s = 0;
  try { s = parseInt(localStorage.getItem(STREAK_KEY),10) || 0; } catch(e){ s = 0; }
  return s;
}
function writeStreak(n){
  try { localStorage.setItem(STREAK_KEY, String(n)); } catch(e){}
}
function showStreak(){
  var s = readStreak();
  if(streakDisplay) streakDisplay.textContent = 'Streak: ' + s + ' 🔥';
}
function bumpStreak(){
  var s = readStreak() || 0;
  s = s + 1;
  writeStreak(s);
  showStreak();
}
showStreak();

/* utility: compute final scale (user slider * 1.3, capped at 1) */
function computeFinalScalePercent(userPercent){
  var p = Number(userPercent) || 100;
  p = Math.max(10, Math.min(200, p)); // clamp
  var final = p * 1.3;
  if(final > 100) final = 100;
  return final; // percent (10..100)
}

/* SVG shape builders (coordinates use original 720x360 viewBox; we scale via width/height) */
function shapeElementFor(shape, accent){
  if(shape === 'square'){
    return '<rect x="48" y="108" width="144" height="144" rx="18" fill="'+accent+'"/>';
  }
  if(shape === 'diamond'){
    return '<polygon points="120,108 192,180 120,252 48,180" fill="'+accent+'"/>';
  }
  if(shape === 'hex'){
    // regular hex around center (120,180) radius 80
    return '<polygon points="200,180 160,244 80,244 40,180 80,116 160,116" fill="'+accent+'"/>';
  }
  if(shape === 'star'){
    // simple 5-point star path scaled approx
    return '<path d="M120 100 L139 156 L198 156 L149 190 L165 246 L120 210 L74 246 L90 190 L41 156 L100 156 Z" fill="'+accent+'"/>';
  }
  // default circle
  return '<circle cx="120" cy="180" r="72" fill="'+accent+'"/>';
}

/* Create a stylish SVG using concatenation (no template backticks) */
function makeBadgeSVG(name, type, shape, bgColor, accentColor, userScalePercent){
  var finalPercent = computeFinalScalePercent(userScalePercent || 100); // percent
  var scale = finalPercent / 100; // 0..1
  var W = Math.round(720 * scale);
  var H = Math.round(360 * scale);

  // build defs: gradient + subtle inner shadow filter
  var defs = '';
  defs += '<defs>';
  defs += '<linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">';
  defs += '<stop offset="0" stop-color="'+bgColor+'"/>';
  defs += '<stop offset="1" stop-color="#ffffff" stop-opacity="0.06"/>';
  defs += '</linearGradient>';
  defs += '<radialGradient id="r1" cx="20%" cy="30%">';
  defs += '<stop offset="0" stop-color="'+accentColor+'" stop-opacity="0.95"/>';
  defs += '<stop offset="1" stop-color="'+accentColor+'" stop-opacity="0.5"/>';
  defs += '</radialGradient>';
  // drop shadow filter (soft)
  defs += '<filter id="ds" x="-20%" y="-20%" width="140%" height="140%">';
  defs += '<feDropShadow dx="0" dy="8" stdDeviation="18" flood-color="#000" flood-opacity="0.35"/>';
  defs += '</filter>';
  defs += '</defs>';

  // shape element
  var shapeFrag = shapeElementFor(shape, accentColor);

  // ribbon / label decoration
  var ribbon = '';
  ribbon += '<g transform="translate(0,0)">';
  ribbon += '<rect x="12" y="12" width="220" height="44" rx="10" fill="'+accentColor+'" opacity="0.9"/>';
  ribbon += '<text x="26" y="42" font-size="16" fill="#fff" font-weight="700" font-family="Inter, system-ui, Arial">'+ safeText(type) +'</text>';
  ribbon += '</g>';

  // title text and subtext coordinates are in viewBox coords (0..720,0..360)
  var textName = '<text x="220" y="150" font-size="34" fill="#111" font-weight="800" font-family="Inter, system-ui, Arial">'+ safeText(name) +'</text>';
  var textType = '<text x="220" y="190" font-size="20" fill="#333">'+ safeText(type) +'</text>';
  var dateStr = new Date().toLocaleDateString();
  var textDate = '<text x="220" y="226" font-size="14" fill="#666">'+ safeText(dateStr) +'</text>';

  // build SVG via concatenation
  var svg = '';
  svg += '<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'" viewBox="0 0 720 360" role="img" aria-label="Badge for '+ safeText(name) +'">';
  svg += defs;
  svg += '<rect width="720" height="360" rx="24" fill="#fff"/>';
  svg += '<rect x="24" y="24" width="672" height="312" rx="16" fill="url(#g1)" filter="url(#ds)"/>';
  // accent shape using radial gradient
  svg += shapeFrag.replace(/fill="[^"]*"/, 'fill="url(#r1)"');
  // small emblem circle top-left using accent color
  svg += '<circle cx="572" cy="72" r="34" fill="'+accentColor+'" opacity="0.12"/>';
  svg += ribbon;
  svg += textName;
  svg += textType;
  svg += textDate;
  // subtle border
  svg += '<rect x="24" y="24" width="672" height="312" rx="16" fill="none" stroke="#000000" stroke-opacity="0.04"/>';
  svg += '</svg>';

  return svg;
}

/* caption builder (styled preview + plain) */
function buildCaption(name, type){
  var plain = name + ' — ' + type + ' badge earned! #BadgeHub';
  var html = '';
  html += '<div style="font-family:Inter,system-ui,Arial">';
  html += '<div style="font-size:18px;font-weight:800">🏅 ' + safeText(name) + '</div>';
  html += '<div style="font-size:13px;color:rgba(0,0,0,0.6);margin-top:6px">' + safeText(type) + ' • <span style="color:rgba(0,0,0,0.5)">#BadgeHub</span></div>';
  html += '</div>';
  return { plain: plain, html: html };
}

/* render + animate (add both class names to match different CSS variants) */
function renderAndAnimate(svgString){
  if(!svgwrap) return;
  svgwrap.innerHTML = svgString;
  var svgEl = svgwrap.querySelector('svg');
  if(!svgEl) return;
  // try both common class names used in our CSS examples
  svgEl.classList.remove('badge-pop','badge-animate','anim-pop','anim-pop2');
  void svgEl.offsetWidth;
  svgEl.classList.add('badge-pop','badge-animate');
  // remove after animation end so it can replay
  svgEl.addEventListener('animationend', function(){ svgEl.classList.remove('badge-pop','badge-animate'); }, { once: true });
}

/* download helper */
function downloadSVGFromElement(svgEl, filename){
  var svgText = new XMLSerializer().serializeToString(svgEl);
  var blob = new Blob([svgText], { type: 'image/svg+xml' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename || 'badge.svg';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* init: set safe defaults if some elements missing */
if(!nameInput) {
  // create a fallback input so code doesn't break (not shown in UI)
  nameInput = { value: 'Anonymous' };
}
if(!typeSelect) {
  typeSelect = { value: 'Daily Check-in' };
}
if(!shapeSelect) {
  shapeSelect = { value: 'circle' };
}

/* Claim button logic (defensive) */
if(claimBtn){
  claimBtn.addEventListener('click', function(){
    var name = (nameInput && nameInput.value) ? nameInput.value.trim() : 'Anonymous';
    var type = (typeSelect && typeSelect.value) ? typeSelect.value : 'Daily Check-in';
    var shape = (shapeSelect && shapeSelect.value) ? shapeSelect.value : 'circle';
    // size slider
    var sliderVal = 100;
    if(sizeScale && sizeScale.value) sliderVal = Number(sizeScale.value);
    // random color
    var bg = randFrom(BG_COLORS);
    var accent = randFrom(ACCENT_COLORS);
    if(randomColorCheck && randomColorCheck.checked){
      bg = randFrom(BG_COLORS);
      accent = randFrom(ACCENT_COLORS);
    }
    // create svg
    var svg = makeBadgeSVG(name, type, shape, bg, accent, sliderVal);
    renderAndAnimate(svg);
    // caption preview
    if(captionPreview) {
      var cap = buildCaption(name, type);
      captionPreview.innerHTML = cap.html;
    }
    // auto-copy caption if requested
    if(autoCopyCheck && autoCopyCheck.checked && navigator.clipboard){
      try { navigator.clipboard.writeText(buildCaption(name,type).plain); } catch(e){}
    }
    // bump streak
    bumpStreak();
  });
}

/* Download */
if(downloadBtn){
  downloadBtn.addEventListener('click', function(){
    var svgEl = svgwrap ? svgwrap.querySelector('svg') : null;
    if(!svgEl) return alert('No badge to download — claim first');
    downloadSVGFromElement(svgEl, 'badge.svg');
  });
}

/* Copy caption (plain text) */
if(copyCaptionBtn){
  copyCaptionBtn.addEventListener('click', function(){
    var name = (nameInput && nameInput.value) ? nameInput.value.trim() : 'Anonymous';
    var type = (typeSelect && typeSelect.value) ? typeSelect.value : 'Daily Check-in';
    var plain = buildCaption(name,type).plain;
    if(navigator.clipboard){
      navigator.clipboard.writeText(plain).then(function(){ alert('Caption copied'); }).catch(function(){ prompt('Copy this caption', plain); });
    } else {
      prompt('Copy this caption', plain);
    }
  });
}

/* Share to Farcaster (Warpcast compose) */
if(shareBtn){
  shareBtn.addEventListener('click', function(){
    var name = (nameInput && nameInput.value) ? nameInput.value.trim() : 'Anonymous';
    var type = (typeSelect && typeSelect.value) ? typeSelect.value : 'Daily Check-in';
    var plain = buildCaption(name,type).plain;
    var url = 'https://warpcast.com/~/compose?text=' + encodeURIComponent(plain);
    window.open(url, '_blank');
  });
}

/* keyboard: Enter in name input triggers claim */
if($id('nameInput')){
  $id('nameInput').addEventListener('keydown', function(e){
    if(e.key === 'Enter' && claimBtn) claimBtn.click();
  });
}

/* finalize: ensure UI shows current theme & streak on load */
loadTheme();
showStreak();
