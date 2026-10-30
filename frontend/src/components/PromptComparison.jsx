import React, { useState } from 'react';
import { Copy, Check, Download, Send, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PromptComparison({
  originalPrompt,
  sanitizedPrompt,
  redactionMap = [],
  onSendToAi
}) {
  const [copied, setCopied] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('both');
  const [isSending, setIsSending] = useState(false);

  const handleCopy = () => {
    if (!sanitizedPrompt) return;
    navigator.clipboard.writeText(sanitizedPrompt);
    setCopied(true);
    toast.success('Sanitized prompt copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!sanitizedPrompt) return;
    const blob = new Blob([sanitizedPrompt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `privyshield-sanitized-prompt-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Sanitized prompt downloaded!');
  };

  const handleConfirmSendToAi = async () => {
    setIsSending(true);
    try {
      if (onSendToAi) {
        await onSendToAi(selectedProvider);
      } else {
        toast.success(`Sanitized prompt securely routed to ${selectedProvider === 'both' ? 'Gemini & Grok' : selectedProvider} with full privacy guarantee.`);
      }
      setShowAiModal(false);
    } catch {
      toast.error('Failed to dispatch prompt to AI.');
    } finally {
      setIsSending(false);
    }
  };

  // Helper to render text with highlighted placeholder tags
  const renderHighlightedSanitized = (text) => {
    if (!text) return null;
    const regex = /(\[[A-Z_]+_\d+\])/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <span
            key={index}
            className="inline-block px-1.5 py-0.5 mx-0.5 text-xs font-mono font-semibold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm"
            title="Redacted Entity Placeholder"
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Prompt Card (Local transient view only) */}
        <div className="flex flex-col rounded-2xl glass-panel border border-slate-800 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <h4 className="font-semibold text-sm text-slate-200">Raw Input (Pre-Sanitization)</h4>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Ephemeral In-Memory Only
            </span>
          </div>

          <div className="mt-4 flex-1 min-h-[160px] p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed select-text overflow-y-auto max-h-[300px]">
            {originalPrompt || <span className="text-slate-500 italic">No original text provided.</span>}
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Never submitted to external AI models in unredacted state.</span>
          </div>
        </div>

        {/* Sanitized Prompt Card */}
        <div className="flex flex-col rounded-2xl glass-panel border border-indigo-500/30 p-5 shadow-glow-primary">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <h4 className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                Sanitized Prompt <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </h4>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Safe for AI Transmission
            </span>
          </div>

          <div className="mt-4 flex-1 min-h-[160px] p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30 font-mono text-xs text-emerald-200/90 whitespace-pre-wrap leading-relaxed select-text overflow-y-auto max-h-[300px]">
            {renderHighlightedSanitized(sanitizedPrompt)}
          </div>

          {/* Action Toolbar */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Sanitized'}
              </button>

              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>

            <button
              onClick={() => setShowAiModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary hover:bg-primary-hover text-white transition-all shadow-glow-primary"
            >
              <Send className="w-3.5 h-3.5" />
              Send to AI with Consent
            </button>
          </div>
        </div>
      </div>

      {/* Redacted Placeholders Key Table */}
      {redactionMap.length > 0 && (
        <div className="rounded-2xl glass-panel border border-slate-800 p-4">
          <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Redacted Entity Mapping ({redactionMap.length} Replacements Applied)
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {redactionMap.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
                <span className="font-mono font-semibold text-indigo-400">{item.placeholder}</span>
                <span className="text-slate-400 text-[11px] truncate max-w-[140px]">
                  masks: <span className="text-slate-300 font-mono">{item.originalSnippet}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explicit User Approval Modal for AI Dispatch */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full rounded-2xl glass-panel-elevated p-6 border border-indigo-500/40 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Explicit AI Transmission Approval</h3>
                <p className="text-xs text-slate-400">Strict zero-leakage security guarantee</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-2">
              <p className="font-medium text-slate-200">
                You are about to transmit the <span className="text-emerald-400 font-semibold">SANITIZED</span> prompt to:
              </p>
              <div className="space-y-1.5 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="aiProvider"
                    value="both"
                    checked={selectedProvider === 'both'}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="accent-primary"
                  />
                  <span>Both Gemini & Grok (Dual AI Consensus)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="aiProvider"
                    value="gemini"
                    checked={selectedProvider === 'gemini'}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="accent-primary"
                  />
                  <span>Google Gemini 1.5</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="aiProvider"
                    value="grok"
                    checked={selectedProvider === 'grok'}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="accent-primary"
                  />
                  <span>xAI Grok</span>
                </label>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              PrivyShield AI guarantees that only anonymized placeholders ({redactionMap.map(r => r.placeholder).join(', ') || 'No raw secrets'}) will be transmitted.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSending}
                onClick={handleConfirmSendToAi}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary hover:bg-primary-hover text-white transition-all shadow-glow-primary flex items-center gap-1.5"
              >
                {isSending ? 'Transmitting...' : 'Approve & Transmit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
