import express from 'express';
import { aiController } from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) return authenticateToken(req, res, next);
  req.user = { id: 'demo-user-uuid-101', email: 'demo@privyshield.ai' };
  next();
};

router.post('/gemini-analysis', optionalAuth, aiController.geminiAnalysis);
router.post('/grok-analysis', optionalAuth, aiController.grokAnalysis);

export default router;
