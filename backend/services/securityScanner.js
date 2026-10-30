/**
 * PrivyShield AI - Core Security Engine
 * Performs multi-layer pattern detection for sensitive entities:
 * - Credentials & Secrets (API keys, Passwords, Private keys, JWT tokens)
 * - PII (Emails, Phone numbers, Potential Aadhaar, PAN identifiers)
 * - Financial (Credit/Debit cards with Luhn check, Bank accounts, IFSC)
 * - Confidential Business Information
 */

// Luhn algorithm for credit card checksum validation
function validateLuhn(numberString) {
  const clean = numberString.replace(/[\s-]/g, '');
  if (!/^\d{13,19}$/.test(clean)) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function scanPromptForThreats(prompt) {
  if (!prompt || typeof prompt !== 'string') {
    return {
      findings: [],
      riskScore: 0,
      riskLevel: 'Safe',
      summary: 'Prompt is empty.',
      threatCounts: {}
    };
  }

  const findings = [];
  let idCounter = 1;

  // Helper to add finding
  const addFinding = (type, category, severity, matchedText, index, confidence, description, recommendation) => {
    findings.push({
      id: `threat-${idCounter++}`,
      type,
      category, // 'Credential', 'PII', 'Financial', 'Confidential'
      severity, // 'Critical', 'High', 'Medium', 'Low'
      matchedText,
      startIndex: index,
      endIndex: index + matchedText.length,
      confidence, // 0.0 - 1.0
      description,
      recommendation
    });
  };

  // 1. Private Keys (Critical)
  const privateKeyRegex = /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/gi;
  let match;
  while ((match = privateKeyRegex.exec(prompt)) !== null) {
    addFinding(
      'PRIVATE_KEY',
      'Credential',
      'Critical',
      match[0],
      match.index,
      0.99,
      'Cryptographic private key detected in prompt.',
      'Revoke and regenerate this key immediately. Never share private keys with any AI or third-party.'
    );
  }

  // OpenAI & general sk-* keys (including sample / demo keys like sk-example-123456)
  const openAiRegex = /\b(?:sk-(?:proj-|test-|live-|example-|admin-)?[a-zA-Z0-9_\-]{6,})\b/gi;
  while ((match = openAiRegex.exec(prompt)) !== null) {
    addFinding(
      'API_KEY',
      'Credential',
      'Critical',
      match[0],
      match.index,
      0.98,
      'API Key / Token detected (OpenAI / standard sk-* format).',
      'Revoke and regenerate this API key immediately in your developer portal.'
    );
  }

  // Generic key and secret assignments (e.g. api_key = "...", access_token: ...)
  const genericApiKeyRegex = /(?:api[_-]?key|access[_-]?token|auth[_-]?token|secret[_-]?key|client[_-]?secret)\s*[:=]\s*["']?([a-zA-Z0-9_\-\.]{8,})["']?/gi;
  while ((match = genericApiKeyRegex.exec(prompt)) !== null) {
    const matchedToken = match[1] || match[0];
    if (!findings.some(f => f.startIndex <= match.index && f.endIndex >= match.index + match[0].length)) {
      addFinding(
        'API_KEY',
        'Credential',
        'Critical',
        match[0],
        match.index,
        0.95,
        'API Key / Access Secret detected in key-value assignment.',
        'Remove authentication tokens before sending prompts to external models.'
      );
    }
  }

  // AWS Access Key
  const awsKeyRegex = /\b(AKIA[0-9A-Z]{16})\b/g;
  while ((match = awsKeyRegex.exec(prompt)) !== null) {
    addFinding(
      'AWS_ACCESS_KEY',
      'Credential',
      'Critical',
      match[0],
      match.index,
      0.99,
      'AWS Access Key ID detected.',
      'Revoke this credential immediately via AWS IAM console.'
    );
  }

  // GitHub Token
  const githubTokenRegex = /\b(?:ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{50,})\b/g;
  while ((match = githubTokenRegex.exec(prompt)) !== null) {
    addFinding(
      'GITHUB_TOKEN',
      'Credential',
      'Critical',
      match[0],
      match.index,
      0.99,
      'GitHub Personal Access Token detected.',
      'Revoke and regenerate this GitHub token immediately.'
    );
  }

  // JWT Token
  const jwtRegex = /\beyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/g;
  while ((match = jwtRegex.exec(prompt)) !== null) {
    addFinding(
      'JWT_TOKEN',
      'Credential',
      'Critical',
      match[0],
      match.index,
      0.96,
      'JSON Web Token (JWT) session credential detected.',
      'Invalidate this session token or allow it to expire before exposing application context.'
    );
  }

  // Passwords / Connection Strings
  const passwordRegex = /(?:password|passwd|pwd|db_pass|database_password)\s*[:=]\s*["']?([^\s"'`;]{4,})["']?/gi;
  while ((match = passwordRegex.exec(prompt)) !== null) {
    addFinding(
      'PASSWORD',
      'Credential',
      'Critical',
      match[0],
      match.index,
      0.92,
      'Plaintext password or database credential pattern detected.',
      'Change this password immediately and ensure credentials are kept in environment variables.'
    );
  }

  // 3. Financial Information
  // Credit / Debit Cards
  const ccRegex = /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12})\b/g;
  while ((match = ccRegex.exec(prompt)) !== null) {
    const isLuhnValid = validateLuhn(match[0]);
    if (isLuhnValid) {
      addFinding(
        'CREDIT_CARD',
        'Financial',
        'Critical',
        match[0],
        match.index,
        0.98,
        'Valid Payment Card number (Visa/Mastercard/Amex) detected.',
        'Never expose payment card numbers to AI services. PCI-DSS violation risk.'
      );
    }
  }

  // Bank IFSC Code (Indian Banking)
  const ifscRegex = /\b[A-Z]{4}0[A-Z0-9]{6}\b/g;
  while ((match = ifscRegex.exec(prompt)) !== null) {
    addFinding(
      'BANK_IFSC',
      'Financial',
      'Medium',
      match[0],
      match.index,
      0.85,
      'Indian Bank IFSC Branch code detected.',
      'Redact bank branch identifiers to preserve privacy.'
    );
  }

  // Bank Account Number (detected when in proximity to keywords)
  const bankAccountRegex = /(?:account(?:\s*no|\s*number)?|a\/c|bank\s*acc)\s*[:#-]?\s*([0-9]{9,18})/gi;
  while ((match = bankAccountRegex.exec(prompt)) !== null) {
    addFinding(
      'BANK_ACCOUNT',
      'Financial',
      'High',
      match[0],
      match.index,
      0.88,
      'Bank Account Number pattern detected in prompt.',
      'Redact banking numbers to prevent financial identity exposure.'
    );
  }

  // 4. Personally Identifiable Information (PII)
  // Email detection
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  while ((match = emailRegex.exec(prompt)) !== null) {
    addFinding(
      'EMAIL_ADDRESS',
      'PII',
      'Medium',
      match[0],
      match.index,
      0.97,
      'Personal or Corporate Email Address detected.',
      'Redact email addresses with an anonymized alias to protect personal identity.'
    );
  }

  // Indian Phone Number (+91 or 10-digit starting with 6,7,8,9)
  const phoneRegex = /(?:\+91[\s-]?)?[6789]\d{9}\b/g;
  while ((match = phoneRegex.exec(prompt)) !== null) {
    // Avoid matching parts of larger numbers
    addFinding(
      'PHONE_NUMBER',
      'PII',
      'Medium',
      match[0],
      match.index,
      0.90,
      'Personal Phone Number (Indian mobile format) detected.',
      'Replace contact numbers with placeholder identifiers.'
    );
  }

  // Potential Aadhaar Identifier (12 digits, typically 4-4-4, first digit 2-9)
  // Note: Must be transparently labeled as a POTENTIAL identifier
  const aadhaarRegex = /\b[2-9][0-9]{3}\s?[0-9]{4}\s?[0-9]{4}\b/g;
  while ((match = aadhaarRegex.exec(prompt)) !== null) {
    // Check if not overlapping with already detected credit card
    const isOverlapping = findings.some(f => f.startIndex <= match.index && f.endIndex >= match.index + match[0].length);
    if (!isOverlapping) {
      addFinding(
        'POTENTIAL_AADHAAR',
        'PII',
        'High',
        match[0],
        match.index,
        0.82,
        'Potential Aadhaar 12-digit Indian National Identity pattern detected.',
        'Government identity numbers must never be submitted to LLMs. Verify and redact.'
      );
    }
  }

  // PAN-like Identifier (5 letters, 4 numbers, 1 letter)
  const panRegex = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g;
  while ((match = panRegex.exec(prompt)) !== null) {
    addFinding(
      'POTENTIAL_PAN',
      'PII',
      'High',
      match[0],
      match.index,
      0.88,
      'Potential Indian Permanent Account Number (PAN) tax identifier detected.',
      'Tax and government identifiers should be masked prior to external processing.'
    );
  }

  // 5. Confidential Business Information
  const confidentialPatterns = [
    { regex: /\b(?:strictly confidential|internal only|confidential and proprietary|under nda|nda restricted)\b/gi, label: 'Confidentiality Marking' },
    { regex: /\b(?:q[1-4]\s+(?:financial\s+results|revenue|earnings|ebitda)|unannounced acquisition|projected valuation)\b/gi, label: 'Material Non-Public Information' },
    { regex: /\b(?:trade secret|proprietary algorithm|unreleased product roadmap)\b/gi, label: 'Proprietary IP' }
  ];

  confidentialPatterns.forEach(item => {
    while ((match = item.regex.exec(prompt)) !== null) {
      addFinding(
        'CONFIDENTIAL_BUSINESS',
        'Confidential',
        'High',
        match[0],
        match.index,
        0.86,
        `Confidential Business Information detected (${item.label}).`,
        'Ensure this prompt does not breach your enterprise Non-Disclosure Agreement (NDA).'
      );
    }
  });

  // Calculate Transparent Risk Scoring (0 - 100)
  const threatCounts = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0
  };

  const categoryCounts = {};

  findings.forEach(f => {
    threatCounts[f.severity] = (threatCounts[f.severity] || 0) + 1;
    categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
  });

  // Weighted scoring calculation
  let calculatedScore = 0;
  if (findings.length > 0) {
    // Critical (API key, Private key, Password, Card): 40 pts each
    // High (Aadhaar, PAN, Bank Account, Confidential): 25 pts each
    // Medium (Email, Phone, IFSC): 12 pts each
    // Low: 5 pts each
    calculatedScore = (threatCounts.Critical * 40) +
                      (threatCounts.High * 25) +
                      (threatCounts.Medium * 12) +
                      (threatCounts.Low * 5);

    // Apply baseline risk floor if high severity exists
    if (threatCounts.Critical > 0) calculatedScore = Math.max(calculatedScore, 85);
    else if (threatCounts.High > 0) calculatedScore = Math.max(calculatedScore, 65);
    else if (threatCounts.Medium > 0) calculatedScore = Math.max(calculatedScore, 35);

    // Cap at 100
    calculatedScore = Math.min(100, Math.round(calculatedScore));
  } else {
    // If no patterns found, do not falsely declare 100% immune, but 5 (Safe baseline)
    calculatedScore = 5;
  }

  // Determine Risk Level:
  // 0–19: Safe, 20–39: Low, 40–59: Medium, 60–79: High, 80–100: Critical
  let riskLevel = 'Safe';
  if (calculatedScore >= 80) riskLevel = 'Critical';
  else if (calculatedScore >= 60) riskLevel = 'High';
  else if (calculatedScore >= 40) riskLevel = 'Medium';
  else if (calculatedScore >= 20) riskLevel = 'Low';
  else riskLevel = 'Safe';

  return {
    findings,
    riskScore: calculatedScore,
    riskLevel,
    detectionCount: findings.length,
    threatCounts,
    categoryCounts,
    summary: findings.length === 0
      ? 'No direct sensitive patterns identified by rule engine.'
      : `Detected ${findings.length} sensitive item(s) across ${Object.keys(categoryCounts).join(', ')} categories.`
  };
}
