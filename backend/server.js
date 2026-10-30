import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import scannerRoutes from './routes/scannerRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { globalLimiter } from './middleware/rateLimiter.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const getOrigins = () => {
  const origins = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000'];
  if (process.env.FRONTEND_URL) {
    const customOrigins = process.env.FRONTEND_URL.split(',').map(url => url.trim().replace(/\/$/, ''));
    origins.push(...customOrigins);
  }
  return origins.filter(Boolean);
};

const allowedOrigins = getOrigins();

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. curl, health checks)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, '');
    const isAllowed = allowedOrigins.includes(normalizedOrigin) ||
      (process.env.NODE_ENV !== 'production') ||
      normalizedOrigin.endsWith('.vercel.app') ||
      normalizedOrigin.endsWith('.onrender.com');

    if (isAllowed) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy: Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());

// Request parsing with safe payload limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Apply Global Rate Limiting
app.use('/api', globalLimiter);

// API Route Registration
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/scanner', scannerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/settings', settingsRoutes);

// Root diagnostic
app.get('/', (req, res) => {
  res.json({
    name: 'PrivyShield AI – Intelligent Privacy Firewall API',
    status: 'online',
    documentation: '/api/health'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found.`
  });
});

// Global Centralized Error Handler (Never expose internal stack traces or secrets)
app.use((err, req, res, next) => {
  console.error('[PrivyShield Error]', err.message);

  const statusCode = err.status || 500;
  const message = statusCode === 500 ? 'A secure internal processing error occurred.' : err.message;

  res.status(statusCode).json({
    success: false,
    message
  });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🛡️ PrivyShield AI Backend Engine running on port ${PORT} (0.0.0.0)`);
  console.log(`📡 Health Check available at http://localhost:${PORT}/api/health`);
});
