import React, { useState } from 'react';
import {
  ScanLine,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Clipboard,
  Trash2,
  RefreshCw,
  Send,
  AlertTriangle,
  Cpu,
  Info,
  CheckCircle2,
  Sliders,
  Play
} from 'lucide-react';
import api from '../services/api';
import RiskMeter from '../components/RiskMeter';
import ThreatBadge from '../components/ThreatBadge';
import PromptComparison from '../components/PromptComparison';
import ConsensusCard from '../components/ConsensusCard';
import { DEMO_PROMPTS } from '../utils/demoPrompts';
import toast from 'react-hot-toast';

export default function ScannerPage() {
  const [prompt, setPrompt] = useState(DEMO_PROMPTS[0].prompt); // Default to official Rahul demo prompt
  const [selectedDemoId, setSelectedDemoId] = useState(DEMO_PROMPTS[0].id);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // AI scanning preferences
  const [enableGemini, setEnableGemini] = useState(true);
  const [enableGrok, setEnableGrok] = useState(true);

  // Load a demo case
  const handleSelectDemo = (demo) => {
    setSelectedDemoId(demo.id);
    setPrompt(demo.prompt);
    toast.success(`Loaded demo: ${demo.title}`);
  };

  const handleClear = () => {
    setPrompt('');
    setSelectedDemoId('');
    setScanResult(null);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setPrompt(text);
        setSelectedDemoId('');
        toast.success('Pasted from clipboard!');
      }
    } catch {
      toast.error('Clipboard read permission was denied.');
    }
  };

  const handleScan = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter or select a prompt to scan.');
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    const providers = [];
    if (enableGemini) providers.push('gemini');
    if (enableGrok) providers.push('grok');

    try {
      const res = await api.post('/scanner/scan', {
        prompt,
        includeAiAnalysis: providers.length > 0,
        aiProviders: providers
      });

      if (res.data.success) {
        setScanResult(res.data);
        if (res.data.detectionCount > 0) {
          toast.success(`Firewall intercepted ${res.data.detectionCount} sensitive item(s)!`);
        } else {
          toast.success('Prompt verified clean. No sensitive items detected.');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Firewall scan failed. Please verify backend connection.';
      toast.error(msg);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 cyber-grid">
      {/* Header Banner */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-primary/20 text-primary-light border border-primary/30">
            <ScanLine className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Privacy Firewall & Prompt Scanner
          </h1>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl">
          Enter any prompt destined for LLMs. PrivyShield scans for credentials, Indian PII, and financial data locally,
          redacts them with semantic tokens, and executes dual AI verification before external dispatch.
        </p>
      </div>

      {/* Demo Test Case Selector Carousel / Pills */}
      <div className="rounded-2xl glass-panel border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-secondary-light" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Preloaded Hackathon Test Cases (Judges Quick Selection)
            </h4>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Simulated credentials are strictly dummy values</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {DEMO_PROMPTS.map((demo) => {
            const isSelected = selectedDemoId === demo.id;
            return (
              <button
                key={demo.id}
                type="button"
                onClick={() => handleSelectDemo(demo)}
                className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-primary/20 border-primary text-white shadow-glow-primary'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-xs">{demo.title}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    demo.difficulty === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    demo.difficulty === 'High' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                    demo.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {demo.difficulty}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">{demo.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Prompt Input Editor Card */}
      <div className="rounded-2xl glass-panel-elevated border border-slate-800 p-6 space-y-4">
        {/* Editor Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Prompt Input Buffer
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-slate-400 text-[11px] px-2 py-1 rounded bg-slate-900 border border-slate-800">
              {prompt.length} chars | ~{Math.ceil(prompt.length / 4)} tokens
            </span>

            <button
              onClick={handlePaste}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
              title="Paste from clipboard"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste</span>
            </button>

            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors border border-slate-700"
              title="Clear editor"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            setSelectedDemoId('');
          }}
          rows={6}
          placeholder="Paste or write your prompt here. Include code with potential API keys, connection strings, emails, phone numbers, or confidential notes..."
          className="w-full p-4 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary text-xs font-mono text-slate-100 placeholder-slate-500 outline-none resize-y leading-relaxed"
        />

        {/* AI Preferences & Scan Trigger */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-primary-light" /> AI Reviewers:
            </span>
            <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={enableGemini}
                onChange={(e) => setEnableGemini(e.target.checked)}
                className="accent-primary rounded"
              />
              <span>Google Gemini</span>
            </label>
            <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={enableGrok}
                onChange={(e) => setEnableGrok(e.target.checked)}
                className="accent-secondary rounded"
              />
              <span>xAI Grok</span>
            </label>
          </div>

          <button
            onClick={handleScan}
            disabled={isScanning || !prompt.trim()}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-bold transition-all shadow-glow-primary flex items-center justify-center gap-2"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Executing Privacy Firewall...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Scan & Redact Prompt</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading Radar Effect while scanning */}
      {isScanning && (
        <div className="p-8 rounded-2xl glass-panel border border-primary/40 text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto"></div>
          <p className="text-xs font-mono text-primary-light">
            Intercepting prompt &rarr; Scanning 15+ regex patterns & Luhn checksums &rarr; Redacting secrets &rarr; Synthesizing AI consensus...
          </p>
        </div>
      )}

      {/* Scan Results Section */}
      {scanResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Score & Summary Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Risk Gauge */}
            <div className="lg:col-span-1">
              <RiskMeter
                score={scanResult.riskScore}
                level={scanResult.riskLevel}
                size="large"
              />
            </div>

            {/* Findings Overview */}
            <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-secondary-light" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Firewall Interception Summary
                    </h3>
                  </div>
                  <span className="font-mono text-xs text-slate-400">
                    Scan ID: <span className="text-indigo-400">{scanResult.scanId?.substring(0, 10)}...</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase">Detections</span>
                    <p className="text-lg font-bold font-mono text-cyan-300">{scanResult.detectionCount}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase">Critical</span>
                    <p className="text-lg font-bold font-mono text-rose-400">{scanResult.threatCounts?.Critical || 0}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase">High/Medium</span>
                    <p className="text-lg font-bold font-mono text-amber-400">
                      {(scanResult.threatCounts?.High || 0) + (scanResult.threatCounts?.Medium || 0)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase">Redactions</span>
                    <p className="text-lg font-bold font-mono text-emerald-400">{scanResult.redactionMap?.length || 0}</p>
                  </div>
                </div>

                {/* Detected Badges */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 font-medium">Intercepted Entity Classes:</span>
                  <div className="flex flex-wrap gap-2">
                    {scanResult.findings.length > 0 ? (
                      scanResult.findings.map((f) => (
                        <ThreatBadge
                          key={f.id}
                          type={f.type}
                          severity={f.severity}
                          category={f.category}
                        />
                      ))
                    ) : (
                      <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> No threats found. Clean prompt.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Sanitized SHA-256 Hash:</span>
                <span className="truncate max-w-[200px] text-slate-500" title={scanResult.sanitizedPromptHash}>
                  {scanResult.sanitizedPromptHash}
                </span>
              </div>
            </div>
          </div>

          {/* Prompt Comparison View (Raw vs Sanitized) */}
          <PromptComparison
            originalPrompt={prompt}
            sanitizedPrompt={scanResult.redactedPrompt}
            redactionMap={scanResult.redactionMap}
          />

          {/* AI Consensus Card */}
          <ConsensusCard consensus={scanResult.consensus} />
        </div>
      )}
    </div>
  );
}
