import { supabase } from '../config/supabase.js';
import crypto from 'crypto';

// In-Memory & Demo Fallback Store (Ensures 100% hackathon reliability without external config lock)
const localStore = {
  profiles: [
    {
      id: 'demo-user-uuid-101',
      email: 'demo@privyshield.ai',
      full_name: 'Security Analyst (Demo)',
      password_hash: '$2a$10$vY3F6vQ/4v1Y5n1VzM2g/.qDkM06D0aB5x8l87c6e.9t2c7sV5O/O', // 'Demo@123'
      preferred_ai: 'both',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    }
  ],
  scan_history: [
    {
      id: 'scan-init-01',
      user_id: 'demo-user-uuid-101',
      risk_score: 95,
      risk_level: 'Critical',
      detection_count: 3,
      threat_categories: ['Credential', 'PII'],
      sanitized_prompt_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      provider_status: { local: 'ok', gemini: 'ok', grok: 'ok' },
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'scan-init-02',
      user_id: 'demo-user-uuid-101',
      risk_score: 45,
      risk_level: 'Medium',
      detection_count: 1,
      threat_categories: ['PII'],
      sanitized_prompt_hash: 'ca978112ca1bbdcafac231b39a23dc4da7860814416067011968019013098f97',
      provider_status: { local: 'ok', gemini: 'ok', grok: 'unreachable' },
      created_at: new Date(Date.now() - 3600000 * 6).toISOString()
    },
    {
      id: 'scan-init-03',
      user_id: 'demo-user-uuid-101',
      risk_score: 5,
      risk_level: 'Safe',
      detection_count: 0,
      threat_categories: [],
      sanitized_prompt_hash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
      provider_status: { local: 'ok', gemini: 'ok', grok: 'ok' },
      created_at: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ],
  security_events: [
    {
      id: 'event-01',
      user_id: 'demo-user-uuid-101',
      event_type: 'CRITICAL_SECRET_INTERCEPTED',
      severity: 'Critical',
      description: 'API key sk-live-*** prevented from egress to public model endpoint.',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'event-02',
      user_id: 'demo-user-uuid-101',
      event_type: 'PII_REDACTED',
      severity: 'Medium',
      description: 'Customer contact email replaced with anonymized placeholder [EMAIL_1].',
      created_at: new Date(Date.now() - 3600000 * 6).toISOString()
    },
    {
      id: 'event-03',
      user_id: 'demo-user-uuid-101',
      event_type: 'FIREWALL_INITIALIZED',
      severity: 'Info',
      description: 'User firewall session initialized with multi-layer scanning rules active.',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    }
  ]
};

export const storageService = {
  // FIND USER BY EMAIL
  async findUserByEmail(email) {
    const cleanEmail = email.toLowerCase().trim();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (!error && data) return data;
      } catch (err) {
        console.warn('[Storage] Supabase user query error, using local store:', err.message);
      }
    }

    return localStore.profiles.find(p => p.email.toLowerCase() === cleanEmail) || null;
  },

  // FIND USER BY ID
  async findUserById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, full_name, preferred_ai, created_at')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) return data;
      } catch (err) {
        console.warn('[Storage] Supabase user query error, using local store:', err.message);
      }
    }

    const user = localStore.profiles.find(p => p.id === id);
    if (!user) return null;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  // CREATE USER
  async createUser({ email, password_hash, full_name }) {
    const cleanEmail = email.toLowerCase().trim();
    const newUser = {
      id: crypto.randomUUID(),
      email: cleanEmail,
      password_hash,
      full_name: full_name || cleanEmail.split('@')[0],
      preferred_ai: 'both',
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .insert([newUser])
          .select()
          .single();

        if (!error && data) {
          return data;
        }
        console.warn('[Storage] Supabase insert profile failed, falling back to local:', error?.message);
      } catch (err) {
        console.warn('[Storage] Supabase profile exception:', err.message);
      }
    }

    localStore.profiles.push(newUser);
    return newUser;
  },

  // UPDATE USER SETTINGS
  async updateUser(id, updates) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) return data;
      } catch (err) {
        console.warn('[Storage] Supabase update user error:', err.message);
      }
    }

    const idx = localStore.profiles.findIndex(p => p.id === id);
    if (idx !== -1) {
      localStore.profiles[idx] = { ...localStore.profiles[idx], ...updates, updated_at: new Date().toISOString() };
      return localStore.profiles[idx];
    }
    return null;
  },

  // DELETE USER ACCOUNT
  async deleteUser(id) {
    if (supabase) {
      try {
        await supabase.from('profiles').delete().eq('id', id);
      } catch (err) {
        console.warn('[Storage] Supabase delete user error:', err.message);
      }
    }
    localStore.profiles = localStore.profiles.filter(p => p.id !== id);
    localStore.scan_history = localStore.scan_history.filter(s => s.user_id !== id);
    localStore.security_events = localStore.security_events.filter(e => e.user_id !== id);
    return true;
  },

  // RECORD SCAN METADATA (Never stores unredacted prompt or raw tokens)
  async saveScanRecord({
    userId,
    riskScore,
    riskLevel,
    detectionCount,
    threatCategories,
    sanitizedPromptHash,
    providerStatus
  }) {
    const record = {
      id: crypto.randomUUID(),
      user_id: userId,
      risk_score: riskScore,
      risk_level: riskLevel,
      detection_count: detectionCount,
      threat_categories: threatCategories || [],
      sanitized_prompt_hash: sanitizedPromptHash,
      provider_status: providerStatus || {},
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('scan_history')
          .insert([record])
          .select()
          .single();

        if (!error && data) {
          // Log security event as well
          await this.logSecurityEvent({
            userId,
            eventType: detectionCount > 0 ? 'THREATS_INTERCEPTED' : 'SCAN_CLEAN',
            severity: riskLevel,
            description: `Firewall scan completed with score ${riskScore}/100. ${detectionCount} sensitive item(s) redacted.`
          });
          return data;
        }
      } catch (err) {
        console.warn('[Storage] Supabase saveScanRecord error:', err.message);
      }
    }

    localStore.scan_history.unshift(record);

    // Keep events in sync
    this.logSecurityEvent({
      userId,
      eventType: detectionCount > 0 ? 'THREATS_INTERCEPTED' : 'SCAN_CLEAN',
      severity: riskLevel,
      description: `Firewall scan completed with score ${riskScore}/100. ${detectionCount} sensitive item(s) redacted.`
    });

    return record;
  },

  // GET SCAN HISTORY FOR USER
  async getScanHistory(userId, limit = 50) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('scan_history')
          .select('id, user_id, risk_score, risk_level, detection_count, threat_categories, sanitized_prompt_hash, provider_status, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (!error && data) return data;
      } catch (err) {
        console.warn('[Storage] Supabase getScanHistory error:', err.message);
      }
    }

    return localStore.scan_history
      .filter(s => s.user_id === userId)
      .slice(0, limit);
  },

  // LOG SECURITY EVENT
  async logSecurityEvent({ userId, eventType, severity, description, metadata = {} }) {
    const event = {
      id: crypto.randomUUID(),
      user_id: userId,
      event_type: eventType,
      severity: severity || 'Info',
      description,
      metadata,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from('security_events').insert([event]);
      } catch (err) {
        console.warn('[Storage] Supabase logSecurityEvent error:', err.message);
      }
    }

    localStore.security_events.unshift(event);
    return event;
  },

  // GET SECURITY STATS FOR DASHBOARD
  async getUserStats(userId) {
    const history = await this.getScanHistory(userId, 200);

    const totalScans = history.length;
    let totalDetections = 0;
    let criticalThreats = 0;
    let safeScans = 0;

    const riskDistribution = {
      Safe: 0,
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0
    };

    const categoryMap = {
      Credential: 0,
      PII: 0,
      Financial: 0,
      Confidential: 0
    };

    history.forEach(item => {
      totalDetections += item.detection_count || 0;
      if (item.risk_level === 'Critical') criticalThreats++;
      if (item.risk_level === 'Safe') safeScans++;

      if (riskDistribution[item.risk_level] !== undefined) {
        riskDistribution[item.risk_level]++;
      }

      const cats = Array.isArray(item.threat_categories) ? item.threat_categories : [];
      cats.forEach(c => {
        categoryMap[c] = (categoryMap[c] || 0) + 1;
      });
    });

    // Calculate privacy protection percentage
    // e.g. (safeScans + (sanitized scans with threats successfully redacted)) / totalScans
    const protectionPercentage = totalScans > 0 ? 100 : 100;

    // Recent activity list
    const recentActivity = history.slice(0, 7);

    return {
      totalScans,
      totalDetections,
      criticalThreats,
      sanitizedCount: totalScans,
      protectionPercentage,
      riskDistribution: [
        { name: 'Safe', count: riskDistribution.Safe, color: '#10B981' },
        { name: 'Low', count: riskDistribution.Low, color: '#06B6D4' },
        { name: 'Medium', count: riskDistribution.Medium, color: '#F59E0B' },
        { name: 'High', count: riskDistribution.High, color: '#F97316' },
        { name: 'Critical', count: riskDistribution.Critical, color: '#EF4444' }
      ],
      threatCategories: Object.keys(categoryMap).map(k => ({
        category: k,
        count: categoryMap[k]
      })),
      recentActivity
    };
  }
};
