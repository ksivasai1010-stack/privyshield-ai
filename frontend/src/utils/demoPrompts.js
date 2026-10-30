/**
 * PrivyShield AI - Hackathon Demo Test Cases
 * All credentials, keys, and identifiers in this file are simulated dummy values for testing purposes.
 */

export const DEMO_PROMPTS = [
  {
    id: 'rahul-demo',
    title: 'Hackathon Official Demo (Rahul)',
    tag: 'API Key + Email',
    difficulty: 'Critical',
    prompt: 'My name is Rahul. My email is rahul@example.com. I accidentally included a sample API key sk-example-123456. Help me debug my application.',
    description: 'The standard hackathon test prompt containing personal email and an exposed sk-* API key.'
  },
  {
    id: 'pii-indian-demo',
    title: 'Indian National PII Leak',
    tag: 'Aadhaar + PAN + Mobile',
    difficulty: 'High',
    prompt: 'Please check my KYC submission. Customer Rahul Sharma, mobile +91 9876543210, email rahul.sharma@example.com, Aadhaar ID 4589 1234 5678, and PAN card number ABCDE1234F. Is there any format error in my document verification?',
    description: 'Simulates Indian PII leakage: Mobile phone (+91), Email, potential 12-digit Aadhaar number, and PAN card.'
  },
  {
    id: 'credentials-db-demo',
    title: 'Database & AWS Credentials',
    tag: 'DB Password + AWS Key',
    difficulty: 'Critical',
    prompt: 'Here is my database config file:\nDB_HOST=cluster-prod.aws.com\nDB_USER=admin_user\npassword = "SuperSecretDbPassword!2025"\nAWS_ACCESS_KEY_ID = AKIAIOSFODNN7EXAMPLE\nHow do I configure connection pooling in Node.js?',
    description: 'Simulates accidental database password and AWS Access Key leakage in configuration snippets.'
  },
  {
    id: 'financial-card-demo',
    title: 'Payment Card & Banking IFSC',
    tag: 'Credit Card + Bank IFSC',
    difficulty: 'Critical',
    prompt: 'Can you help parse this transaction webhook payload? Customer processed payment on card 4111 1111 1111 1111, expiry 12/28. Payout scheduled to Bank Account: 98765432109876 with IFSC Code SBIN0001234.',
    description: 'Simulates credit card number with Luhn check, bank account number, and IFSC bank branch code.'
  },
  {
    id: 'confidential-mna-demo',
    title: 'Confidential Business & M&A Leak',
    tag: 'NDA + Financial Forecast',
    difficulty: 'High',
    prompt: 'STRICTLY CONFIDENTIAL AND PROPRIETARY. Internal Only under NDA.\nProject Titan: Unannounced acquisition target valued at $42.5M. Q3 projected revenue EBITDA of 18.4%. Please write an executive briefing for the board meeting next Tuesday.',
    description: 'Simulates breach of corporate confidentiality markings, unannounced M&A details, and material financial data.'
  },
  {
    id: 'safe-coding-demo',
    title: 'Safe Coding Prompt',
    tag: 'No Sensitive Data',
    difficulty: 'Safe',
    prompt: 'How do I implement binary search in Python? Please provide a clean function with type annotations, docstring, and explain time complexity O(log n).',
    description: 'A completely benign programming inquiry containing zero sensitive entities.'
  }
];
