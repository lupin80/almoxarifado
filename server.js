import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './src/routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "https://picsum.photos", "*.supabase.co"],
      "connect-src": ["'self'", "http://localhost:3000", "http://localhost:5173", "*.supabase.co"],
    },
  },
}));

app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.use('/api', routes);

// --- GERAL ---
app.get('/', (req, res) => {
  res.json({ message: 'Inventory Management API (Modular)', version: '3.0.0', status: 'running' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    engine: 'Supabase',
    architecture: 'Modular (Routes/Controllers)',
  });
});

// --- SERVER INIT ---
const server = app.listen(PORT, () => {
  console.log(`Backend do Vault (Modular) rodando em http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Porta ${PORT} já está em uso.`);
  } else {
    console.error('Erro ao iniciar o servidor:', err);
  }
  process.exit(1);
});