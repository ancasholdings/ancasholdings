import fs from 'fs';
import path from 'path';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { fileName, dataUrl } = req.body || {};
    if (!fileName || !dataUrl) {
      return res.status(400).json({ error: 'Missing fileName or dataUrl' });
    }

    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid dataUrl format' });
    }

    const buffer = Buffer.from(matches[2], 'base64');
    const safeName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    try {
      const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filePath = path.join(uploadsDir, safeName);
      fs.writeFileSync(filePath, buffer);
      return res.status(200).json({ success: true, url: `/uploads/${safeName}` });
    } catch {
      // In serverless read-only environments (e.g. Vercel production), retain dataUrl
      try {
        const tmpDir = path.join('/tmp', 'uploads');
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true });
        }
        fs.writeFileSync(path.join(tmpDir, safeName), buffer);
      } catch {}

      return res.status(200).json({ success: true, url: dataUrl });
    }
  } catch (err: any) {
    console.error('Upload API error:', err);
    return res.status(500).json({ error: 'Failed to save file' });
  }
}
