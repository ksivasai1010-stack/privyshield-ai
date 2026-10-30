import React, { useState, useEffect } from 'react';
import { Settings, User, Lock, Sparkles, ShieldCheck, Trash2, LogOut, Save, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, logout } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [preferredAi, setPreferredAi] = useState(user?.preferredAi || 'both');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Privacy preferences checkboxes
  const [privacyToggles, setPrivacyToggles] = useState({
    redactEmail: true,
    redactPhone: true,
    redactKeys: true,
    redactFinancial: true,
    redactGovernmentIds: true,
    requireConsentBeforeAITransmission: true
  });

  useEffect(() => {
    if (user?.fullName) setFullName(user.fullName);
    if (user?.preferredAi) setPreferredAi(user.preferredAi);
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        fullName,
        preferredAi
      };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await api.put('/settings', payload);
      if (res.data.success) {
        toast.success('Settings updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update settings.';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to purge your account and all associated telemetry records? This action is irreversible.'
    );
    if (confirmed) {
      try {
        await api.delete('/settings/account');
        toast.success('Account metadata purged successfully.');
        logout();
      } catch {
        toast.error('Failed to delete account.');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 cyber-grid">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-primary/20 text-primary-light border border-primary/30">
            <Settings className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Security & Privacy Configuration
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          Manage your analyst identity, preferred AI consensus models, and redaction firewall policies.
        </p>
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-primary-light" />
            User Identity Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Rahul Sharma"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-primary text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address (Verified)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || 'demo@privyshield.ai'}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-500 cursor-not-allowed outline-none"
              />
            </div>
          </div>
        </div>

        {/* AI Engine Preferences Card */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-secondary-light" />
            Preferred AI Consensus Engine
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'both', label: 'Dual Consensus', desc: 'Gemini + Grok Multi-Model' },
              { id: 'gemini', label: 'Google Gemini 1.5', desc: 'Contextual Privacy Review' },
              { id: 'grok', label: 'xAI Grok', desc: 'Injection & Exfiltration Defense' }
            ].map((option) => (
              <label
                key={option.id}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  preferredAi === option.id
                    ? 'bg-primary/20 border-primary text-white shadow-glow-primary'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs">{option.label}</span>
                  <input
                    type="radio"
                    name="preferredAi"
                    value={option.id}
                    checked={preferredAi === option.id}
                    onChange={(e) => setPreferredAi(e.target.value)}
                    className="accent-primary"
                  />
                </div>
                <p className="text-[11px] text-slate-400">{option.desc}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Firewall Redaction Policies Card */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Active Firewall Redaction Policies
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {Object.entries({
              redactEmail: 'Redact Email Addresses ([EMAIL_1])',
              redactPhone: 'Redact Indian Mobile Numbers ([PHONE_1])',
              redactKeys: 'Redact API Keys & Private SSH Keys ([API_KEY_1])',
              redactFinancial: 'Redact Payment Cards & Bank Accounts',
              redactGovernmentIds: 'Redact Potential Aadhaar & PAN Identifiers',
              requireConsentBeforeAITransmission: 'Require Explicit Approval Before AI Dispatch'
            }).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyToggles[key]}
                  onChange={(e) => setPrivacyToggles({ ...privacyToggles, [key]: e.target.checked })}
                  className="accent-primary rounded"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Change Password Card */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            Update Access Password
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-primary text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                New Password (Min 6 Characters)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-primary text-xs text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Changes CTA */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-glow-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>

      {/* Danger Zone: Purge Account */}
      <div className="p-6 rounded-2xl glass-panel border border-rose-500/30 space-y-4">
        <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Danger Zone
        </h3>
        <p className="text-xs text-slate-400">
          Permanently purge your account profile, audit hashes, and security telemetry from the database.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>

          <button
            type="button"
            onClick={handleDeleteAccount}
            className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-rose-500/40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge Account & Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
