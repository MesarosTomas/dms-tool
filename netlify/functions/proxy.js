exports.handler = async function(event) {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  const params = event.queryStringParameters || {};
  const domain = params.domain;
  const path = params.path;

  if (!domain || !path) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing domain or path' }) };
  }

  if (!domain.endsWith('.atlassian.net')) {
    return { statusCode: 403, headers: CORS, body: JSON.stringify({ error: 'Only atlassian.net allowed' }) };
  }

  const targetUrl = 'https://' + domain + path;
  const auth = event.headers['authorization'] || event.headers['Authorization'] || '';

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': auth,
        'Accept': 'application/json',
      },
    });
    const body = await response.text();
    return {
      statusCode: response.status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: body,
    };
  } catch (e) {
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: e.message }) };
  }
};
