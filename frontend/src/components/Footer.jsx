import React from 'react';
import { Shield, Lock, Cpu, EyeOff, CheckCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 py-10 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-tr from-primary to-secondary">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base text-white tracking-tight">PrivyShield AI</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Before your private information reaches AI, PrivyShield protects it. Enterprise-grade AI privacy firewall
              intercepting secrets, credentials, PII, and financial data with multi-model AI consensus.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                <EyeOff className="w-3 h-3 text-cyan-400" /> Ephemeral Memory Only
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                <Lock className="w-3 h-3 text-emerald-400" /> Zero Raw Prompt Storage
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                <Cpu className="w-3 h-3 text-indigo-400" /> Multi-Model Consensus
              </span>
            </div>
          </div>

          {/* Security Standards */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Security Architecture</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Deterministic Luhn Card Validation</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Indian PII (Aadhaar & PAN) Patterns</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cryptographic Key & Secret Redaction</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Row Level Security (Supabase RLS)</span>
              </li>
            </ul>
          </div>

          {/* AI Providers */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">AI Intelligence</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Google Gemini 1.5 Security Audit</li>
              <li>xAI Grok Context Analysis</li>
              <li>Dual-Model Consensus Synthesis</li>
              <li>Explicit User Transmission Consent</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} PrivyShield AI. Production-minded cybersecurity hackathon platform.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              All Security Systems Nominal
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
