import React, { useState } from 'react';
import {
  ShieldAlert,
  Key,
  Lock,
  Mail,
  Phone,
  CreditCard,
  Building,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Play
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ThreatAnalysisPage() {
  const [testText, setTestText] = useState('Rahul email rahul@example.com, card 4111 1111 1111 1111, key sk-example-123456');
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const categories = [
    {
      id: 'credentials',
      name: 'API Keys & Cryptographic Secrets',
      severity: 'Critical',
      icon: Key,
      color: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
      description: 'OpenAI sk-* keys, AWS Access Keys (AKIA), GitHub PAT tokens, JWT sessions, Private PEM keys.',
      rules: ['Matches high-entropy string formats', 'Prefix detection (sk-, AKIA, ghp_)', 'PEM header delimiters'],
      sample: 'api_key = "sk-live-9876543210abcdef98765"'
    },
    {
      id: 'passwords',
      name: 'Plaintext Passwords & Connection Strings',
      severity: 'Critical',
      icon: Lock,
      color: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
      description: 'Database credentials, admin passwords, connection strings, Redis auth tokens.',
      rules: ['Key-value assignments (password=, pwd=)', 'Proximity scanning', 'Token extraction'],
      sample: 'password = "SuperSecretDbPassword!2025"'
    },
    {
      id: 'financial',
      name: 'Credit Cards & Banking Details',
      severity: 'Critical',
      icon: CreditCard,
      color: 'border-orange-500/40 bg-orange-500/10 text-orange-300',
      description: 'Visa, MasterCard, Amex, Indian Bank Account numbers, and IFSC Branch codes.',
      rules: ['Luhn algorithm checksum validation', 'Indian IFSC 11-char regex', 'Bank account proximity verification'],
      sample: 'Card 4111 1111 1111 1111 with IFSC SBIN0001234'
    },
    {
      id: 'indian_pii',
      name: 'Indian National Identity (Aadhaar & PAN)',
      severity: 'High',
      icon: FileText,
      color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
      description: '12-digit potential Aadhaar numbers and 10-character PAN tax identifiers.',
      rules: ['12-digit pattern (XXXX XXXX XXXX)', 'PAN regex (5 letters, 4 numbers, 1 letter)', 'Transparent "Potential" labeling'],
      sample: 'Aadhaar 4589 1234 5678, PAN ABCDE1234F'
    },
    {
      id: 'contact_pii',
      name: 'Personal Contact PII (Email & Mobile)',
      severity: 'Medium',
      icon: Phone,
      color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
      description: 'Personal/corporate email addresses and Indian +91 mobile phone numbers.',
      rules: ['RFC-compliant email regex', '10-digit phone format starting with 6,7,8,9', 'Country code (+91) prefixing'],
      sample: 'rahul.sharma@example.com or +91 9876543210'
    },
    {
      id: 'confidential',
      name: 'Confidential Business Information',
      severity: 'High',
      icon: Building,
      color: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300',
      description: 'Material non-public information, NDA restrictions, Q3 financial revenue leaks, M&A details.',
      rules: ['Confidentiality marking recognition', 'Financial projection keywords', 'Trade secret indicators'],
      sample: 'STRICTLY CONFIDENTIAL. Project Titan: unannounced acquisition.'
    }
  ];

  const handleTestRun = async () => {
    if (!testText.trim()) return;
    setIsTesting(true);
    try {
      const res = await api.post('/scanner/scan', {
        prompt: testText,
        includeAiAnalysis: false
      });
      if (res.data.success) {
        setTestResult(res.data);
        toast.success(`Rule engine matched ${res.data.detectionCount} entities!`);
      }
    } catch {
      toast.error('Testing failed.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 cyber-grid">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <ShieldAlert className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Threat Detection Engine & Rule Catalog
          </h1>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl">
          PrivyShield AI combines deterministic regex scanners with algorithmic validation (such as Luhn card checksums)
          to ensure 0% false negatives on high-risk secrets.
        </p>
      </div>

      {/* Interactive Sandbox Test Runner */}
      <div className="p-6 rounded-2xl glass-panel-elevated border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Interactive Rule Engine Sandbox
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Real-Time Regex & Luhn Verification</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-500 text-xs font-mono text-slate-200 outline-none resize-none"
              placeholder="Type test strings containing card numbers, API keys, emails..."
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Click a category card below to paste its test string</span>
              <button
                onClick={handleTestRun}
                disabled={isTesting || !testText.trim()}
                className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary-hover text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-glow-cyan"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>{isTesting ? 'Verifying...' : 'Test Match'}</span>
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between text-xs">
            <div>
              <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider">
                Detection Telemetry
              </span>
              {testResult ? (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Matched Threats:</span>
                    <span className="font-mono font-bold text-rose-400">{testResult.detectionCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Calculated Score:</span>
                    <span className="font-mono font-bold text-white">{testResult.riskScore}/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Posture:</span>
                    <span className="font-bold text-cyan-300">{testResult.riskLevel}</span>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-slate-500 text-xs italic">
                  Run a test string to see instantaneous entity matching.
                </p>
              )}
            </div>

            {testResult?.redactedPrompt && (
              <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono text-emerald-400 truncate">
                Redacted: {testResult.redactedPrompt}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Threat Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              className="p-6 rounded-2xl glass-panel border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl border ${cat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${cat.color}`}>
                    {cat.severity}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{cat.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{cat.description}</p>
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Validation Rules:
                  </span>
                  <ul className="space-y-1">
                    {cat.rules.map((r, idx) => (
                      <li key={idx} className="flex items-center gap-1.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setTestText(cat.sample);
                    toast.success(`Copied "${cat.name}" sample to sandbox`);
                  }}
                  className="w-full py-1.5 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-[11px] font-mono text-slate-300 transition-colors flex items-center justify-between"
                >
                  <span className="truncate max-w-[200px]">Test: {cat.sample}</span>
                  <span className="text-cyan-400 font-semibold font-sans">Load &rarr;</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
