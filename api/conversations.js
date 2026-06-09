export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const pwd = req.headers['x-admin-password'];
  if (pwd !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });

  const BASE = process.env.KV_REST_API_URL;
  const TOKEN = process.env.KV_REST_API_TOKEN;
  const H = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

  function parseSession(raw) {
    if (!raw) return null;
    try {
      // Handle double-serialized JSON
      const v = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return typeof v === 'string' ? JSON.parse(v) : v;
    } catch { return null; }
  }

  if (req.method === 'DELETE') {
    const { sessionId } = req.query;
    if (sessionId) {
      await fetch(`${BASE}/del/session:${sessionId}`, { method: 'POST', headers: H });
      await fetch(`${BASE}/srem/sessions/${encodeURIComponent(sessionId)}`, { method: 'POST', headers: H });
      return res.status(200).json({ ok: true });
    }
  }

  const smRes = await fetch(`${BASE}/smembers/sessions`, { headers: H });
  const smData = await smRes.json();
  const sessionIds = smData.result || [];

  if (!sessionIds.length) return res.status(200).json({ sessions: [], total: 0 });

  const sessions = await Promise.all(
    sessionIds.map(async (id) => {
      const r = await fetch(`${BASE}/get/session:${decodeURIComponent(id)}`, { headers: H });
      const d = await r.json();
      return parseSession(d.result);
    })
  );

  const valid = sessions.filter(Boolean).sort((a, b) => b.lastActivity - a.lastActivity);
  return res.status(200).json({ sessions: valid, total: valid.length });
}
