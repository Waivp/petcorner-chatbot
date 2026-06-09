export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const pwd = req.headers['x-admin-password'];
  if (pwd !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const KV_URL = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;

  async function kvGet(key) {
    const r = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });
    const d = await r.json();
    return d.result ? JSON.parse(d.result) : null;
  }

  async function kvDel(key) {
    await fetch(`${KV_URL}/del/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });
  }

  async function kvSMembers(key) {
    const r = await fetch(`${KV_URL}/smembers/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });
    const d = await r.json();
    return d.result || [];
  }

  if (req.method === 'DELETE') {
    const { sessionId } = req.query;
    if (sessionId) {
      await kvDel(`session:${sessionId}`);
      await fetch(`${KV_URL}/srem/sessions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([sessionId])
      });
      return res.status(200).json({ ok: true });
    }
  }

  const sessionIds = await kvSMembers('sessions');
  const sessions = await Promise.all(
    sessionIds.map(id => kvGet(`session:${id}`))
  );
  const valid = sessions.filter(Boolean).sort((a, b) => b.lastActivity - a.lastActivity);
  return res.status(200).json({ sessions: valid, total: valid.length });
}
