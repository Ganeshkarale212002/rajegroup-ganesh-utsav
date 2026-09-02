const cfg = {
  apiKey: "AIzaSyBjH6RsLbRKlgq4gGE5QX4OZk-UzYaV2lU",
  authDomain: "rajegroup-vargani-book.firebaseapp.com",
  projectId: "rajegroup-vargani-book",
  storageBucket: "rajegroup-vargani-book.firebasestorage.app",
  messagingSenderId: "63311979980",
  appId: "1:63311979980:web:805f7b06f46982bbaf6969",
  measurementId: "G-D3XK1J96Q4"
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
    const receipts = await db.collection("vargani").get();
    receiptsData = receipts.docs.map(doc => doc.data());

    const expenses = await db.collection("expenses").get();
    expensesData = expenses.docs.map(doc => doc.data());

    const members = await db.collection("members").get();
    membersData = members.docs.map(doc => doc.data());

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

        <button class="${active === "home" ? "active" : ""}"
          onclick="showHome()">
          ⌂
          <span>होम</span>
        </button>

        <button class="${active === "receipts" ? "active" : ""}"
          onclick="showReceipts()">
          ▣
          <span>पावती</span>
        </button>

        <button class="${active === "members" ? "active" : ""}"
          onclick="showMembers()">
          ♙
          <span>कार्यकर्ते</span>
        </button>

        <button class="${active === "expenses" ? "active" : ""}"
          onclick="showExpenses()">
          ₹
          <span>खर्च</span>
        </button>

        <button class="${active === "reports" ? "active" : ""}"
          onclick="showReports()">
          ▤
          <span>अहवाल</span>
        </button>

      </nav>

    </div>
  `;
}


function showHome() {

  const totalCollection =
    receiptsData.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

  const totalExpense =
    expensesData.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

  const balance = totalCollection - totalExpense;

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
          ${money(balance)}
        </strong>

        <small>
          एकूण जमा ${money(totalCollection)}
          •
          खर्च ${money(totalExpense)}
        </small>

      </div>


      <div class="grid">

        <div class="card">
          <small>एकूण वर्गणी</small>
          <b>${money(totalCollection)}</b>
        </div>

        <div class="card">
          <small>एकूण खर्च</small>
          <b>${money(totalExpense)}</b>
        </div>

      </div>


      <h3>
        अलीकडील पावत्या
      </h3>


      <div class="card">

        ${
          receiptsData.slice(0, 5).map(item => `

            <div class="row">

              <span>
                ${item.name || "-"}
              </span>

              <span class="amount">
                ${money(item.amount)}
              </span>

            </div>

          `).join("")
          ||
          "अजून पावत्या नाहीत"
        }

      </div>

    </main>

  `, "home");
}


function showReceipts() {

  shell(`

    <main class="page">

      <div class="title">
        पावती
      </div>


      <input
        class="search"
        placeholder="नाव किंवा पावती क्रमांक शोधा"
      >


      ${
        receiptsData.map(item => `

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

        `).join("")
        ||
        `<div class="card">
          अजून पावत्या नाहीत
        </div>`
      }


      <button
        class="action"
        onclick="newReceipt()"
      >
        ＋ नवीन देणगी
      </button>

    </main>

  `, "receipts");
}


function showMembers() {

  shell(`

    <main class="page">

      <div class="title">
        कार्यकर्ते
      </div>


      ${
        membersData.map(item => `

          <div class="card">

            <b>
              ${item.name || "-"}
            </b>

            <div class="amount">
              ${item.role || "कार्यकर्ता"}
            </div>

          </div>

        `).join("")
        ||
        `<div class="card">
          अजून कार्यकर्ते नाहीत
        </div>`
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
        expensesData.map(item => `

          <div class="row">

            <div>

              <b>
                ${item.category || "-"}
              </b>

              <div class="muted">
                ${item.detail || ""}
              </div>

            </div>

            <span class="amount">
              ${money(item.amount)}
            </span>

          </div>

        `).join("")
        ||
        `<div class="card">
          अजून खर्च नाही
        </div>`
      }


      <button class="action">
        ＋ खर्च नोंदवा
      </button>

    </main>

  `, "expenses");
}


function showReports() {

  const totalCollection =
    receiptsData.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

  const totalExpense =
    expensesData.reduce(
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
          ${money(totalCollection)}
        </div>
      </div>


      <div class="card">
        <b>एकूण खर्च</b>
        <div class="amount">
          ${money(totalExpense)}
        </div>
      </div>


      <div class="card">
        <b>शिल्लक</b>
        <div class="amount">
          ${money(totalCollection - totalExpense)}
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


      <div class="card">
        <b>मंडळाची नोंद</b>
      </div>

    </main>

  `, "reports");
}


async function newReceipt() {

  const name = prompt(
    "वर्गणीदाराचे नाव"
  );

  if (!name) {
    return;
  }


  const amount = Number(
    prompt("रक्कम", "100")
  );

  if (!amount) {
    return;
  }


  const mode =
    prompt("पेमेंट मोड", "UPI")
    || "UPI";


  try {

    const snapshot =
      await db.collection("vargani").get();


    let nextNumber = 1;


    snapshot.docs.forEach(doc => {

      const number =
        Number(
          doc.data().receiptNumber || 0
        );

      if (number >= nextNumber) {
        nextNumber = number + 1;
      }

    });


    await db.collection("vargani").add({

      name: name,

      amount: amount,

      paymentMode: mode,

      receiptNumber: nextNumber,

      date:
        firebase.firestore.Timestamp.now()

    });


    alert(
      "पावती क्रमांक " +
      nextNumber +
      " तयार झाली."
    );


    await loadData();

  } catch (error) {

    console.error(error);

    alert(
      "पावती सेव्ह करताना समस्या आली."
    );

  }
}


loadData();
