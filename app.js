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

    const p = await db
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
    console.error("Firebase Error:", error);
  }

  showHome();
}

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
              ${escapeHtml(profileData.mandalName)}
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
    document.getElementById("receiptList");

  if (!box) return;

  if (!list.length) {

    box.innerHTML = `
      <div class="card">
        अजून पावत्या नाहीत
      </div>
    `;

    return;
  }

  box.innerHTML = list
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
          onclick="shareWhatsApp('${item.id}')">

          📲 WhatsApp Share

        </button>

      </div>

    `)
    .join("");
}

function filterReceipts() {

  const input =
    document.getElementById("receiptSearch");

  if (!input) return;

  const value =
    input.value.toLowerCase().trim();

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
            placeholder="नाव"
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

  document.getElementById("donationDate").value =
    new Date().toISOString().split("T")[0];
}

async function saveReceipt() {

  const name =
    document.getElementById("donorName")
      .value
      .trim();

  const amount =
    Number(
      document.getElementById("donorAmount")
        .value
    );

  const paymentMode =
    document.getElementById("paymentMode")
      .value;

  const receivedBy =
    document.getElementById("receivedBy")
      .value
      .trim();

  const dateValue =
    document.getElementById("donationDate")
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

function shareWhatsApp(id) {

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

  const date =
    receipt.date &&
    receipt.date.toDate
      ? receipt.date
          .toDate()
          .toLocaleDateString("mr-IN")
      : "-";

  const message = `

🧾 *गणेश मित्र मंडळ राजे ग्रुप वारणानगर*

पावती क्रमांक: ${receipt.receiptNumber || "-"}
दिनांक: ${date}

वर्गणीदार: ${receipt.name || "-"}
रक्कम: ${money(receipt.amount)}
पेमेंट मोड: ${receipt.paymentMode || "-"}
रक्कम स्वीकारणारे: ${receipt.receivedBy || "-"}

अध्यक्ष: ${profileData.president || "-"}
उपाध्यक्ष: ${profileData.vicePresident || "-"}
खजिनदार: ${profileData.treasurer || "-"}

🙏 धन्यवाद
  `.trim();

  const whatsappUrl =
    "https://wa.me/?text=" +
    encodeURIComponent(message);

  window.open(
    whatsappUrl,
    "_blank"
  );
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

            `).join("")

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

          <br>

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
            अध्यक्ष Signature Upload
          </label>

          <input
            id="presidentSignFile"
            type="file"
            accept="image/*"
          >

          <br><br>

          <label>
            उपाध्यक्ष Signature Upload
          </label>

          <input
            id="vicePresidentSignFile"
            type="file"
            accept="image/*"
          >

          <br><br>

          <label>
            खजिनदार Signature Upload
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

          let width = img.width;

          let height = img.height;

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

        img.onerror = reject;

        img.src =
          reader.result;
      };

      reader.onerror = reject;

      reader.readAsDataURL(file);
    }
  );
}

async function saveProfile() {

  try {

    const logo =
      await readImage(
        document.getElementById(
          "logoFile"
        ).files[0]
      );

    const presidentSign =
      await readImage(
        document.getElementById(
          "presidentSignFile"
        ).files[0]
      );

    const vicePresidentSign =
      await readImage(
        document.getElementById(
          "vicePresidentSignFile"
        ).files[0]
      );

    const treasurerSign =
      await readImage(
        document.getElementById(
          "treasurerSignFile"
        ).files[0]
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
      data.logo = logo;
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

  const logo =
    profileData.logo

      ? `
        <img
          class="receiptLogo"
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
          src="${profileData.presidentSign}"
        >
      `

      : "";

  const vicePresidentSign =
    profileData.vicePresidentSign

      ? `
        <img
          src="${profileData.vicePresidentSign}"
        >
      `

      : "";

  const treasurerSign =
    profileData.treasurerSign

      ? `
        <img
          src="${profileData.treasurerSign}"
        >
      `

      : "";

  const date =
    receipt.date &&
    receipt.date.toDate

      ? receipt.date
          .toDate()
          .toLocaleDateString("mr-IN")

      : "";

  const html = `

<!DOCTYPE html>

<html lang="mr">

<head>

<meta charset="UTF-8">

<title>
पावती ${receipt.receiptNumber}
</title>

<style>

body {

  font-family:
    Arial,
    sans-serif;

  background: #eee;

  margin: 0;

  padding: 20px;

}

.receipt {

  max-width: 700px;

  margin: auto;

  background: white;

  border: 2px solid #333;

  padding: 25px;

  box-sizing: border-box;

}

.header {

  text-align: center;

}

.receiptLogo {

  width: 130px;

  height: 130px;

  object-fit: contain;

  display: block;

  margin: auto;

}

.om {

  font-size: 70px;

}

h1 {

  margin: 8px 0;

}

.sub {

  font-size: 18px;

}

.top {

  display: flex;

  justify-content:
    space-between;

  margin-top: 20px;

  border-top:
    1px solid #999;

  border-bottom:
    1px solid #999;

  padding: 10px 0;

}

.info {

  margin-top: 20px;

  line-height: 2;

  font-size: 18px;

}

.amount {

  font-size: 25px;

  font-weight: bold;

}

.signatures {

  display: flex;

  align-items:
    flex-end;

  justify-content:
    space-between;

  margin-top: 60px;

  text-align: center;

}

.signature {

  width: 30%;

}

.signature img {

  width: 110px;

  height: 60px;

  object-fit: contain;

  display: block;

  margin: auto;

}

.line {

  border-top:
    1px solid #333;

  margin-top: 5px;

  padding-top: 5px;

}

.president {

  width: 34%;

}

@media print {

  body {

    background: white;

    padding: 0;

  }

  .receipt {

    border: 2px solid #333;

    margin: 0;

  }

}

</style>

</head>

<body>

<div class="receipt">

  <div class="header">

    ${logo}

    <h1>
      ${escapeHtml(
        profileData.mandalName
      )}
    </h1>

    <div class="sub">
      गणेश उत्सव वर्गणी पावती
    </div>

  </div>

  <div class="top">

    <div>

      <b>
        पावती क्रमांक:
      </b>

      ${receipt.receiptNumber || "-"}

    </div>

    <div>

      <b>
        दिनांक:
      </b>

      ${date}

    </div>

  </div>

  <div class="info">

    <div>

      <b>
        वर्गणीदाराचे नाव:
      </b>

      ${escapeHtml(
        receipt.name
      )}

    </div>

    <div>

      <b>
        रक्कम:
      </b>

      <span class="amount">
        ${money(receipt.amount)}
      </span>

    </div>

    <div>

      <b>
        पेमेंट मोड:
      </b>

      ${escapeHtml(
        receipt.paymentMode
      )}

    </div>

    <div>

      <b>
        रक्कम स्वीकारणारे:
      </b>

      ${escapeHtml(
        receipt.receivedBy
      )}

    </div>

  </div>

  <div class="signatures">

    <div class="signature">

      ${vicePresidentSign}

      <div class="line">

        ${escapeHtml(
          profileData.vicePresident
        )}

        <br>

        उपाध्यक्ष

      </div>

    </div>

    <div class="signature president">

      ${presidentSign}

      <div class="line">

        ${escapeHtml(
          profileData.president
        )}

        <br>

        अध्यक्ष

      </div>

    </div>

    <div class="signature">

      ${treasurerSign}

      <div class="line">

        ${escapeHtml(
          profileData.treasurer
        )}

        <br>

        खजिनदार

      </div>

    </div>

  </div>

</div>

<script>

window.onload = function() {

  window.print();

};

</script>

</body>

</html>
`;

  const win =
    window.open(
      "",
      "_blank"
    );

  if (!win) {

    alert(
      "Popup बंद आहे. Browser मध्ये popup allow करा."
    );

    return;
  }

  win.document.open();

  win.document.write(html);

  win.document.close();
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

loadData();
