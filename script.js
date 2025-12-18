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

// ===== STATE =====
let provider;
let signer;
let contract;

// ===== UI =====
const connectBtn = document.getElementById("connectBtn");
const claimBtn = document.getElementById("claimBtn");
const statusBox = document.getElementById("status");

// ===== DEFAULT UI STATE (STEP 1A + STEP 2B PART 1) =====
document.addEventListener("DOMContentLoaded", () => {
  connectBtn.disabled = false;
  claimBtn.disabled = true;

  statusBox.innerText = "Not connected";
  statusBox.className = "status-idle"; // 👈 GRAY STATUS
});

// ===== CONNECT WALLET (STEP 1B) =====
connectBtn.onclick = async () => {
  if (!window.ethereum) {
    alert("MetaMask not installed");
    return;
  }

  try {
    connectBtn.disabled = true;
    statusBox.innerText = "Connecting wallet...";

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


    claimBtn.disabled = false;
    connectBtn.innerText = "Wallet Connected";
    connectBtn.style.opacity = "0.6";

  } catch (err) {
    console.error(err);
    statusBox.innerText = "Wallet connection failed";
    connectBtn.disabled = false;
  }
};

// ===== CLAIM BADGE =====
claimBtn.onclick = async () => {
  if (!contract) return;

  try {
    claimBtn.disabled = true;
    statusBox.innerText = "Minting badge...";

    const tx = await contract.claimBadge();
    await tx.wait();

    statusBox.innerText = "✅ Badge claimed successfully";
    claimBtn.innerText = "Badge Claimed";
    claimBtn.style.opacity = "0.6";

  } catch (err) {
    console.error(err);
    statusBox.innerText = "❌ Transaction failed";
    claimBtn.disabled = false;
  }
};
