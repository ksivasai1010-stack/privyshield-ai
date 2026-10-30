import express from 'express';
import { settingsController } from '../controllers/settingsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) return authenticateToken(req, res, next);
  req.user = { id: 'demo-user-uuid-101', email: 'demo@privyshield.ai' };
  next();
};

router.get('/', optionalAuth, settingsController.getSettings);
router.put('/', optionalAuth, settingsController.updateSettings);
router.delete('/account', optionalAuth, settingsController.deleteAccount);

export default router;
