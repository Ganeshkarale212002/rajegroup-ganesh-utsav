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
   AMOUNT WORDS
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

  function two(n) {

    if (n < 20) {
      return ones[n];
    }

    return tens[Math.floor(n / 10)] +
      (n % 10 ? " " + ones[n % 10] : "");
  }

  function convert(n) {

    if (n < 100) {
      return two(n);
    }

    if (n < 1000) {
      return ones[Math.floor(n / 100)] +
        "शे " +
        (n % 100 ? convert(n % 100) : "");
    }

    if (n < 100000) {
      return two(Math.floor(n / 1000)) +
        " हजार " +
        (n % 1000 ? convert(n % 1000) : "");
    }

    if (n < 10000000) {
      return two(Math.floor(n / 100000)) +
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

            <h1>राजे ग्रुप</h1>

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
      (a, x) =>
        a + Number(x.amount || 0),
      0
    );

  const expense =
    expensesData.reduce(
      (a, x) =>
        a + Number(x.amount || 0),
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
                .map(x => `

                  <div class="row">

                    <span>
                      पावती ${x.receiptNumber || "-"}
                      •
                      ${escapeHtml(x.name)}
                    </span>

                    <span class="amount">
                      ${money(x.amount)}
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
      .map(x => `

        <div class="card">

          <div class="row">

            <div>

              <b>
                पावती ${x.receiptNumber || "-"}
              </b>

              <div class="muted">
                ${escapeHtml(x.name)}
              </div>

              <div class="muted">
                ${escapeHtml(x.paymentMode)}
              </div>

              <div class="muted">
                ${formatDate(x.date)}
              </div>

            </div>


            <span class="amount">
              ${money(x.amount)}
            </span>

          </div>


          <button
            class="action"
            onclick="printReceipt('${x.id}')">

            📄 PDF / Print

          </button>


          <button
            class="action"
            onclick="shareReceiptPDF('${x.id}')">

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


  const q =
    input.value
      .toLowerCase()
      .trim();


  const result =
    receiptsData.filter(x => {

      return (
        String(x.name || "")
          .toLowerCase()
          .includes(q) ||

        String(x.receiptNumber || "")
          .toLowerCase()
          .includes(q)
      );

    });


  renderReceipts(result);
}


/* =========================
   NEW RECEIPT
========================= */

function showNewReceiptForm() {

  root.innerHTML = `

    <div class="app">

      <header>

        <div class="brand">

          <div class="logo">ॐ</div>

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
            value="${escapeHtml(
              profileData.president
            )}"
          >


          <br>


          <label>
            वर्गणी दाखल / कारण
          </label>

          <input
            id="purpose"
            class="search"
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

    const snap =
      await db
        .collection("vargani")
        .get();


    let next = 1;


    snap.forEach(doc => {

      const n =
        Number(
          doc.data().receiptNumber || 0
        );


      if (n >= next) {
        next = n + 1;
      }

    });


    let timestamp =
      firebase.firestore.Timestamp.now();


    if (dateValue) {

      timestamp =
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

        paymentMode:
          paymentMode,

        receivedBy:
          receivedBy,

        purpose:
          purpose,

        amountInWords:
          numberToMarathiWords(
            amount
          ),

        receiptNumber:
          next,

        date:
          timestamp

      });


    alert(
      "पावती क्रमांक " +
      next +
      " तयार झाली."
    );


    await loadData();

    showReceipts();

  } catch (error) {

    console.error(error);

    alert(
      "पावती सेव्ह झाली नाही."
    );

  }
}


/* =========================
   MEMBERS
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
              .map(x => `

                <div class="card">

                  <b>
                    ${escapeHtml(x.name)}
                  </b>

                  <div class="amount">
                    ${escapeHtml(
                      x.role ||
                      "कार्यकर्ता"
                    )}
                  </div>

                  <div class="muted">
                    ${escapeHtml(x.mobile)}
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


/* =========================
   PROFILE
========================= */

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
            अध्यक्ष
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
            उपाध्यक्ष
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
            खजिनदार
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
            Logo Upload
          </label>

          <input
            id="logoFile"
            type="file"
            accept="image/*"
          >


          <br><br>


          <label>
            अध्यक्ष Signature
          </label>

          <input
            id="presidentSignFile"
            type="file"
            accept="image/*"
          >


          <br><br>


          <label>
            उपाध्यक्ष Signature
          </label>

          <input
            id="vicePresidentSignFile"
            type="file"
            accept="image/*"
          >


          <br><br>


          <label>
            खजिनदार Signature
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

          let w = img.width;

          let h = img.height;


          if (w > max) {

            h =
              h * max / w;

            w = max;

          }


          canvas.width = w;

          canvas.height = h;


          const ctx =
            canvas.getContext("2d");


          ctx.drawImage(
            img,
            0,
            0,
            w,
            h
          );


          resolve(
            canvas.toDataURL(
              "image/jpeg",
              0.8
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
          .getElementById("presidentSignFile")
          .files[0]
      );


    const viceSign =
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


    if (logo)
      data.logo = logo;


    if (presidentSign)
      data.presidentSign =
        presidentSign;


    if (viceSign)
      data.vicePresidentSign =
        viceSign;


    if (treasurerSign)
      data.treasurerSign =
        treasurerSign;


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

    console.error(error);

    alert(
      "प्रोफाइल सेव्ह करताना समस्या आली."
    );

  }
}


/* ==================================================
   EXACT RECEIPT DESIGN
================================================== */

function buildReceiptDOM(receipt) {

  const wrapper =
    document.createElement("div");


  wrapper.id =
    "pdfReceipt";


  wrapper.style.cssText = `
    position:absolute;
    left:-10000px;
    top:0;
    width:650px;
    height:920px;
    background:#fffaf0;
    overflow:hidden;
  `;


  const logo =
    profileData.logo

      ? `
        <img
          class="r-logo"
          src="${profileData.logo}"
        >
      `

      : `
        <div class="r-om">
          ॐ
        </div>
      `;


  const vpSign =
    profileData.vicePresidentSign
      ? `<img src="${profileData.vicePresidentSign}">`
      : "";


  const pSign =
    profileData.presidentSign
      ? `<img src="${profileData.presidentSign}">`
      : "";


  const tSign =
    profileData.treasurerSign
      ? `<img src="${profileData.treasurerSign}">`
      : "";


  const words =
    receipt.amountInWords ||
    numberToMarathiWords(
      receipt.amount
    );


  wrapper.innerHTML = `

<style>

#pdfReceipt {

  font-family:
    Arial,
    "Noto Sans Devanagari",
    sans-serif;

  color:#4a211d;

}


.r-page {

  width:650px;

  height:920px;

  position:relative;

  background:#fffaf0;

  border:4px solid #6c2020;

  box-sizing:border-box;

}


.r-inner {

  position:absolute;

  left:6px;

  right:6px;

  top:6px;

  bottom:6px;

  border:2px solid #a47b3d;

}


.r-orange {

  position:absolute;

  left:0;

  top:0;

  width:100%;

  height:78px;

  background:#f26a08;

}


.r-orange-text {

  color:white;

  text-align:center;

  font-size:20px;

  font-weight:bold;

  padding-top:17px;

}


.r-scallop {

  position:absolute;

  left:0;

  bottom:-11px;

  width:100%;

  height:22px;

  background:
    radial-gradient(
      circle at 11px 0,
      #fffaf0 11px,
      transparent 12px
    );

  background-size:22px 22px;

}


.r-head {

  position:absolute;

  top:83px;

  left:20px;

  right:20px;

  text-align:center;

}


.r-logo {

  width:72px;

  height:72px;

  object-fit:contain;

}


.r-om {

  font-size:60px;

  height:72px;

}


.r-title {

  font-size:25px;

  font-weight:bold;

  margin-top:3px;

}


.r-place {

  font-size:13px;

  font-weight:bold;

  margin-top:6px;

}


.r-gold {

  width:220px;

  height:2px;

  background:#b89958;

  margin:7px auto;

}


.r-top {

  position:absolute;

  top:278px;

  left:28px;

  right:28px;

  height:55px;

  border-top:1px solid #b9995a;

  border-bottom:1px solid #b9995a;

}


.r-no {

  position:absolute;

  left:0;

  top:10px;

  border:1px solid #8e6841;

  padding:7px 13px;

  font-size:15px;

  font-weight:bold;

}


.r-date {

  position:absolute;

  right:0;

  top:17px;

  font-size:15px;

  font-weight:bold;

}


.r-content {

  position:absolute;

  top:345px;

  left:30px;

  right:30px;

}


.r-field {

  border-bottom:
    2px dotted #c9aa6d;

  min-height:48px;

  padding-top:5px;

}


.r-label {

  display:block;

  color:#887766;

  font-size:12px;

}


.r-value {

  font-size:17px;

  font-weight:bold;

  margin-top:4px;

}


.r-two {

  display:grid;

  grid-template-columns:1.55fr .75fr;

  gap:18px;

}


.r-watermark {

  position:absolute;

  left:50%;

  top:485px;

  transform:
    translate(-50%,-50%)
    rotate(-20deg);

  font-size:180px;

  font-weight:bold;

  color:rgba(180,130,70,.08);

}


.r-bottom {

  position:absolute;

  left:30px;

  right:30px;

  top:625px;

  display:flex;

  justify-content:space-between;

  align-items:center;

}


.r-money {

  width:165px;

  height:68px;

  background:#f26108;

  border:3px solid #e1a64d;

  border-radius:12px;

  color:white;

  text-align:center;

  box-sizing:border-box;

  padding-top:8px;

}


.r-money-label {

  font-size:12px;

}


.r-money-value {

  font-size:24px;

  font-weight:bold;

  margin-top:4px;

}


.r-qr {

  width:82px;

  height:82px;

  background:white;

  display:flex;

  align-items:center;

  justify-content:center;

}


.r-signs {

  position:absolute;

  left:28px;

  right:28px;

  bottom:55px;

  display:grid;

  grid-template-columns:1fr 1.15fr 1fr;

  gap:15px;

  text-align:center;

  align-items:end;

}


.r-sign {

  height:72px;

}


.r-sign img {

  width:105px;

  height:48px;

  object-fit:contain;

}


.r-line {

  border-top:1px solid #333;

  padding-top:5px;

  font-size:13px;

  font-weight:bold;

}


.r-role {

  font-size:12px;

  margin-top:3px;

}


.r-footer {

  position:absolute;

  bottom:0;

  left:0;

  right:0;

  height:38px;

  background:#f4e5c4;

  border-top:1px solid #c39b55;

  text-align:center;

  padding-top:8px;

  box-sizing:border-box;

  font-size:12px;

  font-weight:bold;

}

</style>


<div class="r-page">

  <div class="r-inner"></div>


  <div class="r-orange">

    <div class="r-orange-text">
      ☆ &nbsp; ॥ श्री गणेश प्रसन्न ॥ &nbsp; ☆
    </div>

    <div class="r-scallop"></div>

  </div>


  <div class="r-head">

    ${logo}


    <div class="r-title">

      ${escapeHtml(
        profileData.mandalName
      )}

    </div>


    <div class="r-gold"></div>


    <div class="r-place">

      ${escapeHtml(
        profileData.place
      )}

    </div>

  </div>


  <div class="r-top">

    <div class="r-no">

      पावती क्र.
      ${receipt.receiptNumber || "-"}

    </div>


    <div class="r-date">

      दिनांक :
      ${formatDate(receipt.date)}

    </div>

  </div>


  <div class="r-watermark">
    ॐ
  </div>


  <div class="r-content">


    <div class="r-field">

      <span class="r-label">
        श्री. / श्रीमती
      </span>

      <div class="r-value">
        ${escapeHtml(receipt.name)}
      </div>

    </div>


    <div class="r-field">

      <span class="r-label">
        याद्वारे रक्कम रुपये (अक्षरी)
      </span>

      <div class="r-value">
        ${escapeHtml(words)}
      </div>

    </div>


    <div class="r-field">

      <span class="r-label">
        English
      </span>

      <div class="r-value">
        One Thousand Rupees Only
      </div>

    </div>


    <div class="r-two">


      <div class="r-field">

        <span class="r-label">
          वर्गणी दाखल / कारण
        </span>

        <div class="r-value">
          ${escapeHtml(
            receipt.purpose ||
            "गणेश उत्सव वर्गणी"
          )}
        </div>

      </div>


      <div class="r-field">

        <span class="r-label">
          माध्यम
        </span>

        <div class="r-value">
          ${escapeHtml(
            receipt.paymentMode
          )}
        </div>

      </div>


    </div>


    <div class="r-field">

      <span class="r-label">
        स्वीकारले
      </span>

      <div class="r-value">
        ${escapeHtml(
          receipt.receivedBy
        )}
      </div>

    </div>


  </div>


  <div class="r-bottom">


    <div class="r-money">

      <div class="r-money-label">
        रक्कम
      </div>

      <div class="r-money-value">

        ₹ ${Number(
          receipt.amount || 0
        ).toLocaleString("en-IN")}/-

      </div>

    </div>


    <div>

      <div
        id="receiptQR"
        class="r-qr">
      </div>

      <div
        style="
          text-align:center;
          font-size:9px;
          margin-top:3px;
        ">

        पावती

      </div>

    </div>


  </div>


  <div class="r-signs">


    <div class="r-sign">

      ${vpSign}

      <div class="r-line">

        ${escapeHtml(
          profileData.vicePresident
        )}

        <div class="r-role">
          उपाध्यक्ष
        </div>

      </div>

    </div>


    <div class="r-sign">

      ${pSign}

      <div class="r-line">

        ${escapeHtml(
          profileData.president
        )}

        <div class="r-role">
          अध्यक्ष
        </div>

      </div>

    </div>


    <div class="r-sign">

      ${tSign}

      <div class="r-line">

        ${escapeHtml(
          profileData.treasurer
        )}

        <div class="r-role">
          खजिनदार
        </div>

      </div>

    </div>


  </div>


  <div class="r-footer">

    सहकार्याबद्दल मनःपूर्वक धन्यवाद

  </div>


</div>
`;


  document.body.appendChild(
    wrapper
  );


  return wrapper;
}


/* =========================
   LOAD QR CODE
========================= */

function loadQRCode() {

  return new Promise(
    (resolve, reject) => {

      if (
        typeof QRCode !==
        "undefined"
      ) {

        resolve();

        return;
      }


      const s =
        document.createElement(
          "script"
        );


      s.src =
        "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";


      s.onload =
        () => resolve();


      s.onerror =
        () =>
          reject(
            new Error(
              "QR library failed"
            )
          );


      document.head.appendChild(
        s
      );

    }
  );
}


/* =========================
   LOAD HTML2CANVAS
========================= */

function loadHtml2Canvas() {

  return new Promise(
    (resolve, reject) => {

      if (
        typeof html2canvas !==
        "undefined"
      ) {

        resolve();

        return;
      }


      const s =
        document.createElement(
          "script"
        );


      s.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";


      s.onload =
        () => resolve();


      s.onerror =
        () =>
          reject(
            new Error(
              "html2canvas failed"
            )
          );


      document.head.appendChild(
        s
      );

    }
  );
}


/* =========================
   LOAD JSPDF
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


      const s =
        document.createElement(
          "script"
        );


      s.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";


      s.onload =
        () => resolve();


      s.onerror =
        () =>
          reject(
            new Error(
              "jsPDF failed"
            )
          );


      document.head.appendChild(
        s
      );

    }
  );
}


/* =========================
   CREATE REAL PDF
========================= */

async function createReceiptPDF(id) {

  const receipt =
    receiptsData.find(
      x => x.id === id
    );


  if (!receipt) {

    throw new Error(
      "Receipt not found"
    );

  }


  await loadQRCode();

  await loadHtml2Canvas();

  await loadJsPDF();


  const element =
    buildReceiptDOM(
      receipt
    );


  /* QR */

  const qr =
    document.getElementById(
      "receiptQR"
    );


  if (qr) {

    new QRCode(
      qr,
      {
        text:
          location.origin +
          "/?receipt=" +
          String(
            receipt.receiptNumber || ""
          ),

        width:72,

        height:72
      }
    );

  }


  /* wait for logo/signatures/QR */

  await new Promise(
    resolve =>
      setTimeout(
        resolve,
        900
      )
  );


  const canvas =
    await html2canvas(
      element,
      {
        scale: 2,

        useCORS: true,

        backgroundColor:
          "#fffaf0",

        width: 650,

        height: 920
      }
    );


  const image =
    canvas.toDataURL(
      "image/jpeg",
      0.95
    );


  const {
    jsPDF
  } = window.jspdf;


  const pdf =
    new jsPDF({

      orientation:
        "portrait",

      unit:
        "mm",

      format:
        "a4"

    });


  /*
     IMPORTANT:
     650 x 920 is same A4 proportion.
     त्यामुळे receipt stretch होणार नाही.
  */

  pdf.addImage(
    image,
    "JPEG",
    0,
    0,
    210,
    297
  );


  const blob =
    pdf.output("blob");


  element.remove();


  return blob;
}


/* =========================
   PRINT
========================= */

async function printReceipt(id) {

  try {

    const receipt =
      receiptsData.find(
        x => x.id === id
      );


    if (!receipt) {

      alert(
        "पावती सापडली नाही."
      );

      return;

    }


    const element =
      buildReceiptDOM(
        receipt
      );


    await loadQRCode();


    const qr =
      document.getElementById(
        "receiptQR"
      );


    if (qr) {

      new QRCode(
        qr,
        {
          text:
            location.origin +
            "/?receipt=" +
            String(
              receipt.receiptNumber || ""
            ),

          width:72,

          height:72
        }
      );

    }


    await new Promise(
      r =>
        setTimeout(
          r,
          700
        )
    );


    const win =
      window.open(
        "",
        "_blank"
      );


    if (!win) {

      element.remove();

      alert(
        "Popup allow करा."
      );

      return;

    }


    win.document.write(`

      <html>

      <head>

        <title>
          पावती ${receipt.receiptNumber}
        </title>

        <style>

          body {
            margin:0;
            padding:0;
            background:white;
          }

          @page {
            size:A4;
            margin:0;
          }

        </style>

      </head>

      <body>

        ${element.innerHTML}

      </body>

      </html>

    `);


    win.document.close();


    element.remove();


    setTimeout(
      () => {

        win.print();

      },
      900
    );


  } catch (error) {

    console.error(error);

    alert(
      "PDF/Print तयार करता आले नाही."
    );

  }
}


/* =========================
   WHATSAPP ACTUAL PDF
========================= */

async function shareReceiptPDF(id) {

  try {

    alert(
      "तुझी पावती PDF तयार होत आहे..."
    );


    const receipt =
      receiptsData.find(
        x => x.id === id
      );


    if (!receipt) {

      alert(
        "पावती सापडली नाही."
      );

      return;

    }


    const blob =
      await createReceiptPDF(
        id
      );


    const fileName =
      "राजे-ग्रुप-पावती-" +
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


    /*
       Android Chrome मध्ये
       हे WhatsApp ला actual PDF
       attachment म्हणून देईल.
    */

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

        files: [file]

      });

      return;

    }


    /*
       जर browser file-share support करत नसेल
    */

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
