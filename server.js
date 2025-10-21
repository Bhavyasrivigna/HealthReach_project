// backend/server.js
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Low, JSONFile } = require('lowdb');
const { nanoid } = require('nanoid');

const app = express();
const PORT = 3000;

// Database setup
const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

async function initDb() {
  await db.read();
  db.data = db.data || { users: [], hospitals: [], appointments: [], ambulances: [] };

  // Default hospitals (added only once)
  if (db.data.hospitals.length === 0) {
    db.data.hospitals.push(
      { id: nanoid(), name: "Govt General Hospital", type: "govt", beds_free: 12, icu_free: 1, oxygen: true },
      { id: nanoid(), name: "Sunrise Private Hospital", type: "private", beds_free: 8, icu_free: 2, oxygen: true }
    );
    await db.write();
  }
}
initDb();

app.use(cors());
app.use(bodyParser.json());

// Serve your frontend (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..')));

// Temporary OTP store
let otpStore = {};
function makeOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ✅ API: Request OTP
app.post('/api/request-otp', (req, res) => {
  const { phone, name, role } = req.body;
  const otp = makeOtp();
  otpStore[phone] = { otp, name, role, exp: Date.now() + 5 * 60 * 1000 };
  console.log(`[OTP] ${phone}: ${otp}`);
  res.json({ ok: true, msg: "OTP sent (check terminal)" });
});

// ✅ API: Verify OTP
app.post('/api/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  const record = otpStore[phone];
  if (!record || record.exp < Date.now()) return res.status(400).json({ error: "OTP expired" });
  if (record.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

  await db.read();
  let user = db.data.users.find(u => u.phone === phone);
  if (!user) {
    user = { id: nanoid(), phone, name: record.name || "User", role: record.role || "patient" };
    db.data.users.push(user);
    await db.write();
  }

  delete otpStore[phone];
  res.json({ ok: true, user });
});

// ✅ API: Get hospitals
app.get('/api/hospitals', async (req, res) => {
  await db.read();
  res.json(db.data.hospitals);
});

// ✅ Start server
app.listen(PORT, () => console.log(`✅ Server running → http://localhost:${PORT}`));
