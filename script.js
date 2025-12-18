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

// ===== CONNECT WALLET =====
connectBtn.onclick = async () => {
  if (!window.ethereum) {
    alert("MetaMask not installed");
    return;
  }

  try {
    // 👉 THIS ALWAYS TRIGGERS METAMASK POPUP
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

    statusBox.innerText = "Connected: " + address.slice(0, 6) + "..." + address.slice(-4);
    claimBtn.disabled = false;

  } catch (err) {
    console.error(err);
    statusBox.innerText = "Wallet connection failed";
  }
};

// ===== CLAIM BADGE =====
claimBtn.onclick = async () => {
  if (!contract) return;

  try {
    statusBox.innerText = "Minting badge...";
    const tx = await contract.claimBadge();
    await tx.wait();

    statusBox.innerText = "✅ Badge claimed successfully";

  } catch (err) {
    console.error(err);
    statusBox.innerText = "❌ Transaction failed";
  }
};
