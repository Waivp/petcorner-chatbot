export default async function handler(req, res) {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
if (req.method === 'OPTIONS') return res.status(200).end();
if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

try {
const { messages, pageUrl, pageTitle } = req.body;

// Build page context for the AI
let pageContext = '';
if (pageUrl || pageTitle) {
pageContext = `\n\nCurrent page context: The user is visiting "${pageTitle || 'Pet Corner website'}" at ${pageUrl || 'petcornerdubai.com'}.`;
if (pageUrl && pageUrl.includes('/grooming')) pageContext += ' They are on the grooming page.';
if (pageUrl && pageUrl.includes('/vet')) pageContext += ' They are on the vet clinic page.';
if (pageUrl && pageUrl.includes('/cat')) pageContext += ' They are browsing cat products.';
if (pageUrl && pageUrl.includes('/dog')) pageContext += ' They are browsing dog products.';
if (pageUrl && pageUrl.includes('/fish')) pageContext += ' They are browsing fish/aquatics products.';
if (pageUrl && pageUrl.includes('/bird')) pageContext += ' They are browsing bird products.';
if (pageUrl && pageUrl.includes('/pharmacy')) pageContext += ' They are on the pet pharmacy page.';
if (pageUrl && pageUrl.includes('/deals')) pageContext += ' They are browsing deals and discounts.';
}

const systemPrompt = `You are a helpful and friendly AI assistant for Pet Corner, the UAE's largest pet store with 20+ locations across Dubai, Abu Dhabi, and the UAE. 

Key facts about Pet Corner:
- 25,000+ products including food, accessories, toys, and live animals
- 15-minute express delivery available in many UAE areas
- Professional grooming services (book at petcornerdubai.com/grooming)
- Veterinary clinics at select locations
- Pet pharmacy with medicines and supplements
- Brands: Royal Canin, Hills, Josera, Almo Nature, Orijen, Acana, and many more
- Services: grooming, vet consultations, pet boarding, training
- WhatsApp support: +971 4 456 6432
- Website: petcornerdubai.com
- App available for iOS and Android with 15-min delivery tracking

Help customers with: product recommendations, availability questions, grooming bookings, vet inquiries, delivery info, store locations, and general pet care advice.

Always be warm, helpful, and concise. Use emojis occasionally to be friendly. If someone needs urgent help or wants to speak to a human, suggest WhatsApp at +971 4 456 6432.${pageContext}`;

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
system: systemPrompt,
messages: messages
})
});

const data = await response.json();
if (data.error) throw new Error(data.error.message);
res.status(200).json({ reply: data.content[0].text });
} catch (err) {
console.error('chat error:', err);
res.status(500).json({ reply: 'Sorry, I had a connection issue. Please try again in a moment!' });
}
}
