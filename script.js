// SVG maker (returns SVG string using template literal)
function makeBadgeSVG(displayName, badgeType) {
  const date = new Date().toLocaleDateString();
  const bgColor = '#0b5fff';
  const accent = '#ffd166';

  // small helper: escape user text so it can't break SVG/HTML
  function escapeXml(str = '') {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Return SVG as a template literal (notice the backticks around the whole SVG)
  return 
<svg class="badge" xmlns="http://www.w3.org/2000/svg" width="720" height="360" viewBox="0 0 720 360">
  <title>Badge for ${escapeXml(displayName)}</title>
  <rect width="720" height="360" rx="24" fill="#ffffff" />
  <rect x="24" y="24" width="672" height="312" rx="16" fill="${bgColor}" />
  <circle cx="120" cy="180" r="72" fill="${accent}" />
  <text x="220" y="145" font-size="34" fill="#fff" font-weight="700" font-family="Inter, system-ui, Arial, Helvetica, sans-serif">${escapeXml(displayName)}</text>
  <text x="220" y="190" font-size="24" fill="#fff">${escapeXml(badgeType)}</text>
  <text x="220" y="230" font-size="16" fill="#cfe0ff">${escapeXml(date)}</text>
</svg>.trim();
}
