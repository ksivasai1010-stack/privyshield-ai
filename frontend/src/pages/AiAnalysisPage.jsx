import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  ExternalLink,
  Layers,
  HelpCircle
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AiAnalysisPage() {
  const [integrations, setIntegrations] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyIntegrations = async () => {
    setIsVerifying(true);
    try {
      const res = await api.get('/health/verify-integrations');
      if (res.data.success) {
        setIntegrations(res.data.integrations);
        toast.success('AI & Database connectivity verified.');
      }
    } catch {
      toast.error('Failed to verify backend integrations.');
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    verifyIntegrations();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 cyber-grid">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Dual AI Consensus & Multi-Model Telemetry
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            PrivyShield combines Google Gemini 1.5 and xAI Grok. Both models audit sanitized prompts independently,
            preventing single-model hallucination or policy evasion.
          </p>
        </div>

        <button
          onClick={verifyIntegrations}
          disabled={isVerifying}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
          <span>{isVerifying ? 'Pinging APIs...' : 'Verify Integrations'}</span>
        </button>
      </div>

      {/* Connectivity & Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Google Gemini Card */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-light" />
              <h3 className="font-bold text-sm text-white">Google Gemini 1.5 Flash</h3>
            </div>
            {integrations?.gemini?.active ? (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Operational
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Fallback Mode
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Performs deep contextual inference on sanitized tokens. Analyzes prompts for inadvertent IP leakage,
            architectural risks, and sensitive project names.
          </p>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Endpoint Telemetry</span>
            <p className="font-mono text-slate-300 text-[11px]">
              {integrations?.gemini?.message || 'Checking status...'}
            </p>
          </div>
        </div>

        {/* xAI Grok Card */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary-light" />
              <h3 className="font-bold text-sm text-white">xAI Grok Beta</h3>
            </div>
            {integrations?.grok?.active ? (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Operational
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Fallback Mode
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Validates adversarial prompt injection resistance and secondary data exfiltration. Ensures that placeholders
            cannot be reverse-engineered by LLM completion tricks.
          </p>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Endpoint Telemetry</span>
            <p className="font-mono text-slate-300 text-[11px]">
              {integrations?.grok?.message || 'Checking status...'}
            </p>
          </div>
        </div>

        {/* Supabase PostgreSQL Card */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Supabase PostgreSQL</h3>
            </div>
            {integrations?.database?.connected ? (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> RLS Active
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Local Store Active
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Stores cryptographic SHA-256 hashes, risk scores, and audit events. Never retains raw unredacted prompts.
            Enforces PostgreSQL Row Level Security (RLS).
          </p>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Persistence Telemetry</span>
            <p className="font-mono text-slate-300 text-[11px]">
              {integrations?.database?.message || 'Checking status...'}
            </p>
          </div>
        </div>
      </div>

      {/* Consensus Architecture Explanation */}
      <div className="p-6 rounded-2xl glass-panel-elevated border border-indigo-500/30 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary-light" />
          The Consensus Protocol: Rule Engine vs AI Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
          <div className="space-y-2">
            <h4 className="font-semibold text-white">1. Authoritative Local Precedence</h4>
            <p className="text-slate-400">
              When our local security scanner detects hard cryptographic secrets (such as an API key, private key, or password),
              that finding is permanently marked as <span className="text-rose-400 font-semibold">Critical</span>.
              External AI models are strictly prohibited from downgrading verified secret detections.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-white">2. Contextual Risk Escalation</h4>
            <p className="text-slate-400">
              If local patterns find no immediate regex matches, but Gemini or Grok observe that the prompt discusses
              material non-public financial metrics or proprietary algorithms, the AI models escalate the risk posture
              and attach mitigation recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
