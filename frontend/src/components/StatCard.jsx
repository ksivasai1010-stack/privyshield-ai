import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, trend, variant = 'primary' }) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          glow: 'group-hover:border-primary/50 group-hover:shadow-glow-primary',
          iconBg: 'bg-primary/10 text-primary-light',
          badge: 'text-primary-light bg-primary/10'
        };
      case 'cyan':
        return {
          glow: 'group-hover:border-secondary/50 group-hover:shadow-glow-cyan',
          iconBg: 'bg-secondary/10 text-secondary-light',
          badge: 'text-secondary-light bg-secondary/10'
        };
      case 'danger':
        return {
          glow: 'group-hover:border-danger/50 group-hover:shadow-glow-danger',
          iconBg: 'bg-danger/10 text-danger-light',
          badge: 'text-danger-light bg-danger/10'
        };
      case 'success':
        return {
          glow: 'group-hover:border-success/50 group-hover:shadow-lg group-hover:shadow-success/20',
          iconBg: 'bg-success/10 text-success-light',
          badge: 'text-success-light bg-success/10'
        };
      default:
        return {
          glow: 'group-hover:border-slate-500/50',
          iconBg: 'bg-slate-800 text-slate-300',
          badge: 'text-slate-300 bg-slate-800'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`group relative p-5 rounded-2xl glass-panel border border-slate-800/80 transition-all duration-300 hover:-translate-y-0.5 ${styles.glow}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold font-mono text-white mt-1.5">{value}</h3>
          {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${styles.iconBg} shrink-0 transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
          <span className="text-slate-400">{trend.label}</span>
          <span className={`font-mono font-semibold ${trend.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
}
