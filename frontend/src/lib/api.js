export const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const RESUME_DOWNLOAD_URL = API ? `${API}/resume/download` : '#';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
/** "2025-10" -> "October 2025". null -> "now". */
export function fmtMonth(v) {
  if (!v) return 'now';
  const [y, m] = String(v).split('-');
  return m ? `${MONTHS[Number(m) - 1]} ${y}` : y;
}

/** POSTs the contact form to the FastAPI service. Returns { ok, message }. */
export async function sendContact(payload) {
  if (!API) return { ok: false, message: 'The contact service is not connected yet. Please email me directly.' };
  try {
    const r = await fetch(`${API}/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (r.ok) return { ok: true, message: 'Thanks, your message is on its way.' };
    if (r.status === 429) return { ok: false, message: 'Too many messages from this connection. Please try again later.' };
    return { ok: false, message: 'Please check the fields and try again.' };
  } catch {
    return { ok: false, message: 'Could not reach the server. Please email me directly.' };
  }
}
