import React from 'react';
import { Cpu, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

export default function ConsensusCard({ consensus }) {
  if (!consensus) return null;

  const {
    finalRiskScore,
    finalRiskLevel,
    consensusStatus,
    agreementDescription,
    providerAvailability,
    providerDetails,
    synthesizedRecommendations = []
  } = consensus;

  const local = providerDetails?.local;
  const gemini = providerDetails?.gemini;
  const grok = providerDetails?.grok;

  return (
    <div className="rounded-2xl glass-panel border border-slate-800 p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white">AI Consensus & Verification Matrix</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">{agreementDescription}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            {consensusStatus}
          </span>
        </div>
      </div>

      {/* 3 Providers Grid: Local Engine | Gemini | Grok */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Local Deterministic Rule Engine */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-indigo-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-xs text-slate-200">Local Security Engine</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> Authoritative
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Engine Score:</span>
                <span className="font-mono font-bold text-sm text-white">{local?.riskScore ?? 0}/100</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Entities Detected:</span>
                <span className="font-mono text-xs text-cyan-300">{local?.detectionCount ?? 0}</span>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2">
              {local?.summary || 'Deterministic pattern matching for credentials, PII, and financial data.'}
            </p>
          </div>
          <div className="mt-3 pt-2 text-[10px] text-slate-500 font-mono">
            Ground Truth: Exact Pattern & Luhn Check
          </div>
        </div>

        {/* 2. Google Gemini 1.5 */}
        <div className={`p-4 rounded-xl bg-slate-900/70 border ${gemini?.available ? 'border-slate-800' : 'border-slate-800/50 opacity-80'} flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-light" />
                <span className="font-semibold text-xs text-slate-200">Google Gemini</span>
              </div>
              {gemini?.available ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  <AlertTriangle className="w-3 h-3" /> Offline
                </span>
              )}
            </div>

            {gemini?.available ? (
              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Contextual Risk:</span>
                  <span className="font-mono font-bold text-sm text-white">{gemini?.riskScore ?? 'N/A'}/100</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Context Observations:</span>
                  <span className="font-mono text-xs text-primary-light">{gemini?.findings?.length || 0}</span>
                </div>
                <p className="mt-3 text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2">
                  {gemini?.explanation || 'Evaluated prompt context and architectural safety.'}
                </p>
              </div>
            ) : (
              <div className="py-2 text-[11px] text-slate-400 italic">
                {gemini?.reason || 'Gemini service offline or API key missing.'}
              </div>
            )}
          </div>
          <div className="mt-3 pt-2 text-[10px] text-slate-500 font-mono">
            Provider: Google AI Studio
          </div>
        </div>

        {/* 3. xAI Grok */}
        <div className={`p-4 rounded-xl bg-slate-900/70 border ${grok?.available ? 'border-slate-800' : 'border-slate-800/50 opacity-80'} flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-secondary-light" />
                <span className="font-semibold text-xs text-slate-200">xAI Grok</span>
              </div>
              {grok?.available ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  <AlertTriangle className="w-3 h-3" /> Offline
                </span>
              )}
            </div>

            {grok?.available ? (
              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Contextual Risk:</span>
                  <span className="font-mono font-bold text-sm text-white">{grok?.riskScore ?? 'N/A'}/100</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Context Observations:</span>
                  <span className="font-mono text-xs text-secondary-light">{grok?.findings?.length || 0}</span>
                </div>
                <p className="mt-3 text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2">
                  {grok?.explanation || 'Verified secondary exposure and prompt resistance.'}
                </p>
              </div>
            ) : (
              <div className="py-2 text-[11px] text-slate-400 italic">
                {grok?.reason || 'xAI Grok offline or GROK_API_KEY missing.'}
              </div>
            )}
          </div>
          <div className="mt-3 pt-2 text-[10px] text-slate-500 font-mono">
            Provider: xAI Cloud API
          </div>
        </div>
      </div>

      {/* Synthesized Recommendations */}
      {synthesizedRecommendations.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Consolidated Security Recommendations
          </h4>
          <ul className="space-y-2">
            {synthesizedRecommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="text-indigo-400 font-bold shrink-0">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
