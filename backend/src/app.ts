import './config/env.ts'; // Load and validate environment variables first!
import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import apiRouter from './routes/api.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import { requestLogger } from './middleware/requestLogger.ts';
import { config } from './config/env.ts';
import { HealthController } from './controllers/health.controller.ts';

const app = express();

// Enable trusting proxy headers (necessary for running behind nginx/Cloud Run)
app.set('trust proxy', 1);

// 1. Security Headers Configuration (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  })
);

// 2. Cross-Origin Resource Sharing (CORS)
const allowedOrigins = config.ALLOWED_ORIGINS
  ? (config.ALLOWED_ORIGINS.includes(',') ? config.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : config.ALLOWED_ORIGINS)
  : '*';

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Request Body Parsing
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// 4. Request Logging Middleware (Structured Winston logs)
app.use(requestLogger);

// 5. Root Health Checks (Load Balancer support)
app.get('/health', HealthController.general as any);
app.get('/health/db', HealthController.dbCheck as any);
app.get('/health/ai', HealthController.aiCheck as any);

// 6. Rate Limiting Protection (Prevent DDoS and API abuse)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: false,
  },
  message: {
    success: false,
    errorCode: 'TOO_MANY_REQUESTS',
    message: 'Too many requests from this IP address, please try again later.',
  },
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per 15 mins for AI diagnostics
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: false,
  },
  message: {
    success: false,
    errorCode: 'TOO_MANY_REQUESTS',
    message: 'Too many AI diagnostic prediction requests, please try again later.',
  },
});

app.use('/api/', apiLimiter);
app.use('/api/v1/predict', aiLimiter);

// 7. Register Centralized Routing Gateway
app.use('/uploads', express.static(path.join(process.cwd(), 'backend/uploads')));
app.use('/api/v1', apiRouter);

// 8. Global Error Handling Middleware
app.use(errorHandler as any);

export default app;
