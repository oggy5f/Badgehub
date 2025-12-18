// ===== CONFIG =====
const CONTRACT_ADDRESS = "0xD64a64a8741B1C998C197dCF227Bc1628Eb97b43";

const ABI = [
  {
    "inputs": [],
    "name": "claimBadge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// ===== HELPERS =====
function todayKey() {
  const d = new Date();
  return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
}

// ===== STATE =====
let provider;
let signer;
let contract;

// ===== UI =====
const connectBtn = document.getElementById("connectBtn");
const claimBtn = document.getElementById("claimBtn");
const statusBox = document.getElementById("status");

// ===== DEFAULT UI STATE + CLAIM CHECK =====
document.addEventListener("DOMContentLoaded", () => {
  connectBtn.disabled = false;
  claimBtn.disabled = true;

  const claimedDate = localStorage.getItem("badgehub_claimed");

  if (claimedDate === todayKey()) {
    statusBox.innerText = "✅ Badge already claimed today";
    statusBox.style.color = "#4ade80";
    statusBox.className = "status-success";

    claimBtn.innerText = "Badge Claimed Today";
    claimBtn.disabled = true;
    claimBtn.style.opacity = "0.5";
    claimBtn.style.cursor = "not-allowed";
  } else {
    statusBox.innerText = "Not connected";
    statusBox.className = "status-idle";
  }
});

// ===== CONNECT WALLET =====
connectBtn.onclick = async () => {
  if (!window.ethereum) {
    alert("MetaMask not installed");
    return;
  }

  try {
    connectBtn.disabled = true;
    statusBox.innerText = "Connecting wallet...";
    statusBox.className = "status-idle";

    await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    const address = await signer.getAddress();

    contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      ABI,
      signer
    );

    statusBox.innerText =
      "Connected: " + address.slice(0, 6) + "..." + address.slice(-4);
    statusBox.style.color = "#4ade80";
    statusBox.className = "status-success";

    // Enable claim only if not claimed today
    if (localStorage.getItem("badgehub_claimed") !== todayKey()) {
      claimBtn.disabled = false;
    }

    connectBtn.innerText = "Wallet Connected";
    connectBtn.style.opacity = "0.6";

  } catch (err) {
    console.error(err);
    statusBox.innerText = "Wallet connection failed";
    statusBox.className = "status-error";
    connectBtn.disabled = false;
  }
};

// ===== CLAIM BADGE =====
claimBtn.onclick = async () => {
  if (!contract) return;

  try {
    claimBtn.disabled = true;
    statusBox.innerText = "Minting badge...";
    statusBox.className = "status-idle";

    const tx = await contract.claimBadge();
    await tx.wait();

    // ✅ SAVE CLAIM STATE (IMPORTANT)
    localStorage.setItem("badgehub_claimed", todayKey());

    statusBox.innerText = "✅ Badge claimed today";
    statusBox.style.color = "#4ade80";
    statusBox.className = "status-success";

    claimBtn.innerText = "Badge Claimed Today";
    claimBtn.disabled = true;
    claimBtn.style.opacity = "0.5";
    claimBtn.style.cursor = "not-allowed";

  } catch (err) {
    console.error(err);
    statusBox.innerText = "❌ Transaction failed";
    statusBox.className = "status-error";
    claimBtn.disabled = false;
  }
};
