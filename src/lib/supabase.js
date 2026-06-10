/**
 * Supabase REST API helpers for Dashboard message board.
 * Zero npm dependency — uses fetch() directly against Supabase REST API.
 */
const SUPABASE_URL = 'https://ifqamaqsqctxzoojault.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmcWFtYXFzcWN0eHpvb2phdWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMDQyNjksImV4cCI6MjA5NjY4MDI2OX0.0GGLhoGamhwkHOJa_RqheGHOcBQdwtMvlvfGB2v_oxc';

const HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
};

/** Fetch all messages, newest first */
export async function fetchMessages() {
  const url = `${SUPABASE_URL}/rest/v1/messages?select=*&order=created_at.desc`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Fetch messages failed: ${res.status}`);
  return res.json();
}

/** Insert a new message. Returns the created row. */
export async function postMessage({ author, text, fingerprint }) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
    method: 'POST',
    headers: { ...HEADERS, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
    body: JSON.stringify({ author, text, fingerprint }),
  });
  if (!res.ok) throw new Error(`Post message failed: ${res.status}`);
  return res.json();
}

/** Delete a message by id */
export async function deleteMessage(id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/messages?id=eq.${id}`, {
    method: 'DELETE',
    headers: HEADERS,
  });
  if (!res.ok) throw new Error(`Delete message failed: ${res.status}`);
}

/** Get or create a persistent browser fingerprint */
export function getFingerprint() {
  const key = 'dashboard_fingerprint';
  let fp = null;
  try { fp = localStorage.getItem(key); } catch {}
  if (!fp) {
    fp = crypto.randomUUID();
    try { localStorage.setItem(key, fp); } catch {}
  }
  return fp;
}
