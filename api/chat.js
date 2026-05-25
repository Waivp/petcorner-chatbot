export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { messages } = req.body;
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: `You are a helpful and friendly assistant for Pet Corner, a leading pet store in the UAE with 20+ locations. Help customers with products (food, accessories, toys), pet breeds, grooming services, veterinary clinics, delivery (15-minute delivery available), store locations, promotions, and the Pet Corner app. Be warm, concise, and helpful. If unsure about specific details, offer to connect them with the team.`,
        messages: messages
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    res.status(200).json({ reply: data.content[0].text });
  } catch (err) {
    res.status(500).json({ reply: 'Sorry, I had a connection issue. Please try again in a moment!' });
  }
}