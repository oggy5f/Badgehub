// script.js - full
// Helper $
const $ = id => document.getElementById(id);

// DOM
const nameInput = $('nameInput');
const typeSelect = $('typeSelect');
const shapeSelect = $('shapeSelect');
const claimBtn = $('claimBtn');
const svgwrap = $('svgwrap');
const downloadBtn = $('downloadBtn');
const copyCaption = $('copyCaption');
const shareBtn = $('shareBtn');
const captionPreview = $('captionPreview');
const themeSelect = $('theme');
const sizeScale = $('sizeScale');
const randomColorCheck = $('randomColor');
const autoCopyCheck = $('autoCopy');
const streakDisplay = $('streakDisplay');

const ROOT = document.documentElement;
const THEME_KEY = 'bh_theme';
const STREAK_KEY = 'bh_streak';

// escape xml
function escapeXml(s){
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// simple color generator
function randColor(){
  const colors = ['#ffb3c1','#ffd4a3','#d0f0ff','#c7f7d0','#f0d0ff','#ffd166','#ff7b7b','#c46a3b'];
  return colors[Math.floor(Math.random()*colors.length)];
}

// make SVG (using template literal for readability)
function makeBadgeSVG(name, type, shape, bgColor, scalePercent){
  // scale percent: 100 = normal, 30 = 30% etc
  const scale = (scalePercent||100)/100;
  const width = 720 * scale;
  const height = 360 * scale;
  const accent = '#ffd166';
  const safeName = escapeXml(name);
  const safeType = escapeXml(type);
  // shape element
  let shapeEl = '';
  if(shape === 'circle'){
    const cx = 120*scale, cy = 180*scale, r = 72*scale;
    shapeEl = <circle cx="${cx}" cy="${cy}" r="${r}" fill="${accent}" />;
  } else if(shape === 'square'){
    const x = 24*scale, y = 24*scale, w = 144*scale, h = 144*scale, rx = 16*scale;
    shapeEl = <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${accent}" />;
  } else if(shape === 'hex'){
    const cx = 120*scale, cy = 180*scale, r = 80*scale;
    // regular hex path approximation
    const p = [];
    for(let i=0;i<6;i++){
      const a = (Math.PI/3)*i - Math.PI/6;
      p.push( (cx + r*Math.cos(a)).toFixed(2)+','+(cy + r*Math.sin(a)).toFixed(2) );
    }
    shapeEl = <polygon points="${p.join(' ')}" fill="${accent}" />;
  }

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${720*scale} ${360*scale}">
  <title>Badge for ${safeName}</title>
  <rect width="${720*scale}" height="${360*scale}" rx="${24*scale}" fill="#ffffff" />
  <rect x="${24*scale}" y="${24*scale}" width="${672*scale}" height="${312*scale}" rx="${16*scale}" fill="${bgColor}" />
  ${shapeEl}
  <text x="${220*scale}" y="${145*scale}" font-size="${34*scale}" fill="#fff" font-weight="700" font-family="Inter, system-ui, Arial, Helvetica, sans-serif">${safeName}</text>
  <text x="${220*scale}" y="${190*scale}" font-size="${24*scale}" fill="#fff">${safeType}</text>
  <text x="${220*scale}" y="${230*scale}" font-size="${16*scale}" fill="#cfe0ff">${new Date().toLocaleDateString()}</text>
</svg>`.trim();
  return svg;
}

// apply theme persistence
function applyTheme(name){
  if(!name || name === 'dark') {
    ROOT.removeAttribute('data-theme');
  } else {
    ROOT.setAttribute('data-theme', name);
  }
  themeSelect.value = name || 'dark';
  localStorage.setItem(THEME_KEY, name || 'dark');
}

// load theme
(function(){
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(saved);
})();

themeSelect.addEventListener('change', function(){
  applyTheme(themeSelect.value);
});

// streak load
(function(){
  let s = parseInt(localStorage.getItem(STREAK_KEY)||'0',10);
  streakDisplay.textContent = 'Streak: ' + s + ' 🔥';
})();

// render helper
function setSVGHTML(svgString){
  svgwrap.innerHTML = ''; // clear
  const frag = document.createRange().createContextualFragment(svgString);
  svgwrap.appendChild(frag);
  // add pop animation
  const svgel = svgwrap.querySelector('svg');
  if(svgel){
    svgel.classList.remove('badge-pop');
    // force reflow then add
    void svgel.offsetWidth;
    svgel.classList.add('badge-pop');
  }
}

// download helper
function downloadSVG(svg, filename){
  const blob = new Blob([svg], {type:'image/svg+xml;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'badge.svg';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// build caption
function buildCaption(name, type){
  const plain = ${name} — ${type} badge earned! #BadgeHub;
  // HTML preview (simple card-like)
  const html = '<div style="font-family:Inter,system-ui,Arial;color:var(--text)">' +
               '<div style="font-size:18px;font-weight:800">🏅 ' + escapeXml(name) + '</div>' +
               '<div style="font-size:13px;color:var(--muted);margin-top:6px">' + escapeXml(type) + ' • <span style="opacity:0.9">#BadgeHub</span></div>' +
               '</div>';
  return {html, plain};
}

// Claim badge logic
claimBtn.addEventListener('click', function(){
  const name = (nameInput.value || '').trim() || 'Anonymous';
  const type = (typeSelect.value || 'Daily Check-in');
  const shape = shapeSelect.value || 'circle';
  const scale = parseInt(sizeScale.value || '100',10);
  const useRandom = randomColorCheck.checked;
  const bg = useRandom ? randColor() : '#ffb3c1'; // default bg
  const svg = makeBadgeSVG(name, type, shape, bg, scale);

  // render
  setSVGHTML(svg);

  // update caption preview
  const cap = buildCaption(name, type);
  captionPreview.innerHTML = cap.html;

  // auto-copy if enabled
  if(autoCopyCheck.checked && navigator.clipboard){
    navigator.clipboard.writeText(cap.plain).catch(()=>{});
  }

  // increment streak & store
  const old = parseInt(localStorage.getItem(STREAK_KEY)||'0',10);
  const next = old + 1;
  localStorage.setItem(STREAK_KEY, String(next));
  streakDisplay.textContent = 'Streak: ' + next + ' 🔥';
});

// Download button
downloadBtn.addEventListener('click', function(){
  const svgEl = svgwrap.querySelector('svg');
  if(!svgEl){ alert('No badge to download yet'); return; }
  const svgText = new XMLSerializer().serializeToString(svgEl);
  downloadSVG(svgText, 'badge.svg');
});

// copy caption button
copyCaption.addEventListener('click', function(){
  const name = (nameInput.value || '').trim() || 'Anonymous';
  const type = (typeSelect.value || 'Daily Check-in');
  const cap = buildCaption(name, type);
  if(navigator.clipboard){
    navigator.clipboard.writeText(cap.plain).then(()=>{ alert('Caption copied'); });
  } else {
    prompt('Copy this caption', cap.plain);
  }
});

// share to Farcaster (warpcast compose)
shareBtn.addEventListener('click', function(){
  const name = (nameInput.value || '').trim() || 'Anonymous';
  const type = (typeSelect.value || 'Daily Check-in');
  const cap = buildCaption(name, type);
  const url = 'https://warpcast.com/~/compose?text=' + encodeURIComponent(cap.plain);
  window.open(url, '_blank');
});

// keyboard: Enter to claim (on name input)
nameInput.addEventListener('keydown', function(e){
  if(e.key === 'Enter'){ claimBtn.click(); }
});

// set default preview placeholder
captionPreview.innerHTML = '<div class="small">Caption will appear here after claim.</div>';
