import fs from 'fs';
import path from 'path';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const ticketsFile = path.resolve(process.cwd(), 'work_orders.json');
  const tmpFile = path.join('/tmp', 'work_orders.json');

  if (req.method === 'GET') {
    try {
      if (fs.existsSync(ticketsFile)) {
        const existing = JSON.parse(fs.readFileSync(ticketsFile, 'utf-8'));
        return res.status(200).json({ workOrders: existing });
      }
      if (fs.existsSync(tmpFile)) {
        const existing = JSON.parse(fs.readFileSync(tmpFile, 'utf-8'));
        return res.status(200).json({ workOrders: existing });
      }
      return res.status(200).json({ workOrders: [] });
    } catch {
      return res.status(200).json({ workOrders: [] });
    }
  }

  if (req.method === 'POST') {
    try {
      const ticket = req.body;
      let existing: any[] = [];
      try {
        if (fs.existsSync(ticketsFile)) {
          existing = JSON.parse(fs.readFileSync(ticketsFile, 'utf-8'));
        }
      } catch {}

      existing.unshift({ ...ticket, serverReceivedAt: new Date().toISOString() });

      try {
        fs.writeFileSync(ticketsFile, JSON.stringify(existing.slice(0, 100), null, 2), 'utf-8');
      } catch {
        fs.writeFileSync(tmpFile, JSON.stringify(existing.slice(0, 100), null, 2), 'utf-8');
      }

      return res.status(200).json({ success: true, ticketId: ticket.ticketId });
    } catch (err: any) {
      console.error('Work orders error:', err);
      return res.status(500).json({ error: 'Failed to record ticket' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
