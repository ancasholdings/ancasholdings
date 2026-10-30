import nodemailer from 'nodemailer';

const SMTP_USER = 'tudor@ancasholdings.com';
const SMTP_PASS = 'csnqxsyeepcfhdax';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
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
    const lead = req.body || {};
    const leadSummary = [
      "ANCAS HOLDINGS — NEW PROPERTY ACQUISITION LEAD",
      "--------------------------------------------------",
      `Full Name       : ${lead.fullName}`,
      `Email Address   : ${lead.email}`,
      `Property Address: ${lead.propertyAddress}`,
      `Property Type   : ${lead.propertyType}`,
      `Lead Details    : ${lead.details || 'None provided'}`,
      `Submitted At    : ${new Date().toISOString()}`
    ].join('\n');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      },
      tls: { rejectUnauthorized: false }
    });

    await transporter.sendMail({
      from: `"${lead.fullName || 'Lead Submission'}" <${SMTP_USER}>`,
      to: 'tudor@ancasholdings.com',
      replyTo: lead.email || SMTP_USER,
      subject: `[Property Acquisition Lead] ${lead.propertyAddress} (${lead.propertyType})`,
      text: leadSummary
    });

    return res.status(200).json({ success: true, message: 'Lead received and dispatched' });
  } catch (err: any) {
    console.error('Lead submission error:', err);
    return res.status(500).json({ error: 'Failed to record lead' });
  }
}
