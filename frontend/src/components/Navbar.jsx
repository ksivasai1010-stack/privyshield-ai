import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Sparkles, LayoutDashboard, ScanLine, AlertOctagon, History, Settings, LogIn, LogOut, Menu, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout, quickDemoLogin } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Scanner', path: '/scanner', icon: ScanLine },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Threat Engine', path: '/threat-analysis', icon: AlertOctagon },
    { name: 'AI Consensus', path: '/ai-analysis', icon: Sparkles },
    { name: 'Audit History', path: '/history', icon: History },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-primary to-secondary shadow-glow-primary group-hover:scale-105 transition-transform duration-300">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5 font-sans">
              PrivyShield <span className="text-secondary text-xs uppercase px-1.5 py-0.5 rounded bg-secondary/15 border border-secondary/30">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">Privacy Firewall</span>
          </div>
        </Link>

        {/* Live Firewall Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-emerald-400">Firewall Active</span>
          <span className="text-slate-500">|</span>
          <span className="text-[11px] text-slate-400 font-mono">Zero-Leak Redaction</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? 'bg-primary/15 text-primary-light border border-primary/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Auth & Settings */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/settings"
                className="flex items-center gap-2 p-1.5 pr-3 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 transition-colors"
                title="Account Settings"
              >
                <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-primary to-indigo-700 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                  {user?.fullName ? user.fullName[0] : (user?.email ? user.email[0] : 'U')}
                </div>
                <span className="font-medium truncate max-w-[110px]">{user?.fullName || user?.email}</span>
                <Settings className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <button
                onClick={logout}
                className="p-2 rounded-lg bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors border border-slate-800"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={quickDemoLogin}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-all flex items-center gap-1.5"
                title="Instant login with pre-configured analyst profile for hackathon evaluation"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Demo Mode
              </button>

              <Link
                to="/login"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                Login
              </Link>

              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary hover:bg-primary-hover text-white transition-all shadow-glow-primary"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-background/95 px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active ? 'bg-primary/20 text-primary-light' : 'text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    quickDemoLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-xs font-semibold rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Instant Demo Analyst Mode
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 text-xs font-medium rounded-lg bg-slate-800 text-slate-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 text-xs font-semibold rounded-lg bg-primary text-white"
                  >
                    Register
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-300 truncate">{user?.fullName || user?.email}</span>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
