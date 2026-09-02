const cfg = {
  apiKey: "AIzaSyBjH6RsLbRKlgq4gGE5QX4OZk-UzYaV2lU",
  authDomain: "rajegroup-vargani-book.firebaseapp.com",
  projectId: "rajegroup-vargani-book",
  storageBucket: "rajegroup-vargani-book.firebasestorage.app",
  messagingSenderId: "63311979980",
  appId: "1:63311979980:web:805f7b06f46982bbaf6969"
};

firebase.initializeApp(cfg);

const db = firebase.firestore();
const root = document.getElementById("app");

let receiptsData = [];
let expensesData = [];
let membersData = [];

function money(value) {
  return "₹ " + Number(value || 0).toLocaleString("en-IN");
}

function shell(content, active) {
  root.innerHTML = `
    <div class="app">

      <header>
        <div class="brand">
          <div class="logo">ॐ</div>
          <div>
            <h1>राजे ग्रुप</h1>
            <small>गणेश मित्र मंडळ वारणानगर</small>
          </div>
        </div>
        <div>🔔</div>
      </header>

      ${content}

      <nav>
        <button class="${active === "home" ? "active" : ""}" onclick="showHome()">
          ⌂<span>होम</span>
        </button>

        <button class="${active === "receipts" ? "active" : ""}" onclick="showReceipts()">
          ▣<span>पावती</span>
        </button>

        <button class="${active === "members" ? "active" : ""}" onclick="showMembers()">
          ♙<span>कार्यकर्ते</span>
        </button>

        <button class="${active === "expenses" ? "active" : ""}" onclick="showExpenses()">
          ₹<span>खर्च</span>
        </button>

        <button class="${active === "reports" ? "active" : ""}" onclick="showReports()">
          ▤<span>अहवाल</span>
        </button>
      </nav>

    </div>
  `;
}

async function loadData() {
  try {
    const r = await db.collection("vargani").get();
    receiptsData = r.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const e = await db.collection("expenses").get();
    expensesData = e.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const m = await db.collection("members").get();
    membersData = m.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    console.error("Firebase Error:", error);
  }

  showHome();
}

function showHome() {
  const collection = receiptsData.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const expense = expensesData.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  shell(`
    <main class="page">

      <div class="muted">नमस्कार 👋</div>

      <div class="title">राजे ग्रुप</div>

      <div class="balance">
        <small>सध्याची शिल्लक</small>
        <strong>${money(collection - expense)}</strong>
        <small>
          एकूण जमा ${money(collection)}
          • खर्च ${money(expense)}
        </small>
      </div>

      <div class="grid">

        <div class="card">
          <small>एकूण वर्गणी</small>
          <b>${money(collection)}</b>
        </div>

        <div class="card">
          <small>एकूण खर्च</small>
          <b>${money(expense)}</b>
        </div>

      </div>

      <h3>अलीकडील पावत्या</h3>

      <div class="card">

        ${
          receiptsData.length
            ? receiptsData.slice(-5).reverse().map(item => `
                <div class="row">
                  <span>
                    पावती ${item.receiptNumber || "-"}
                    • ${item.name || "-"}
                  </span>

                  <span class="amount">
                    ${money(item.amount)}
                  </span>
                </div>
              `).join("")
            : "अजून पावत्या नाहीत"
        }

      </div>

    </main>
  `, "home");
}

function showReceipts() {
  shell(`
    <main class="page">

      <div class="title">पावती</div>

      <input
        id="receiptSearch"
        class="search"
        placeholder="नाव किंवा पावती क्रमांक शोधा"
        oninput="filterReceipts()"
      >

      <div id="receiptList"></div>

      <button class="action" onclick="newReceipt()">
        ＋ नवीन देणगी
      </button>

    </main>
  `, "receipts");

  renderReceipts(receiptsData);
}

function renderReceipts(list) {
  const box = document.getElementById("receiptList");

  if (!box) return;

  if (!list.length) {
    box.innerHTML = `
      <div class="card">
        अजून पावत्या नाहीत
      </div>
    `;
    return;
  }

  box.innerHTML = list.map(item => `
    <div class="card">

      <div class="row">
        <div>
          <b>पावती ${item.receiptNumber || "-"}</b>

          <div class="muted">
            ${item.name || "-"}
          </div>

          <div class="muted">
            ${item.paymentMode || "-"}
          </div>
        </div>

        <span class="amount">
          ${money(item.amount)}
        </span>
      </div>

    </div>
  `).join("");
}

function filterReceipts() {
  const input = document.getElementById("receiptSearch");

  if (!input) return;

  const value = input.value.toLowerCase().trim();

  const filtered = receiptsData.filter(item => {

    const name = String(item.name || "").toLowerCase();

    const number = String(
      item.receiptNumber || ""
    ).toLowerCase();

    return name.includes(value) || number.includes(value);
  });

  renderReceipts(filtered);
}

function showMembers() {
  shell(`
    <main class="page">

      <div class="title">
        कार्यकर्ते
      </div>

      ${
        membersData.length
          ? membersData.map(item => `
              <div class="card">

                <b>${item.name || "-"}</b>

                <div class="amount">
                  ${item.role || "कार्यकर्ता"}
                </div>

                <div class="muted">
                  ${item.mobile || ""}
                </div>

              </div>
            `).join("")
          : `
            <div class="card">
              अजून कार्यकर्ते नाहीत
            </div>
          `
      }

      <button class="action">
        ＋ नवीन कार्यकर्ता
      </button>

      <button class="action">
        अध्यक्षपद दुसऱ्याला द्या
      </button>

    </main>
  `, "members");
}

function showExpenses() {
  shell(`
    <main class="page">

      <div class="title">
        खर्च
      </div>

      ${
        expensesData.length
          ? expensesData.map(item => `
              <div class="card">

                <div class="row">

                  <div>
                    <b>${item.category || "-"}</b>

                    <div class="muted">
                      ${item.detail || ""}
                    </div>

                    <div class="muted">
                      ${item.paidTo || ""}
                    </div>
                  </div>

                  <span class="amount">
                    ${money(item.amount)}
                  </span>

                </div>

              </div>
            `).join("")
          : `
            <div class="card">
              अजून खर्च नाही
            </div>
          `
      }

      <button class="action">
        ＋ खर्च नोंदवा
      </button>

    </main>
  `, "expenses");
}

function showReports() {
  const collection = receiptsData.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const expense = expensesData.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  shell(`
    <main class="page">

      <div class="title">
        अहवाल
      </div>

      <div class="card">
        <b>एकूण जमा</b>
        <div class="amount">
          ${money(collection)}
        </div>
      </div>

      <div class="card">
        <b>एकूण खर्च</b>
        <div class="amount">
          ${money(expense)}
        </div>
      </div>

      <div class="card">
        <b>शिल्लक</b>
        <div class="amount">
          ${money(collection - expense)}
        </div>
      </div>

      <div class="card">
        <b>पूर्ण उत्सव खाते</b>
      </div>

      <div class="card">
        <b>दैनिक संकलन अहवाल</b>
      </div>

      <div class="card">
        <b>कार्यकर्त्यानुसार अहवाल</b>
      </div>

      <div class="card">
        <b>बाकी वर्गणी यादी</b>
      </div>

      <div class="card">
        <b>खर्च अहवाल</b>
      </div>

      <div class="card">
        <b>इतिहास</b>
      </div>

    </main>
  `, "reports");
}

async function newReceipt() {

  const name = prompt(
    "वर्गणीदाराचे नाव"
  );

  if (!name || !name.trim()) {
    return;
  }

  const amountText = prompt(
    "रक्कम",
    "100"
  );

  if (!amountText) {
    return;
  }

  const amount = Number(amountText);

  if (!Number.isFinite(amount) || amount <= 0) {
    alert("योग्य रक्कम टाका.");
    return;
  }

  const mode = prompt(
    "पेमेंट मोड: Cash / UPI",
    "UPI"
  ) || "UPI";

  try {

    const snapshot =
      await db.collection("vargani").get();

    let nextNumber = 1;

    snapshot.forEach(doc => {

      const number =
        Number(
          doc.data().receiptNumber || 0
        );

      if (number >= nextNumber) {
        nextNumber = number + 1;
      }

    });

    await db.collection("vargani").add({

      name: name.trim(),

      amount: amount,

      paymentMode: mode.trim(),

      receiptNumber: nextNumber,

      date:
        firebase.firestore.Timestamp.now(),

      receivedBy:
        "विक्रम कोकाटे"

    });

    alert(
      "पावती क्रमांक " +
      nextNumber +
      " तयार झाली."
    );

    await loadData();

  } catch (error) {

    console.error(
      "Receipt Save Error:",
      error
    );

    alert(
      "पावती सेव्ह झाली नाही. पुन्हा प्रयत्न करा."
    );
  }
}

loadData();
