import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

const SMTP_USER = 'tudor@ancasholdings.com';
const SMTP_PASS = 'csnqxsyeepcfhdax';
const SMTP_HOST = 'smtp.gmail.com';
const SMTP_PORT = 465;

async function sendShipMyForm(toEmail: string, subject: string, message: string, fromName: string, replyTo?: string) {
  try {
    const origin = 'https://ancasholdings.com';
    const fd = new FormData();
    fd.append('name', fromName);
    if (replyTo) {
      fd.append('email', replyTo);
    }
    fd.append('Subject', subject);
    fd.append('message', message);

    const res = await fetch(`https://shipmyform.com/to/${encodeURIComponent(toEmail)}`, {
      method: 'POST',
      headers: {
        'Origin': origin,
        'Referer': origin + '/'
      },
      body: fd
    });
    return { success: res.ok, status: res.status };
  } catch (err: any) {
    console.warn(`ShipMyForm dispatch failed to ${toEmail}:`, err.message);
    return { success: false, error: err.message };
  }
}

async function sendEmailMessage({
  to,
  subject,
  text,
  html,
  fromName,
  replyTo
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  fromName?: string;
  replyTo?: string;
}): Promise<{ success: boolean; method: string; detail?: string }> {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      },
      tls: { rejectUnauthorized: false }
    });

    const cleanFromName = fromName ? fromName.replace(/[\[\]]/g, '').trim() : 'Ancas Holdings';
    const info = await transporter.sendMail({
      from: `"${cleanFromName}" <${SMTP_USER}>`,
      to,
      replyTo: replyTo || SMTP_USER,
      subject,
      text,
      html: html || text.replace(/\n/g, '<br/>')
    });
    console.log(`[SMTP DELIVERED] Successfully sent email to ${to} (Message ID: ${info.messageId})`);
    return { success: true, method: 'smtp', detail: info.messageId };
  } catch (smtpErr: any) {
    console.error(`[SMTP ERROR] Could not send email via SMTP to ${to}:`, smtpErr.message);
    const relayRes = await sendShipMyForm(to, subject, text, fromName || 'Ancas Holdings', replyTo);
    return {
      success: relayRes.success,
      method: 'shipmyform',
      detail: relayRes.success ? 'Dispatched via web mail gateway' : relayRes.error
    };
  }
}

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
    const ticket = req.body;
    if (!ticket || !ticket.ticketId || !ticket.tenantEmail) {
      return res.status(400).json({ error: 'Missing required ticket data' });
    }

    // Persist ticket to file store
    const cleanPhotos = (ticket.photos || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      size: p.size
    }));
    const cleanTicket = {
      ...ticket,
      photos: cleanPhotos,
      serverReceivedAt: new Date().toISOString()
    };

    try {
      const ticketsFile = path.resolve(process.cwd(), 'work_orders.json');
      let existing: any[] = [];
      if (fs.existsSync(ticketsFile)) {
        try {
          existing = JSON.parse(fs.readFileSync(ticketsFile, 'utf-8'));
        } catch {}
      }
      existing.unshift(cleanTicket);
      fs.writeFileSync(ticketsFile, JSON.stringify(existing.slice(0, 100), null, 2), 'utf-8');
    } catch {
      // In serverless read-only environment, fallback to /tmp
      try {
        const tmpFile = path.join('/tmp', 'work_orders.json');
        let existing: any[] = [];
        if (fs.existsSync(tmpFile)) {
          try {
            existing = JSON.parse(fs.readFileSync(tmpFile, 'utf-8'));
          } catch {}
        }
        existing.unshift(cleanTicket);
        fs.writeFileSync(tmpFile, JSON.stringify(existing.slice(0, 100), null, 2), 'utf-8');
      } catch {}
    }

    const host = req.headers?.host || 'ancasholdings.com';
    const proto = req.headers?.['x-forwarded-proto'] || 'https';
    const appBaseUrl = `${proto}://${host}`;
    const fullPhotoUrls = (ticket.photoUrls || []).map((u: string) => 
      u.startsWith('http') || u.startsWith('data:') ? u : `${appBaseUrl}${u}`
    );

    // Build Contractor / Management Work Order Summary (Exclusively for tudor@ancasholdings.com)
    const contractorSummary = [
      "============================================================",
      "ANCAS HOLDINGS — MAINTENANCE WORK ORDER DISPATCH",
      "============================================================",
      `WORK ORDER ID   : ${ticket.ticketId}`,
      `SUBMITTED DATE  : ${ticket.submittedAt}`,
      `PRIORITY LEVEL  : ${(ticket.urgencyLevel || 'STANDARD').toUpperCase()}`,
      "",
      "--- JOB SITE & LOCATION ---",
      `Property        : ${ticket.propertyAddress}`,
      `Unit / Apt #    : ${ticket.unitNumber}`,
      `In-Unit Location: ${ticket.locationInUnit || 'Unit interior'}`,
      "",
      "--- ACCESS & RESIDENT COORDINATION ---",
      `Resident Name   : ${ticket.tenantName}`,
      `Resident Phone  : ${ticket.tenantPhone}`,
      `Resident Email  : ${ticket.tenantEmail}`,
      `Permission Enter: ${ticket.permissionToEnter || 'Yes'}`,
      `Preferred Window: ${ticket.preferredTime || 'Anytime'}`,
      "",
      "--- SCOPE OF WORK ---",
      `Trade Category  : ${ticket.maintenanceType}`,
      "Issue Description:",
      ticket.description,
      "",
      "--- ATTACHED MEDIA & PHOTOS ---",
      fullPhotoUrls.length > 0
        ? fullPhotoUrls.map((url: string, i: number) => `Photo ${i + 1}: ${url}`).join('\n')
        : "No photos uploaded.",
      "============================================================"
    ].join('\n');

    const categoryShort = (ticket.maintenanceType || 'Maintenance').split('(')[0].trim();
    const priorityTag = ticket.urgencyLevel === 'urgent' ? ' [URGENT]' : '';
    const managementSubject = `[NEW MAINTENANCE TICKET #${ticket.ticketId}]${priorityTag} ${categoryShort} - Unit ${ticket.unitNumber}, ${ticket.propertyAddress}`;

    const tudorHtml = `
<div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 650px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <div style="background-color: #00264d; padding: 16px 20px; border-radius: 6px 6px 0 0;">
    <span style="color: #d4a017; font-size: 11px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">New Maintenance Work Order</span>
    <h2 style="color: #ffffff; margin: 4px 0 0; font-size: 20px;">Ticket #${ticket.ticketId}${priorityTag}</h2>
  </div>
  <div style="padding: 20px;">
    <h3 style="color: #00264d; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; font-size: 14px; text-transform: uppercase;">Job Site & Resident Details</h3>
    <table style="width: 100%; font-size: 14px; margin-bottom: 16px;">
      <tr><td style="color: #64748b; width: 140px; padding: 4px 0;">Property Address:</td><td style="font-weight: bold;">${ticket.propertyAddress}</td></tr>
      <tr><td style="color: #64748b; padding: 4px 0;">Unit / Apt #:</td><td style="font-weight: bold; color: #00264d;">${ticket.unitNumber}</td></tr>
      <tr><td style="color: #64748b; padding: 4px 0;">In-Unit Location:</td><td>${ticket.locationInUnit || 'Unit interior'}</td></tr>
      <tr><td style="color: #64748b; padding: 4px 0;">Resident Name:</td><td><strong>${ticket.tenantName}</strong></td></tr>
      <tr><td style="color: #64748b; padding: 4px 0;">Resident Phone:</td><td><a href="tel:${ticket.tenantPhone}">${ticket.tenantPhone}</a></td></tr>
      <tr><td style="color: #64748b; padding: 4px 0;">Resident Email:</td><td><a href="mailto:${ticket.tenantEmail}">${ticket.tenantEmail}</a></td></tr>
      <tr><td style="color: #64748b; padding: 4px 0;">Permission to Enter:</td><td>${ticket.permissionToEnter || 'Yes'}</td></tr>
      <tr><td style="color: #64748b; padding: 4px 0;">Preferred Window:</td><td>${ticket.preferredTime || 'Anytime'}</td></tr>
    </table>

    <h3 style="color: #00264d; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; font-size: 14px; text-transform: uppercase;">Scope of Work</h3>
    <p style="font-size: 14px; margin: 6px 0;"><strong>Category:</strong> ${ticket.maintenanceType}</p>
    <div style="background-color: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 14px; white-space: pre-wrap; margin-bottom: 16px;">
${ticket.description}
    </div>

    ${fullPhotoUrls.length > 0 ? `
      <h3 style="color: #00264d; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; font-size: 14px; text-transform: uppercase;">Attached Photos (${fullPhotoUrls.length})</h3>
      <ul style="font-size: 13px;">
        ${fullPhotoUrls.map((u: string, idx: number) => `<li><a href="${u}" target="_blank">Photo ${idx + 1}: ${u}</a></li>`).join('')}
      </ul>
    ` : '<p style="color: #64748b; font-size: 13px;">No photos attached.</p>'}
  </div>
</div>
    `;

    // 2. Dispatch Work Order Exclusively to tudor@ancasholdings.com
    const tudorDispatch = await sendEmailMessage({
      to: 'tudor@ancasholdings.com',
      subject: managementSubject,
      text: contractorSummary,
      html: tudorHtml,
      fromName: `Maintenance Dispatch ${ticket.tenantName}`,
      replyTo: ticket.tenantEmail
    });

    // 3. Dispatch Immediate Confirmation Notification Exclusively to Tenant's Inbox
    const tenantNotificationMessage = [
      "Your maintenance ticket has been dispatched. A team member will follow up shortly.",
      "",
      `Work Order Reference: #${ticket.ticketId}`,
      `Property: Unit ${ticket.unitNumber}, ${ticket.propertyAddress}`,
      `Classification: ${ticket.maintenanceType}`,
      `Submitted: ${ticket.submittedAt}`,
      "",
      "Ancas Holdings Property Management",
      "Direct Hotline: (773) 516-3148"
    ].join('\n');

    const tenantNotificationSubject = `Your maintenance ticket has been dispatched - #${ticket.ticketId}`;

    const tenantHtml = `
<div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <div style="background-color: #00264d; padding: 16px 20px; border-radius: 6px 6px 0 0; text-align: center;">
    <h2 style="color: #ffffff; margin: 0; font-size: 18px; letter-spacing: 1px;">ANCAS HOLDINGS</h2>
    <p style="color: #d4a017; margin: 4px 0 0; font-size: 12px; text-transform: uppercase;">Resident Care &amp; Property Operations</p>
  </div>
  <div style="padding: 24px 20px;">
    <p style="font-size: 16px; font-weight: bold; color: #00264d; margin-top: 0;">
      Your maintenance ticket has been dispatched. A team member will follow up shortly.
    </p>
    <div style="background-color: #f8fafc; border-left: 4px solid #00264d; padding: 12px 16px; margin: 16px 0;">
      <p style="margin: 4px 0; font-size: 14px;"><strong>Ticket ID:</strong> #${ticket.ticketId}</p>
      <p style="margin: 4px 0; font-size: 14px;"><strong>Property:</strong> Unit ${ticket.unitNumber}, ${ticket.propertyAddress}</p>
      <p style="margin: 4px 0; font-size: 14px;"><strong>Category:</strong> ${ticket.maintenanceType}</p>
      <p style="margin: 4px 0; font-size: 14px;"><strong>Submitted:</strong> ${ticket.submittedAt}</p>
    </div>
    <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
      If you have an urgent inquiry, you may reach our office directly at <strong>(773) 516-3148</strong> or reply directly to this email.
    </p>
  </div>
</div>
    `;

    const tenantDispatch = await sendEmailMessage({
      to: ticket.tenantEmail,
      subject: tenantNotificationSubject,
      text: tenantNotificationMessage,
      html: tenantHtml,
      fromName: "Ancas Holdings Property Management",
      replyTo: "tudor@ancasholdings.com"
    });

    return res.status(200).json({
      success: true,
      ticketId: ticket.ticketId,
      tudorStatus: tudorDispatch.success ? 'sent' : 'queued',
      tudorMethod: tudorDispatch.method,
      tenantStatus: tenantDispatch.success ? 'sent' : 'queued',
      tenantMethod: tenantDispatch.method,
      hasSmtp: true,
      message: "Your maintenance ticket has been dispatched. A team member will follow up shortly."
    });
  } catch (err: any) {
    console.error('Work order dispatch error:', err);
    return res.status(500).json({ error: 'Failed to process work order dispatch' });
  }
}
