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

  const { title, body, labels } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'Title and body are required' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO = 'koljaschumann/tsc-saisonplanung';

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: 'GitHub token not configured' });
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'TSC-Saisonplanung-App'
      },
      body: JSON.stringify({
        title,
        body,
        labels: labels || []
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('GitHub API Error:', error);
      return res.status(response.status).json({
        error: 'Failed to create issue',
        details: error.message
      });
    }

    const issue = await response.json();
    return res.status(201).json({
      success: true,
      issueNumber: issue.number,
      issueUrl: issue.html_url
    });

  } catch (error) {
    console.error('Error creating issue:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
