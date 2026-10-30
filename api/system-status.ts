import fs from 'fs';
import path from 'path';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let totalWorkOrders = 0;
  try {
    const ticketsFile = path.resolve(process.cwd(), 'work_orders.json');
    if (fs.existsSync(ticketsFile)) {
      const existing = JSON.parse(fs.readFileSync(ticketsFile, 'utf-8'));
      totalWorkOrders = existing.length;
    }
  } catch {}

  return res.status(200).json({
    status: 'operational',
    hasSmtpConfigured: true,
    smtpUser: 'tudor@ancasholdings.com',
    totalWorkOrders,
    timestamp: new Date().toISOString()
  });
}
