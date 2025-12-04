// helpers
var $ = function(id){ return document.getElementById(id); };

var nameInput = $("name"),
    typeSelect = $("type"),
    shapeSel = $("shape"),
    themeSel = $("theme"),
    claimBtn = $("claim"),
    badgeContainer = $("badgeContainer"),
    downloadBtn = $("download"),
    copyCaptionBtn = $("copyCaption"),
    shareBtn = $("share"),
    captionEl = $("caption"),
    toast = $("toast"),
    autoCopyChk = $("autoCopy"),
    autoDownloadChk = $("autoDownload"),
    randomColorChk = $("randomColor"),
    streakDisplay = $("streakDisplay");

// localStorage keys
var LS_THEME = "bh_theme";
var LS_STREAK = "bh_streak";
var LS_LAST = "bh_last";

// escape helper
function escapeXml(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

// theme
function applyTheme(t){
  if(t==="default") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", t);
  localStorage.setItem(LS_THEME, t);
}
var savedTheme = localStorage.getItem(LS_THEME) || "default";
themeSel.value = savedTheme;
applyTheme(savedTheme);
themeSel.addEventListener("change", ()=> applyTheme(themeSel.value));

// streak
function updateStreak(){
  var s = parseInt(localStorage.getItem(LS_STREAK)||"0",10);
  streakDisplay.textContent = "Streak: "+s+" 🔥";
}
function incrementStreak(){
  var now = new Date().toDateString();
  var last = localStorage.getItem(LS_LAST);
  var s = parseInt(localStorage.getItem(LS_STREAK)||"0",10);
  if(last !== now) s += 1;
  localStorage.setItem(LS_STREAK, s);
  localStorage.setItem(LS_LAST, now);
  updateStreak();
}
updateStreak();

// random color
function randomColor(){
  var h = Math.floor(Math.random()*360);
  return "hsl("+h+",70%,70%)";
}

// SVG generator (no backticks)
function makeSVG(name,type,bg,ac,shape){
  var date = new Date().toLocaleDateString();
  var svg = "";
  svg += '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="360">';
  svg += '<rect width="720" height="360" rx="20" fill="#ffffff"/>';
  svg += '<rect x="24" y="24" width="672" height="312" rx="16" fill="'+bg+'"/>';

  if(shape==="circle"){
    svg += '<circle cx="120" cy="180" r="72" fill="'+ac+'"/>';
  } else if(shape==="shield"){
    svg += '<path d="M120 80 L180 140 L180 240 Q120 300 60 240 L60 140 Z" fill="'+ac+'"/>';
  } else if(shape==="ribbon"){
    svg += '<rect x="36" y="46" width="200" height="110" rx="12" fill="'+ac+'"/>';
    svg += '<path d="M36 156 L76 190 L116 156 Z" fill="'+ac+'"/>';
  } else if(shape==="hex"){
    svg += '<polygon points="120,108 170,138 170,222 120,252 70,222 70,138" fill="'+ac+'"/>';
  }

  svg += '<text x="220" y="145" font-size="34" fill="#ffffff" font-weight="700">'+escapeXml(name)+'</text>';
  svg += '<text x="220" y="190" font-size="22" fill="#ffffff">'+escapeXml(type)+'</text>';
  svg += '<text x="220" y="230" font-size="16" fill="#e6efff">'+escapeXml(date)+'</text>';

  svg += '</svg>';
  return svg;
}

// toast
function showToast(t){
  toast.textContent = t;
  toast.style.display = "block";
  setTimeout(()=> toast.style.display="none", 1500);
}

// caption
function buildCaption(n,t){
  return "🏅 "+n+" — "+t+" badge earned! #BadgeHub";
}

// download
function downloadSvg(txt,name){
  var blob = new Blob([txt],{type:"image/svg+xml"});
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href=url; a.download=name; document.body.appendChild(a);
  a.click(); a.remove();
  URL.revokeObjectURL(url);
}

// claim
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

  showToast("Badge Ready!");
});

// copy caption
copyCaptionBtn.addEventListener("click", ()=> {
  navigator.clipboard.writeText(captionEl.textContent);
  showToast("Copied!");
});

// download
downloadBtn.addEventListener("click", ()=>{
  var svg = badgeContainer.querySelector("svg");
  if(svg) downloadSvg(svg.outerHTML,"badge.svg");
});

// FARCASTER SHARE
shareBtn.addEventListener("click",()=>{
  var text = captionEl.textContent || "";
  var url = "https://warpcast.com/~/compose?text="+encodeURIComponent(text);
  window.open(url,"_blank");
});
