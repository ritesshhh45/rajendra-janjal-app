// Builds the web UI as an SPA and copies it to capacitor-www (works on Windows/Mac/Linux).
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const pushReady = existsSync("android/app/google-services.json");
console.log(pushReady ? "Firebase found: push notifications ON" : "No android/app/google-services.json: push notifications OFF (app will not crash)");

const run = (cmd, args, env = {}) => {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: true, env: { ...process.env, ...env } });
  if (r.status !== 0) process.exit(r.status ?? 1);
};
run("npx vite build", [], { CAPACITOR_BUILD: "1", VITE_ENABLE_PUSH: pushReady ? "true" : "false" });
run("node scripts/prepare-capacitor.mjs", []);
