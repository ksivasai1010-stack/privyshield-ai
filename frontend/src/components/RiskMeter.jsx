import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, ShieldX } from 'lucide-react';

export default function RiskMeter({ score = 0, level = 'Safe', size = 'normal' }) {
  const normalizedScore = Math.min(100, Math.max(0, score));

  // Determine colors based on level / score
  const getColorScheme = () => {
    if (normalizedScore >= 80 || level === 'Critical') {
      return {
        text: 'text-rose-500',
        stroke: '#EF4444',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        glow: 'shadow-glow-danger',
        icon: ShieldX,
        label: 'Critical Risk'
      };
    }
    if (normalizedScore >= 60 || level === 'High') {
      return {
        text: 'text-orange-500',
        stroke: '#F97316',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        glow: 'shadow-lg shadow-orange-500/20',
        icon: AlertTriangle,
        label: 'High Risk'
      };
    }
    if (normalizedScore >= 40 || level === 'Medium') {
      return {
        text: 'text-amber-400',
        stroke: '#F59E0B',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        glow: 'shadow-lg shadow-amber-500/20',
        icon: AlertTriangle,
        label: 'Medium Risk'
      };
    }
    if (normalizedScore >= 20 || level === 'Low') {
      return {
        text: 'text-cyan-400',
        stroke: '#06B6D4',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/30',
        glow: 'shadow-glow-cyan',
        icon: ShieldAlert,
        label: 'Low Risk'
      };
    }
    return {
      text: 'text-emerald-400',
      stroke: '#10B981',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      glow: 'shadow-lg shadow-emerald-500/20',
      icon: ShieldCheck,
      label: 'Safe Posture'
    };
  };

  const scheme = getColorScheme();
  const Icon = scheme.icon;

  // Circular gauge calculations
  const radius = size === 'large' ? 68 : 46;
  const strokeWidth = size === 'large' ? 10 : 7;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;
  const svgSize = size === 'large' ? 160 : 110;

  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-2xl glass-card ${scheme.border} ${scheme.glow} transition-all duration-300`}>
      <div className="relative flex items-center justify-center" style={{ width: svgSize, height: svgSize }}>
        <svg className="transform -rotate-90" width={svgSize} height={svgSize}>
          {/* Background circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke={scheme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Score & Icon */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className={`w-6 h-6 ${scheme.text} mb-0.5 animate-pulse`} />
          <span className={`text-2xl font-bold font-mono tracking-tight text-white`}>
            {normalizedScore}
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            / 100
          </span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${scheme.bg} ${scheme.text} border ${scheme.border}`}>
          {level || scheme.label}
        </span>
      </div>
    </div>
  );
}
