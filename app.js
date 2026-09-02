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

        <button
          class="${active === "home" ? "active" : ""}"
          onclick="showHome()">
          ⌂
          <span>होम</span>
        </button>

        <button
          class="${active === "receipts" ? "active" : ""}"
          onclick="showReceipts()">
          ▣
          <span>पावती</span>
        </button>

        <button
          class="${active === "members" ? "active" : ""}"
          onclick="showMembers()">
          ♙
          <span>कार्यकर्ते</span>
        </button>

        <button
          class="${active === "expenses" ? "active" : ""}"
          onclick="showExpenses()">
          ₹
          <span>खर्च</span>
        </button>

        <button
          class="${active === "reports" ? "active" : ""}"
          onclick="showReports()">
          ▤
          <span>अहवाल</span>
        </button>

      </nav>

    </div>
  `;
}

function showHome() {

  const collection = receiptsData.reduce(
    (sum, item) =>
      sum + Number(item.amount || 0),
    0
  );

  const expense = expensesData.reduce(
    (sum, item) =>
      sum + Number(item.amount || 0),
    0
  );

  shell(`

    <main class="page">

      <div class="muted">
        नमस्कार 👋
      </div>

      <div class="title">
        राजे ग्रुप
      </div>

      <div class="balance">

        <small>
          सध्याची शिल्लक
        </small>

        <strong>
          ${money(collection - expense)}
        </strong>

        <small>
          एकूण जमा ${money(collection)}
          •
          खर्च ${money(expense)}
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

      <h3>
        अलीकडील पावत्या
      </h3>

      <div class="card">

        ${
          receiptsData.length

          ? receiptsData
              .slice(-5)
              .reverse()
              .map(item => `

                <div class="row">

                  <span>
                    पावती ${item.receiptNumber || "-"}
                    •
                    ${item.name || "-"}
                  </span>

                  <span class="amount">
                    ${money(item.amount)}
                  </span>

                </div>

              `)
              .join("")

          : "अ
