// script.js - Crypto UI BadgeHub (single-file logic)
// Small helper
const $ = id => document.getElementById(id);

// DOM
const nameInput = $('nameInput');
const typeSelect = $('typeSelect');
const shapeSelect = $('shapeSelect');
const claimBtn = $('claimBtn');
const svgWrap = $('svgWrap');
const downloadBtn = $('downloadBtn');
const copyBtn = $('copyBtn');
const shareBtn = $('shareBtn');
const farcasterBtn = $('farcasterBtn');
const mintBtn = $('mintBtn');
const captionPreview = $('captionPreview');
const sizeRange = $('sizeRange');
const sizeVal = $('sizeVal');
const randomColor = $('randomColor');
const autoCopy = $('autoCopy');
const autoDownload = $('autoDownload');
const streakCountEl = $('streakCount');
const themeSelect = $('themeSelect');

let currentSVGString = '';
let streak = 0;

// Themes: apply to <html> as data-theme
function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('bh:theme', theme);
}
themeSelect.addEventListener('change', e=>{
  applyTheme(e.target.value);
});
const savedTheme = localStorage.getItem('bh:theme') || 'dark';
themeSelect.value = savedTheme;
applyTheme(savedTheme);

// size slider
sizeRange.addEventListener('input', ()=>{
  sizeVal.textContent = sizeRange.value;
});

// streak logic
function loadStreak(){
  const data = JSON.parse(localStorage.getItem('bh:streak') || '{}');
  const last = data.lastClaim;
  streak = data.streak || 0;
  // if last claim was yesterday/earlier, keep streak; if more than 24h gap, reset (simple)
  if(last){
    const diff = Date.now() - (new Date(last)).getTime();
    if(diff > (48 * 3600 * 1000)){ // more than 48h break
      streak = 0;
    }
  }
  streakCountEl.textContent = streak;
}
function saveStreak(){
  localStorage.setItem('bh:streak', JSON.stringify({streak, lastClaim: new Date().toISOString()}));
}

// helper: random color
function randColor(){
  const pool = ['#ff7ab6','#a17cff','#6be4ff','#ffd16b','#ff9b6b','#8affb0'];
  return pool[Math.floor(Math.random()*pool.length)];
}

// SVG maker
function makeBadgeSVG(displayName, badgeType, shape, scalePct=100, bgColor='#0b5fff'){
  const date = new Date().toLocaleDateString();
  const s = Number(scalePct) / 100;
  // base card size scaled (720x360 base)
  const width = 720 * s;
  const height = 360 * s;
  const circleSize = 120 * s;
  // shape content: circle, square, hex
  let shapeSvg = '';
  if(shape === 'circle'){
    shapeSvg = <circle cx="${120*s}" cy="${180*s}" r="${circleSize/2}" fill="${bgColor}" />;
  } else if(shape === 'square'){
    const size = circleSize;
    shapeSvg = <rect x="${120*s - size/2}" y="${180*s - size/2}" width="${size}" height="${size}" rx="${size*0.12}" fill="${bgColor}" />;
  } else { // hex
    const r = circleSize/2;
    const cx = 120*s, cy = 180*s;
    const points = Array.from({length:6}).map((_,i)=>{
      const a = Math.PI/3*i - Math.PI/6;
      return ${cx + r*Math.cos(a)},${cy + r*Math.sin(a)};
    }).join(' ');
    shapeSvg = <polygon points="${points}" fill="${bgColor}" />;
  }

  // use template literal (multi-line)
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${720} ${360}">
    <defs>
      <filter id="soft">
        <feDropShadow dx="0" dy="8" stdDeviation="16" flood-opacity="0.12"/>
      </filter>
    </defs>
    <rect width="720" height="360" rx="24" fill="#0b0f14" />
    <rect x="24" y="24" width="672" height="312" rx="16" fill="#0f1720"/>
    <!-- circular/square/hex shape -->
    ${shapeSvg}
    <text x="${220}" y="${145}" font-size="${34}" fill="#fff" font-weight="800" font-family="Inter, system-ui, Arial">
      ${escapeXml(displayName)}
    </text>
    <text x="${220}" y="${190}" font-size="${22}" fill="#cfe0ff">${escapeXml(badgeType)}</text>
    <text x="${220}" y="${230}" font-size="${16}" fill="#9fbff0">${escapeXml(date)}</text>
  </svg>`.trim();

  return svg;
}

// small xml escape to keep safe
function escapeXml(str=''){
  return String(str||'').replace(/[&<>"']/g, function (s) {
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'})[s];
  });
}

// render svg into DOM
function renderSVG(svgString){
  currentSVGString = svgString;
  svgWrap.classList.remove('empty');
  svgWrap.innerHTML = svgString;
  // add animation (pop)
  const svgEl = svgWrap.querySelector('svg');
  if(svgEl){
    svgEl.classList.remove('pop');
    // force reflow then add
    void svgEl.offsetWidth;
    svgEl.classList.add('pop');
  }
}

// download helper
function downloadSVG(name='badge.svg'){
  if(!currentSVGString) return;
  const blob = new Blob([currentSVGString], {type: 'image/svg+xml;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a); a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 5000);
}

// copy caption
function copyCaption(text){
  navigator.clipboard?.writeText(text).then(()=>{}, ()=>{});
}

// share twitter (simple text only, images not attached)
function shareTwitter(text){
  const url = https://twitter.com/intent/tweet?text=${encodeURIComponent(text)};
  window.open(url,'_blank','noopener');
}

// farcaster share placeholder: we cannot POST to Farcaster from client w/o auth — provide a copied caption
function shareFarcaster(text){
  // copy to clipboard and open farcaster.com (user can paste)
  copyCaption(text);
  alert('Caption copied. Open your Farcaster app and paste to share. (Automated Farcaster posting requires auth.)');
}

// caption generator
function makeCaption(name,type){
  return I just earned a ${type} badge on BadgeHub 🎉 — ${name} #BadgeHub;
}

// load previous settings
function loadSettings(){
  sizeVal.textContent = sizeRange.value;
  const sTheme = localStorage.getItem('bh:theme') || 'dark';
  if(sTheme) themeSelect.value = sTheme;
}
loadSettings();
loadStreak();

// Claim button action
claimBtn.addEventListener('click', ()=>{
  const name = nameInput.value.trim() || 'Anonymous';
  const type = typeSelect.value;
  const shape = shapeSelect.value;
  const scale = sizeRange.value;
  const color = randomColor.checked ? randColor() : '#ff9b6b'; // fallback

  const svg = makeBadgeSVG(name, type, shape, scale, color);
  renderSVG(svg);

  // update streak
  streak = (parseInt(streak) || 0) + 1;
  streakCountEl.textContent = streak;
  saveStreak();

  const caption = makeCaption(name, type);
  captionPreview.textContent = caption;

  if(autoCopy.checked){
    copyCaption(caption);
  }
  if(autoDownload.checked){
    downloadSVG(${name.replace(/\s+/g,'_')}_${type.replace(/\s+/g,'_')}.svg);
  }
});

// download button
downloadBtn.addEventListener('click', ()=>{
  downloadSVG('badge.svg');
});

// copy caption
copyBtn.addEventListener('click', ()=>{
  const name = nameInput.value.trim() || 'Anonymous';
  const type = typeSelect.value;
  const text = makeCaption(name,type);
  copyCaption(text);
  captionPreview.textContent = 'Caption copied to clipboard ✔';
});

// share
shareBtn.addEventListener('click', ()=>{
  const name = nameInput.value.trim() || 'Anonymous';
  const type = typeSelect.value;
  const text = makeCaption(name,type);
  shareTwitter(text);
});
farcasterBtn.addEventListener('click', ()=>{
  const name = nameInput.value.trim() || 'Anonymous';
  const type = typeSelect.value;
  const text = makeCaption(name,type);
  shareFarcaster(text);
});

// Mint placeholder
mintBtn.addEventListener('click', ()=>{
  alert('Mint integration placeholder — requires API + wallet connection.');
});

// quick keyboard: press Enter to claim
nameInput.addEventListener('keydown', e=>{
  if(e.key === 'Enter'){ claimBtn.click();}
});

// load last known theme from localStorage already applied earlier

// If a saved SVG is in localStorage we could load it (optional) - not implemented by default.
