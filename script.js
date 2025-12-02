// Simple Badge Generator — no backend, pure frontend
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
  const svg = 
  <svg class="badge" xmlns="http://www.w3.org/2000/svg" width="720" height="360" viewBox="0 0 720 360">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="18" flood-opacity="0.12"/>
      </filter>
    </defs>
    <rect width="720" height="360" rx="24" fill="#ffffff" />
    <rect x="24" y="24" width="672" height="312" rx="16" fill="${bgColor}" filter="url(#shadow)"/>
    <circle cx="120" cy="180" r="72" fill="${accent}" />
    <text x="220" y="145" font-size="34" fill="#fff" font-family="Inter, system-ui" font-weight="700">${escapeXml(badgeType)}</text>
    <text x="220" y="190" font-size="24" fill="#e6f0ff" font-family="Inter, system-ui">${escapeXml(displayName)}</text>
    <text x="220" y="230" font-size="16" fill="#cfe0ff" font-family="Inter, system-ui">${escapeXml(date)}</text>
    <text x="520" y="320" font-size="12" fill="#d9e7ff" font-family="Inter, system-ui" text-anchor="end">BadgeHub · Farcaster</text>
  </svg>;
  return svg;
}

function escapeXml(unsafe) {
  return (unsafe + '').replace(/[<>&'"]/g, function (c) {
    return {
      '<':'&lt;', '>':'&gt;', '&':'&amp;', "'":'&apos;', '"':'&quot;'
    }[c];
  });
}

function svgToDataURL(svg) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function svgToPng(svg, width = 720, height = 360) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    };
    img.onerror = (e) => reject(e);
    img.src = svgToDataURL(svg);
  });
}

claimBtn.addEventListener('click', async () => {
  msg.innerText = '';
  const name = nameInput.value.trim() || 'Anonymous';
  const type = typeSelect.value;
  const svg = makeBadgeSVG(name, type);
  badgeContainer.innerHTML = svg;
  previewWrap.classList.remove('hidden');
  msg.innerText = 'Badge ready — download or copy caption to share.';

  try {
    const blob = await svgToPng(svg);
    const url = URL.createObjectURL(blob);
    downloadBtn.onclick = () => {
      const a = document.createElement('a');
      a.href = url;
      a.download = ${name.replace(/\s+/g,'_')}_${type.replace(/\s+/g,'_')}.png;
      a.click();
    };
    copyCaptionBtn.onclick = async () => {
      const caption = 🏅 ${type} badge earned!\n${name}\n#BadgeHub #Farcaster;
      try {
        await navigator.clipboard.writeText(caption);
        msg.innerText = 'Caption copied! Paste it into a Farcaster cast along with your image.';
      } catch(e) {
        msg.innerText = 'Couldn\'t copy automatically — select & copy the caption below:\n' + caption;
        console.log(e);
      }
    };
  } catch(e) {
    console.error(e);
    msg.innerText = 'Error preparing image. You can still screenshot the badge preview.';
  }
});
