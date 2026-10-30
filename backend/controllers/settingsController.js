import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { storageService } from '../services/storageService.js';

const updateSettingsSchema = z.object({
  fullName: z.string().min(2).optional(),
  preferredAi: z.enum(['gemini', 'grok', 'both']).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional()
});

export const settingsController = {
  // GET /api/settings
  async getSettings(req, res) {
    try {
      const userId = req.user?.id || 'demo-user-uuid-101';
      const user = await storageService.findUserById(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      return res.json({
        success: true,
        settings: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          preferredAi: user.preferred_ai || 'both',
          privacyPreferences: {
            redactEmail: true,
            redactPhone: true,
            redactKeys: true,
            redactFinancial: true,
            redactGovernmentIds: true,
            requireConsentBeforeAITransmission: true
          }
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve settings.' });
    }
  },

  // PUT /api/settings
  async updateSettings(req, res) {
    try {
      const userId = req.user?.id || 'demo-user-uuid-101';
      const parsed = updateSettingsSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid input.'
        });
      }

      const { fullName, preferredAi, currentPassword, newPassword } = parsed.data;
      const updates = {};

      if (fullName) updates.full_name = fullName;
      if (preferredAi) updates.preferred_ai = preferredAi;

      // Handle password update if requested
      if (newPassword) {
        const fullUser = await storageService.findUserByEmail(req.user?.email || 'demo@privyshield.ai');
        if (fullUser && currentPassword) {
          const isMatch = await bcrypt.compare(currentPassword, fullUser.password_hash);
          if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
          }
          const salt = await bcrypt.genSalt(10);
          updates.password_hash = await bcrypt.hash(newPassword, salt);
        }
      }

      const updated = await storageService.updateUser(userId, updates);

      await storageService.logSecurityEvent({
        userId,
        eventType: 'SETTINGS_MODIFIED',
        severity: 'Info',
        description: 'User updated profile or privacy preferences.'
      });

      return res.json({
        success: true,
        message: 'Settings updated successfully.',
        user: {
          id: updated.id,
          email: updated.email,
          fullName: updated.full_name,
          preferredAi: updated.preferred_ai
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Error updating settings.' });
    }
  },

  // DELETE /api/settings/account
  async deleteAccount(req, res) {
    try {
      const userId = req.user?.id || 'demo-user-uuid-101';
      await storageService.deleteUser(userId);

      return res.json({
        success: true,
        message: 'Account and associated metadata purged successfully.'
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to delete account.' });
    }
  }
};
