import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);
    if (res?.success) {
      navigate('/dashboard');
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    const res = await quickDemoLogin();
    setIsLoading(false);
    if (res?.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 cyber-grid">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-primary to-secondary shadow-glow-primary">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Sign In to PrivyShield AI
          </h2>
          <p className="text-xs text-slate-400">
            Access your intelligent firewall dashboard and audit history
          </p>
        </div>

        {/* Quick Demo Mode Banner for Hackathon Judges */}
        <div className="p-4 rounded-2xl glass-panel-elevated border border-cyan-500/40 shadow-glow-cyan text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-cyan-300 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            Hackathon Judge Quick Access
          </div>
          <p className="text-xs text-slate-300">
            Click below to instantly authenticate with a pre-configured analyst session.
          </p>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleDemoLogin}
            className="w-full py-2.5 px-4 rounded-xl bg-secondary hover:bg-secondary-hover text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Live Demo Analyst Mode</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-background px-3 text-[11px] text-slate-500 uppercase tracking-widest font-mono">
            Or Sign In with Credentials
          </span>
          <div className="border-t border-slate-800 w-full"></div>
        </div>

        {/* Standard Credentials Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl glass-panel border border-slate-800 p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@enterprise.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary text-xs text-white placeholder-slate-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-glow-primary flex items-center justify-center gap-2"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-center text-xs text-slate-400 pt-2">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-light hover:underline font-semibold">
              Create Account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
