import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import routes from './src/routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== FRONTEND =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

app.use(express.static(distPath));

// ====================

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "blob:", "*"],
      "connect-src": ["'self'", "http://localhost:3000", "http://localhost:5173", "*.supabase.co"],
    },
  },
}));

app.use(cors());
app.use(express.json());

// --- API ROUTES ---
app.use('/api', routes);

// --- HEALTH ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    engine: 'Supabase',
    architecture: 'Modular (Routes/Controllers)',
  });
});

// ===== FRONTEND FALLBACK =====
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// --- SERVER INIT ---
const server = app.listen(PORT, () => {
  console.log(`Backend do Vault (Modular) rodando em http://localhost:${PORT}`);
});