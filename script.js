// ========= DOM ELEMENTS =========
var nameInput = document.getElementById("name");
var typeSelect = document.getElementById("type");
var shapeSel = document.getElementById("shape");
var themeSel = document.getElementById("theme");
var claimBtn = document.getElementById("claim");
var badgeContainer = document.getElementById("badgeContainer");
var downloadBtn = document.getElementById("download");
var copyCaptionBtn = document.getElementById("copyCaption");
var shareBtn = document.getElementById("share");
var captionEl = document.getElementById("caption");
var toast = document.getElementById("toast");
var autoCopyChk = document.getElementById("autoCopy");
var autoDownloadChk = document.getElementById("autoDownload");
var randomColorChk = document.getElementById("randomColor");
var streakDisplay = document.getElementById("streakDisplay");
var svgwrap = document.getElementById("svgwrap");

// ========= THEME SETUP =========
function applyTheme(t){
  if(t==="default"){
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", t);
  }
  localStorage.setItem("bh_theme", t);
}
var savedTheme = localStorage.getItem("bh_theme") || "default";
themeSel.value = savedTheme;
applyTheme(savedTheme);
themeSel.addEventListener("change", ()=> applyTheme(themeSel.value));

// ========= STREAK LOGIC =========
function updateStreak(){
  var s = parseInt(localStorage.getItem("bh_streak")||"0",10);
  streakDisplay.textContent = "Streak: " + s + " 🔥";
}
function incrementStreak(){
  var today = new Date().toDateString();
  var last = localStorage.getItem("bh_last");
  var s = parseInt(localStorage.getItem("bh_streak")||"0",10);
  if(last !== today) s += 1;
  localStorage.setItem("bh_streak", s);
  localStorage.setItem("bh_last", today);
  updateStreak();
}
updateStreak();

// ========= ESCAPE XML =========
function escapeXml(s){
  return String(s).replace(/&/g,"&amp;")
                  .replace(/</g,"&lt;")
                  .replace(/>/g,"&gt;");
}

// ========= RANDOM COLORS =========
function randomColor(){
  var h = Math.floor(Math.random()*360);
  return "hsl(" + h + ",70%,70%)";
}

// ========= SVG BUILDER =========
function makeSVG(name,type,bg,ac,shape){
  var date = new Date().toLocaleDateString();
  var svg = "";
  svg += '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="360">';
  svg += '<rect width="720" height="360" rx="20" fill="#ffffff"/>';
  svg += '<rect x="24" y="24" width="672" height="312" rx="16" fill="'+bg+'"/>';

  if(shape==="circle"){
    svg += '<circle cx="120" cy="180" r="72" fill="'+ac+'"/>';
  }
  else if(shape==="shield"){
    svg += '<path d="M120 80 L180 140 L180 240 Q120 300 60 240 L60 140 Z" fill="'+ac+'"/>';
  }
  else if(shape==="ribbon"){
    svg += '<rect x="36" y="46" width="200" height="110" rx="12" fill="'+ac+'"/>';
    svg += '<path d="M36 156 L76 190 L116 156 Z" fill="'+ac+'"/>';
  }
  else if(shape==="hex"){
    svg += '<polygon points="120,108 170,138 170,222 120,252 70,222 70,138" fill="'+ac+'"/>';
  }

  svg += '<text x="220" y="145" font-size="34" fill="#ffffff" font-weight="700">'+escapeXml(name)+'</text>';
  svg += '<text x="220" y="190" font-size="22" fill="#ffffff">'+escapeXml(type)+'</text>';
  svg += '<text x="220" y="230" font-size="16" fill="#e6efff">'+escapeXml(date)+'</text>';

  svg += '</svg>';
  return svg;
}

// ========= TOAST =========
function showToast(t){
  toast.textContent = t;
  toast.classList.add("show");
  setTimeout(()=> toast.classList.remove("show"),1500);
}

// ========= CAPTION =========
function buildCaption(n,t){
  return "🏅 " + n + " — " + t + " badge earned! #BadgeHub";
}

// ========= DOWNLOAD SVG =========
function downloadSvg(text,name){
  var blob = new Blob([text],{type:"image/svg+xml"});
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url; 
  a.download=name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ========= CLAIM BADGE =========
claimBtn.addEventListener("click", function(){
  var name = nameInput.value || "User";
  var type = typeSelect.value || "Daily Check-in";

  var bg = randomColorChk.checked ? randomColor() : "#0b5fff";
  var ac = randomColorChk.checked ? randomColor() : "#ffd166";

  var svg = makeSVG(name,type,bg,ac,shapeSel.value);

  badgeContainer.innerHTML = svg;
  captionEl.textContent = buildCaption(name,type);

  incrementStreak();

  if(autoCopyChk.checked){
    navigator.clipboard.writeText(captionEl.textContent);
  }
  if(autoDownloadChk.checked){
    downloadSvg(svg,"badge.svg");
  }

  // Animation
  svgwrap.classList.remove("pop");
  void svgwrap.offsetWidth;
  svgwrap.classList.add("pop");

  showToast("Badge Ready!");
});

// ========= COPY CAPTION =========
copyCaptionBtn.addEventListener("click", ()=> {
  navigator.clipboard.writeText(captionEl.textContent);
  showToast("Caption Copied!");
});

// ========= DOWNLOAD =========
downloadBtn.addEventListener("click", ()=>{
  var svg = badgeContainer.querySelector("svg");
  if(svg) downloadSvg(svg.outerHTML,"badge.svg");
});

// ========= SHARE TO FARCASTER =========
shareBtn.addEventListener("click", ()=>{
  var text = captionEl.textContent || "";
  var url = "https://warpcast.com/~/compose?text=" + encodeURIComponent(text);
  window.open(url, "_blank");
});
