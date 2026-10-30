import React, { useState, useEffect } from 'react';
import { History, ShieldCheck, Filter, Clock, Hash, AlertOctagon, RefreshCw, Lock } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/scanner/history');
      if (res.data.success) {
        setHistory(res.data.history || []);
        setFilteredHistory(res.data.history || []);
      }
    } catch {
      toast.error('Failed to load audit history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (selectedFilter === 'ALL') {
      setFilteredHistory(history);
    } else {
      setFilteredHistory(history.filter(h => h.risk_level?.toUpperCase() === selectedFilter));
    }
  }, [selectedFilter, history]);

  const filterButtons = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'SAFE'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 cyber-grid">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/20 text-primary-light border border-primary/30">
              <History className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Security Audit History & Hash Ledger
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Cryptographic audit ledger of past firewall interceptions. Backed by Supabase PostgreSQL.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          disabled={isLoading}
          className="p-2.5 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 transition-colors border border-slate-700 self-start sm:self-auto"
          title="Refresh History"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Privacy Guarantee Alert Box */}
      <div className="p-4 rounded-2xl glass-panel-elevated border border-emerald-500/30 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <h4 className="font-bold text-white">PrivyShield Strict Zero-Prompt Persistence Guarantee</h4>
          <p className="text-slate-300 leading-relaxed">
            In compliance with enterprise privacy standards, <strong className="text-white">original unredacted prompts are permanently discarded from memory</strong> after inspection.
            Only risk scores, threat categories, and irreversible SHA-256 hashes are logged in the database.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-2">
          <Filter className="w-3.5 h-3.5 text-primary-light" /> Filter Posture:
        </span>
        {filterButtons.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setSelectedFilter(filter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
              selectedFilter === filter
                ? 'bg-primary text-white shadow-glow-primary border border-primary-light'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Audit History Table */}
      <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShieldCheck className="w-8 h-8 text-slate-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">No records found for this filter</h4>
            <p className="text-xs text-slate-500">All prompt scans matching this criteria are displayed here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
                  <th className="py-3 px-4">Scan ID</th>
                  <th className="py-3 px-4">Timestamp (UTC)</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Threats</th>
                  <th className="py-3 px-4">Categories Detected</th>
                  <th className="py-3 px-4">Sanitized SHA-256 Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 text-indigo-300 font-semibold truncate max-w-[130px]">
                      {item.id}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-sans flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(item.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        item.risk_level === 'Critical' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                        item.risk_level === 'High' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30' :
                        item.risk_level === 'Medium' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                        item.risk_level === 'Low' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' :
                        'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {item.risk_level}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-white font-bold">
                      {item.risk_score} <span className="text-slate-500 text-[10px]">/ 100</span>
                    </td>
                    <td className="py-3.5 px-4 text-cyan-300">
                      {item.detection_count}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <div className="flex flex-wrap gap-1">
                        {(item.threat_categories || []).length > 0 ? (
                          item.threat_categories.map((cat, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                              {cat}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-[11px]">Clean</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px] truncate max-w-[180px]" title={item.sanitized_prompt_hash}>
                      {item.sanitized_prompt_hash}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
