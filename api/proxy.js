export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { domain, path } = req.query;

  if (!domain || !path) {
    return res.status(400).json({ error: 'Missing domain or path parameter' });
  }

  if (!domain.endsWith('.atlassian.net')) {
    return res.status(403).json({ error: 'Only *.atlassian.net domains are allowed' });
  }

  const targetUrl = `https://${domain}${path}`;
  const auth = req.headers['authorization'] || '';

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': auth,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const body = await response.text();
    res.status(response.status).send(body);
  } catch (e) {
    res.status(502).json({ error: 'Proxy fetch failed', detail: e.message });
  }
}
