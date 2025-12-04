// simple helper
const $ = (id) => document.getElementById(id);

// SVG maker (returns an SVG string)
function makeBadgeSVG(displayName = 'Anonymous', badgeType = 'Daily Check-in') {
  const date = new Date().toLocaleDateString();
  const bg = '#f6d6f0';
  const accent = '#f6a26b';
  const textColor = '#ffffff';

  return `
  <svg class="badge" xmlns="http://www.w3.org/2000/svg" width="720" height="360" viewBox="0 0 720 360">
    <rect width="720" height="360" rx="24" fill="#0f1720" />
    <rect x="16" y="16" width="688" height="328" rx="20" fill="${bg}" />
    <circle cx="120" cy="120" r="48" fill="${accent}" />
    <text x="260" y="150" font-size="48" fill="${textColor}" font-weight="700" font-family="Inter, system-ui, Arial, Helvetica, sans-serif">${escapeXml(displayName)}</text>
    <text x="260" y="200" font-size="20" fill="#fff" opacity="0.9">${escapeXml(badgeType)}</text>
    <text x="260" y="230" font-size="14" fill="#fff" opacity="0.7">${escapeXml(date)}</text>
  </svg>
  `.trim();
}

// simple XML escape helper
function escapeXml(str='') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Insert SVG into page and trigger animation
function showBadge(displayName, badgeType) {
  const wrapper = $('svgwrap');
  wrapper.innerHTML = makeBadgeSVG(displayName, badgeType);

  // get svg element we just inserted
  const svg = wrapper.querySelector('svg');
  if (!svg) return;

  // ensure no leftover class
  svg.classList.remove('anim-pop');

  // force reflow so animation will run when we add class
  // (reading offsetWidth triggers reflow)
  void svg.offsetWidth;

  // add class -> animation starts
  svg.classList.add('anim-pop');

  // remove the class after animation to allow replay next time
  svg.addEventListener('animationend', () => {
    svg.classList.remove('anim-pop');
  }, { once: true });
}

// UI binding
if ($('claim')) {
  $('claim').addEventListener('click', () => {
    const name = $('name').value.trim() || 'Anonymous';
    const type = $('type').value || 'Daily Check-in';
    showBadge(name, type);
  });
}
