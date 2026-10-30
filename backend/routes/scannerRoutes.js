import express from 'express';
import { scannerController } from '../controllers/scannerController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// The scanner endpoint allows both authenticated users and guest/demo users with fallback user ID
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return authenticateToken(req, res, next);
  }
  // Allow demo scan
  req.user = { id: 'demo-user-uuid-101', email: 'demo@privyshield.ai' };
  next();
};

router.post('/scan', optionalAuth, scannerController.scan);
router.post('/analyze', optionalAuth, scannerController.analyze);
router.get('/history', optionalAuth, scannerController.history);
router.get('/stats', optionalAuth, scannerController.stats);

export default router;
