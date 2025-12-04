console.log("script.js loaded");

// Escape text safely
function escapeXML(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

// Generate SVG badge
function makeBadgeSVG(name, type) {
    const date = new Date().toLocaleDateString();
    const bg = "#ffb5ff";
    const accent = "#ff9966";

    // SVG as plain string (NO BACKTICKS)
    let svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="360" viewBox="0 0 720 360">' +
        '<rect width="720" height="360" rx="24" fill="#ffffff"/>' +
        '<rect x="24" y="24" width="672" height="312" rx="16" fill="' + bg + '"/>' +
        '<circle cx="120" cy="180" r="72" fill="' + accent + '"/>' +
        '<text x="220" y="145" font-size="34" fill="#fff" font-weight="700">' + escapeXML(name) + '</text>' +
        '<text x="220" y="190" font-size="24" fill="#fff">' + escapeXML(type) + '</text>' +
        '<text x="220" y="230" font-size="16" fill="#ffe0ff">' + escapeXML(date) + '</text>' +
        '</svg>';

    return svg;
}

// DOM
const claimBtn = document.getElementById("claim");
const nameInput = document.getElementById("name");
const typeSelect = document.getElementById("type");
const svgwrap = document.getElementById("svgwrap");

// Claim button click
claimBtn.addEventListener("click", () => {
    const name = nameInput.value.trim() || "User";
    const type = typeSelect.value || "Daily Check-in";

    const svg = makeBadgeSVG(name, type);

    // Put SVG into wrapper
    svgwrap.innerHTML = svg;

    // POP ANIMATION
    const badge = svgwrap.querySelector("svg");
    if (badge) {
        badge.classList.add("popped");
        setTimeout(() => badge.classList.remove("popped"), 220);
    }
});
