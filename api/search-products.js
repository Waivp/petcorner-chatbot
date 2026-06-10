export default async function handler(req, res) {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
if (req.method === 'OPTIONS') return res.status(200).end();

const { q, size = 6 } = req.query;
if (!q) return res.status(400).json({ error: 'query required' });

try {
const url = `https://live.luigisbox.com/search?tracker_id=618251-781686&q=${encodeURIComponent(q)}&size=${size}&f[]=type:item`;
const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
const data = await r.json();

const hits = data?.results?.hits || [];
const products = hits.map(h => {
const a = h.attributes || {};
return {
name: a.title || a.name || h.url,
price: a.price || null,
brand: Array.isArray(a.brand) ? a.brand[0] : a.brand || null,
category: Array.isArray(a.main_category_lvl_2) ? a.main_category_lvl_2[0] : null,
availability: a.availability > 0 ? 'In Stock' : 'Out of Stock',
url: a.web_url ? (Array.isArray(a.web_url) ? a.web_url[0] : a.web_url) : `https://petcornerdubai.com/${h.url}`,
discount: Array.isArray(a.discount) ? a.discount[0] : a.discount || '0',
autoship: Array.isArray(a.autoship_status) ? a.autoship_status[0] : false,
label: Array.isArray(a.labels) ? a.labels[0] : null
};
}).filter(p => p.name && !p.name.startsWith('product-'));

return res.status(200).json({ products, total: data?.results?.total_hits || 0, query: q });
} catch (err) {
console.error('search error:', err);
return res.status(500).json({ error: err.message });
}
}
