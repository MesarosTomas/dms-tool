module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const domain = req.query.domain || '';
  const path   = req.query.path   || '';

  if (!domain || !path) {
    return res.status(400).json({ error: 'Missing domain or path' });
  }

  if (!domain.endsWith('.atlassian.net')) {
    return res.status(403).json({ error: 'Only *.atlassian.net allowed' });
  }

  const targetUrl = 'https://' + domain + path;
  const auth = req.headers['authorization'] || '';

  console.log('Proxying to:', targetUrl);

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': auth,
        'Accept': 'application/json',
      },
    });

    const body = await response.text();
    console.log('Response status:', response.status);
    res.status(response.status).send(body);
  } catch (e) {
    console.error('Fetch error:', e.message);
    res.status(502).json({ error: e.message });
  }
};
