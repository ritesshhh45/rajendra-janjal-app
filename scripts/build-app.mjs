// Builds the web UI as an SPA and copies it to capacitor-www (works on Windows/Mac/Linux).
import { spawnSync } from "node:child_process";
const run = (cmd, args, env = {}) => {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: true, env: { ...process.env, ...env } });
  if (r.status !== 0) process.exit(r.status ?? 1);
};
run("npx", ["vite", "build"], { CAPACITOR_BUILD: "1" });
run("node", ["scripts/prepare-capacitor.mjs"]);
