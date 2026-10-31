# Digital Ward (Rajendra Janjal app) – Security & Release Review

Reviewed: full source from the zip (DB migrations, server routes, auth, admin panel, Android project, build).
Checks run: `tsc` (1 error, fixed), `vitest` (8/8 pass), `build:app` (OK), `npm audit`, manual code review.
NOT checked (not in the zip): your LIVE Supabase database, Lovable project settings, Firebase console.

## A. Fixed in this zip (v7)

| # | Severity | Problem | Fix |
|---|----------|---------|-----|
| 1 | CRITICAL | `register_citizen` gave the session token of an EXISTING citizen to anyone who typed that mobile number. With it: read name/address/DOB (`citizen_me`), read complaints, delete the account. No OTP. | 0007 SQL: existing mobile gets its token back only from the same device_id; everyone else gets "already registered". Rate limits added. |
| 2 | HIGH | `/api/public/hooks/birthday-wishes` accepted ANY header `Authorization: Bearer x` (the real cron secret was never checked). Anyone could trigger it. | Now uses `authenticateCronRequest` (LOVABLE_CRON_SECRET). |
| 3 | MEDIUM | Personal data (profile, complaints) AND the full admin citizen list were cached in browser localStorage for 7 days. | `offline-cache.ts` no longer persists `me`, `complaints`, `admin`. |
| 4 | MEDIUM | Admin panel could read every citizen's `session_token` (admin account theft = impersonate all citizens). | Column-level grant: admin can read only id, name, mobile, address, dob, created_at. |
| 5 | MEDIUM | Android `allowBackup=true` (app data incl. session token can be copied by adb/cloud backup). | `allowBackup=false`, cleartext off. |
| 6 | MEDIUM | No limit on complaint spam; category not validated. | 20 complaints/day/citizen, active category required. |
| 7 | LOW | Admin sign-up creates pending rows even for unconfirmed e-mails; admin helper functions callable by anonymous users. | `claim_admin` needs confirmed e-mail; EXECUTE revoked from anon. |
| 8 | LOW | Scheme "Apply" link accepted `javascript:` URLs. | Only http/https shown. |
| 9 | LOW | Delete account failed silently on network error. | Error toast, session kept. |
| 10 | BUILD | `tsc` error TS4111 in translate.ts. | Fixed. |

## B. You MUST verify / do yourself (I cannot see these)

1. **Live DB function.** Your app code (`citizen.ts`) already expects "empty row if mobile exists" and `rate_limited`, but the SQL in `drizzle/migrations/0004` did not do that. Your live DB may differ from the repo. Run 0007 anyway, then TEST: register a number in one browser, try the same number in another browser/incognito -> must say "already registered" and must NOT log you in.
2. **Admin API host.** `src/lib/admin.ts` points to `rajendra-bhau-app.lovable.app`, but README/v5 used `rajendra-janjal-app.lovable.app`. The admin login token is sent to that host. Make sure it is YOUR project (best: your own custom domain) and set `VITE_API_BASE`.
3. **Supabase Auth settings:** turn OFF "Allow new users to sign up" after your admin account(s) exist; use a long unique password (and MFA if available) for the primary admin. Check `select * from admins;` — only people you know, approved.
4. **Birthday cron:** `0005` enables pg_cron but never schedules a job. Check `select * from cron.job;` and that LOVABLE_CRON_SECRET is set. Test: `curl -X POST <host>/api/public/hooks/birthday-wishes -H "Authorization: Bearer wrong"` -> must return 401.
5. **Storage bucket `media`** must be PRIVATE (policies assume that). Signed URLs are valid 20 years; fine for public photos, never upload private documents there.
6. **Secrets:** FCM_SERVICE_ACCOUNT and SUPABASE_SERVICE_ROLE_KEY only in server env (never in code). Zip contains `.env` with only the publishable key (OK), but do not commit `.env` to GitHub; also delete `janjal-fix-files-v4/5/6.zip` and `offline-backbutton-fix.patch` (empty) from the repo.
7. **Dependencies:** `npm audit` shows vite (dev-server issues) and zod (<4.6.6) high. Update when Lovable's toolchain allows (`npm audit fix`, test build). Not exploitable from the app APK itself.

## C. The REAL fix for citizen login: SMS OTP (recommended before big launch)
Right now a mobile number is not verified. Anyone can register someone else's number; the interim fix (device match) blocks takeover but means: a citizen who reinstalls the app / changes phone cannot log back in (they see "already registered"). Add SMS OTP (Supabase Phone Auth with an Indian SMS provider such as MSG91/Twilio, DLT registration needed in India), then tie `citizens` to `auth.uid()`.

## D. Play Store / App Store checklist

**Common**
- Publish under the leader's / office's own developer account (impersonation + political-party-logo policies). Keep a written authorization from the office/party for the party logo and the leader's photos.
- Public HTTPS privacy-policy URL (your `/privacy` page works if the site is deployed and reachable without login). Add: data processors (Supabase/Lovable Cloud, Google Firebase), retention period, grievance contact (DPDP Act 2023), and a consent checkbox on the register screen.
- Reviewer test access: registration has no OTP, so give reviewers a test mobile/instructions.

**Android (Google Play, $25 one-time)**
- Release signing: no signing config in `build.gradle`. Create a keystore (BACK IT UP — lose it, lose the app), build a signed AAB, bump `versionCode` for each upload.
- Add `android/app/google-services.json` (Firebase) for push; `build-app.mjs` enables push automatically when it exists.
- Play "Data safety" form: name, phone, address, DOB, device token, complaints. Account deletion: in-app exists; Play also needs a web page/URL explaining how to request deletion.
- Commands: `npm run build:app` -> `npx cap sync android` -> Android Studio -> Build > Generate Signed Bundle.

**iOS (Apple, $99/year, needs a Mac + Xcode)**
- The project has NO iOS part yet: `npm i @capacitor/ios`, `npx cap add ios`, `npx cap sync ios`, open in Xcode.
- Push on iOS: APNs key uploaded to Firebase + `GoogleService-Info.plist`.
- App Review risks: Guideline 4.2 (web-wrapper apps) – emphasise native push, offline use, complaints; 5.1.1 data collection + in-app account deletion (you have it); privacy "nutrition labels".

## E. How to apply this zip
1. Extract over your project (same folder structure; it replaces 8 files, adds 1 SQL + this doc).
2. Run `drizzle/migrations/0007_security_hardening.sql` in the Supabase SQL editor (or ask Lovable to apply it).
3. `npm run build:app` then `npx cap sync android`.
4. Test list: new registration works; same number from another device -> "already registered"; same device after app restart -> still logged in; complaint submits; admin login + Notices; birthday endpoint with wrong secret -> 401.
5. Optional cosmetic: `npx eslint . --fix` (1,079 lint errors are only Prettier formatting).
