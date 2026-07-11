export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { sessionId, messages, lead, event, pageUrl, rating } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

    const BASE = process.env.KV_REST_API_URL;
    const TOKEN = process.env.KV_REST_API_TOKEN;
    const H = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

    // Get existing session
    const getRes = await fetch(`${BASE}/get/session:${sessionId}`, { headers: H });
    const getData = await getRes.json();
    const now = Date.now();

    let session = null;
    if (getData.result) {
      try {
        const v = JSON.parse(getData.result);
        session = typeof v === 'string' ? JSON.parse(v) : v;
      } catch { session = null; }
    }
    if (!session) {
      session = { sessionId, startedAt: now, pageUrl: pageUrl || '', messages: [], lead: null, lastActivity: now };
    }

    // FIX: never overwrite saved messages with a shorter/empty transcript
    const existingLen = Array.isArray(session.messages) ? session.messages.length : 0;
    if (Array.isArray(messages) && messages.length > existingLen) {
      session.messages = messages;
    }

    if (lead) session.lead = lead;
    if (event) session.lastEvent = event;
    if (rating) {
      session.ratings = session.ratings || [];
      session.ratings.push(Object.assign({}, rating, { at: now }));
    }
    if (pageUrl) session.pageUrl = pageUrl;
    session.lastActivity = now;

    // Save session data: SET session:id <json>
    await fetch(`${BASE}/set/session:${sessionId}`, {
      method: 'POST',
      headers: H,
      body: JSON.stringify(JSON.stringify(session))
    });

    // Add to sessions index: SADD sessions <sessionId>
    await fetch(`${BASE}/sadd/sessions/${encodeURIComponent(sessionId)}`, {
      method: 'POST',
      headers: H
    });

    // Return saved transcript so the widget can restore it
    return res.status(200).json({ ok: true, messages: session.messages });
  } catch (err) {
    console.error('save-conversation error:', err);
    return res.status(500).json({ error: err.message });
  }
}
