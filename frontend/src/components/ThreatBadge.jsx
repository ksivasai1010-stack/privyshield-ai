import React from 'react';
import { Key, Mail, Phone, CreditCard, ShieldAlert, FileText, Lock, Building } from 'lucide-react';

export default function ThreatBadge({ type, severity, category }) {
  // Get icon by type
  const getIcon = () => {
    switch (type) {
      case 'API_KEY':
      case 'API_KEY_OPENAI':
      case 'AWS_ACCESS_KEY':
      case 'GITHUB_TOKEN':
      case 'PRIVATE_KEY':
        return Key;
      case 'PASSWORD':
      case 'JWT_TOKEN':
        return Lock;
      case 'EMAIL_ADDRESS':
        return Mail;
      case 'PHONE_NUMBER':
        return Phone;
      case 'CREDIT_CARD':
      case 'BANK_ACCOUNT':
      case 'BANK_IFSC':
        return CreditCard;
      case 'POTENTIAL_AADHAAR':
      case 'POTENTIAL_PAN':
        return FileText;
      case 'CONFIDENTIAL_BUSINESS':
        return Building;
      default:
        return ShieldAlert;
    }
  };

  const Icon = getIcon();

  const getSeverityStyle = () => {
    switch (severity) {
      case 'Critical':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'High':
        return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
      case 'Medium':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Low':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
  };

  const formatTypeName = (raw) => {
    return raw
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getSeverityStyle()}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{formatTypeName(type || category || 'Threat')}</span>
      {severity && (
        <span className="text-[10px] font-mono opacity-80 uppercase ml-1 px-1 rounded bg-black/20">
          {severity}
        </span>
      )}
    </span>
  );
}
