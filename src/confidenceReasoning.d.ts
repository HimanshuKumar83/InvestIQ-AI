export interface ConfidenceNarrativeInput {
  confidenceScore: number;
  coverageScore: number;
  coverageLabel: 'Excellent' | 'Partial' | 'Limited';
  missingFields: string[];
  riskScore: number;
  verifiedProfile: boolean;
  verifiedFinancials: boolean;
  verifiedNews: boolean;
  inferredNotes: string[];
}

export function buildConfidenceNarrative(input: ConfidenceNarrativeInput): string;
