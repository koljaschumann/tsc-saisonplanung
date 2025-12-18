// Vercel Serverless Function to create GitHub Issues
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let parsedBody = req.body;

  // Handle case where body might be a string
  if (typeof req.body === 'string') {
    try {
      parsedBody = JSON.parse(req.body);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  const { title, body, labels } = parsedBody;

  if (!title || !body) {
    return res.status(400).json({ error: 'Title and body are required' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO = 'koljaschumann/tsc-saisonplanung';

  if (!GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN is not set');
    return res.status(500).json({ error: 'GitHub token not configured' });
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'TSC-Saisonplanung-App',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        title,
        body,
        labels: labels || []
      })
    });

    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse GitHub response:', responseText);
      return res.status(500).json({ error: 'Invalid response from GitHub' });
    }

    if (!response.ok) {
      console.error('GitHub API Error:', response.status, responseData);
      return res.status(response.status).json({
        error: 'Failed to create issue',
        details: responseData.message || 'Unknown error',
        status: response.status
      });
    }

    return res.status(201).json({
      success: true,
      issueNumber: responseData.number,
      issueUrl: responseData.html_url
    });

  } catch (error) {
    console.error('Error creating issue:', error.message, error.stack);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
