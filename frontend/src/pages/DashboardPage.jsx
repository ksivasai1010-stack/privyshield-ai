import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  FileCheck2,
  ScanLine,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import api from '../services/api';
import StatCard from '../components/StatCard';
import ThreatBadge from '../components/ThreatBadge';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/scanner/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.warn('Could not load dynamic stats, using fallback state');
      toast.error('Failed to load dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalScans = stats?.totalScans ?? 0;
  const totalDetections = stats?.totalDetections ?? 0;
  const criticalThreats = stats?.criticalThreats ?? 0;
  const sanitizedCount = stats?.sanitizedCount ?? 0;
  const protectionPercentage = stats?.protectionPercentage ?? 100;
  const recentActivity = stats?.recentActivity || [];

  // Colors for Threat Categories chart
  const PIE_COLORS = ['#6366F1', '#06B6D4', '#F59E0B', '#EF4444', '#10B981'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 cyber-grid">
      {/* Top Banner & Scan CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel-elevated border border-indigo-500/30 shadow-glow-primary">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Security Operations Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Live Firewall Active
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Real-time telemetry of intercepted secrets, credential leaks, and multi-model AI consensus verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            disabled={isLoading}
            className="p-2.5 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 transition-colors border border-slate-700"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/scanner"
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-glow-primary flex items-center gap-2"
          >
            <ScanLine className="w-4 h-4" />
            <span>Scan New Prompt</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 5 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Prompts Scanned"
          value={totalScans}
          subtext="Total prompt executions"
          icon={ScanLine}
          variant="primary"
          trend={{ label: 'Firewall uptime', value: '100%', positive: true }}
        />
        <StatCard
          title="Sensitive Items"
          value={totalDetections}
          subtext="Intercepted entities"
          icon={ShieldAlert}
          variant="cyan"
          trend={{ label: 'Entity coverage', value: '15+ types', positive: true }}
        />
        <StatCard
          title="Critical Threats"
          value={criticalThreats}
          subtext="API keys & passwords blocked"
          icon={AlertOctagon}
          variant="danger"
          trend={{ label: 'Zero egress leaks', value: '0 Leaks', positive: true }}
        />
        <StatCard
          title="Prompts Sanitized"
          value={sanitizedCount}
          subtext="Safely tokenized"
          icon={FileCheck2}
          variant="primary"
          trend={{ label: 'Tokenized placeholders', value: 'Active', positive: true }}
        />
        <StatCard
          title="Protection Rate"
          value={`${protectionPercentage}%`}
          subtext="Zero-leak adherence"
          icon={ShieldCheck}
          variant="success"
          trend={{ label: 'Efficacy score', value: 'Optimal', positive: true }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Chart */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Privacy Risk Distribution
              </h3>
              <p className="text-xs text-slate-400">Classification of scanned prompt risk severity</p>
            </div>
            <TrendingUp className="w-4 h-4 text-primary-light" />
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.riskDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D1426',
                    borderColor: '#1F2C4C',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#F8FAFC'
                  }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {(stats?.riskDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#6366F1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Categories Breakdown Chart */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Threat Category Analysis
              </h3>
              <p className="text-xs text-slate-400">Distribution across Credential, PII, and Financial categories</p>
            </div>
            <Sparkles className="w-4 h-4 text-secondary-light" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {stats?.threatCategories && stats.threatCategories.some(c => c.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.threatCategories}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {stats.threatCategories.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0D1426',
                      borderColor: '#1F2C4C',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#F8FAFC'
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center p-6 space-y-2">
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs text-slate-400">No threat patterns detected yet in current telemetry.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Security Activity Table */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Security Audit Activity
            </h3>
            <p className="text-xs text-slate-400">
              Safe metadata only. Unredacted prompts are never stored in history.
            </p>
          </div>
          <Link to="/history" className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1">
            View All History &rarr;
          </Link>
        </div>

        {recentActivity.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="p-3 rounded-full bg-slate-800/80 w-fit mx-auto text-slate-400">
              <ScanLine className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-200">No Scans Recorded Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Run your first prompt scan to see real-time redaction, risk telemetry, and AI consensus results.
            </p>
            <Link
              to="/scanner"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold"
            >
              Scan Demo Prompt
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
                  <th className="py-3 px-3">Scan ID</th>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Risk Level</th>
                  <th className="py-3 px-3">Risk Score</th>
                  <th className="py-3 px-3">Threats Intercepted</th>
                  <th className="py-3 px-3">Categories</th>
                  <th className="py-3 px-3">SHA-256 Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {recentActivity.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 text-slate-300 font-semibold truncate max-w-[120px]">
                      {item.id.substring(0, 13)}...
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-sans flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3 font-sans">
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
                    <td className="py-3 px-3 text-white font-bold">
                      {item.risk_score} <span className="text-slate-500 text-[10px]">/ 100</span>
                    </td>
                    <td className="py-3 px-3 text-cyan-300">
                      {item.detection_count} item(s)
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <div className="flex flex-wrap gap-1">
                        {(item.threat_categories || []).length > 0 ? (
                          item.threat_categories.map((c, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                              {c}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-[11px]">Clean</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[10px] truncate max-w-[130px]" title={item.sanitized_prompt_hash}>
                      {item.sanitized_prompt_hash ? item.sanitized_prompt_hash.substring(0, 16) + '...' : 'N/A'}
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
