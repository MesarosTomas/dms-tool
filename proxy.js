exports.handler = async function(event) {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  // Expect: /api/proxy?domain=syntax.atlassian.net&path=/rest/api/...
  const params = event.queryStringParameters || {};
  const domain = params.domain;
  const path   = params.path;

  if (!domain || !path) {
    return {
      statusCode: 400,
      headers: CORS,
      body: JSON.stringify({ error: 'Missing domain or path parameter' })
    };
  }

  // Security: only allow *.atlassian.net
  if (!domain.endsWith('.atlassian.net')) {
    return {
      statusCode: 403,
      headers: CORS,
      body: JSON.stringify({ error: 'Only *.atlassian.net domains allowed' })
    };
  }

  const targetUrl = `https://${domain}${path}`;
  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';

  let response;
  try {
    response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
  } catch (e) {
    return {
      statusCode: 502,
      headers: CORS,
      body: JSON.stringify({ error: 'Fetch failed', detail: e.message })
    };
  }

  const body = await response.text();

  return {
    statusCode: response.status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
    body,
  };
};
