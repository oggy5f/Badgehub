console.log("script.js loaded");

const CONTRACT_ADDRESS = "0xD64a64a8741B1C998C197dCF227Bc1628Eb97b43";

const ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "streak", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "totalClaims", "type": "uint256" }
    ],
    "name": "BadgeClaimed",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "claimBadge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "getUser",
    "outputs": [
      { "internalType": "uint256", "name": "last", "type": "uint256" },
      { "internalType": "uint256", "name": "streak", "type": "uint256" },
      { "internalType": "uint256", "name": "total", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

let provider = null;
let signer = null;
let contract = null;
let userAddress = null;

function showError(msg) {
  document.getElementById("errBox").innerText = msg;
}

async function init() {
  try {
    if (!window.ethereum) {
      showError("MetaMask not installed.");
      return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    document.getElementById("connStatus").innerText = "Connected";
    document.getElementById("userAddr").innerText = userAddress;

    refreshUI();

  } catch (err) {
    console.error(err);
    showError("Error initializing provider: " + err.message);
  }
}

async function refreshUI() {
  try {
    const data = await contract.getUser(userAddress);
    console.log("User data:", data);

    document.getElementById("lastClaim").innerText =
      data.last > 0 ? new Date(data.last * 1000).toLocaleString() : "-";

  } catch (err) {
    console.error(err);
    showError("Unable to fetch onchain data.");
  }
}

async function claimBadge() {
  try {
    showError("");

    const tx = await contract.claimBadge();
    await tx.wait();

    alert("Badge claimed successfully!");

    refreshUI();

  } catch (err) {
    console.error(err);
    showError("Error claiming badge: " + err.message);
  }
}

document.getElementById("connectBtn").onclick = async () => {
  try {
    await ethereum.request({ method: "eth_requestAccounts" });
    init();
  } catch (err) {
    showError("Wallet connection failed.");
  }
};

document.getElementById("refreshBtn").onclick = refreshUI;
document.getElementById("claimBtn").onclick = claimBadge;

document.getElementById("svgBtn").onclick = () => {
  const svg = `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="200" fill="#ffaa00"></rect>
    <text x="50%" y="50%" fill="black" font-size="20" text-anchor="middle">Badgehub Badge</text>
  </svg>`;

  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "badge.svg";
  a.click();
};
