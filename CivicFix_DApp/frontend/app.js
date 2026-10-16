/* CivicFix frontend. Set CONTRACT_ADDRESS and CONTRACT_ABI after deploying in Remix. */
const CONTRACT_ADDRESS = "0x1744D1C44E4245fd70E1deA560Aed05AD88f8243"; // Paste deployed contract address here.
const CONTRACT_ABI = [
  "function administrator() view returns (address)",
  "function complaintCount() view returns (uint256)",
  "function getComplaint(uint256) view returns (tuple(uint256 id,address reporter,string category,string description,string location,uint8 status,uint256 createdAt,uint256 updatedAt))",
  "function getComplaintIds() view returns (uint256[])",
  "function getStatusHistory(uint256) view returns (tuple(uint8 status,address updatedBy,uint256 timestamp,string note)[])",
  "function submitComplaint(string,string,string) returns (uint256)",
  "function updateComplaintStatus(uint256,uint8,string)",
  "event ComplaintSubmitted(uint256 indexed complaintId,address indexed reporter,string category,string location,uint256 timestamp)",
  "event ComplaintStatusUpdated(uint256 indexed complaintId,uint8 oldStatus,uint8 newStatus,address indexed updatedBy,string note,uint256 timestamp)"
];
const STATUS = ["Submitted", "In progress", "Resolved", "Rejected"];
let provider, signer, contract, currentAccount, isAdmin = false, cachedComplaints = [];
const $ = (id) => document.getElementById(id);

function toast(message, error = false) {
  const el = $("toast");
  el.textContent = message;
  el.style.background = error ? "#8e302c" : "#183b2c";
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 4300);
}
function shortAddress(address) { return address ? `${address.slice(0,6)}…${address.slice(-4)}` : "Unknown"; }
function dateText(seconds) {
  const date = new Date(Number(seconds) * 1000);
  return Number.isNaN(date.getTime()) ? "Unknown time" : date.toLocaleString();
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));
}
function setConnectedUI(connected) {
  $("connectBtn").textContent = connected ? shortAddress(currentAccount) : "Connect MetaMask";
  $("networkLabel").textContent = connected ? "Wallet connected" : "Not connected";
}
async function connectWallet() {
  if (!window.ethereum) {
    toast("MetaMask was not detected. Install the MetaMask browser extension first.", true);
    return;
  }
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (!accounts.length) throw new Error("No wallet account was returned.");
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    currentAccount = accounts[0];
    setConnectedUI(true);
    if (!CONTRACT_ADDRESS || !ethers.isAddress(CONTRACT_ADDRESS)) {
      $("adminNotice").textContent = "Wallet connected. Add the deployed contract address in frontend/app.js to enable contract actions.";
      toast("Wallet connected. Configure the contract address in app.js.");
      return;
    }
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const network = await provider.getNetwork();
    $("networkLabel").textContent = `Chain ID ${network.chainId}`;
    const admin = await contract.administrator();
    isAdmin = admin.toLowerCase() === currentAccount.toLowerCase();
    $("adminNotice").textContent = isAdmin
      ? `Administrator wallet verified: ${shortAddress(currentAccount)}. Status updates are enabled.`
      : `Connected as ${shortAddress(currentAccount)}. Only ${shortAddress(admin)} can update statuses.`;
    await loadComplaints();
    toast("Wallet connected successfully.");
  } catch (err) {
    toast(readError(err), true);
  }
}
function readError(err) {
  const message = err?.shortMessage || err?.reason || err?.message || "Unknown error";
  if (message.includes("user rejected") || message.includes("ACTION_REJECTED")) return "Transaction was rejected in MetaMask.";
  if (message.includes("Only administrator")) return "Unauthorized: only the contract administrator can update status.";
  if (message.includes("Description must be")) return "Description must contain 10–500 characters.";
  if (message.includes("Invalid category")) return "Choose a valid category.";
  if (message.includes("Invalid location")) return "Enter a location of 1–100 characters.";
  return message.length > 220 ? message.slice(0, 220) + "…" : message;
}
async function loadComplaints() {
  if (!contract) {
    $("complaintList").innerHTML = '<div class="empty">Connect MetaMask and configure the deployed contract to view reports.</div>';
    return;
  }
  try {
    const ids = await contract.getComplaintIds();
    cachedComplaints = [];
    for (const id of ids) cachedComplaints.push(await contract.getComplaint(id));
    cachedComplaints.reverse();
    $("totalCount").textContent = cachedComplaints.length;
    $("progressCount").textContent = cachedComplaints.filter(c => Number(c.status) === 1).length;
    $("resolvedCount").textContent = cachedComplaints.filter(c => Number(c.status) === 2).length;
    renderComplaints();
  } catch (err) { toast("Could not load records: " + readError(err), true); }
}
function renderComplaints() {
  const query = $("searchInput").value.trim().toLowerCase();
  const status = $("statusFilter").value;
  const visible = cachedComplaints.filter(c =>
    (status === "all" || Number(c.status) === Number(status)) &&
    `${c.category} ${c.location} ${c.description} ${c.id}`.toLowerCase().includes(query)
  );
  if (!visible.length) {
    $("complaintList").innerHTML = '<div class="empty">No reports match this filter yet.</div>';
    return;
  }
  $("complaintList").innerHTML = visible.map(c => {
    const s = Number(c.status), id = c.id.toString();
    return `<article class="complaint-card">
      <div class="complaint-top"><div><p class="complaint-title">#${escapeHtml(id)} · ${escapeHtml(c.category)}</p><div class="complaint-meta">${escapeHtml(c.location)}<br>Reported by ${escapeHtml(shortAddress(c.reporter))} · ${escapeHtml(dateText(c.createdAt))}</div></div>
      <span class="status status-${s}">${STATUS[s]}</span></div>
      <p class="complaint-description">${escapeHtml(c.description)}</p>
      <div class="card-foot"><span class="complaint-meta">Updated ${escapeHtml(dateText(c.updatedAt))}</span><button class="tiny-button" data-history="${escapeHtml(id)}">View history →</button></div>
    </article>`;
  }).join("");
  document.querySelectorAll("[data-history]").forEach(btn => btn.addEventListener("click", () => {
    $("historyId").value = btn.dataset.history;
    showHistory(Number(btn.dataset.history));
    $("historyList").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }));
}
$("connectBtn").addEventListener("click", connectWallet);
$("refreshBtn").addEventListener("click", loadComplaints);
$("searchInput").addEventListener("input", renderComplaints);
$("statusFilter").addEventListener("change", renderComplaints);

$("complaintForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!contract) return toast("Connect MetaMask and configure the contract address first.", true);
  const category = $("category").value.trim();
  const location = $("location").value.trim();
  const description = $("description").value.trim();
  if (description.length < 10 || description.length > 500) return toast("Description must contain 10–500 characters.", true);
  if (!category || !location || location.length > 100) return toast("Enter a category and a location of at most 100 characters.", true);
  try {
    const tx = await contract.submitComplaint(category, description, location);
    toast("Transaction submitted. Waiting for confirmation…");
    await tx.wait();
    $("complaintForm").reset();
    await loadComplaints();
    toast("Complaint recorded on-chain successfully.");
  } catch (err) { toast(readError(err), true); }
});

$("adminForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!contract) return toast("Connect MetaMask and configure the contract address first.", true);
  const id = $("adminId").value;
  const status = Number($("newStatus").value);
  const note = $("adminNote").value.trim();
  if (!id || Number(id) < 1) return toast("Enter a valid report ID.", true);
  try {
    // The contract enforces admin-only access; the frontend check is only a usability aid.
    if (!isAdmin) return toast("Unauthorized: connect the wallet that deployed the contract.", true);
    const tx = await contract.updateComplaintStatus(id, status, note);
    toast("Status update submitted. Waiting for confirmation…");
    await tx.wait();
    $("adminForm").reset();
    await loadComplaints();
    toast("Complaint status updated on-chain.");
  } catch (err) { toast(readError(err), true); }
});

$("historyForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = Number($("historyId").value);
  if (!contract) return toast("Connect MetaMask and configure the contract address first.", true);
  if (!Number.isInteger(id) || id < 1) return toast("Enter a valid report ID.", true);
  await showHistory(id);
});

async function showHistory(id) {
  try {
    const entries = await contract.getStatusHistory(id);
    $("historyList").innerHTML = entries.map(entry => {
      const s = Number(entry.status);
      return `<div class="history-item"><span class="timeline-dot"></span><div><strong>${STATUS[s]}</strong><p>${escapeHtml(entry.note || "No note")}<br>${escapeHtml(dateText(entry.timestamp))} · ${escapeHtml(shortAddress(entry.updatedBy))}</p></div></div>`;
    }).join("") || '<p class="muted">No history available.</p>';
  } catch (err) {
    $("historyList").innerHTML = `<p class="muted">${escapeHtml(readError(err))}</p>`;
    toast("Could not retrieve history: " + readError(err), true);
  }
}

if (window.ethereum) {
  window.ethereum.on("accountsChanged", () => { currentAccount = null; contract = null; signer = null; provider = null; isAdmin = false; setConnectedUI(false); $("adminNotice").textContent = "Wallet changed. Reconnect to continue."; });
  window.ethereum.on("chainChanged", () => window.location.reload());
}
