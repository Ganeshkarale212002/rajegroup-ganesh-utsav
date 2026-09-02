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

let profileData = {
  mandalName: "गणेश मित्र मंडळ राजे ग्रुप वारणानगर",
  president: "विक्रम कोकाटे",
  vicePresident: "",
  treasurer: "चैतन्य पवार",
  logo: "",
  presidentSign: "",
  vicePresidentSign: "",
  treasurerSign: ""
};


/* =========================
   BASIC FUNCTIONS
========================= */

function money(value) {
  return "₹ " + Number(value || 0).toLocaleString("en-IN");
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "-";

  try {
    if (value.toDate) {
      return value.toDate().toLocaleDateString("mr-IN");
    }

    return new Date(value).toLocaleDateString("mr-IN");

  } catch (e) {
    return "-";
  }
}


/* =========================
   LOAD FIREBASE DATA
========================= */

async function loadData() {

  try {

    const r =
      await db.collection("vargani").get();

    receiptsData =
      r.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));


    const e =
      await db.collection("expenses").get();

    expensesData =
      e.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));


    const m =
      await db.collection("members").get();

    membersData =
      m.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));


    const p =
      await db
        .collection("profile")
        .doc("mandal")
        .get();

    if (p.exists) {

      profileData = {
        ...profileData,
        ...p.data()
      };

    }

  } catch (error) {

    console.error(
      "Firebase Error:",
      error
    );

  }

  showHome();
}


/* =========================
   MAIN APP SHELL
========================= */

function shell(content, active) {

  root.innerHTML = `

    <div class="app">

      <header>

        <div class="brand">

          <div class="logo">

            ${
              profileData.logo
                ? `<img src="${profileData.logo}">`
                : "ॐ"
            }

          </div>

          <div>

            <h1>
              राजे ग्रुप
            </h1>

            <small>
              ${escapeHtml(profileData.mandalName)}
            </small>

          </div>

        </div>

        <div>
          🔔
        </div>

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


/* =========================
   HOME
========================= */

function showHome() {

  const collection =
    receiptsData.reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );


  const expense =
    expensesData.reduce(
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

          <small>
            एकूण वर्गणी
          </small>

          <b>
            ${money(collection)}
          </b>

        </div>


        <div class="card">

          <small>
            एकूण खर्च
          </small>

          <b>
            ${money(expense)}
          </b>

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
                      ${escapeHtml(item.name)}
                    </span>

                    <span class="amount">
                      ${money(item.amount)}
                    </span>

                  </div>

                `)
                .join("")

            : "अजून पावत्या नाहीत"
        }

      </div>

    </main>

  `, "home");
}


/* =========================
   RECEIPTS LIST
========================= */

function showReceipts() {

  shell(`

    <main class="page">

      <div class="title">
        पावती
      </div>


      <input
        id="receiptSearch"
        class="search"
        placeholder="नाव किंवा पावती क्रमांक शोधा"
        oninput="filterReceipts()"
      >


      <div id="receiptList"></div>


      <button
        class="action"
        onclick="showNewReceiptForm()">

        ＋ नवीन देणगी

      </button>

    </main>

  `, "receipts");


  renderReceipts(receiptsData);
}


function renderReceipts(list) {

  const box =
    document.getElementById(
      "receiptList"
    );

  if (!box) return;


  if (!list.length) {

    box.innerHTML = `

      <div class="card">
        अजून पावत्या नाहीत
      </div>

    `;

    return;
  }


  box.innerHTML =
    list
      .slice()
      .reverse()
      .map(item => `

        <div class="card">

          <div class="row">

            <div>

              <b>
                पावती ${item.receiptNumber || "-"}
              </b>

              <div class="muted">
                ${escapeHtml(item.name)}
              </div>

              <div class="muted">
                ${escapeHtml(item.paymentMode)}
              </div>

              <div class="muted">
                ${formatDate(item.date)}
              </div>

            </div>


            <span class="amount">
              ${money(item.amount)}
            </span>

          </div>


          <button
            class="action"
            onclick="printReceipt('${item.id}')">

            📄 PDF / Print

          </button>


          <button
            class="action"
            onclick="shareReceiptPDF('${item.id}')">

            📲 WhatsApp वर PDF पाठवा

          </button>

        </div>

      `)
      .join("");
}


function filterReceipts() {

  const input =
    document.getElementById(
      "receiptSearch"
    );

  if (!input) return;


  const value =
    input.value
      .toLowerCase()
      .trim();


  const filtered =
    receiptsData.filter(item => {

      const name =
        String(item.name || "")
          .toLowerCase();


      const number =
        String(item.receiptNumber || "")
          .toLowerCase();


      return (
        name.includes(value) ||
        number.includes(value)
      );

    });


  renderReceipts(filtered);
}


/* =========================
   NEW RECEIPT FORM
========================= */

function showNewReceiptForm() {

  root.innerHTML = `

    <div class="app">

      <header>

        <div class="brand">

          <div class="logo">
            ॐ
          </div>

          <div>

            <h1>
              राजे ग्रुप
            </h1>

            <small>
              नवीन देणगी
            </small>

          </div>

        </div>

      </header>


      <main class="page">

        <div class="title">
          नवीन देणगी
        </div>


        <div class="card">

          <label>
            वर्गणीदाराचे नाव
          </label>

          <input
            id="donorName"
            class="search"
            type="text"
            placeholder="नाव लिहा"
          >


          <br>


          <label>
            रक्कम
          </label>

          <input
            id="donorAmount"
            class="search"
            type="number"
            inputmode="numeric"
            placeholder="उदा. 500"
          >


          <br>


          <label>
            पेमेंट मोड
          </label>

          <select
            id="paymentMode"
            class="search">

            <option value="Cash">
              Cash
            </option>

            <option value="UPI">
              UPI
            </option>

          </select>


          <br>


          <label>
            कोणी घेतली
          </label>

          <input
            id="receivedBy"
            class="search"
            type="text"
            value="${escapeHtml(profileData.president)}"
          >


          <br>


          <label>
            तारीख
          </label>

          <input
            id="donationDate"
            class="search"
            type="date"
          >


          <br>


          <button
            class="action"
            onclick="saveReceipt()">

            ✓ पावती तयार करा

          </button>


          <button
            class="action"
            onclick="showReceipts()">

            ← मागे

          </button>

        </div>

      </main>

    </div>

  `;


  document.getElementById(
    "donationDate"
  ).value =
    new Date()
      .toISOString()
      .split("T")[0];
}


/* =========================
   SAVE RECEIPT
========================= */

async function saveReceipt() {

  const name =
    document
      .getElementById("donorName")
      .value
      .trim();


  const amount =
    Number(
      document
        .getElementById("donorAmount")
        .value
    );


  const paymentMode =
    document
      .getElementById("paymentMode")
      .value;


  const receivedBy =
    document
      .getElementById("receivedBy")
      .value
      .trim();


  const dateValue =
    document
      .getElementById("donationDate")
      .value;


  if (!name) {

    alert(
      "वर्गणीदाराचे नाव टाका."
    );

    return;
  }


  if (!amount || amount <= 0) {

    alert(
      "योग्य रक्कम टाका."
    );

    return;
  }


  if (!receivedBy) {

    alert(
      "कोणी घेतली ते नाव टाका."
    );

    return;
  }


  try {

    const snapshot =
      await db
        .collection("vargani")
        .get();


    let nextNumber = 1;


    snapshot.forEach(doc => {

      const number =
        Number(
          doc.data().receiptNumber || 0
        );


      if (number >= nextNumber) {

        nextNumber =
          number + 1;

      }

    });


    let receiptDate =
      firebase.firestore.Timestamp.now();


    if (dateValue) {

      receiptDate =
        firebase.firestore.Timestamp.fromDate(
          new Date(
            dateValue + "T12:00:00"
          )
        );

    }


    await db
      .collection("vargani")
      .add({

        name: name,

        amount: amount,

        paymentMode: paymentMode,

        receivedBy: receivedBy,

        receiptNumber: nextNumber,

        date: receiptDate

      });


    alert(
      "पावती क्रमांक " +
      nextNumber +
      " तयार झाली."
    );


    await loadData();

    showReceipts();

  } catch (error) {

    console.error(
      "Receipt Error:",
      error
    );


    alert(
      "पावती सेव्ह झाली नाही."
    );

  }

}


/* =========================
   PROFILE
========================= */

function showMembers() {

  shell(`

    <main class="page">

      <div class="title">
        कार्यकर्ते
      </div>


      ${
        membersData.length

          ? membersData
              .map(item => `

                <div class="card">

                  <b>
                    ${escapeHtml(item.name)}
                  </b>

                  <div class="amount">
                    ${escapeHtml(
                      item.role ||
                      "कार्यकर्ता"
                    )}
                  </div>

                  <div class="muted">
                    ${escapeHtml(item.mobile)}
                  </div>

                </div>

              `)
              .join("")

          : `

            <div class="card">
              अजून कार्यकर्ते नाहीत
            </div>

          `
      }


      <button
        class="action"
        onclick="showProfile()">

        ⚙️ मंडळ प्रोफाइल

      </button>

    </main>

  `, "members");
}


function showProfile() {

  root.innerHTML = `

    <div class="app">

      <header>

        <div class="brand">

          <div class="logo">
            ॐ
          </div>

          <div>

            <h1>
              राजे ग्रुप
            </h1>

            <small>
              मंडळ प्रोफाइल
            </small>

          </div>

        </div>

      </header>


      <main class="page">

        <div class="title">
          मंडळ प्रोफाइल
        </div>


        <div class="card">

          <label>
            मंडळाचे नाव
          </label>

          <input
            id="mandalName"
            class="search"
            value="${escapeHtml(
              profileData.mandalName
            )}"
          >


          <br>


          <label>
            अध्यक्षाचे नाव
          </label>

          <input
            id="president"
            class="search"
            value="${escapeHtml(
              profileData.president
            )}"
          >


          <br>


          <label>
            उपाध्यक्षाचे नाव
          </label>

          <input
            id="vicePresident"
            class="search"
            value="${escapeHtml(
              profileData.vicePresident
            )}"
          >


          <br>


          <label>
            खजिनदाराचे नाव
          </label>

          <input
            id="treasurer"
            class="search"
            value="${escapeHtml(
              profileData.treasurer
            )}"
          >


          <br><br>


          <label>
            🖼️ Logo Upload
          </label>

          <input
            id="logoFile"
            type="file"
            accept="image/*"
          >


          <br><br>


          <label>
            ✍️ अध्यक्ष Signature
          </label>

          <input
            id="presidentSignFile"
            type="file"
            accept="image/*"
          >


          <br><br>


          <label>
            ✍️ उपाध्यक्ष Signature
          </label>

          <input
            id="vicePresidentSignFile"
            type="file"
            accept="image/*"
          >


          <br><br>


          <label>
            ✍️ खजिनदार Signature
          </label>

          <input
            id="treasurerSignFile"
            type="file"
            accept="image/*"
          >


          <br><br>


          <button
            class="action"
            onclick="saveProfile()">

            ✓ प्रोफाइल सेव्ह करा

          </button>


          <button
            class="action"
            onclick="showMembers()">

            ← मागे

          </button>

        </div>

      </main>

    </div>
  `;
}


/* =========================
   IMAGE SAVE
========================= */

function readImage(file) {

  return new Promise(
    (resolve, reject) => {

      if (!file) {

        resolve("");

        return;

      }


      const reader =
        new FileReader();


      reader.onload = () => {

        const img =
          new Image();


        img.onload = () => {

          const canvas =
            document.createElement(
              "canvas"
            );


          const max = 700;

          let width =
            img.width;

          let height =
            img.height;


          if (width > max) {

            height =
              height * max / width;

            width = max;

          }


          canvas.width =
            width;

          canvas.height =
            height;


          const ctx =
            canvas.getContext(
              "2d"
            );


          ctx.drawImage(
            img,
            0,
            0,
            width,
            height
          );


          resolve(
            canvas.toDataURL(
              "image/jpeg",
              0.75
            )
          );

        };


        img.onerror =
          reject;


        img.src =
          reader.result;

      };


      reader.onerror =
        reject;


      reader.readAsDataURL(file);

    }
  );
}


async function saveProfile() {

  try {

    const logo =
      await readImage(
        document
          .getElementById("logoFile")
          .files[0]
      );


    const presidentSign =
      await readImage(
        document
          .getElementById("presidentSignFile")
          .files[0]
      );


    const vicePresidentSign =
      await readImage(
        document
          .getElementById(
            "vicePresidentSignFile"
          )
          .files[0]
      );


    const treasurerSign =
      await readImage(
        document
          .getElementById(
            "treasurerSignFile"
          )
          .files[0]
      );


    const data = {

      mandalName:
        document
          .getElementById("mandalName")
          .value
          .trim(),

      president:
        document
          .getElementById("president")
          .value
          .trim(),

      vicePresident:
        document
          .getElementById("vicePresident")
          .value
          .trim(),

      treasurer:
        document
          .getElementById("treasurer")
          .value
          .trim()

    };


    if (logo) {

      data.logo =
        logo;

    }


    if (presidentSign) {

      data.presidentSign =
        presidentSign;

    }


    if (vicePresidentSign) {

      data.vicePresidentSign =
        vicePresidentSign;

    }


    if (treasurerSign) {

      data.treasurerSign =
        treasurerSign;

    }


    await db
      .collection("profile")
      .doc("mandal")
      .set(
        data,
        { merge: true }
      );


    profileData = {

      ...profileData,

      ...data

    };


    alert(
      "प्रोफाइल सेव्ह झाली."
    );


    showMembers();

  } catch (error) {

    console.error(
      "Profile Error:",
      error
    );


    alert(
      "प्रोफाइल सेव्ह करताना समस्या आली."
    );

  }

}


/* =========================
   RECEIPT HTML
========================= */

function receiptHTML(receipt) {

  const logo =
    profileData.logo

      ? `
        <img
          class="main-logo"
          src="${profileData.logo}"
        >
      `

      : `
        <div class="om">
          ॐ
        </div>
      `;


  const presidentSign =
    profileData.presidentSign

      ? `
        <img
          class="sign"
          src="${profileData.presidentSign}"
        >
      `

      : "";


  const viceSign =
    profileData.vicePresidentSign

      ? `
        <img
          class="sign"
          src="${profileData.vicePresidentSign}"
        >
      `

      : "";


  const treasurerSign =
    profileData.treasurerSign

      ? `
        <img
          class="sign"
          src="${profileData.treasurerSign}"
        >
      `

      : "";


  return `

<!DOCTYPE html>

<html lang="mr">

<head>

<meta charset="UTF-8">

<meta name="viewport"
      content="width=device-width">

<title>
पावती ${receipt.receiptNumber || ""}
</title>


<style>

* {
  box-sizing: border-box;
}

body {

  margin: 0;

  padding: 15px;

  background: #eeeeee;

  font-family:
    Arial,
    "Noto Sans Devanagari",
    sans-serif;

  color: #222;

}

.receipt {

  width: 100%;

  max-width: 760px;

  margin: auto;

  background: #fff;

  border: 3px solid #3b2418;

  padding: 18px;

  position: relative;

}

.receipt:before {

  content: "";

  position: absolute;

  inset: 7px;

  border: 1px solid #8a6a55;

  pointer-events: none;

}

.header {

  text-align: center;

  position: relative;

  z-index: 1;

}

.main-logo {

  width: 145px;

  height: 145px;

  object-fit: contain;

  display: block;

  margin: 0 auto 5px;

}

.om {

  font-size: 80px;

  line-height: 100px;

}

.mandal {

  font-size: 27px;

  font-weight: 700;

  margin-top: 5px;

}

.subtitle {

  font-size: 19px;

  font-weight: 600;

  margin-top: 5px;

}

.topline {

  display: flex;

  justify-content: space-between;

  gap: 15px;

  margin-top: 18px;

  padding: 10px;

  border-top: 2px solid #3b2418;

  border-bottom: 2px solid #3b2418;

  font-size: 17px;

  position: relative;

  z-index: 1;

}

.info {

  margin-top: 15px;

  font-size: 18px;

  line-height: 2;

  position: relative;

  z-index: 1;

}

.info-row {

  border-bottom: 1px dotted #777;

  padding: 3px 0;

}

.big-amount {

  font-size: 27px;

  font-weight: 800;

}

.signatures {

  display: flex;

  align-items: flex-end;

  justify-content: space-between;

  margin-top: 65px;

  position: relative;

  z-index: 1;

}

.signature-box {

  width: 29%;

  text-align: center;

  min-height: 105px;

}

.signature-box.president {

  width: 34%;

}

.sign {

  width: 115px;

  height: 58px;

  object-fit: contain;

  display: block;

  margin: 0 auto 3px;

}

.sign-line {

  border-top: 1px solid #333;

  padding-top: 5px;

  font-size: 16px;

  font-weight: 600;

}

.role {

  font-size: 15px;

  font-weight: normal;

}

.footer {

  text-align: center;

  margin-top: 20px;

  font-size: 13px;

  position: relative;

  z-index: 1;

}

@media print {

  body {

    background: white;

    padding: 0;

  }

  .receipt {

    max-width: none;

    border: 3px solid #3b2418;

  }

}

</style>

</head>


<body>


<div class="receipt">


  <div class="header">

    ${logo}


    <div class="mandal">

      ${escapeHtml(
        profileData.mandalName
      )}

    </div>


    <div class="subtitle">

      गणेश उत्सव वर्गणी पावती

    </div>

  </div>


  <div class="topline">

    <div>

      <b>पावती क्र.:</b>

      ${receipt.receiptNumber || "-"}

    </div>


    <div>

      <b>दिनांक:</b>

      ${formatDate(receipt.date)}

    </div>

  </div>


  <div class="info">


    <div class="info-row">

      <b>वर्गणीदाराचे नाव:</b>

      ${escapeHtml(receipt.name)}

    </div>


    <div class="info-row">

      <b>रक्कम:</b>

      <span class="big-amount">

        ${money(receipt.amount)}

      </span>

    </div>


    <div class="info-row">

      <b>पेमेंट मोड:</b>

      ${escapeHtml(
        receipt.paymentMode
      )}

    </div>


    <div class="info-row">

      <b>रक्कम स्वीकारणारे:</b>

      ${escapeHtml(
        receipt.receivedBy
      )}

    </div>


  </div>


  <div class="signatures">


    <div class="signature-box">

      ${viceSign}


      <div class="sign-line">

        ${escapeHtml(
          profileData.vicePresident
        )}

        <div class="role">
          उपाध्यक्ष
        </div>

      </div>

    </div>


    <div class="signature-box president">

      ${presidentSign}


      <div class="sign-line">

        ${escapeHtml(
          profileData.president
        )}

        <div class="role">
          अध्यक्ष
        </div>

      </div>

    </div>


    <div class="signature-box">

      ${treasurerSign}


      <div class="sign-line">

        ${escapeHtml(
          profileData.treasurer
        )}

        <div class="role">
          खजिनदार
        </div>

      </div>

    </div>


  </div>


  <div class="footer">

    धन्यवाद 🙏

  </div>


</div>


</body>

</html>

  `;

}


/* =========================
   PRINT / PDF
========================= */

function printReceipt(id) {

  const receipt =
    receiptsData.find(
      item => item.id === id
    );


  if (!receipt) {

    alert(
      "पावती सापडली नाही."
    );

    return;

  }


  const win =
    window.open(
      "",
      "_blank"
    );


  if (!win) {

    alert(
      "Popup बंद आहे. Browser popup allow करा."
    );

    return;

  }


  win.document.open();

  win.document.write(
    receiptHTML(receipt)
  );

  win.document.close();


  setTimeout(() => {

    win.print();

  }, 700);

}


/* =========================
   LOAD jsPDF
========================= */

function loadJsPDF() {

  return new Promise(
    (resolve, reject) => {

      if (
        window.jspdf &&
        window.jspdf.jsPDF
      ) {

        resolve();

        return;

      }


      const script =
        document.createElement(
          "script"
        );


      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";


      script.onload =
        () => resolve();


      script.onerror =
        () =>
          reject(
            new Error(
              "PDF library load failed"
            )
          );


      document.head.appendChild(
        script
      );

    }
  );

}


/* =========================
   HTML TO PDF
========================= */

async function makeReceiptPDF(id) {

  const receipt =
    receiptsData.find(
      item => item.id === id
    );


  if (!receipt) {

    throw new Error(
      "Receipt not found"
    );

  }


  await loadJsPDF();


  const { jsPDF } =
    window.jspdf;


  const doc =
    new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });


  const margin = 12;

  const pageWidth =
    210;

  const pageHeight =
    297;


  doc.setLineWidth(0.8);

  doc.rect(
    margin,
    margin,
    pageWidth - margin * 2,
    pageHeight - margin * 2
  );


  doc.setLineWidth(0.3);

  doc.rect(
    margin + 3,
    margin + 3,
    pageWidth - margin * 2 - 6,
    pageHeight - margin * 2 - 6
  );


  let y = 27;


  if (profileData.logo) {

    try {

      doc.addImage(
        profileData.logo,
        "JPEG",
        78,
        y,
        54,
        38
      );

      y += 43;

    } catch (e) {

      y += 5;

    }

  } else {

    doc.setFontSize(30);

    doc.text(
      "OM",
      105,
      y + 12,
      { align: "center" }
    );

    y += 22;

  }


  doc.setFontSize(18);

  doc.setFont("helvetica", "bold");

  doc.text(
    profileData.mandalName,
    105,
    y,
    { align: "center" }
  );


  y += 9;


  doc.setFontSize(12);

  doc.text(
    "Ganesh Utsav Vargani Pavti",
    105,
    y,
    { align: "center" }
  );


  y += 10;


  doc.line(
    20,
    y,
    190,
    y
  );


  y += 9;


  doc.setFontSize(11);

  doc.setFont("helvetica", "normal");


  doc.text(
    "Pavti No.: " +
    String(receipt.receiptNumber || "-"),
    22,
    y
  );


  doc.text(
    "Date: " +
    formatDate(receipt.date),
    188,
    y,
    { align: "right" }
  );


  y += 10;


  doc.line(
    20,
    y,
    190,
    y
  );


  y += 12;


  doc.setFontSize(12);


  doc.text(
    "Varganidarache nav: " +
    String(receipt.name || ""),
    22,
    y
  );


  y += 10;


  doc.text(
    "Rakkam: " +
    money(receipt.amount),
    22,
    y
  );


  y += 10;


  doc.text(
    "Payment Mode: " +
    String(receipt.paymentMode || ""),
    22,
    y
  );


  y += 10;


  doc.text(
    "Rakkam sweekaranare: " +
    String(receipt.receivedBy || ""),
    22,
    y
  );


  y += 45;


  /* signatures */

  const leftX = 48;

  const centerX = 105;

  const rightX = 162;


  if (profileData.vicePresidentSign) {

    try {

      doc.addImage(
        profileData.vicePresidentSign,
        "JPEG",
        leftX - 18,
        y - 15,
        36,
        18
      );

    } catch (e) {}

  }


  if (profileData.presidentSign) {

    try {

      doc.addImage(
        profileData.presidentSign,
        "JPEG",
        centerX - 20,
        y - 15,
        40,
        20
      );

    } catch (e) {}

  }


  if (profileData.treasurerSign) {

    try {

      doc.addImage(
        profileData.treasurerSign,
        "JPEG",
        rightX - 18,
        y - 15,
        36,
        18
      );

    } catch (e) {}

  }


  doc.line(
    leftX - 25,
    y + 5,
    leftX + 25,
    y + 5
  );


  doc.line(
    centerX - 28,
    y + 5,
    centerX + 28,
    y + 5
  );


  doc.line(
    rightX - 25,
    y + 5,
    rightX + 25,
    y + 5
  );


  doc.setFontSize(10);


  doc.text(
    profileData.vicePresident || "",
    leftX,
    y + 11,
    { align: "center" }
  );


  doc.text(
    "Upadhyaksha",
    leftX,
    y + 17,
    { align: "center" }
  );


  doc.text(
    profileData.president || "",
    centerX,
    y + 11,
    { align: "center" }
  );


  doc.text(
    "Adhyaksha",
    centerX,
    y + 17,
    { align: "center" }
  );


  doc.text(
    profileData.treasurer || "",
    rightX,
    y + 11,
    { align: "center" }
  );


  doc.text(
    "Khajindar",
    rightX,
    y + 17,
    { align: "center" }
  );


  doc.setFontSize(9);


  doc.text(
    "Dhanyawad",
    105,
    275,
    { align: "center" }
  );


  return doc.output(
    "blob"
  );

}


/* =========================
   WHATSAPP PDF SHARE
========================= */

async function shareReceiptPDF(id) {

  const receipt =
    receiptsData.find(
      item => item.id === id
    );


  if (!receipt) {

    alert(
      "पावती सापडली नाही."
    );

    return;

  }


  try {

    alert(
      "PDF तयार होत आहे..."
    );


    const blob =
      await makeReceiptPDF(id);


    const fileName =
      "Rajegroup-Pavati-" +
      String(
        receipt.receiptNumber || "1"
      ) +
      ".pdf";


    const file =
      new File(
        [blob],
        fileName,
        {
          type: "application/pdf"
        }
      );


    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({
        files: [file]
      })
    ) {

      await navigator.share({

        title:
          "राजे ग्रुप पावती",

        text:
          "गणेश मित्र मंडळ राजे ग्रुप वारणानगर",

        files: [file]

      });

      return;

    }


    const url =
      URL.createObjectURL(
        blob
      );


    const a =
      document.createElement(
        "a"
      );

    a.href = url;

    a.download =
      fileName;

    document.body.appendChild(a);

    a.click();

    a.remove();


    URL.revokeObjectURL(
      url
    );


    alert(
      "PDF तयार झाली. Downloads मधून WhatsApp वर पाठवा."
    );


  } catch (error) {

    console.error(
      "PDF Share Error:",
      error
    );


    alert(
      "PDF share करता आली नाही. PDF download करून WhatsApp वर पाठवा."
    );

  }

}


/* =========================
   EXPENSES
========================= */

function showExpenses() {

  shell(`

    <main class="page">

      <div class="title">
        खर्च
      </div>


      ${
        expensesData.length

          ? expensesData
              .map(item => `

                <div class="card">

                  <div class="row">

                    <div>

                      <b>
                        ${escapeHtml(
                          item.category
                        )}
                      </b>

                      <div class="muted">
                        ${escapeHtml(
                          item.detail
                        )}
                      </div>

                      <div class="muted">
                        ${escapeHtml(
                          item.paidTo
                        )}
                      </div>

                    </div>


                    <span class="amount">
                      ${money(item.amount)}
                    </span>

                  </div>

                </div>

              `)
              .join("")

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


/* =========================
   REPORTS
========================= */

function showReports() {

  const collection =
    receiptsData.reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );


  const expense =
    expensesData.reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );


  shell(`

    <main class="page">

      <div class="title">
        अहवाल
      </div>


      <div class="card">

        <b>
          एकूण जमा
        </b>

        <div class="amount">
          ${money(collection)}
        </div>

      </div>


      <div class="card">

        <b>
          एकूण खर्च
        </b>

        <div class="amount">
          ${money(expense)}
        </div>

      </div>


      <div class="card">

        <b>
          शिल्लक
        </b>

        <div class="amount">
          ${money(
            collection - expense
          )}
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


/* =========================
   START
========================= */

loadData();
