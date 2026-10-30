import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ScannerPage from './pages/ScannerPage';
import ThreatAnalysisPage from './pages/ThreatAnalysisPage';
import AiAnalysisPage from './pages/AiAnalysisPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-slate-100 selection:bg-primary selection:text-white font-sans antialiased">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/scanner" element={<ScannerPage />} />
          <Route path="/threat-analysis" element={<ThreatAnalysisPage />} />
          <Route path="/ai-analysis" element={<AiAnalysisPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />

      {/* Dark Cybersecurity Themed Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0D1426',
            color: '#F8FAFC',
            border: '1px solid #1F2C4C',
            fontSize: '13px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#0D1426',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#0D1426',
            },
          },
        }}
      />
    </div>
  );
}
