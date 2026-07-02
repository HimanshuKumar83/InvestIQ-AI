export function buildConfidenceNarrative({
  confidenceScore,
  coverageScore,
  coverageLabel,
  missingFields,
  riskScore,
  verifiedProfile,
  verifiedFinancials,
  verifiedNews,
  inferredNotes,
}) {
  const confidenceLevel = confidenceScore >= 80
    ? 'high confidence'
    : confidenceScore >= 60
      ? 'moderate confidence'
      : 'lower confidence';

  const evidenceBits = [
    verifiedProfile && 'the company profile',
    verifiedFinancials && 'the financial profile',
    verifiedNews && 'the recent news context',
  ].filter(Boolean);

  const evidenceText = evidenceBits.length
    ? `The score is grounded in ${evidenceBits.join(', ')}.`
    : 'The score is grounded in the available evidence.';

  const coverageText = coverageLabel === 'Excellent'
    ? 'excellent coverage'
    : coverageLabel === 'Partial'
      ? 'partial coverage'
      : 'limited coverage';

  const missingText = missingFields.length
    ? `Missing data on ${missingFields.slice(0, 2).join(' and ')} still matters, so the recommendation should be treated with care.`
    : 'The evidence set is fairly complete, which helps keep the conclusion steady.';

  const riskText = riskScore >= 70
    ? 'elevated risk'
    : riskScore >= 35
      ? 'manageable risk'
      : 'contained risk';

  const signalText = inferredNotes.length
    ? 'Some inputs were inferred rather than directly verified, so the confidence score is more sensitive to future updates.'
    : 'The current signal is grounded in the available verified evidence.';

  return `This score reflects ${confidenceLevel} because ${evidenceText} Coverage is ${coverageText} (${coverageScore}%), and ${missingText} Overall, the risk profile looks ${riskText}. ${signalText}`;
}
