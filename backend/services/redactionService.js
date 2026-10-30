import crypto from 'crypto';

/**
 * Redaction Service
 * Replaces detected sensitive entities with structured, numbered placeholders:
 * e.g., [EMAIL_1], [API_KEY_1], [PHONE_1], [POTENTIAL_AADHAAR_1], etc.
 */
export function redactPrompt(originalPrompt, findings) {
  if (!originalPrompt || findings.length === 0) {
    const hash = crypto.createHash('sha256').update(originalPrompt || '').digest('hex');
    return {
      sanitizedPrompt: originalPrompt || '',
      redactionMap: [],
      sanitizedPromptHash: hash,
      redactionCount: 0
    };
  }

  // Sort findings in descending order by startIndex so character replacements do not offset earlier slices
  const sortedFindings = [...findings].sort((a, b) => b.startIndex - a.startIndex);

  // Group counters by placeholder prefix
  const prefixCounters = {};
  const redactions = [];

  let sanitizedText = originalPrompt;

  // Track placeholders in forward order for logical indexing
  // First, assign placeholder labels
  const findingsWithPlaceholders = [...findings].sort((a, b) => a.startIndex - b.startIndex);
  const placeholderMap = new Map();

  findingsWithPlaceholders.forEach(finding => {
    let prefix = 'SENSITIVE_DATA';
    switch (finding.type) {
      case 'EMAIL_ADDRESS':
        prefix = 'EMAIL';
        break;
      case 'PHONE_NUMBER':
        prefix = 'PHONE';
        break;
      case 'API_KEY':
      case 'API_KEY_OPENAI':
      case 'AWS_ACCESS_KEY':
      case 'GITHUB_TOKEN':
        prefix = 'API_KEY';
        break;
      case 'JWT_TOKEN':
        prefix = 'AUTH_TOKEN';
        break;
      case 'PASSWORD':
        prefix = 'PASSWORD';
        break;
      case 'PRIVATE_KEY':
        prefix = 'PRIVATE_KEY';
        break;
      case 'CREDIT_CARD':
        prefix = 'CARD_NUMBER';
        break;
      case 'BANK_ACCOUNT':
        prefix = 'BANK_ACCOUNT';
        break;
      case 'BANK_IFSC':
        prefix = 'BANK_IFSC';
        break;
      case 'POTENTIAL_AADHAAR':
        prefix = 'POTENTIAL_AADHAAR';
        break;
      case 'POTENTIAL_PAN':
        prefix = 'POTENTIAL_PAN';
        break;
      case 'CONFIDENTIAL_BUSINESS':
        prefix = 'CONFIDENTIAL_DATA';
        break;
      default:
        prefix = 'SENSITIVE_ITEM';
    }

    prefixCounters[prefix] = (prefixCounters[prefix] || 0) + 1;
    const placeholder = `[${prefix}_${prefixCounters[prefix]}]`;
    placeholderMap.set(finding.id, placeholder);

    redactions.push({
      findingId: finding.id,
      type: finding.type,
      category: finding.category,
      severity: finding.severity,
      placeholder,
      // Note: original text is stored ONLY in this transient response object in memory, never persisted to DB
      originalSnippet: finding.matchedText.length > 30 ? finding.matchedText.substring(0, 30) + '...' : finding.matchedText
    });
  });

  // Apply replacements from back to front
  sortedFindings.forEach(finding => {
    const placeholder = placeholderMap.get(finding.id);
    const before = sanitizedText.slice(0, finding.startIndex);
    const after = sanitizedText.slice(finding.endIndex);
    sanitizedText = before + placeholder + after;
  });

  // Generate SHA-256 hash of the sanitized prompt for audit tracking
  const sanitizedPromptHash = crypto.createHash('sha256').update(sanitizedText).digest('hex');

  return {
    sanitizedPrompt: sanitizedText,
    redactionMap: redactions,
    sanitizedPromptHash,
    redactionCount: redactions.length
  };
}
