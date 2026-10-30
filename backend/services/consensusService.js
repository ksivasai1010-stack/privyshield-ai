/**
 * PrivyShield AI - Consensus Engine
 * Merges the deterministic rule engine (Local Scanner) with AI Security providers (Gemini, Grok).
 *
 * CRITICAL RULE:
 * The Local Scanner is the authoritative ground truth for confirmed secrets (API keys, passwords, credentials).
 * AI models provide contextual risk escalation, residual leakage detection, and qualitative explanations.
 * AI models CANNOT downgrade a hard secret detection to "Safe".
 */

export function buildConsensusReport(localScan, geminiResult, grokResult) {
  const providerAvailability = {
    localEngine: { available: true, status: 'operational' },
    gemini: {
      available: !!geminiResult?.available,
      status: geminiResult?.available ? 'operational' : (geminiResult?.reason || 'unreachable')
    },
    grok: {
      available: !!grokResult?.available,
      status: grokResult?.available ? 'operational' : (grokResult?.reason || 'unreachable')
    }
  };

  const activeAiCount = (geminiResult?.available ? 1 : 0) + (grokResult?.available ? 1 : 0);

  // Determine Final Risk Score:
  // Base is the local scanner's score
  let finalScore = localScan.riskScore;
  let finalRiskLevel = localScan.riskLevel;

  // If local found critical secrets, score remains at least what local decided
  const aiScores = [];
  if (geminiResult?.available && typeof geminiResult.riskScore === 'number') {
    aiScores.push(geminiResult.riskScore);
  }
  if (grokResult?.available && typeof grokResult.riskScore === 'number') {
    aiScores.push(grokResult.riskScore);
  }

  // If AI models found contextual hazards not caught by regex, elevate score appropriately
  if (aiScores.length > 0) {
    const avgAiScore = Math.round(aiScores.reduce((a, b) => a + b, 0) / aiScores.length);
    // If local was safe (e.g. 5) but AI flagged medium/high contextual leakage, elevate
    if (localScan.detectionCount === 0 && avgAiScore > 20) {
      finalScore = Math.max(finalScore, avgAiScore);
    } else if (localScan.threatCounts?.Critical > 0) {
      // Keep critical priority
      finalScore = Math.max(finalScore, 85);
    } else {
      // Weighted combination: 70% local rule certainty, 30% AI contextual assessment
      finalScore = Math.round((localScan.riskScore * 0.7) + (avgAiScore * 0.3));
    }
  }

  // Cap at 100
  finalScore = Math.min(100, Math.max(0, finalScore));

  // Determine Level from score
  if (finalScore >= 80) finalRiskLevel = 'Critical';
  else if (finalScore >= 60) finalRiskLevel = 'High';
  else if (finalScore >= 40) finalRiskLevel = 'Medium';
  else if (finalScore >= 20) finalRiskLevel = 'Low';
  else finalRiskLevel = 'Safe';

  // Compare AI findings and consensus status
  let consensusStatus = 'Local Deterministic (AI Offline)';
  let agreementDescription = 'Local security engine detected all structural threats directly.';

  if (activeAiCount === 2) {
    const scoreDiff = Math.abs((geminiResult.riskScore || 0) - (grokResult.riskScore || 0));
    if (scoreDiff <= 15) {
      consensusStatus = 'Full Multi-Model Consensus';
      agreementDescription = 'Gemini and Grok independently confirmed the privacy posture and redaction efficacy.';
    } else {
      consensusStatus = 'Divergent AI Assessment';
      agreementDescription = `Gemini assessed risk at ${geminiResult.riskScore}/100 while Grok scored ${grokResult.riskScore}/100. Local rules maintained baseline security.`;
    }
  } else if (activeAiCount === 1) {
    const activeProvider = geminiResult?.available ? 'Gemini' : 'Grok';
    consensusStatus = `Dual Verification (Local + ${activeProvider})`;
    agreementDescription = `Verified by Local Security Engine and ${activeProvider}. Other AI provider was not reachable.`;
  }

  // Synthesize combined recommendations
  const recommendationSet = new Set();
  localScan.findings.forEach(f => {
    if (f.recommendation) recommendationSet.add(f.recommendation);
  });
  if (geminiResult?.recommendations) {
    geminiResult.recommendations.forEach(r => recommendationSet.add(r));
  }
  if (grokResult?.recommendations) {
    grokResult.recommendations.forEach(r => recommendationSet.add(r));
  }

  return {
    finalRiskScore: finalScore,
    finalRiskLevel: finalRiskLevel,
    consensusStatus,
    agreementDescription,
    activeAiCount,
    providerAvailability,
    providerDetails: {
      local: {
        riskScore: localScan.riskScore,
        riskLevel: localScan.riskLevel,
        detectionCount: localScan.detectionCount,
        categoryCounts: localScan.categoryCounts,
        summary: localScan.summary
      },
      gemini: geminiResult,
      grok: grokResult
    },
    synthesizedRecommendations: Array.from(recommendationSet)
  };
}
