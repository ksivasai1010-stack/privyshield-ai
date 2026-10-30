import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { storageService } from '../services/storageService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'privyshield-super-secret-jwt-key-2025';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional()
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const authController = {
  // POST /api/auth/register
  async register(req, res) {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid input.'
        });
      }

      const { email, password, fullName } = parsed.data;

      // Check if user already exists
      const existing = await storageService.findUserByEmail(email);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists.'
        });
      }

      // Hash password with bcrypt
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const user = await storageService.createUser({
        email,
        password_hash,
        full_name: fullName
      });

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Audit log
      await storageService.logSecurityEvent({
        userId: user.id,
        eventType: 'USER_REGISTERED',
        severity: 'Info',
        description: `New user registered: ${user.email}`
      });

      return res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          preferredAi: user.preferred_ai
        }
      });
    } catch (err) {
      console.error('[AuthController] Register error:', err);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during registration.'
      });
    }
  },

  // POST /api/auth/login
  async login(req, res) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid input.'
        });
      }

      const { email, password } = parsed.data;

      const user = await storageService.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      // Verify bcrypt password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      await storageService.logSecurityEvent({
        userId: user.id,
        eventType: 'USER_LOGIN',
        severity: 'Info',
        description: `User authenticated successfully: ${user.email}`
      });

      return res.json({
        success: true,
        message: 'Signed in successfully.',
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          preferredAi: user.preferred_ai
        }
      });
    } catch (err) {
      console.error('[AuthController] Login error:', err);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during login.'
      });
    }
  },

  // GET /api/auth/me
  async me(req, res) {
    try {
      const user = await storageService.findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User profile not found.'
        });
      }

      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          preferredAi: user.preferred_ai,
          createdAt: user.created_at
        }
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching profile.'
      });
    }
  }
};
