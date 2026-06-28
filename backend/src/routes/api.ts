import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { AuthController } from '../controllers/auth.controller.ts';
import { ComplaintController } from '../controllers/complaint.controller.ts';
import { VerificationController } from '../controllers/verification.controller.ts';
import { PredictionController } from '../controllers/prediction.controller.ts';
import { LogController } from '../controllers/log.controller.ts';
import { AIController } from '../controllers/ai.controller.ts';
import { HealthController } from '../controllers/health.controller.ts';
import { AnalyticsController } from '../controllers/analytics.controller.ts';
import { authMiddleware } from '../middleware/auth.ts';
import { requireRole } from '../middleware/role.ts';

const router = Router();

// -------------------------------------------------------------------------
// HEALTH MONITORING GATEWAY
// -------------------------------------------------------------------------
router.get('/health', HealthController.general as any);
router.get('/health/db', HealthController.dbCheck as any);
router.get('/health/ai', HealthController.aiCheck as any);

// -------------------------------------------------------------------------
// AUTHENTICATION ROUTES
// -------------------------------------------------------------------------
router.post('/auth/register', AuthController.register as any);
router.post('/auth/login', AuthController.login as any);
router.get('/auth/profile', authMiddleware as any, AuthController.getProfile as any);
router.put('/auth/profile', authMiddleware as any, AuthController.updateProfile as any);

// -------------------------------------------------------------------------
// CONFIGURATION ENDPOINTS
// -------------------------------------------------------------------------
router.get('/config/maps', authMiddleware as any, (req, res) => {
  res.json({
    success: true,
    data: {
      apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    },
  });
});

// -------------------------------------------------------------------------
// COMPLAINT TICKETS ROUTES
// -------------------------------------------------------------------------
router.get('/complaints', ComplaintController.list as any);
router.get('/complaints/:id', ComplaintController.get as any);
router.post('/complaints', authMiddleware as any, ComplaintController.create as any);
router.put('/complaints/:id', authMiddleware as any, requireRole(['OFFICIAL', 'ADMIN']) as any, ComplaintController.update as any);
router.delete('/complaints/:id', authMiddleware as any, requireRole(['ADMIN']) as any, ComplaintController.delete as any);

// -------------------------------------------------------------------------
// CITIZEN VERIFICATION & UPVOTE ROUTES
// -------------------------------------------------------------------------
router.post('/verifications', authMiddleware as any, VerificationController.cast as any);
router.get('/verifications/:complaintId', VerificationController.getSummary as any);

// -------------------------------------------------------------------------
// AI HOTSPOT PREDICTIONS ROUTES
// -------------------------------------------------------------------------
router.get('/predictions', PredictionController.list as any);

// -------------------------------------------------------------------------
// AUDIT LOGS ROUTES
// -------------------------------------------------------------------------
router.get('/logs', authMiddleware as any, requireRole(['OFFICIAL', 'ADMIN']) as any, LogController.list as any);
router.post('/logs', authMiddleware as any, requireRole(['OFFICIAL', 'ADMIN']) as any, LogController.create as any);

// -------------------------------------------------------------------------
// AI DEEP VISION DIAGNOSTICS PROXY
// -------------------------------------------------------------------------
router.post('/predict', authMiddleware as any, AIController.predict as any);

// -------------------------------------------------------------------------
// METRICS ANALYTICS ENDPOINTS
// -------------------------------------------------------------------------
router.get('/analytics/categories', authMiddleware as any, requireRole(['OFFICIAL', 'ADMIN']) as any, AnalyticsController.getCategories as any);
router.get('/analytics/areas', authMiddleware as any, requireRole(['OFFICIAL', 'ADMIN']) as any, AnalyticsController.getAreas as any);
router.get('/analytics/severity', authMiddleware as any, requireRole(['OFFICIAL', 'ADMIN']) as any, AnalyticsController.getSeverity as any);
router.get('/analytics/resolution', authMiddleware as any, requireRole(['OFFICIAL', 'ADMIN']) as any, AnalyticsController.getResolution as any);

// -------------------------------------------------------------------------
// FILE UPLOAD ATTACHMENT GATEWAY
// -------------------------------------------------------------------------
router.post('/upload', (req, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({
      success: false,
      errorCode: 'UPLOAD_ERROR',
      message: 'Image attachment payload missing',
    });
  }

  try {
    let fileExt = 'png';
    let base64Data = image;
    if (image.startsWith('data:image')) {
      const matches = image.match(/^data:image\/([a-zA-Z+]+);base64,/);
      if (matches && matches.length > 1) {
        fileExt = matches[1];
      }
      base64Data = image.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
    }
    const buffer = Buffer.from(base64Data, 'base64');
    const filename = `upload_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${fileExt}`;
    const uploadDir = path.join(__dirname, '../../uploads');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(uploadDir, filename), buffer);
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
    
    res.json({
      success: true,
      data: {
        url: fileUrl,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      errorCode: 'UPLOAD_ERROR',
      message: err.message || 'Failed to save uploaded image asset',
    });
  }
});

export default router;
