// Firebase Cloud Messaging (HTTP v1) sender. Reads the service account JSON from FCM_SERVICE_ACCOUNT.
type ServiceAccount = { client_email: string; private_key: string; project_id: string };

export class FcmNotConfigured extends Error {
  constructor() {
    super("FCM not configured");
  }
}

function readAccount(): ServiceAccount {
  const raw = process.env["FCM_SERVICE_ACCOUNT"];
  if (!raw) throw new FcmNotConfigured();
  try {
    const sa = JSON.parse(raw) as ServiceAccount;
    if (!sa.client_email || !sa.private_key || !sa.project_id) throw new Error();
    return sa;
  } catch {
    throw new FcmNotConfigured();
  }
}

const b64url = (buf: ArrayBuffer | Uint8Array | string) =>
  Buffer.from(typeof buf === "string" ? buf : new Uint8Array(buf as ArrayBuffer)).toString("base64url");

async function accessToken(sa: ServiceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const pem = sa.private_key.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const key = await crypto.subtle.importKey(
    "pkcs8",
    Buffer.from(pem, "base64"),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${header}.${claim}`));
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claim}.${b64url(sig)}`,
    }),
  });
  if (!res.ok) throw new Error(`Google auth failed [${res.status}]: ${await res.text()}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

/** Sends to each token; returns how many were delivered and which tokens are dead. */
export async function sendToTokens(
  tokens: string[],
  msg: { title: string; body: string; image?: string | null; data?: Record<string, string> },
) {
  const sa = readAccount();
  const token = await accessToken(sa);
  let sent = 0;
  const dead: string[] = [];
  const errors: string[] = [];
  const url = `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`;
  for (let i = 0; i < tokens.length; i += 20) {
    await Promise.all(
      tokens.slice(i, i + 20).map(async (t) => {
        const res = await fetch(url, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            message: {
              token: t,
              notification: { title: msg.title, body: msg.body, ...(msg.image ? { image: msg.image } : {}) },
              ...(msg.data ? { data: msg.data } : {}),
            },
          }),
        });
        if (res.ok) return void sent++;
        const text = await res.text();
        if (res.status === 404 || /UNREGISTERED|registration-token-not-registered|INVALID_ARGUMENT/.test(text)) dead.push(t);
        else errors.push(`[${res.status}] ${text.slice(0, 200)}`);
      }),
    );
  }
  if (errors.length) console.error("[fcm] send errors", errors.slice(0, 5));
  return { sent, dead, failed: errors.length };
}
