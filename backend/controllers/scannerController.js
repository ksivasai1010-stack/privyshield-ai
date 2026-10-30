import { z } from 'zod';
import { scanPromptForThreats } from '../services/securityScanner.js';
import { redactPrompt } from '../services/redactionService.js';
import { analyzeWithGemini } from '../services/geminiService.js';
import { analyzeWithGrok } from '../services/grokService.js';
import { buildConsensusReport } from '../services/consensusService.js';
import { storageService } from '../services/storageService.js';

const scanRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty').max(20000, 'Prompt exceeds maximum length of 20,000 characters'),
  includeAiAnalysis: z.boolean().optional().default(true),
  aiProviders: z.array(z.enum(['gemini', 'grok'])).optional().default(['gemini', 'grok'])
});

export const scannerController = {
  // POST /api/scanner/scan
  async scan(req, res) {
    let originalPrompt = req.body?.prompt;

    try {
      const parsed = scanRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid prompt data.'
        });
      }

      const { includeAiAnalysis, aiProviders } = parsed.data;
      const userId = req.user?.id || 'demo-user-uuid-101';

      // 1. Local Security Scan (Deterministic Entity & Regex Detection)
      const localScan = scanPromptForThreats(originalPrompt);

      // 2. Redaction Engine (Numbered placeholders, SHA-256 hash)
      const redaction = redactPrompt(originalPrompt, localScan.findings);

      // IMMEDIATELY ZERO OUT / DISCARD ORIGINAL PROMPT VARIABLE
      originalPrompt = null;
      req.body.prompt = null;

      // 3. AI Analysis (ONLY ON SANITIZED PROMPT!)
      let geminiResult = null;
      let grokResult = null;

      if (includeAiAnalysis) {
        const promises = [];

        if (aiProviders.includes('gemini')) {
          promises.push(
            analyzeWithGemini(redaction.sanitizedPrompt)
              .then(res => { geminiResult = res; })
              .catch(err => {
                geminiResult = {
                  provider: 'Gemini',
                  available: false,
                  reason: err.message,
                  riskScore: null,
                  findings: []
                };
              })
          );
        }

        if (aiProviders.includes('grok')) {
          promises.push(
            analyzeWithGrok(redaction.sanitizedPrompt)
              .then(res => { grokResult = res; })
              .catch(err => {
                grokResult = {
                  provider: 'Grok',
                  available: false,
                  reason: err.message,
                  riskScore: null,
                  findings: []
                };
              })
          );
        }

        await Promise.allSettled(promises);
      }

      // 4. Build Multi-Provider Consensus Report
      const consensus = buildConsensusReport(localScan, geminiResult, grokResult);

      // 5. Save Safe Scan Metadata in Database (No raw prompt stored!)
      const threatCategoryList = Object.keys(localScan.categoryCounts);
      const savedRecord = await storageService.saveScanRecord({
        userId,
        riskScore: consensus.finalRiskScore,
        riskLevel: consensus.finalRiskLevel,
        detectionCount: localScan.detectionCount,
        threatCategories: threatCategoryList,
        sanitizedPromptHash: redaction.sanitizedPromptHash,
        providerStatus: {
          local: 'ok',
          gemini: geminiResult?.available ? 'ok' : (geminiResult?.reason || 'disabled'),
          grok: grokResult?.available ? 'ok' : (grokResult?.reason || 'disabled')
        }
      });

      // 6. Return response to client
      return res.json({
        success: true,
        scanId: savedRecord.id,
        createdAt: savedRecord.created_at,
        riskScore: consensus.finalRiskScore,
        riskLevel: consensus.finalRiskLevel,
        detectionCount: localScan.detectionCount,
        threatCounts: localScan.threatCounts,
        categoryCounts: localScan.categoryCounts,
        findings: localScan.findings.map(f => ({
          id: f.id,
          type: f.type,
          category: f.category,
          severity: f.severity,
          confidence: f.confidence,
          description: f.description,
          recommendation: f.recommendation,
          // Mask the matched snippet so the frontend can display where it was
          maskedSnippet: f.matchedText.length > 20 ? f.matchedText.substring(0, 4) + '...' + f.matchedText.slice(-4) : '****'
        })),
        redactedPrompt: redaction.sanitizedPrompt,
        redactionMap: redaction.redactionMap,
        sanitizedPromptHash: redaction.sanitizedPromptHash,
        consensus,
        aiAnalysis: {
          gemini: geminiResult,
          grok: grokResult
        }
      });
    } catch (err) {
      console.error('[ScannerController] Scan execution error:', err);
      return res.status(500).json({
        success: false,
        message: 'Firewall scanning encountered an internal error.'
      });
    } finally {
      // Guarantee cleanup of memory reference
      originalPrompt = null;
    }
  },

  // POST /api/scanner/analyze (Deep AI context scan of sanitized prompt)
  async analyze(req, res) {
    try {
      const { sanitizedPrompt } = req.body;
      if (!sanitizedPrompt || typeof sanitizedPrompt !== 'string') {
        return res.status(400).json({ success: false, message: 'Sanitized prompt is required.' });
      }

      const [geminiResult, grokResult] = await Promise.all([
        analyzeWithGemini(sanitizedPrompt),
        analyzeWithGrok(sanitizedPrompt)
      ]);

      return res.json({
        success: true,
        gemini: geminiResult,
        grok: grokResult
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'AI analysis service failed.'
      });
    }
  },

  // GET /api/scanner/history
  async history(req, res) {
    try {
      const userId = req.user?.id || 'demo-user-uuid-101';
      const history = await storageService.getScanHistory(userId, 50);

      return res.json({
        success: true,
        count: history.length,
        history
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Could not fetch scan history.'
      });
    }
  },

  // GET /api/scanner/stats
  async stats(req, res) {
    try {
      const userId = req.user?.id || 'demo-user-uuid-101';
      const stats = await storageService.getUserStats(userId);

      return res.json({
        success: true,
        stats
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Could not calculate security stats.'
      });
    }
  }
};
