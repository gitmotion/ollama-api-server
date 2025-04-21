import express, { RequestHandler } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './config/environment';
import ollamaRoutes from './routes/ollama';

dotenv.config();

const app = express();

// Trust proxy settings for proper client IP handling
app.set('trust proxy', true);

// Middleware
app.use(express.json());
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-api-key', 'Authorization', 'X-Requested-With', 'X-Forwarded-For', 'X-Real-IP'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  credentials: true,
  maxAge: 86400,
  optionsSuccessStatus: 204
}));

// Add headers middleware
const headersMiddleware: RequestHandler = (req, res, next) => {
  // Get the actual client IP when behind a proxy
  const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.ip;
  
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-api-key, Authorization, X-Requested-With, X-Forwarded-For, X-Real-IP');
  
  // Set Cache-Control to no-cache for streaming responses
  res.header('Cache-Control', 'no-cache, no-transform');
  
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
};

app.use(headersMiddleware);

// Routes
app.use('/api', ollamaRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(config.port, '0.0.0.0', () => {
  console.log(`Server running on port ${config.port}`);
});