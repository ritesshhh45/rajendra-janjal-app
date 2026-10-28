// Database = ward.db (SQLite file, apoap banto). Production la HTTPS (nginx / Render / Railway) magh chalva.
const express = require('express'), helmet = require('helmet'), rateLimit = require('express-rate-limit');
const Database = require('better-sqlite3'), crypto = require('crypto');
const db = new Database('ward.db');
db.exec(`CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, name TEXT, mobile TEXT, email TEXT UNIQUE, dob TEXT, address TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY, user_id INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP);`);
const app = express(); app.use(helmet()); app.use(express.json({ limit: '10kb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 60 }));                       // brute-force pasun bachav
const strict = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { message: 'Too many attempts. Try later.' } });
const hash = (t) => crypto.createHash('sha256').update(t).digest('hex');
const str = (v, min, max) => typeof v === 'string' && v.trim().length >= min && v.length <= max;
const validDob = (v) => { const d = new Date(v); return /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(d) && (Date.now() - d) / (365.25 * 864e5) >= 18 && (Date.now() - d) / (365.25 * 864e5) < 110; };

app.post('/register', strict, (req, res) => {
  const b = req.body || {};
  if (!str(b.name, 2, 60) || !/^[6-9]\d{9}$/.test(b.mobile) || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(b.email || '') || !str(b.address, 3, 200) || !validDob(b.dob))
    return res.status(400).json({ message: 'Please check your details' });
  const email = b.email.toLowerCase();
  let u = db.prepare('SELECT * FROM users WHERE email=?').get(email);
  if (u && u.dob !== b.dob) return res.status(403).json({ message: 'Email already registered. Check date of birth.' }); // same email + same DOB = same person (navin phone var pn chalto)
  if (!u) { const r = db.prepare('INSERT INTO users(name,mobile,email,dob,address) VALUES(?,?,?,?,?)').run(b.name.trim(), b.mobile, email, b.dob, b.address.trim()); u = { id: r.lastInsertRowid }; }
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions(token_hash,user_id) VALUES(?,?)').run(hash(token), u.id);
  res.json({ token });
});
app.post('/account/delete', (req, res) => {
  const t = (req.headers.authorization || '').replace('Bearer ', '');
  const s = t && db.prepare('SELECT user_id FROM sessions WHERE token_hash=?').get(hash(t));
  if (!s) return res.status(401).json({ message: 'Unauthorized' });
  db.prepare('DELETE FROM sessions WHERE user_id=?').run(s.user_id); db.prepare('DELETE FROM users WHERE id=?').run(s.user_id);
  res.json({ ok: true });
});
app.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log('API running on :3000'));
