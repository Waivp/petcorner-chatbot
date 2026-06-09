export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { sessionId, messages, lead, event, pageUrl } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

    const KV_URL = process.env.KV_REST_API_URL;
    const KV_TOKEN = process.env.KV_REST_API_TOKEN;

    async function kvSet(key, value) {
      await fetch(`${KV_URL}/set/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: JSON.stringify(value) })
      });
    }

    async function kvGet(key) {
      const r = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` }
      });
      const d = await r.json();
      return d.result ? JSON.parse(d.result) : null;
    }

    async function kvSAdd(key, member) {
      await fetch(`${KV_URL}/sadd/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([member])
      });
    }

    const now = Date.now();
    const existing = await kvGet(`session:${sessionId}`) || {
      sessionId,
      startedAt: now,
      pageUrl: pageUrl || '',
      messages: [],
      lead: null,
      lastActivity: now
    };

    if (messages) existing.messages = messages;
    if (lead) existing.lead = lead;
    if (event) existing.lastEvent = event;
    existing.lastActivity = now;

    await kvSet(`session:${sessionId}`, existing);
    await kvSAdd('sessions', sessionId);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
