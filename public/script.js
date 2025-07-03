const base = 'http://localhost:5000';
const username = localStorage.getItem("username");

document.getElementById("user-name").innerText = username;

// Logout
document.getElementById("logout-btn").onclick = () => {
  localStorage.clear();
  alert("✅ Logged out successfully!");
  window.location.href = "index.html";
};

// Toast function
function showToast(msg, color = "#28a745") {
  const toast = document.createElement("div");
  toast.innerText = msg;
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.background = color;
  toast.style.color = "white";
  toast.style.padding = "10px 20px";
  toast.style.borderRadius = "5px";
  toast.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

// Add Debt
document.getElementById("debt-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const type = document.getElementById("type").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const reason = document.getElementById("reason").value;

  const lender = type === "lent" ? username : name;
  const borrower = type === "lent" ? name : username;

  const res = await fetch(`${base}/api/debt/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lender, borrower, amount, reason })
  });

  const data = await res.json();
  if (data.msg) {
    loadDebts();
    e.target.reset();
    showToast("Debt added!");
  }
});

// Load Debts with Filter
async function loadDebts() {
  const filter = document.getElementById("filter-type").value;
  const res = await fetch(`${base}/api/debt/${username}`);
  const debts = await res.json();

  let totalLent = 0;
  let totalBorrowed = 0;
  const list = document.getElementById("debt-list");
  list.innerHTML = "";

  debts
    .filter(d => {
      if (filter === "lent") return d.lender === username;
      if (filter === "borrowed") return d.borrower === username;
      return true;
    })
    .forEach(d => {
      const li = document.createElement("li");
      if (d.lender === username) totalLent += d.amount;
      if (d.borrower === username) totalBorrowed += d.amount;

      li.innerHTML = `
        <b>${d.lender}</b> → <b>${d.borrower}</b> ₹${d.amount}
        <br>📝 ${d.reason || "No reason"}
        <br>🕒 ${new Date(d.time).toLocaleString()}
        <br>Status: ${d.confirmed ? "✅ Confirmed" : d.paidRequest ? "⏳ Waiting" : "❌ Not Paid"}
        <br>
        ${d.borrower === username && !d.confirmed
          ? `<button onclick="markPaid('${d._id}')">Mark as Paid</button>` : ''}
        ${d.lender === username && d.paidRequest && !d.confirmed
          ? `<button onclick="confirmPayment('${d._id}')">Confirm</button>` : ''}
      `;
      list.appendChild(li);
    });

  document.getElementById("total-lent").innerText = totalLent;
  document.getElementById("total-borrowed").innerText = totalBorrowed;
}

// Mark Paid
async function markPaid(id) {
  await fetch(`${base}/api/debt/mark-paid/${id}`, { method: "PUT" });
  loadDebts();
  showToast("Marked as Paid (Pending)");
}

// Confirm
async function confirmPayment(id) {
  await fetch(`${base}/api/debt/confirm/${id}`, { method: "PUT" });
  loadDebts();
  showToast("Payment Confirmed");
}

// Load on page start
window.onload = loadDebts;
