import test from 'node:test';
import assert from 'node:assert/strict';
import { buildConfidenceNarrative } from './confidenceReasoning.js';

test('buildConfidenceNarrative explains strong evidence and missing-data impact', () => {
  const narrative = buildConfidenceNarrative({
    confidenceScore: 84,
    coverageScore: 82,
    coverageLabel: 'Partial',
    missingFields: ['quarterly delivery trends', 'regulatory exposure'],
    riskScore: 38,
    verifiedProfile: true,
    verifiedFinancials: true,
    verifiedNews: true,
    inferredNotes: ['News contains inferred or unverifiable content.'],
  });

  assert.match(narrative, /high confidence/i);
  assert.match(narrative, /coverage is partial/i);
  assert.match(narrative, /missing data/i);
  assert.match(narrative, /manageable risk/i);
});

test('buildConfidenceNarrative keeps lower-confidence language clear for weak evidence', () => {
  const narrative = buildConfidenceNarrative({
    confidenceScore: 42,
    coverageScore: 44,
    coverageLabel: 'Limited',
    missingFields: ['cash flow trend', 'segment margins'],
    riskScore: 78,
    verifiedProfile: false,
    verifiedFinancials: false,
    verifiedNews: false,
    inferredNotes: [],
  });

  assert.match(narrative, /lower confidence/i);
  assert.match(narrative, /limited coverage/i);
  assert.match(narrative, /elevated risk/i);
});
