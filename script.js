// ===== CONFIG =====
const CONTRACT_ADDRESS = "0x5be06071239D6b39764D238F7cB7382c02ac5249";

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

function generateMetadata(userAddress) {
  const today = todayKey();

  const metadata = {
    name: "Badgehub Daily Badge",
    description: "Daily onchain badge claimed on Base",
    image: "https://placehold.co/600x600/0f172a/4ade80?text=Badgehub+Badge",

    // ✅ STEP 2A – improvement
    external_url: "https://oggy5f.github.io/base-mini-app/",
    background_color: "0f172a",

    attributes: [
      {
        trait_type: "Date",
        value: today
      },
      {
        trait_type: "Claimer",
        value: userAddress
      },
      {
        trait_type: "Network",
        value: "Base"
      }
    ]
  };

  return "data:application/json;base64," + btoa(JSON.stringify(metadata));
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

  const claimedDate = localStorage.getItem("badgehub_claimed");

  if (claimedDate === todayKey()) {
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

// ===== CONNECT WALLET =====
connectBtn.onclick = async () => {
  if (!window.ethereum) {
    alert("MetaMask not installed");
    return;
  }

  try {
    connectBtn.disabled = true;
    statusBox.innerText = "Connecting wallet...";

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    const network = await provider.getNetwork();
    if (network.chainId !== 8453) {
      alert("Please switch to Base Mainnet");
      connectBtn.disabled = false;
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

    const userAddress = await signer.getAddress();
    const tokenURI = generateMetadata(userAddress);

    const tx = await contract.claimBadge();
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
