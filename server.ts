import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

import uploadHandler from './api/upload.ts';
import dispatchHandler from './api/dispatch-work-order.ts';
import systemStatusHandler from './api/system-status.ts';
import workOrdersHandler from './api/work-orders.ts';
import leadsHandler from './api/leads.ts';

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

  // Health check endpoint for Cloud Run
  app.get('/health', (_req, res) => {
    res.status(200).send('OK');
  });

  // Delegate all /api endpoints to the serverless function handlers in /api
  app.all('/api/upload', (req, res) => uploadHandler(req, res));
  app.all('/api/dispatch-work-order', (req, res) => dispatchHandler(req, res));
  app.all('/api/system-status', (req, res) => systemStatusHandler(req, res));
  app.all('/api/work-orders', (req, res) => workOrdersHandler(req, res));
  app.all('/api/leads', (req, res) => leadsHandler(req, res));

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
