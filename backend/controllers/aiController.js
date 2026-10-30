import { analyzeWithGemini } from '../services/geminiService.js';
import { analyzeWithGrok } from '../services/grokService.js';

export const aiController = {
  // POST /api/ai/gemini-analysis
  async geminiAnalysis(req, res) {
    try {
      const { sanitizedPrompt } = req.body;
      if (!sanitizedPrompt) {
        return res.status(400).json({ success: false, message: 'Sanitized prompt is required.' });
      }
      const result = await analyzeWithGemini(sanitizedPrompt);
      return res.json({ success: true, result });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/ai/grok-analysis
  async grokAnalysis(req, res) {
    try {
      const { sanitizedPrompt } = req.body;
      if (!sanitizedPrompt) {
        return res.status(400).json({ success: false, message: 'Sanitized prompt is required.' });
      }
      const result = await analyzeWithGrok(sanitizedPrompt);
      return res.json({ success: true, result });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};
