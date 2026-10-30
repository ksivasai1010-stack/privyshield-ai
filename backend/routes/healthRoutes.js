import express from 'express';
import { supabase, isSupabaseConnected } from '../config/supabase.js';
import { analyzeWithGemini } from '../services/geminiService.js';
import { analyzeWithGrok } from '../services/grokService.js';

const router = express.Router();

// GET /api/health - General Status
router.get('/', (req, res) => {
  const hasGemini = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() && !process.env.GEMINI_API_KEY.includes('YOUR_'));
  const hasGrok = !!(process.env.GROK_API_KEY && process.env.GROK_API_KEY.trim() && !process.env.GROK_API_KEY.includes('YOUR_'));
  const hasSupabase = isSupabaseConnected();

  res.json({
    status: 'operational',
    service: 'PrivyShield AI Security Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    components: {
      localSecurityEngine: {
        status: 'active',
        regexEngines: 15,
        luhnValidation: 'enabled',
        redactionEngine: 'active'
      },
      supabase: {
        configured: hasSupabase,
        status: hasSupabase ? 'connected' : 'resilient_local_store_active',
        note: hasSupabase ? 'Remote Supabase PostgreSQL with RLS active' : 'Local security memory store active'
      },
      gemini: {
        configured: hasGemini,
        status: hasGemini ? 'key_detected' : 'missing_or_placeholder_key',
        provider: 'Google AI Studio'
      },
      grok: {
        configured: hasGrok,
        status: hasGrok ? 'key_detected' : 'missing_or_placeholder_key',
        provider: 'xAI'
      }
    }
  });
});

// GET /api/health/verify-integrations - Active Ping Test
router.get('/verify-integrations', async (req, res) => {
  const testSample = 'This is a test sample verification from PrivyShield AI.';
  const results = {
    timestamp: new Date().toISOString(),
    database: { status: 'checking' },
    gemini: { status: 'checking' },
    grok: { status: 'checking' }
  };

  // Test Database
  if (supabase) {
    try {
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      if (error) {
        results.database = {
          status: 'error',
          message: 'Connected to Supabase endpoint, but table query returned error. Ensure schema.sql has been executed.',
          connected: false
        };
      } else {
        results.database = {
          status: 'success',
          message: 'Supabase PostgreSQL connected and responsive.',
          connected: true
        };
      }
    } catch (err) {
      results.database = {
        status: 'error',
        message: 'Network error connecting to Supabase endpoint.',
        connected: false
      };
    }
  } else {
    results.database = {
      status: 'fallback',
      message: 'Supabase credentials not configured in backend/.env. Using local resilient security store.',
      connected: false
    };
  }

  // Test Gemini
  try {
    const geminiRes = await analyzeWithGemini(testSample);
    results.gemini = {
      status: geminiRes.available ? 'success' : 'unavailable',
      message: geminiRes.available ? 'Gemini AI API connection verified successfully.' : geminiRes.reason,
      active: geminiRes.available
    };
  } catch (err) {
    results.gemini = {
      status: 'error',
      message: 'Failed to communicate with Gemini API.',
      active: false
    };
  }

  // Test Grok
  try {
    const grokRes = await analyzeWithGrok(testSample);
    results.grok = {
      status: grokRes.available ? 'success' : 'unavailable',
      message: grokRes.available ? 'xAI Grok API connection verified successfully.' : grokRes.reason,
      active: grokRes.available
    };
  } catch (err) {
    results.grok = {
      status: 'error',
      message: 'Failed to communicate with xAI Grok API.',
      active: false
    };
  }

  res.json({
    success: true,
    integrations: results
  });
});

export default router;
