# Ward Connect (app + backend)
## 1. Backend (database)
cd backend && npm install && npm start      -> API on :3000, data ward.db madhe save hoto
(Users baghayla: DB Browser for SQLite ne ward.db ughda)
## 2. App
Ek navin terminal: npm install ; npx expo install --fix
src/config.js madhe API_URL = http://<PC cha LAN IP>:3000   (phone + PC same WiFi)
npx expo start -> Expo Go madhe QR scan
Pahilyanda details bhara. Nantar app band/chalu kela tari direct Home ughdto.
Navin phone var: same email + same DOB takla ki parat login hoto.
## 3. Production
Backend HTTPS var host kara (Render/Railway/VPS), API_URL = https://... ; mag: eas build -p android
Images: raw-images/ madhe thev -> npm run img (compressed webp)
