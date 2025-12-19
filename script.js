// ===== FARCASTER CONTEXT (AUTO CONNECT) =====
let farcasterContext = null;

(async () => {
  try {
    if (window.farcaster?.sdk) {
      farcasterContext = await window.farcaster.sdk.getContext();
      console.log("Farcaster context:", farcasterContext);

      // Agar Farcaster ke andar ho → Connect button hide
      const connectBtn = document.getElementById("connectBtn");
      if (connectBtn) connectBtn.style.display = "none";

      // Farcaster wallet auto-setup
      if (farcasterContext?.wallet) {
        setupWithInjectedWallet();
      }
    } else {
      console.log("Not inside Farcaster");
    }
  } catch (e) {
    console.error("Farcaster context error", e);
  }
})();

// ===== CONFIG =====
const CONTRACT_ADDRESS = "0x5be06071239D6b39764D238F7cB7382c02ac5249";

// ✅ CORRECT ABI (tokenURI required)
const ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "tokenURI",
        "type": "string"
      }
    ],
    "name": "claimBadge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// ✅ IPFS METADATA URI (FINAL)
const TOKEN_URI =
  "ipfs://bafybeifie26xdk3bu7pggtxkpxweuuahrr6u3f3snzav27ppahwjvriz5q";

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

// ===== DEFAULT UI STATE =====
document.addEventListener("DOMContentLoaded", () => {
  connectBtn.disabled = false;
  claimBtn.disabled = true;

  if (localStorage.getItem("badgehub_claimed") === todayKey()) {
    statusBox.innerText = "✅ Badge already claimed today";
    statusBox.className = "status-success";

    claimBtn.innerText = "Badge Claimed Today";
    claimBtn.disabled = true;
    claimBtn.style.opacity = "0.5";
  } else {
    statusBox.innerText = "Not connected";
    statusBox.className = "status-idle";
  }
});

// ===== SETUP (Shared for MetaMask + Farcaster) =====
async function setupWithInjectedWallet() {
  provider = new ethers.providers.Web3Provider(window.ethereum);

  const network = await provider.getNetwork();
  if (network.chainId !== 8453) {
    statusBox.innerText = "❌ Switch to Base Mainnet";
    statusBox.className = "status-error";
    return;
  }

  signer = provider.getSigner();
  const address = await signer.getAddress();

  contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  statusBox.innerText =
    "Connected: " + address.slice(0, 6) + "..." + address.slice(-4);
  statusBox.className = "status-success";

  if (localStorage.getItem("badgehub_claimed") !== todayKey()) {
    claimBtn.disabled = false;
  }
}

// ===== CONNECT WALLET (BROWSER ONLY) =====
connectBtn.onclick = async () => {
  if (!window.ethereum) {
    alert("MetaMask not installed");
    return;
  }

  try {
    connectBtn.disabled = true;
    statusBox.innerText = "Connecting wallet...";

    await window.ethereum.request({ method: "eth_requestAccounts" });
    await setupWithInjectedWallet();

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

    // ✅ FINAL mint call
    const tx = await contract.claimBadge(TOKEN_URI);
    await tx.wait();

    localStorage.setItem("badgehub_claimed", todayKey());

    statusBox.innerText = "✅ Badge claimed today";
    statusBox.className = "status-success";

    claimBtn.innerText = "Badge Claimed Today";
    claimBtn.disabled = true;
    claimBtn.style.opacity = "0.5";

  } catch (err) {
    console.error(err);
    statusBox.innerText = "❌ Transaction failed";
    claimBtn.disabled = false;
  }
};
