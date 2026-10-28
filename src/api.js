import { CONFIG } from './config';
async function call(path, body, token) {
  if (!__DEV__ && !CONFIG.API_URL.startsWith('https://')) throw new Error('HTTPS required');
  const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 12000);
  try {
    const r = await fetch(CONFIG.API_URL + path, { method: 'POST', signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body || {}) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.message || 'Request failed');
    return j;
  } catch (e) { throw new Error(e.name === 'AbortError' ? 'Server not reachable' : e.message); }
  finally { clearTimeout(to); }
}
export const register = (p) => call('/register', p);            // -> { token }
export const deleteAccount = (token) => call('/account/delete', {}, token);
