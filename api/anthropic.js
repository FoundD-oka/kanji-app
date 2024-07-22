import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        req.body,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
          },
        }
      );
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Error calling Anthropic API:', error);
      res.status(500).json({ error: 'Error calling Anthropic API' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
