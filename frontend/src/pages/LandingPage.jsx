import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Lock,
  Cpu,
  ArrowRight,
  EyeOff,
  Database,
  Terminal,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Copy,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LandingPage() {
  // Live preview scanner interactive state
  const [previewInput, setPreviewInput] = useState(
    'My email is rahul@example.com and my API key is sk-example-123456. Help me debug my application.'
  );
  const [copied, setCopied] = useState(false);

  // Quick live demo redaction calculation for the widget
  const getSimulatedSanitization = (text) => {
    let sanitized = text;
    sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[EMAIL_1]');
    sanitized = sanitized.replace(/\b(?:sk-(?:[a-zA-Z0-9_\-]{6,}))\b/g, '[API_KEY_1]');
    sanitized = sanitized.replace(/(?:\+91[\s-]?)?[6789]\d{9}\b/g, '[PHONE_1]');
    sanitized = sanitized.replace(/\b[2-9][0-9]{3}\s?[0-9]{4}\s?[0-9]{4}\b/g, '[POTENTIAL_AADHAAR_1]');
    return sanitized;
  };

  const previewSanitized = getSimulatedSanitization(previewInput);
  const hasSecrets = previewInput !== previewSanitized;

  const handleCopy = () => {
    navigator.clipboard.writeText(previewSanitized);
    setCopied(true);
    toast.success('Sanitized text copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[250px] bg-secondary/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-primary/30 text-xs font-semibold text-primary-light shadow-glow-primary animate-fade-in">
            <ShieldCheck className="w-4 h-4 text-secondary" />
            <span>Next-Generation Intelligent AI Privacy Firewall</span>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
            Your Privacy. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-300 to-secondary">
              Our First Line of Defense.
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Intercept sensitive credentials, API keys, passwords, Indian PII, and financial data{' '}
            <span className="text-white font-medium">before</span> they ever leave your machine for public or enterprise LLMs.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/scanner"
              className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-glow-primary hover:shadow-xl transition-all flex items-center gap-2 group"
            >
              <span>Launch Privacy Scanner</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/dashboard"
              className="px-6 py-3.5 rounded-xl glass-panel hover:bg-slate-800 text-slate-200 text-sm font-semibold border border-slate-700/80 transition-all flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4 text-cyan-400" />
              <span>View Security Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Live Interactive Scanner Preview Widget */}
        <div className="mt-14 max-w-4xl mx-auto">
          <div className="rounded-2xl glass-panel-elevated p-6 border border-indigo-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary-light" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Live Interactive Firewall Preview
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {hasSecrets ? (
                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Sensitive Data Intercepted
                  </span>
                ) : (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> No Secrets Detected
                  </span>
                )}
              </span>
            </div>

            {/* Quick Demo Preload Buttons */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px] font-semibold">Try sample:</span>
              <button
                type="button"
                onClick={() => setPreviewInput('My email is rahul@example.com and my API key is sk-example-123456. Help me debug my application.')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                Rahul Demo (API Key + Email)
              </button>
              <button
                type="button"
                onClick={() => setPreviewInput('Customer Aadhaar number is 4589 1234 5678 and mobile is +91 9876543210 for account verification.')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                Indian PII (Aadhaar + Phone)
              </button>
              <button
                type="button"
                onClick={() => setPreviewInput('How do I optimize binary search in Python without memory overhead?')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                Safe Coding Prompt
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Input Box */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Type or Paste Raw Prompt (Local):
                </label>
                <textarea
                  value={previewInput}
                  onChange={(e) => setPreviewInput(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary text-xs font-mono text-slate-200 outline-none resize-none"
                  placeholder="Enter a prompt with emails, API keys, passwords..."
                />
              </div>

              {/* Real-Time Redacted Output */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Firewall Sanitized Output:
                  </label>
                  <button
                    onClick={handleCopy}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="w-full h-[96px] p-3 rounded-xl bg-slate-950/90 border border-emerald-500/30 text-xs font-mono text-emerald-300/90 overflow-y-auto leading-relaxed select-text">
                  {previewSanitized}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary-light" /> Zero raw data stored. Sanitized prompts only dispatched upon explicit consent.
              </span>
              <Link to="/scanner" className="text-secondary hover:underline font-semibold flex items-center gap-1">
                Open Full Deep Scanner &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Enterprise AI Privacy Protection Suite
          </h2>
          <p className="text-sm text-slate-400">
            A complete defensive layer combining deterministic pattern recognition with multi-model AI consensus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 hover:border-primary/50 transition-all space-y-3">
            <div className="p-3 rounded-xl bg-primary/10 text-primary-light w-fit">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Deterministic Secret Interception</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Regex and entropy detection for OpenAI keys, AWS access tokens, GitHub PATs, JWT tokens, private SSH keys, and plaintext passwords.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 hover:border-secondary/50 transition-all space-y-3">
            <div className="p-3 rounded-xl bg-secondary/10 text-secondary-light w-fit">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Indian PII & Financial Safeguard</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detects Indian mobile numbers (+91), email addresses, potential 12-digit Aadhaar identifiers, PAN tax cards, and payment cards with Luhn validation.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 hover:border-indigo-500/50 transition-all space-y-3">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Dual AI Consensus Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synthesizes Google Gemini 1.5 and xAI Grok audits of the sanitized text to detect subtle contextual leakage, NDA violations, and injection attempts.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 hover:border-emerald-500/50 transition-all space-y-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
              <EyeOff className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Zero-Storage Architecture</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Raw prompts reside in memory only during inspection and are permanently scrubbed. Only cryptographic SHA-256 hashes and risk scores are recorded.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 hover:border-amber-500/50 transition-all space-y-3">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Numbered Placeholder Redaction</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Replaces secrets with clean, semantic placeholders like [EMAIL_1] and [API_KEY_1], allowing LLMs to debug code without compromising credentials.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 hover:border-rose-500/50 transition-all space-y-3">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 w-fit">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Supabase Audit Trails & RLS</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enterprise compliance logging backed by Supabase PostgreSQL with strict Row Level Security (RLS) guaranteeing user data isolation.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Pipeline */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How PrivyShield Protects Your Prompts
          </h2>
          <p className="text-sm text-slate-400">
            A verifiable 4-stage privacy pipeline executed in milliseconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono font-bold text-sm">
              01
            </div>
            <h4 className="font-bold text-sm text-white">Prompt Interception</h4>
            <p className="text-xs text-slate-400">
              User enters prompt in editor or browser extension. Captured locally over encrypted HTTPS.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold text-sm">
              02
            </div>
            <h4 className="font-bold text-sm text-white">Deterministic Inspection</h4>
            <p className="text-xs text-slate-400">
              Multi-layer scanners evaluate 15+ regex patterns, Luhn card checksums, and token structures.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm">
              03
            </div>
            <h4 className="font-bold text-sm text-white">Tokenized Redaction</h4>
            <p className="text-xs text-slate-400">
              Secrets replaced with safe numbered placeholders. Raw prompt scrubbed permanently from RAM.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-mono font-bold text-sm">
              04
            </div>
            <h4 className="font-bold text-sm text-white">Consensus & Safe Dispatch</h4>
            <p className="text-xs text-slate-400">
              Gemini & Grok verify contextual safety. Prompt dispatched to target LLM only upon user consent.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="rounded-3xl glass-panel-elevated p-8 sm:p-12 border border-primary/40 shadow-glow-primary text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Ready to secure your AI workflows?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Experience immediate privacy firewall protection. Test live sample prompts or run real-world developer security evaluations.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/scanner"
              className="px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-glow-primary transition-all flex items-center gap-2"
            >
              <span>Scan Your First Prompt</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/threat-analysis"
              className="px-6 py-3.5 rounded-xl glass-panel hover:bg-slate-800 text-slate-200 text-sm font-semibold border border-slate-700 transition-all"
            >
              Explore Threat Catalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Icon helper
function LayoutDashboard(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
  );
}
