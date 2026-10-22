import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Health check endpoint for Cloud Run
app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

const distPath = path.resolve(__dirname, 'dist');

if (fs.existsSync(distPath)) {
  // Serve static files from Vite build output
  app.use(express.static(distPath));

  // SPA fallback: return index.html for all other routes
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
} else {
  // Fallback if dist hasn't been built yet
  app.get('*', (_req, res) => {
    res.status(503).send('Application is building or starting. Please refresh shortly.');
  });
}

app.listen(Number(PORT), HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
