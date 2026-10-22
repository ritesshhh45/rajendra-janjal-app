// Copies the SPA build (.output/public) into capacitor-www so the Android app ships the UI offline.
import { cpSync, rmSync, existsSync, copyFileSync } from "node:fs";
const src = ".output/public", out = "capacitor-www";
if (!existsSync(`${src}/_shell.html`)) throw new Error("Run `vite build` first (SPA shell _shell.html not found).");
rmSync(out, { recursive: true, force: true });
cpSync(src, out, { recursive: true });
copyFileSync(`${out}/_shell.html`, `${out}/index.html`);
console.log("capacitor-www ready");
