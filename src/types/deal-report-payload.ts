/**
 * Pre-formatted strings for the deal report PDF. Built on the server from
 * property + memo + engine read; consumed only by the client PDF generator.
 */
export type DealReportPayload = {
  address: string;
  cityState: string;
  zoningDistrict: string;
  generatedDateLabel: string;
  opportunityValue: string;
  underbuiltScore: string;
  complexityScore: string;
  complexityLabel: string;
  speedToValueScore: string;
  speedToValueLabel: string;
  suggestedNextStep: string;
  lotSqft: string;
  builtSqft: string;
  maxFar: string;
  currentBuiltFar: string;
  remainingFar: string;
  unusedBuildable: string;
  estValuePerBuildableSqft: string;
  constructionPerSqft: string;
  softCostPct: string;
  totalProjectValue: string;
  totalCost: string;
  estimatedProfit: string;
  profitMargin: string;
  executiveSummary: string;
  whyItMatters: string[];
  keyRisks: string[];
  keyFlags: string[];
};
