import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const HOST = '0.0.0.0';
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Static uploads directory
  const uploadsDir = path.resolve(__dirname, 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // Persistent work order file store
  const ticketsFile = path.resolve(__dirname, 'work_orders.json');
  if (!fs.existsSync(ticketsFile)) {
    fs.writeFileSync(ticketsFile, '[]', 'utf-8');
  }

  // Health check endpoint for Cloud Run
  app.get('/health', (_req, res) => {
    res.status(200).send('OK');
  });

  // System diagnostic endpoint
  app.get('/api/system-status', (_req, res) => {
    const hasSmtp = Boolean(process.env.SMTP_PASS || process.env.GMAIL_APP_PASS || process.env.EMAIL_PASS);
    const existing: any[] = JSON.parse(fs.readFileSync(ticketsFile, 'utf-8'));
    res.json({
      status: 'operational',
      hasSmtpConfigured: hasSmtp,
      smtpUser: process.env.SMTP_USER || 'tudor@ancasholdings.com',
      totalWorkOrders: existing.length,
      timestamp: new Date().toISOString()
    });
  });

  // API to upload photos
  app.post('/api/upload', (req, res) => {
    try {
      const { fileName, dataUrl } = req.body;
      if (!fileName || !dataUrl) {
        return res.status(400).json({ error: 'Missing fileName or dataUrl' });
      }
      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'Invalid dataUrl format' });
      }
      const buffer = Buffer.from(matches[2], 'base64');
      const safeName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = path.join(uploadsDir, safeName);
      fs.writeFileSync(filePath, buffer);

      const fileUrl = `/uploads/${safeName}`;
      res.json({ success: true, url: fileUrl });
    } catch (err: any) {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Failed to save file' });
    }
  });

  // Fallback public relay function via ShipMyForm
  async function sendShipMyForm(toEmail: string, subject: string, message: string, fromName: string, replyTo?: string) {
    try {
      const origin = process.env.APP_URL || 'https://ancasholdings.com';
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

  // Unified multi-channel email sender: SMTP (preferred) + Form Relays (fallback)
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
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASS || process.env.EMAIL_PASS;
    const smtpUser = process.env.SMTP_USER || 'tudor@ancasholdings.com';
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT) || 465;

    // Method 1: Authenticated SMTP (Direct Gmail / Google Workspace delivery)
    if (smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });
        const info = await transporter.sendMail({
          from: `"${fromName || 'Ancas Holdings'}" <${smtpUser}>`,
          to,
          replyTo: replyTo || smtpUser,
          subject,
          text,
          html: html || text.replace(/\n/g, '<br/>')
        });
        console.log(`[SMTP DELIVERED] Successfully sent email to ${to} (Message ID: ${info.messageId})`);
        return { success: true, method: 'smtp', detail: info.messageId };
      } catch (smtpErr: any) {
        console.error(`[SMTP ERROR] Could not send email via SMTP to ${to}:`, smtpErr.message);
      }
    }

    // Method 2: ShipMyForm relay
    const relayRes = await sendShipMyForm(to, subject, text, fromName || 'Ancas Holdings', replyTo);
    return {
      success: relayRes.success,
      method: 'shipmyform',
      detail: relayRes.success ? 'Dispatched via web mail gateway' : relayRes.error
    };
  }

  // API to handle end-to-end work order dispatch
  app.post('/api/dispatch-work-order', async (req, res) => {
    try {
      const ticket = req.body;
      if (!ticket || !ticket.ticketId || !ticket.tenantEmail) {
        return res.status(400).json({ error: 'Missing required ticket data' });
      }

      // 1. Persist to server JSON database
      const existing: any[] = JSON.parse(fs.readFileSync(ticketsFile, 'utf-8'));
      existing.unshift({ ...ticket, serverReceivedAt: new Date().toISOString() });
      fs.writeFileSync(ticketsFile, JSON.stringify(existing.slice(0, 100), null, 2), 'utf-8');

      const appBaseUrl = process.env.APP_URL || `http://${req.headers.host || 'localhost:3000'}`;
      const fullPhotoUrls = (ticket.photoUrls || []).map((u: string) => 
        u.startsWith('http') ? u : `${appBaseUrl}${u}`
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
      const managementSubject = `[WORK ORDER #${ticket.ticketId}]${priorityTag} ${categoryShort} - Unit ${ticket.unitNumber}, ${ticket.propertyAddress}`;

      // 2. Dispatch Work Order Exclusively to tudor@ancasholdings.com (Do NOT CC or send this to the tenant)
      const tudorDispatch = await sendEmailMessage({
        to: 'tudor@ancasholdings.com',
        subject: managementSubject,
        text: contractorSummary,
        fromName: `Maintenance Dispatch [${ticket.tenantName}]`,
        replyTo: ticket.tenantEmail
      });

      // 3. Dispatch Immediate Confirmation Notification Exclusively to Tenant's Inbox
      const tenantNotificationMessage = [
        "Your work order was received by the Ancas Holdings team. A team member will be in touch shortly.",
        "",
        `Work Order Reference: #${ticket.ticketId}`,
        `Property: Unit ${ticket.unitNumber}, ${ticket.propertyAddress}`,
        `Classification: ${ticket.maintenanceType}`,
        `Submitted: ${ticket.submittedAt}`,
        "",
        "Ancas Holdings Property Management",
        "Direct Hotline: (773) 516-3148"
      ].join('\n');

      const tenantNotificationSubject = `[Ancas Holdings] Work Order Received #${ticket.ticketId}`;

      const tenantDispatch = await sendEmailMessage({
        to: ticket.tenantEmail,
        subject: tenantNotificationSubject,
        text: tenantNotificationMessage,
        fromName: "Ancas Holdings Property Management",
        replyTo: "tudor@ancasholdings.com"
      });

      res.json({
        success: true,
        ticketId: ticket.ticketId,
        tudorStatus: tudorDispatch.success ? 'sent' : 'queued',
        tudorMethod: tudorDispatch.method,
        tenantStatus: tenantDispatch.success ? 'sent' : 'queued',
        tenantMethod: tenantDispatch.method,
        hasSmtp: Boolean(process.env.SMTP_PASS || process.env.GMAIL_APP_PASS || process.env.EMAIL_PASS),
        message: "Your work order was received by the Ancas Holdings team. A team member will be in touch shortly."
      });
    } catch (err: any) {
      console.error('Work order dispatch error:', err);
      res.status(500).json({ error: 'Failed to process work order dispatch' });
    }
  });

  // API to record acquisition leads
  app.post('/api/leads', async (req, res) => {
    try {
      const lead = req.body;
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

      await sendEmailMessage({
        to: 'tudor@ancasholdings.com',
        subject: `[Property Acquisition Lead] ${lead.propertyAddress} (${lead.propertyType})`,
        text: leadSummary,
        fromName: lead.fullName,
        replyTo: lead.email
      });

      res.json({ success: true, message: 'Lead received and dispatched' });
    } catch (err: any) {
      console.error('Lead submission error:', err);
      res.status(500).json({ error: 'Failed to record lead' });
    }
  });

  // API to record and persist work orders directly
  app.post('/api/work-orders', (req, res) => {
    try {
      const ticket = req.body;
      const existing: any[] = JSON.parse(fs.readFileSync(ticketsFile, 'utf-8'));
      existing.unshift({ ...ticket, serverReceivedAt: new Date().toISOString() });
      fs.writeFileSync(ticketsFile, JSON.stringify(existing.slice(0, 100), null, 2), 'utf-8');
      res.json({ success: true, ticketId: ticket.ticketId });
    } catch (err: any) {
      console.error('Work order save error:', err);
      res.status(500).json({ error: 'Failed to record ticket' });
    }
  });

  // API to list work orders for management
  app.get('/api/work-orders', (_req, res) => {
    try {
      const existing = JSON.parse(fs.readFileSync(ticketsFile, 'utf-8'));
      res.json({ workOrders: existing });
    } catch {
      res.json({ workOrders: [] });
    }
  });

  if (!isProd) {
    // Mount Vite dev server middlewares
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    } else {
      app.get('*', (_req, res) => {
        res.status(503).send('Application is building or starting. Please refresh shortly.');
      });
    }
  }

  app.listen(Number(PORT), HOST, () => {
    console.log(`Server listening on http://${HOST}:${PORT}`);
  });
}

startServer();

