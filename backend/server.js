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
const isProduction = process.env.NODE_ENV === 'production';

const getAllowedOrigins = () => {
  const origins = [];

  // In development mode, allow local development frontend servers
  if (!isProduction) {
    origins.push(
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    );
  }

  // In production, strictly allow the configured FRONTEND_URL origin(s)
  if (process.env.FRONTEND_URL) {
    const configuredOrigins = process.env.FRONTEND_URL
      .split(',')
      .map(url => url.trim().replace(/\/+$/, ''))
      .filter(Boolean);
    origins.push(...configuredOrigins);
  }

  return origins;
};

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, uptime/health probes)
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.trim().replace(/\/+$/, '');
    const allowedOrigins = getAllowedOrigins();

    // Verify exact match against authorized origins
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    // In development only, allow localhost variants if not explicitly in list
    if (!isProduction && (normalizedOrigin.includes('localhost') || normalizedOrigin.includes('127.0.0.1'))) {
      return callback(null, true);
    }

    // Explicitly reject unauthorized origins
    return callback(new Error(`CORS policy violation: Origin '${origin}' is not authorized.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours preflight cache
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
// Handle OPTIONS preflight across all endpoints
app.options('*', cors(corsOptions));

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

  if (err.message && err.message.includes('CORS policy violation')) {
    return res.status(403).json({
      success: false,
      message: err.message
    });
  }

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
