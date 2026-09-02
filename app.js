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
  mandalName: "गणेश मित्र मंडळ राजे ग्रुप, वारणानगर",
  place: "वारणानगर, सातारा",
  president: "विक्रम कोकाटे",
  vicePresident: "",
  treasurer: "चैतन्य पवार",
  logo: "",
  presidentSign: "",
  vicePresidentSign: "",
  treasurerSign: ""
};


/* =========================
   BASIC
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
    const d = value.toDate
      ? value.toDate()
      : new Date(value);

    return d.toLocaleDateString("mr-IN");
  } catch (e) {
    return "-";
  }
}


/* =========================
   AMOUNT IN WORDS
========================= */

function numberToMarathiWords(num) {

  num = Number(num || 0);

  if (num === 0) {
    return "शून्य रुपये फक्त";
  }

  const ones = [
    "",
    "एक",
    "दोन",
    "तीन",
    "चार",
    "पाच",
    "सहा",
    "सात",
    "आठ",
    "नऊ",
    "दहा",
    "अकरा",
    "बारा",
    "तेरा",
    "चौदा",
    "पंधरा",
    "सोळा",
    "सतरा",
    "अठरा",
    "एकोणीस"
  ];

  const tens = [
    "",
    "",
    "वीस",
    "तीस",
    "चाळीस",
    "पन्नास",
    "साठ",
    "सत्तर",
    "ऐंशी",
    "नव्वद"
  ];

  function twoDigit(n) {

    if (n < 20) {
      return ones[n];
    }

    return tens[Math.floor(n / 10)] +
      (n % 10 ? " " + ones[n % 10] : "");
  }

  function convert(n) {

    if (n < 100) {
      return twoDigit(n);
    }

    if (n < 1000) {
      return ones[Math.floor(n / 100)] +
        "शे " +
        (n % 100 ? convert(n % 100) : "");
    }

    if (n < 100000) {
      return twoDigit(Math.floor(n / 1000)) +
        " हजार " +
        (n % 1000 ? convert(n % 1000) : "");
    }

    if (n < 10000000) {
      return twoDigit(Math.floor(n / 100000)) +
        " लाख " +
        (n % 100000 ? convert(n % 100000) : "");
    }

    return String(n);
  }

  return convert(Math.floor(num)) +
    " रुपये फक्त";
}


/* =========================
   LOAD DATA
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
   APP SHELL
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
              ${escapeHtml(
                profileData.mandalName
              )}
            </small>

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
   RECEIPTS
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
   NEW RECEIPT
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
            placeholder="उदा. 1032"
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
            रक्कम स्वीकारणारे
          </label>

          <input
            id="receivedBy"
            class="search"
            type="text"
            value="${escapeHtml(
              profileData.president
            )}"
          >


          <br>


          <label>
            वर्गणी कशासाठी
          </label>

          <input
            id="purpose"
            class="search"
            type="text"
            value="गणेश उत्सव वर्गणी"
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


  const purpose =
    document
      .getElementById("purpose")
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

        name,

        amount,

        paymentMode,

        receivedBy,

        purpose,

        amountInWords:
          numberToMarathiWords(
            amount
          ),

        receiptNumber:
          nextNumber,

        date:
          receiptDate

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
            ठिकाण
          </label>

          <input
            id="place"
            class="search"
            value="${escapeHtml(
              profileData.place
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
   IMAGE
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
            canvas.getContext("2d");


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


/* =========================
   SAVE PROFILE
========================= */

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
          .getElementById(
            "presidentSignFile"
          )
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
          .getElementById(
            "mandalName"
          )
          .value
          .trim(),

      place:
        document
          .getElementById(
            "place"
          )
          .value
          .trim(),

      president:
        document
          .getElementById(
            "president"
          )
          .value
          .trim(),

      vicePresident:
        document
          .getElementById(
            "vicePresident"
          )
          .value
          .trim(),

      treasurer:
        document
          .getElementById(
            "treasurer"
          )
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
      ? `<img src="${profileData.presidentSign}">`
      : "";


  const viceSign =
    profileData.vicePresidentSign
      ? `<img src="${profileData.vicePresidentSign}">`
      : "";


  const treasurerSign =
    profileData.treasurerSign
      ? `<img src="${profileData.treasurerSign}">`
      : "";


  const amountWords =
    receipt.amountInWords ||
    numberToMarathiWords(
      receipt.amount
    );


  return `

<!DOCTYPE html>

<html lang="mr">

<head>

<meta charset="UTF-8">

<meta name="viewport"
content="width=device-width,initial-scale=1">

<title>
पावती-${receipt.receiptNumber}
</title>


<style>

* {
  box-sizing: border-box;
}

body {

  margin: 0;

  padding: 12px;

  background: #eeeeee;

  font-family:
    Arial,
    "Noto Sans Devanagari",
    sans-serif;

  color: #44201b;

}


.receipt {

  width: 100%;

  max-width: 760px;

  min-height: 1050px;

  margin: auto;

  background: #fffaf0;

  border: 4px solid #6b201d;

  position: relative;

  overflow: hidden;

  padding: 15px 22px 20px;

}


.receipt:after {

  content: "";

  position: absolute;

  inset: 6px;

  border: 2px solid #a47a35;

  pointer-events: none;

}


/* TOP ORANGE */

.top-banner {

  height: 95px;

  margin: -15px -22px 0;

  background:
    linear-gradient(
      180deg,
      #f4770a,
      #e95d05
    );

  color: white;

  text-align: center;

  padding-top: 18px;

  position: relative;

  z-index: 2;

}


.banner-text {

  font-size: 22px;

  font-weight: bold;

}


.scallop {

  position: absolute;

  bottom: -12px;

  left: 0;

  right: 0;

  height: 25px;

  background:
    radial-gradient(
      circle at 12px -2px,
      #fffaf0 14px,
      transparent 15px
    )
    repeat-x;

  background-size: 24px 24px;

}


/* HEADER */

.header {

  text-align: center;

  position: relative;

  z-index: 3;

  padding-top: 22px;

}


.main-logo {

  width: 95px;

  height: 95px;

  object-fit: contain;

  display: block;

  margin: auto;

}


.om {

  font-size: 75px;

  line-height: 90px;

}


.mandal {

  font-size: 26px;

  font-weight: 800;

  margin-top: 8px;

}


.place {

  font-size: 14px;

  font-weight: 600;

  margin-top: 7px;

}


.gold-line {

  width: 75%;

  height: 2px;

  margin: 8px auto;

  background: #b08a42;

}


/* RECEIPT NUMBER */

.top-info {

  display: flex;

  justify-content: space-between;

  align-items: center;

  margin-top: 20px;

  padding: 8px 4px;

  border-top: 1px solid #c2a46d;

  border-bottom: 1px solid #c2a46d;

  position: relative;

  z-index: 3;

}


.receipt-no {

  border: 1px solid #8c6540;

  padding: 8px 15px;

  font-weight: bold;

}


.date {

  font-weight: bold;

}


/* CONTENT */

.content {

  position: relative;

  z-index: 3;

  margin-top: 25px;

}


.field {

  border-bottom: 2px dotted #c5a66a;

  padding: 8px 4px;

  min-height: 45px;

  font-size: 18px;

}


.label {

  color: #8b7664;

  font-size: 13px;

  display: block;

}


.value {

  font-weight: 700;

  font-size: 19px;

}


.two {

  display: grid;

  grid-template-columns:
    1.6fr
    0.8fr;

  gap: 20px;

}


/* WATERMARK */

.watermark {

  position: absolute;

  left: 50%;

  top: 58%;

  transform:
    translate(-50%,-50%)
    rotate(-20deg);

  font-size: 190px;

  color: rgba(170,120,60,0.09);

  font-weight: bold;

  z-index: 1;

}


/* BOTTOM AREA */

.bottom-area {

  position: relative;

  z-index: 3;

  display: flex;

  justify-content: space-between;

  align-items: center;

  margin-top: 45px;

}


.amount-box {

  width: 190px;

  background:
    linear-gradient(
      180deg,
      #f76b08,
      #d84d08
    );

  color: white;

  border: 3px solid #e3ad50;

  border-radius: 12px;

  text-align: center;

  padding: 10px;

  box-shadow:
    0 0 0 2px #9e5c20 inset;

}


.amount-title {

  font-size: 13px;

}


.amount-number {

  font-size: 28px;

  font-weight: 800;

  margin-top: 5px;

}


.qr {

  width: 105px;

  height: 105px;

  border: 5px solid white;

  box-shadow:
    0 0 0 1px #777;

}


/* SIGNATURES */

.signatures {

  position: relative;

  z-index: 3;

  display: grid;

  grid-template-columns:
    1fr
    1.15fr
    1fr;

  align-items: end;

  gap: 18px;

  margin-top: 75px;

  text-align: center;

}


.sign-box {

  min-height: 105px;

}


.sign-box img {

  width: 105px;

  height: 55px;

  object-fit: contain;

  display: block;

  margin: auto;

}


.sign-line {

  border-top: 1px solid #333;

  padding-top: 7px;

  font-weight: 700;

  font-size: 15px;

}


.role {

  font-weight: 600;

  font-size: 14px;

}


/* FOOTER */

.footer {

  position: absolute;

  left: 0;

  right: 0;

  bottom: 0;

  height: 55px;

  background: #f4e7c8;

  border-top: 1px solid #c39b55;

  text-align: center;

  padding-top: 8px;

  z-index: 3;

  font-weight: bold;

}


@media print {

  body {

    background: white;

    padding: 0;

  }

  .receipt {

    max-width: none;

    margin: 0;

    min-height: 285mm;

  }

}

</style>

</head>


<body>


<div class="receipt">


  <div class="top-banner">

    <div class="banner-text">

      ☆ &nbsp; ॥ श्री गणेश प्रसन्न ॥ &nbsp; ☆

    </div>

    <div class="scallop"></div>

  </div>


  <div class="header">

    ${logo}


    <div class="mandal">

      ${escapeHtml(
        profileData.mandalName
      )}

    </div>


    <div class="gold-line"></div>


    <div class="place">

      ${escapeHtml(
        profileData.place
      )}

    </div>

  </div>


  <div class="top-info">

    <div class="receipt-no">

      पावती क्र.
      ${receipt.receiptNumber || "-"}

    </div>


    <div class="date">

      दिनांक :
      ${formatDate(receipt.date)}

    </div>

  </div>


  <div class="watermark">
    ॐ
  </div>


  <div class="content">


    <div class="field">

      <span class="label">
        श्री. / श्रीमती
      </span>

      <span class="value">
        ${escapeHtml(receipt.name)}
      </span>

    </div>


    <div class="field">

      <span class="label">
        याद्वारे रक्कम रुपये (अक्षरी)
      </span>

      <span class="value">
        ${escapeHtml(amountWords)}
      </span>

    </div>


    <div class="field">

      <span class="label">
        English
      </span>

      <span class="value">
        Rupees ${Number(
          receipt.amount || 0
        ).toLocaleString("en-IN")} Only
      </span>

    </div>


    <div class="two">

      <div class="field">

        <span class="label">
          वर्गणी दाखल / कारण
        </span>

        <span class="value">
          ${escapeHtml(
            receipt.purpose ||
            "गणेश उत्सव वर्गणी"
          )}
        </span>

      </div>


      <div class="field">

        <span class="label">
          माध्यम
        </span>

        <span class="value">
          ${escapeHtml(
            receipt.paymentMode
          )}
        </span>

      </div>

    </div>


    <div class="field">

      <span class="label">
        स्वीकारले
      </span>

      <span class="value">
        ${escapeHtml(
          receipt.receivedBy
        )}
      </span>

    </div>


    <div class="bottom-area">


      <div class="amount-box">

        <div class="amount-title">
          रक्कम
        </div>

        <div class="amount-number">
          ₹ ${Number(
            receipt.amount || 0
          ).toLocaleString("en-IN")}/-
        </div>

      </div>


      <div>

        <div
          id="qrCode"
          class="qr">
        </div>

        <div
          style="
            text-align:center;
            font-size:11px;
            margin-top:4px;
          ">

          पावती

        </div>

      </div>


    </div>


  </div>


  <div class="signatures">


    <div class="sign-box">

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


    <div class="sign-box">

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


    <div class="sign-box">

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

    सहकार्याबद्दल मनःपूर्वक धन्यवाद 🙏

  </div>


</div>


<script
src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js">
</script>


<script>

new QRCode(
  document.getElementById("qrCode"),
  {
    text:
      "${location.origin}/?receipt=${receipt.receiptNumber || ""}",
    width: 95,
    height: 95
  }
);

</script>


</body>

</html>

  `;
}


/* =========================
   PRINT
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

  }, 1000);

}


/* =========================
   PDF LIBRARY
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
              "PDF library failed"
            )
          );


      document.head.appendChild(
        script
      );

    }
  );
}


/* =========================
   PDF
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


  const W = 210;

  const H = 297;

  const margin = 8;


  /* outer border */

  doc.setLineWidth(1);

  doc.rect(
    margin,
    margin,
    W - margin * 2,
    H - margin * 2
  );


  doc.setLineWidth(0.4);

  doc.rect(
    margin + 3,
    margin + 3,
    W - margin * 2 - 6,
    H - margin * 2 - 6
  );


  /* orange header */

  doc.setFillColor(
    238,
    96,
    8
  );

  doc.rect(
    11,
    11,
    188,
    25,
    "F"
  );


  doc.setTextColor(
    255,
    255,
    255
  );

  doc.setFontSize(14);

  doc.text(
    "☆  || Shri Ganesh Prasanna ||  ☆",
    105,
    26,
    {
      align: "center"
    }
  );


  doc.setTextColor(
    65,
    30,
    25
  );


  let y = 48;


  /* logo */

  if (profileData.logo) {

    try {

      doc.addImage(
        profileData.logo,
        "JPEG",
        82,
        y,
        46,
        35
      );

      y += 41;

    } catch (e) {

      y += 5;

    }

  } else {

    doc.setFontSize(28);

    doc.text(
      "OM",
      105,
      y + 12,
      {
        align: "center"
      }
    );

    y += 20;

  }


  doc.setFontSize(17);

  doc.setFont("helvetica", "bold");

  doc.text(
    profileData.mandalName,
    105,
    y,
    {
      align: "center"
    }
  );


  y += 8;


  doc.setFontSize(10);

  doc.text(
    profileData.place,
    105,
    y,
    {
      align: "center"
    }
  );


  y += 9;


  doc.line(
    30,
    y,
    180,
    y
  );


  y += 10;


  /* receipt no */

  doc.setFontSize(10);

  doc.setFont("helvetica", "normal");


  doc.text(
    "Pavati Kr.: " +
    String(
      receipt.receiptNumber || "-"
    ),
    18,
    y
  );


  doc.text(
    "Dinank: " +
    formatDate(receipt.date),
    192,
    y,
    {
      align: "right"
    }
  );


  y += 10;


  doc.line(
    18,
    y,
    192,
    y
  );


  y += 13;


  doc.setFontSize(11);


  doc.text(
    "Varganidarache nav:",
    20,
    y
  );


  doc.setFont("helvetica", "bold");


  doc.text(
    String(receipt.name || ""),
    62,
    y
  );


  y += 12;


  doc.setFont("helvetica", "normal");


  doc.text(
    "Rakkam akshari:",
    20,
    y
  );


  doc.text(
    String(
      receipt.amountInWords ||
      numberToMarathiWords(
        receipt.amount
      )
    ),
    60,
    y
  );


  y += 12;


  doc.text(
    "Rakkam:",
    20,
    y
  );


  doc.setFont("helvetica", "bold");


  doc.text(
    money(receipt.amount),
    50,
    y
  );


  y += 12;


  doc.setFont("helvetica", "normal");


  doc.text(
    "Vargani / Karan:",
    20,
    y
  );


  doc.text(
    String(
      receipt.purpose ||
      "Ganesh Utsav Vargani"
    ),
    62,
    y
  );


  y += 12;


  doc.text(
    "Madhyam:",
    20,
    y
  );


  doc.text(
    String(
      receipt.paymentMode || ""
    ),
    55,
    y
  );


  y += 12;


  doc.text(
    "Sweekarle:",
    20,
    y
  );


  doc.text(
    String(
      receipt.receivedBy || ""
    ),
    55,
    y
  );


  y += 35;


  /* amount box */

  doc.setFillColor(
    228,
    82,
    5
  );

  doc.roundedRect(
    20,
    y,
    55,
    25,
    4,
    4,
    "F"
  );


  doc.setTextColor(
    255,
    255,
    255
  );


  doc.setFontSize(9);

  doc.text(
    "Rakkam",
    47,
    y + 8,
    {
      align: "center"
    }
  );


  doc.setFontSize(17);

  doc.setFont("helvetica", "bold");

  doc.text(
    "Rs. " +
    Number(
      receipt.amount || 0
    ).toLocaleString("en-IN") +
    "/-",
    47,
    y + 18,
    {
      align: "center"
    }
  );


  doc.setTextColor(
    65,
    30,
    25
  );


  /* QR */

  const qrCanvas =
    document.createElement(
      "canvas"
    );


  if (
    typeof QRCode !==
    "undefined"
  ) {

    new QRCode(
      qrCanvas,
      {
        text:
          location.origin +
          "/?receipt=" +
          String(
            receipt.receiptNumber || ""
          ),
        width: 180,
        height: 180
      }
    );

  }


  /* signatures */

  y += 55;


  const leftX = 48;

  const centerX = 105;

  const rightX = 162;


  if (
    profileData.vicePresidentSign
  ) {

    try {

      doc.addImage(
        profileData.vicePresidentSign,
        "JPEG",
        leftX - 18,
        y - 14,
        36,
        18
      );

    } catch (e) {}

  }


  if (
    profileData.presidentSign
  ) {

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


  if (
    profileData.treasurerSign
  ) {

    try {

      doc.addImage(
        profileData.treasurerSign,
        "JPEG",
        rightX - 18,
        y - 14,
        36,
        18
      );

    } catch (e) {}

  }


  doc.setLineWidth(0.4);


  doc.line(
    leftX - 23,
    y + 5,
    leftX + 23,
    y + 5
  );


  doc.line(
    centerX - 27,
    y + 5,
    centerX + 27,
    y + 5
  );


  doc.line(
    rightX - 23,
    y + 5,
    rightX + 23,
    y + 5
  );


  doc.setFontSize(9);


  doc.text(
    profileData.vicePresident || "",
    leftX,
    y + 11,
    {
      align: "center"
    }
  );


  doc.text(
    "Upadhyaksha",
    leftX,
    y + 17,
    {
      align: "center"
    }
  );


  doc.text(
    profileData.president || "",
    centerX,
    y + 11,
    {
      align: "center"
    }
  );


  doc.text(
    "Adhyaksha",
    centerX,
    y + 17,
    {
      align: "center"
    }
  );


  doc.text(
    profileData.treasurer || "",
    rightX,
    y + 11,
    {
      align: "center"
    }
  );


  doc.text(
    "Khajindar",
    rightX,
    y + 17,
    {
      align: "center"
    }
  );


  doc.setFontSize(9);

  doc.text(
    "Sahakaryabaddal manahpurvak dhanyawad",
    105,
    278,
    {
      align: "center"
    }
  );


  return doc.output(
    "blob"
  );
}


/* =========================
   WHATSAPP PDF SHARE
========================= */

async function shareReceiptPDF(id) {

  try {

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
          type:
            "application/pdf"
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


    document.body.appendChild(
      a
    );


    a.click();

    a.remove();


    URL.revokeObjectURL(
      url
    );


    alert(
      "PDF तयार झाली. आता Downloads मधून WhatsApp वर पाठवा."
    );


  } catch (error) {

    console.error(
      "PDF Share Error:",
      error
    );


    alert(
      "PDF तयार/Share करता आली नाही."
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
